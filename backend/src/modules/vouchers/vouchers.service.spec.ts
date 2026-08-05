import { Test, TestingModule } from '@nestjs/testing';
import { VouchersService } from './vouchers.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('VouchersService', () => {
  let service: VouchersService;

  const mockPrismaService = {
    voucher: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VouchersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<VouchersService>(VouchersService);
  });

  describe('validateVoucher', () => {
    it('should calculate percent discount correctly with max limit', async () => {
      const now = new Date();
      mockPrismaService.voucher.findUnique.mockResolvedValue({
        id: 'v-123',
        code: 'DISCOUNT20',
        discountType: 'percent',
        discountValue: 20, // 20%
        maxDiscount: 30000,
        minOrderValue: 100000,
        validFrom: new Date(now.getTime() - 10000),
        validTo: new Date(now.getTime() + 10000),
        totalLimit: 100,
        usedCount: 10,
      });

      const result = await service.validateVoucher({ code: 'DISCOUNT20', subtotal: 200000 });

      // 20% of 200k = 40k, capped at maxDiscount 30k
      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(30000);
      expect(result.finalTotal).toBe(170000);
    });

    it('should throw BadRequestException if subtotal is lower than minOrderValue', async () => {
      const now = new Date();
      mockPrismaService.voucher.findUnique.mockResolvedValue({
        id: 'v-123',
        code: 'BIGDEAL',
        discountType: 'fixed',
        discountValue: 50000,
        minOrderValue: 200000,
        validFrom: new Date(now.getTime() - 10000),
        validTo: new Date(now.getTime() + 10000),
      });

      await expect(
        service.validateVoucher({ code: 'BIGDEAL', subtotal: 150000 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if voucher code does not exist', async () => {
      mockPrismaService.voucher.findUnique.mockResolvedValue(null);

      await expect(
        service.validateVoucher({ code: 'INVALID', subtotal: 100000 }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
