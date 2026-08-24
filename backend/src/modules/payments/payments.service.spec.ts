import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import * as crypto from 'crypto';

import { PrismaService } from '../../prisma/prisma.service';
import { PaymentsService } from './payments.service';
import { MOMO_SANDBOX_CONFIG, VNPAY_SANDBOX_CONFIG } from './utils/payment-crypto.util';

describe('PaymentsService', () => {
  let service: PaymentsService;

  const mockPrismaService = {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      upsert: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('mock-config'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  describe('createPaymentUrl', () => {
    it('should generate MoMo payment url with signature for MoMo orders', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-1',
        paymentMethod: PaymentMethod.momo,
        totalAmount: 150000,
      });

      const result = await service.createPaymentUrl({ orderId: 'order-1' });

      expect(result.payUrl).toContain('momo.vn');
      expect(result.payUrl).toContain('signature=');
      expect(result.amount).toBe(150000);
      expect(mockPrismaService.payment.upsert).toHaveBeenCalled();
    });

    it('should generate VNPay payment url with secure hash for bank orders', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-2',
        paymentMethod: PaymentMethod.bank,
        totalAmount: 200000,
      });

      const result = await service.createPaymentUrl({ orderId: 'order-2' });

      expect(result.payUrl).toContain('vnpayment.vn');
      expect(result.payUrl).toContain('vnp_SecureHash=');
      expect(result.amount).toBe(200000);
      expect(mockPrismaService.payment.upsert).toHaveBeenCalled();
    });
  });

  describe('handleMoMoWebhook', () => {
    it('should update payment status to PAID when resultCode is 0 and signature is valid', async () => {
      mockPrismaService.payment.update.mockResolvedValue({ id: 'pay-1' });

      const rawSig =
        `accessKey=${MOMO_SANDBOX_CONFIG.accessKey}` +
        `&amount=150000` +
        `&extraData=` +
        `&message=Success` +
        `&orderId=order-1` +
        `&orderInfo=` +
        `&orderType=momo_wallet` +
        `&partnerCode=${MOMO_SANDBOX_CONFIG.partnerCode}` +
        `&payType=qr` +
        `&requestId=req-123` +
        `&responseTime=` +
        `&resultCode=0` +
        `&transId=`;

      const validSignature = crypto
        .createHmac('sha256', MOMO_SANDBOX_CONFIG.secretKey)
        .update(rawSig)
        .digest('hex');

      const result = await service.handleMoMoWebhook({
        partnerCode: MOMO_SANDBOX_CONFIG.partnerCode,
        orderId: 'order-1',
        requestId: 'req-123',
        amount: '150000',
        resultCode: '0',
        message: 'Success',
        signature: validSignature,
      });

      expect(result.RspCode).toBe('00');
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { paymentStatus: PaymentStatus.paid },
      });
    });

    it('should throw BadRequestException when MoMo signature is invalid', async () => {
      await expect(
        service.handleMoMoWebhook({
          partnerCode: MOMO_SANDBOX_CONFIG.partnerCode,
          orderId: 'order-1',
          requestId: 'req-123',
          amount: '150000',
          resultCode: '0',
          message: 'Success',
          signature: 'invalid-tampered-signature-123456',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('handleVNPayWebhook', () => {
    it('should update payment status when VNPay checksum is valid', async () => {
      const vnpParams: Record<string, string> = {
        vnp_Amount: '20000000',
        vnp_BankCode: 'NCB',
        vnp_ResponseCode: '00',
        vnp_TransactionNo: '14552312',
        vnp_TxnRef: 'order-2',
      };

      const sortedKeys = Object.keys(vnpParams).sort();
      const searchParams = new URLSearchParams();
      for (const key of sortedKeys) {
        searchParams.append(key, vnpParams[key]!);
      }
      const validHash = crypto
        .createHmac('sha512', VNPAY_SANDBOX_CONFIG.vnp_HashSecret)
        .update(Buffer.from(searchParams.toString(), 'utf-8'))
        .digest('hex');

      const result = await service.handleVNPayWebhook({
        vnp_TxnRef: 'order-2',
        vnp_Amount: '20000000',
        vnp_ResponseCode: '00',
        vnp_TransactionNo: '14552312',
        vnp_BankCode: 'NCB',
        vnp_SecureHash: validHash,
      });

      expect(result.RspCode).toBe('00');
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 'order-2' },
        data: { paymentStatus: PaymentStatus.paid },
      });
    });

    it('should throw BadRequestException when VNPay checksum is invalid', async () => {
      await expect(
        service.handleVNPayWebhook({
          vnp_TxnRef: 'order-2',
          vnp_Amount: '20000000',
          vnp_ResponseCode: '00',
          vnp_TransactionNo: '14552312',
          vnp_BankCode: 'NCB',
          vnp_SecureHash: 'invalid-tampered-checksum',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('refundPayment', () => {
    it('should refund successfully for paid online payment', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-1',
        paymentMethod: PaymentMethod.momo,
      });

      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: 'pay-1',
        orderId: 'order-1',
        amount: 150000,
        status: PaymentStatus.paid,
      });

      mockPrismaService.payment.update.mockResolvedValue({
        id: 'pay-1',
        amount: 150000,
        status: PaymentStatus.refunded,
      });

      const result = await service.refundPayment('order-1', 'Khách đổi ý');

      expect(result.success).toBe(true);
      expect(result.refundAmount).toBe(150000);
      expect(mockPrismaService.payment.update).toHaveBeenCalled();
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { paymentStatus: PaymentStatus.refunded },
      });
    });
  });
});
