import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { PaymentsService } from './payments.service';

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
    it('should generate MoMo payment url for MoMo orders', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-1',
        paymentMethod: PaymentMethod.momo,
        totalAmount: 150000,
      });

      const result = await service.createPaymentUrl({ orderId: 'order-1' });

      expect(result.payUrl).toContain('momo.vn');
      expect(result.amount).toBe(150000);
      expect(mockPrismaService.payment.upsert).toHaveBeenCalled();
    });
  });

  describe('handleMoMoWebhook', () => {
    it('should update payment status to PAID when resultCode is 0', async () => {
      mockPrismaService.payment.update.mockResolvedValue({ id: 'pay-1' });

      const result = await service.handleMoMoWebhook({
        partnerCode: 'MOMO',
        orderId: 'order-1',
        requestId: 'req-123',
        amount: '150000',
        resultCode: '0',
        message: 'Success',
      });

      expect(result.RspCode).toBe('00');
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { paymentStatus: PaymentStatus.paid },
      });
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
