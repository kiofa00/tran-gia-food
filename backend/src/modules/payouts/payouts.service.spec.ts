import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PayoutStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { PayoutsService } from './payouts.service';

describe('PayoutsService', () => {
  let service: PayoutsService;

  const mockUser = { id: 'user-1' } as any;
  const mockShipper = { id: 'ship-1', userId: 'user-1', walletCash: 500000, isActive: true };

  const mockPrismaService = {
    shipper: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    shipperPayout: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayoutsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PayoutsService>(PayoutsService);
    jest.clearAllMocks();
  });

  describe('requestShipperWithdrawal', () => {
    it('should create payout and deduct wallet balance', async () => {
      mockPrismaService.shipper.findUnique.mockResolvedValue(mockShipper);
      mockPrismaService.shipper.update.mockResolvedValue({});
      mockPrismaService.shipperPayout.create.mockResolvedValue({
        id: 'payout-1',
        amount: 200000,
        status: PayoutStatus.pending,
      });

      const result = await service.requestShipperWithdrawal(mockUser, { amount: 200000 });

      expect(result.status).toBe(PayoutStatus.pending);
      expect(mockPrismaService.shipper.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { walletCash: { decrement: 200000 } },
        }),
      );
    });

    it('should throw NotFoundException when shipper profile not found', async () => {
      mockPrismaService.shipper.findUnique.mockResolvedValue(null);

      await expect(
        service.requestShipperWithdrawal(mockUser, { amount: 100000 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when wallet balance is insufficient', async () => {
      mockPrismaService.shipper.findUnique.mockResolvedValue({ ...mockShipper, walletCash: 50000 });

      await expect(
        service.requestShipperWithdrawal(mockUser, { amount: 200000 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getShipperPayoutHistory', () => {
    it('should return payout history for the shipper', async () => {
      const mockPayouts = [{ id: 'p1', amount: 100000 }];
      mockPrismaService.shipper.findUnique.mockResolvedValue(mockShipper);
      mockPrismaService.shipperPayout.findMany.mockResolvedValue(mockPayouts);

      const result = await service.getShipperPayoutHistory(mockUser);

      expect(result).toEqual(mockPayouts);
      expect(mockPrismaService.shipperPayout.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
    });

    it('should throw NotFoundException when shipper profile not found', async () => {
      mockPrismaService.shipper.findUnique.mockResolvedValue(null);

      await expect(service.getShipperPayoutHistory(mockUser)).rejects.toThrow(NotFoundException);
    });
  });
});
