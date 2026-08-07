import { Test, TestingModule } from '@nestjs/testing';
import { KycStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  let service: AdminService;

  const mockPrismaService = {
    user: {
      count: jest.fn().mockResolvedValue(100),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'user-1',
          name: 'Nguyễn Văn A',
          phone: '0901234567',
          email: 'user1@example.com',
          role: 'customer',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'user-2',
          name: 'Trần Thị B',
          phone: '0909876543',
          email: null,
          role: 'shipper',
          createdAt: new Date('2024-02-01'),
        },
      ]),
      findUnique: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
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
      providers: [AdminService, { provide: PrismaService, useValue: mockPrismaService }],
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
      mockPrismaService.shipper.update.mockResolvedValue({
        id: 'shipper-1',
        ekycStatus: KycStatus.verified,
      });

      const result = await service.updateShipperKyc('shipper-1', { status: KycStatus.verified });

      expect(result.ekycStatus).toBe(KycStatus.verified);
    });
  });

  describe('getUsersList', () => {
    it('should return paginated user list with correct structure', async () => {
      const result = await service.getUsersList({ role: 'ALL' });
      expect(result).toBeDefined();

      const data = Array.isArray(result) ? result : (result as { data: unknown[] }).data;
      expect(Array.isArray(data)).toBe(true);

      const first = (data as { id: string; role: string; status: string }[])[0];
      expect(first.id).toBe('user-1');
      expect(first.role).toBe('CUSTOMER'); // uppercased
      expect(first.status).toBe('ACTIVE'); // default
    });

    it('should filter by role when specified', async () => {
      const result = await service.getUsersList({ role: 'SHIPPER' });
      const data = Array.isArray(result) ? result : (result as { data: unknown[] }).data;
      const items = data as { id: string; role: string }[];
      expect(items.every((u) => u.role === 'SHIPPER')).toBe(true);
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status', async () => {
      mockPrismaService.user.findUnique = jest
        .fn()
        .mockResolvedValue({ id: 'user-1', name: 'Test' });
      mockPrismaService.user.update = jest
        .fn()
        .mockResolvedValue({ id: 'user-1', status: 'SUSPENDED' });

      const result = await service.updateUserStatus('user-1', { status: 'SUSPENDED' });
      expect(result.status).toBe('SUSPENDED');
    });
  });
});
