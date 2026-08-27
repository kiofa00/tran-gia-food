import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DiscountType, User, UserRole, VoucherType } from '@prisma/client';

import { MenuService } from '../modules/menu/menu.service';
import { RestaurantsService } from '../modules/restaurants/restaurants.service';
import { VouchersService } from '../modules/vouchers/vouchers.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

describe('E2E Flow 2 & 3: Restaurant, Menu & Voucher Management Workflow', () => {
  let restaurantsService: RestaurantsService;
  let menuService: MenuService;
  let vouchersService: VouchersService;

  const mockAdminUser = { id: 'admin-1', role: UserRole.admin } as unknown as User;
  const mockRestaurantOwner = { id: 'owner-1', role: UserRole.restaurant } as unknown as User;

  const mockPrismaService = {
    restaurant: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    menuCategory: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    menuItem: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    voucher: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    voucherUsage: {
      count: jest.fn(),
      create: jest.fn(),
    },
    appConfig: {
      findUnique: jest.fn().mockResolvedValue({ value: '10' }),
    },
  };

  const mockRedisService = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantsService,
        MenuService,
        VouchersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    restaurantsService = module.get<RestaurantsService>(RestaurantsService);
    menuService = module.get<MenuService>(MenuService);
    vouchersService = module.get<VouchersService>(VouchersService);
    jest.clearAllMocks();
  });

  describe('Step 1: Restaurant Opening Hours & Configuration', () => {
    it('should configure weekly opening hours schedule for restaurant', async () => {
      const openingHoursData = {
        monday: { open: '07:00', close: '22:00', isOpen: true },
        tuesday: { open: '07:00', close: '22:00', isOpen: true },
        wednesday: { open: '07:00', close: '22:00', isOpen: true },
        thursday: { open: '07:00', close: '22:00', isOpen: true },
        friday: { open: '07:00', close: '22:30', isOpen: true },
        saturday: { open: '07:00', close: '23:00', isOpen: true },
        sunday: { open: '07:00', close: '23:00', isOpen: true },
      };

      mockPrismaService.restaurant.findUnique.mockResolvedValue({
        id: 'rest-1',
        ownerId: 'owner-1',
      });

      mockPrismaService.restaurant.update.mockResolvedValue({
        id: 'rest-1',
        name: 'Cơm Tấm Sài Gòn 39',
        openingHours: openingHoursData,
      });

      const updated = await restaurantsService.update(mockRestaurantOwner, 'rest-1', {
        openingHours: openingHoursData,
      });

      expect(updated.openingHours).toEqual(openingHoursData);
      expect(mockPrismaService.restaurant.update).toHaveBeenCalled();
    });
  });

  describe('Step 2: Menu Categories, Items & Stock Management', () => {
    it('should create menu category and item with price and options', async () => {
      mockPrismaService.restaurant.findUnique.mockResolvedValue({
        id: 'rest-1',
        ownerId: 'owner-1',
      });

      mockPrismaService.menuCategory.create.mockResolvedValue({
        id: 'cat-1',
        name: 'Món Chính',
        restaurantId: 'rest-1',
      });

      const category = await menuService.createCategory(mockRestaurantOwner, 'rest-1', {
        name: 'Món Chính',
      });

      expect(category.name).toBe('Món Chính');

      mockPrismaService.menuCategory.findUnique.mockResolvedValue({
        id: 'cat-1',
        restaurantId: 'rest-1',
      });

      mockPrismaService.menuItem.create.mockResolvedValue({
        id: 'item-1',
        name: 'Cơm Sườn Nướng Mật Ong',
        price: 55000,
        categoryId: 'cat-1',
        isAvailable: true,
      });

      const menuItem = await menuService.createItem(mockRestaurantOwner, 'cat-1', {
        name: 'Cơm Sườn Nướng Mật Ong',
        price: 55000,
        description: 'Sườn cốt lết ướp mật ong rừng',
      });

      expect(menuItem.price).toBe(55000);
      expect(menuItem.isAvailable).toBe(true);
    });

    it('should toggle item availability when out of stock', async () => {
      mockPrismaService.menuItem.findUnique.mockResolvedValue({
        id: 'item-1',
        category: { restaurantId: 'rest-1' },
      });
      mockPrismaService.restaurant.findUnique.mockResolvedValue({
        id: 'rest-1',
        ownerId: 'owner-1',
      });

      mockPrismaService.menuItem.update.mockResolvedValue({
        id: 'item-1',
        isAvailable: false,
      });

      const toggled = await menuService.updateItem(mockRestaurantOwner, 'item-1', {
        isAvailable: false,
      });
      expect(toggled.isAvailable).toBe(false);
    });
  });

  describe('Step 3: Platform Voucher & Restaurant Voucher Issuance and Validation', () => {
    it('should allow Admin to issue a Platform Voucher with minOrderValue & maxDiscount', async () => {
      mockPrismaService.voucher.findUnique.mockResolvedValue(null);
      mockPrismaService.voucher.create.mockResolvedValue({
        id: 'vouch-platform-1',
        code: 'TRANGA20',
        type: VoucherType.platform,
        discountType: DiscountType.percent,
        discountValue: 20,
        maxDiscount: 40000,
        minOrderValue: 100000,
        validFrom: new Date('2026-08-01'),
        validTo: new Date('2026-08-31'),
        totalLimit: 500,
        usedCount: 0,
      });

      const voucher = await vouchersService.create(mockAdminUser, {
        code: 'TRANGA20',
        type: VoucherType.platform,
        discountType: DiscountType.percent,
        discountValue: 20,
        maxDiscount: 40000,
        minOrderValue: 100000,
        validFrom: '2026-08-01',
        validTo: '2026-08-31',
        totalLimit: 500,
      });

      expect(voucher.code).toBe('TRANGA20');
      expect(voucher.type).toBe(VoucherType.platform);
    });

    it('should validate voucher discount calculation correctly', async () => {
      mockPrismaService.voucher.findUnique.mockResolvedValue({
        id: 'vouch-platform-1',
        code: 'TRANGA20',
        type: VoucherType.platform,
        discountType: DiscountType.percent,
        discountValue: 20,
        maxDiscount: 40000,
        minOrderValue: 100000,
        validFrom: new Date('2026-01-01'),
        validTo: new Date('2026-12-31'),
        totalLimit: 500,
        usedCount: 10,
        perUserLimit: 2,
      });

      mockPrismaService.voucherUsage.count.mockResolvedValue(0);

      const validation = await vouchersService.validateVoucher({
        code: 'TRANGA20',
        subtotal: 150000,
      });

      // 20% of 150.000 = 30.000 (< maxDiscount 40.000)
      expect(validation.discountAmount).toBe(30000);
      expect(validation.finalTotal).toBe(120000);
    });

    it('should reject voucher when order subtotal is below minimum order value', async () => {
      mockPrismaService.voucher.findUnique.mockResolvedValue({
        id: 'vouch-platform-1',
        code: 'TRANGA20',
        minOrderValue: 100000,
        validFrom: new Date('2026-01-01'),
        validTo: new Date('2026-12-31'),
        totalLimit: 500,
        usedCount: 10,
      });

      await expect(
        vouchersService.validateVoucher({
          code: 'TRANGA20',
          subtotal: 80000, // Below 100k
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
