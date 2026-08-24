import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentUrlDto, MoMoWebhookDto, VNPayWebhookDto } from './dto/payment.dto';
import {
  MOMO_SANDBOX_CONFIG,
  generateMoMoRequestSignature,
  generateVNPayPaymentUrl,
  verifyMoMoWebhookSignature,
  verifyVNPayWebhookSignature,
} from './utils/payment-crypto.util';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private prisma: PrismaService) {}

  async createPaymentUrl(dto: CreatePaymentUrlDto) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    if (order.paymentMethod === PaymentMethod.cash) {
      return { payUrl: null, message: 'Đơn hàng chọn thanh toán tiền mặt (COD)' };
    }

    if (order.paymentMethod === PaymentMethod.momo) {
      const requestId = `MOMO_REQ_${order.id}_${Date.now()}`;
      const signature = generateMoMoRequestSignature({
        partnerCode: MOMO_SANDBOX_CONFIG.partnerCode,
        accessKey: MOMO_SANDBOX_CONFIG.accessKey,
        requestId,
        amount: order.totalAmount,
        orderId: order.id,
        orderInfo: `Thanh toan don hang ${order.id} Tran Gia Food`,
        redirectUrl: MOMO_SANDBOX_CONFIG.redirectUrl,
        ipnUrl: MOMO_SANDBOX_CONFIG.ipnUrl,
        requestType: 'captureWallet',
        extraData: '',
      });

      const payUrl = `${MOMO_SANDBOX_CONFIG.endpoint}?partnerCode=${MOMO_SANDBOX_CONFIG.partnerCode}&accessKey=${MOMO_SANDBOX_CONFIG.accessKey}&requestId=${requestId}&amount=${order.totalAmount}&orderId=${order.id}&signature=${signature}`;

      await this.prisma.payment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          method: PaymentMethod.momo,
          amount: order.totalAmount,
          status: PaymentStatus.pending,
          transactionId: requestId,
        },
        update: {
          amount: order.totalAmount,
          status: PaymentStatus.pending,
          transactionId: requestId,
        },
      });

      return { payUrl, orderId: order.id, amount: order.totalAmount, requestId, signature };
    }

    const payUrl = generateVNPayPaymentUrl({
      orderId: order.id,
      amount: order.totalAmount,
      orderInfo: `Thanh toan don hang ${order.id} Tran Gia Food`,
    });

    await this.prisma.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        method: PaymentMethod.bank,
        amount: order.totalAmount,
        status: PaymentStatus.pending,
      },
      update: {
        amount: order.totalAmount,
        status: PaymentStatus.pending,
      },
    });

    return { payUrl, orderId: order.id, amount: order.totalAmount };
  }

  async handleMoMoWebhook(dto: MoMoWebhookDto) {
    this.logger.log(`Received MoMo Webhook for order ${dto.orderId}: resultCode=${dto.resultCode}`);

    // Xác thực chữ ký số nếu có signature được truyền vào
    if (dto.signature) {
      const isValid = verifyMoMoWebhookSignature(
        {
          partnerCode: dto.partnerCode || MOMO_SANDBOX_CONFIG.partnerCode,
          accessKey: MOMO_SANDBOX_CONFIG.accessKey,
          requestId: dto.requestId,
          amount: dto.amount,
          orderId: dto.orderId,
          orderInfo: dto.orderInfo,
          orderType: dto.orderType,
          transId: dto.transId,
          resultCode: dto.resultCode,
          message: dto.message,
          payType: dto.payType,
          responseTime: dto.responseTime,
          extraData: dto.extraData ? JSON.stringify(dto.extraData) : '',
        },
        dto.signature,
      );

      if (!isValid) {
        this.logger.warn(`Invalid MoMo signature for order ${dto.orderId}`);
        throw new BadRequestException('Chữ ký MoMo không hợp lệ (Invalid Signature)');
      }
    }

    const status = dto.resultCode === '0' ? PaymentStatus.paid : PaymentStatus.failed;

    await this.prisma.payment.upsert({
      where: { orderId: dto.orderId },
      create: {
        orderId: dto.orderId,
        method: PaymentMethod.momo,
        amount: parseFloat(dto.amount || '0'),
        status,
        transactionId: dto.requestId,
      },
      update: {
        status,
        transactionId: dto.requestId,
        gatewayResponse: JSON.parse(JSON.stringify(dto)),
      },
    });

    if (status === PaymentStatus.paid) {
      await this.prisma.order.update({
        where: { id: dto.orderId },
        data: { paymentStatus: PaymentStatus.paid },
      });
    }

    return { RspCode: '00', Message: 'Confirm Success' };
  }

  async handleVNPayWebhook(dto: VNPayWebhookDto) {
    this.logger.log(
      `Received VNPay Webhook for order ${dto.vnp_TxnRef}: responseCode=${dto.vnp_ResponseCode}`,
    );

    // Xác thực chữ ký số nếu có vnp_SecureHash được truyền vào
    if (dto.vnp_SecureHash) {
      const isValid = verifyVNPayWebhookSignature(
        dto as Record<string, string | number | undefined>,
      );
      if (!isValid) {
        this.logger.warn(`Invalid VNPay Checksum for order ${dto.vnp_TxnRef}`);
        throw new BadRequestException('Chữ ký VNPay không hợp lệ (Invalid Checksum)');
      }
    }

    const status = dto.vnp_ResponseCode === '00' ? PaymentStatus.paid : PaymentStatus.failed;

    await this.prisma.payment.upsert({
      where: { orderId: dto.vnp_TxnRef },
      create: {
        orderId: dto.vnp_TxnRef,
        method: PaymentMethod.bank,
        amount: parseFloat(dto.vnp_Amount || '0') / 100,
        status,
        transactionId: dto.vnp_TransactionNo,
      },
      update: {
        status,
        transactionId: dto.vnp_TransactionNo,
        gatewayResponse: JSON.parse(JSON.stringify(dto)),
      },
    });

    if (status === PaymentStatus.paid) {
      await this.prisma.order.update({
        where: { id: dto.vnp_TxnRef },
        data: { paymentStatus: PaymentStatus.paid },
      });
    }

    return { RspCode: '00', Message: 'Confirm Success' };
  }

  async refundPayment(orderId: string, reason = 'Đơn hàng bị hủy') {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    if (order.paymentMethod === PaymentMethod.cash) {
      return { success: true, message: 'Đơn hàng COD không cần hoàn tiền qua cổng thanh toán' };
    }

    const payment = await this.prisma.payment.findUnique({ where: { orderId } });
    if (!payment)
      throw new NotFoundException('Không tìm thấy thông tin thanh toán cho đơn hàng này');

    if (payment.status !== PaymentStatus.paid) {
      throw new BadRequestException(
        'Chỉ có thể hoàn tiền cho các giao dịch đã thanh toán thành công',
      );
    }

    this.logger.log(
      `Processing refund for order ${orderId}, amount: ${payment.amount}, reason: ${reason}`,
    );

    const updatedPayment = await this.prisma.payment.update({
      where: { orderId },
      data: {
        status: PaymentStatus.refunded,
        gatewayResponse: {
          refundReason: reason,
          refundedAt: new Date().toISOString(),
          refundAmount: payment.amount,
        },
      },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: PaymentStatus.refunded },
    });

    return {
      success: true,
      message: 'Hoàn tiền thành công',
      refundAmount: updatedPayment.amount,
      orderId,
    };
  }

  async getPaymentStatus(orderId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { orderId } });
    if (!payment) throw new NotFoundException('Không tìm thấy thông tin thanh toán');
    return payment;
  }
}
