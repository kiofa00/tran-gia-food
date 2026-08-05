import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CreatePaymentUrlDto, MoMoWebhookDto } from './dto/payment.dto';
import { PaymentStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async createPaymentUrl(dto: CreatePaymentUrlDto) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    if (order.paymentMethod === PaymentMethod.cash) {
      return { payUrl: null, message: 'Đơn hàng chọn thanh toán tiền mặt (COD)' };
    }

    if (order.paymentMethod === PaymentMethod.momo) {
      // Mock / Real MoMo Payment Gateway URL creation
      const payUrl = `https://test-payment.momo.vn/v2/gateway/api/create?orderId=${order.id}&amount=${order.totalAmount}`;
      await this.prisma.payment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          method: PaymentMethod.momo,
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

    return { payUrl: `https://vnpay.vn/pay?orderId=${order.id}`, amount: order.totalAmount };
  }

  async handleMoMoWebhook(dto: MoMoWebhookDto) {
    this.logger.log(`Received MoMo Webhook for order ${dto.orderId}: resultCode=${dto.resultCode}`);

    const status = dto.resultCode === '0' ? PaymentStatus.paid : PaymentStatus.failed;

    await this.prisma.payment.update({
      where: { orderId: dto.orderId },
      data: {
        status,
        transactionId: dto.requestId,
        gatewayResponse: dto as any,
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

  async getPaymentStatus(orderId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { orderId } });
    if (!payment) throw new NotFoundException('Không tìm thấy thông tin thanh toán');
    return payment;
  }
}
