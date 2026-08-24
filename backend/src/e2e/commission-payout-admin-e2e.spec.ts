import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Order, PayoutStatus } from '@prisma/client';

import { AdminService } from '../modules/admin/admin.service';
import { CmsService } from '../modules/cms/cms.service';
import { CommissionsService } from '../modules/commissions/commissions.service';
import { MailService } from '../modules/mail/mail.service';
import { PayoutsService } from '../modules/payouts/payouts.service';
import { UsersService } from '../modules/users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

describe('E2E Flow 5 & 6: Commission, Payouts, Admin KPI & CMS Management Workflow', () => {
  let commissionsService: CommissionsService;
  let payoutsService: PayoutsService;
  let adminService: AdminService;
  let usersService: UsersService;
  let cmsService: CmsService;

  const mockPrismaService = {
    commission: {
      findUnique: jest.fn(),
      create: jest.fn(),
      aggregate: jest.fn(),
    },
    appConfig: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
    order: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    shipper: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    restaurant: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    shipperPenalty: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    shipperPayout: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    payment: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockRedisService = {
    getAllActiveShipperLocations: jest.fn().mockResolvedValue([]),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
  };

  const mockMailService = {
    sendShipperWeeklyStatement: jest.fn().mockResolvedValue({ success: true }),
    sendRestaurantWeeklyStatement: jest.fn().mockResolvedValue({ success: true }),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'CMS_URL') return 'http://localhost:1337';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommissionsService,
        PayoutsService,
        AdminService,
        UsersService,
        CmsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: MailService, useValue: mockMailService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    commissionsService = module.get<CommissionsService>(CommissionsService);
    payoutsService = module.get<PayoutsService>(PayoutsService);
    adminService = module.get<AdminService>(AdminService);
    usersService = module.get<UsersService>(UsersService);
    cmsService = module.get<CmsService>(CmsService);
    jest.clearAllMocks();
  });

  describe('Step 1: Automatic Commission Calculation & Dual-Wallet Balance Update', () => {
    it('should calculate platform, restaurant and shipper shares on order completion', async () => {
      mockPrismaService.commission.findUnique.mockResolvedValue(null);
      mockPrismaService.appConfig.findUnique.mockResolvedValue({ value: '0.15' }); // 15% platform ship fee rate

      mockPrismaService.commission.create.mockResolvedValue({
        id: 'comm-1',
        orderId: 'order-100',
        foodAmount: 100000,
        shipAmount: 20000,
        restaurantShare: 85000,
        shipperShare: 17000, // 85% of 20.000 ship fee
        platformShare: 18000, // 15.000 + 3.000
      });

      mockPrismaService.shipper.update.mockResolvedValue({});

      const orderData = {
        id: 'order-100',
        subtotal: 100000,
        shipFee: 20000,
        platformFee: 15000, // 15%
        shipperId: 'ship-1',
      };

      await commissionsService.handleOrderCompleted(orderData as unknown as Order);

      expect(mockPrismaService.commission.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            orderId: 'order-100',
            foodAmount: 100000,
            shipAmount: 20000,
            restaurantShare: 85000,
            shipperShare: 17000,
            platformShare: 18000,
          }),
        }),
      );

      expect(mockPrismaService.shipper.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ship-1' },
          data: {
            walletCash: { increment: 17000 },
            totalDeliveries: { increment: 1 },
          },
        }),
      );
    });
  });

  describe('Step 2: Weekly Statement & Automated Payouts Dispatch', () => {
    it('should generate weekly payout statements and dispatch emails to active shippers', async () => {
      mockPrismaService.shipper.findMany.mockResolvedValue([
        {
          id: 'ship-1',
          walletCash: 850000,
          isActive: true,
          bankAccount: '9988776655',
          user: { email: 'shipper.hung@trangiafood.vn', name: 'Nguyễn Văn Hùng' },
        },
      ]);

      mockPrismaService.shipperPayout.create.mockResolvedValue({
        id: 'payout-auto-1',
        shipperId: 'ship-1',
        amount: 850000,
        status: PayoutStatus.completed,
      });

      await payoutsService.generateWeeklyStatements();

      expect(mockPrismaService.shipperPayout.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            shipperId: 'ship-1',
            amount: 850000,
            status: PayoutStatus.completed,
          }),
        }),
      );

      expect(mockMailService.sendShipperWeeklyStatement).toHaveBeenCalledWith(
        'shipper.hung@trangiafood.vn',
        expect.objectContaining({
          shipperName: 'Nguyễn Văn Hùng',
          netPayoutAmount: 850000,
        }),
      );
    });
  });

  describe('Step 3: Admin Management, Analytics & CMS Content', () => {
    it('should retrieve overall platform KPI summary for admin dashboard', async () => {
      mockPrismaService.user.count.mockResolvedValue(340);
      mockPrismaService.restaurant.count.mockResolvedValue(45);
      mockPrismaService.shipper.count.mockResolvedValue(60);
      mockPrismaService.order.count.mockResolvedValue(1250);
      mockPrismaService.commission.aggregate = jest.fn().mockResolvedValue({
        _sum: {
          platformShare: 52500,
          foodAmount: 350000,
          shipAmount: 70000,
        },
      });

      const overview = await adminService.getDashboardOverview();

      expect(overview.totalOrders).toBe(1250);
      expect(overview.totalUsers).toBe(340);
      expect(overview.totalRestaurants).toBe(45);
      expect(overview.totalShippers).toBe(60);
      expect(overview.totalPlatformRevenue).toBe(52500);
      expect(overview.totalFoodGmv).toBe(350000);
    });

    it('should allow admin to update user account profile / status', async () => {
      mockPrismaService.user.update.mockResolvedValue({
        id: 'user-1',
        name: 'Nguyễn Văn Cập Nhật',
        phone: '0901112233',
        isActive: false,
      });

      const updated = await usersService.update('user-1', {
        name: 'Nguyễn Văn Cập Nhật',
      });

      expect(updated.name).toBe('Nguyễn Văn Cập Nhật');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { name: 'Nguyễn Văn Cập Nhật' },
      });
    });

    it('should retrieve announcements from CMS', async () => {
      const result = await cmsService.getAnnouncements();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
