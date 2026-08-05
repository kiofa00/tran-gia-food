import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../../prisma/prisma.service';
import { KycStatus } from '@prisma/client';

describe('AdminService', () => {
  let service: AdminService;

  const mockPrismaService = {
    user: { count: jest.fn().mockResolvedValue(100) },
    restaurant: { count: jest.fn().mockResolvedValue(20) },
    shipper: {
      count: jest.fn().mockResolvedValue(30),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    order: { count: jest.fn().mockResolvedValue(500) },
    commission: {
      aggregate: jest.fn().mockResolvedValue({
        _sum: { platformShare: 5000000, foodAmount: 20000000, shipAmount: 5000000 },
      }),
    },
    appConfig: {
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
    shipperPenalty: { create: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  describe('getDashboardOverview', () => {
    it('should aggregate system stats and revenue overview', async () => {
      const overview = await service.getDashboardOverview();

      expect(overview.totalUsers).toBe(100);
      expect(overview.totalRestaurants).toBe(20);
      expect(overview.totalShippers).toBe(30);
      expect(overview.totalOrders).toBe(500);
      expect(overview.totalPlatformRevenue).toBe(5000000);
    });
  });

  describe('updateShipperKyc', () => {
    it('should update eKYC status to VERIFIED', async () => {
      mockPrismaService.shipper.findUnique.mockResolvedValue({ id: 'shipper-1' });
      mockPrismaService.shipper.update.mockResolvedValue({ id: 'shipper-1', ekycStatus: KycStatus.verified });

      const result = await service.updateShipperKyc('shipper-1', { status: KycStatus.verified });

      expect(result.ekycStatus).toBe(KycStatus.verified);
    });
  });
});
