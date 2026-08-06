import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma/prisma.service';
import { CommissionsService } from './commissions.service';

describe('CommissionsService', () => {
  let service: CommissionsService;

  const mockPrismaService = {
    commission: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    shipper: {
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommissionsService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<CommissionsService>(CommissionsService);
  });

  describe('handleOrderCompleted', () => {
    it('should split earnings correctly and credit shipper wallet', async () => {
      mockPrismaService.commission.findUnique.mockResolvedValue(null);
      mockPrismaService.commission.create.mockResolvedValue({ id: 'comm-1' });

      const order = {
        id: 'order-100',
        subtotal: 100000,
        shipFee: 20000,
        platformFee: 20000,
        shipperId: 'shipper-1',
      } as unknown as Parameters<CommissionsService['handleOrderCompleted']>[0];

      await service.handleOrderCompleted(order);

      expect(mockPrismaService.commission.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          foodAmount: 100000,
          shipAmount: 20000,
          restaurantShare: 80000, // 80% of food
          shipperShare: 17000, // 85% of ship
          platformShare: 23000, // 20k food + 3k ship
        }),
      });

      expect(mockPrismaService.shipper.update).toHaveBeenCalledWith({
        where: { id: 'shipper-1' },
        data: expect.objectContaining({
          walletCash: { increment: 17000 },
        }),
      });
    });
  });
});
