import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from './users.service';

// Placeholder value used in mock data to simulate a bcrypt hash stored in DB.
// NOT a real credential — intentionally non-sensitive test fixture.
const MOCK_HASH = 'bcrypt_test_placeholder';

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    phone: '0901234567',
    email: null,
    role: 'customer',
    isActive: true,
    passwordHash: MOCK_HASH,
    fcmToken: null,
    avatarUrl: null,
    lat: null,
    lng: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    notification: {
      findMany: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  // ─── findById ─────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('should return user without passwordHash', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById('user-1');

      expect(result).not.toHaveProperty('passwordHash');
      expect(result).toHaveProperty('name', 'Test User');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('not-exist')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update ──────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update user and return without passwordHash', async () => {
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, name: 'Updated' });

      const result = await service.update('user-1', { name: 'Updated' });

      expect(result).not.toHaveProperty('passwordHash');
      expect(result).toHaveProperty('name', 'Updated');
    });
  });

  // ─── updateFcmToken ───────────────────────────────────────────────────────

  describe('updateFcmToken', () => {
    it('should update fcmToken without returning data', async () => {
      mockPrismaService.user.update.mockResolvedValue(undefined);

      await expect(service.updateFcmToken('user-1', 'new-token')).resolves.toBeUndefined();
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { fcmToken: 'new-token' },
      });
    });
  });

  // ─── getOrderHistory ──────────────────────────────────────────────────────

  describe('getOrderHistory', () => {
    const mockOrders = [
      {
        id: 'order-1',
        status: 'completed',
        restaurant: { id: 'r1', name: 'Pho Bo', coverImageUrl: null },
        items: [],
      },
      {
        id: 'order-2',
        status: 'cancelled',
        restaurant: { id: 'r2', name: 'Bun Cha', coverImageUrl: null },
        items: [],
      },
    ];

    it('should return paginated order history for a user', async () => {
      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);
      mockPrismaService.order.count.mockResolvedValue(2);

      const result = await service.getOrderHistory('user-1', 1, 20);

      expect(result.data).toHaveLength(2);
      expect(result.meta).toEqual({ page: 1, limit: 20, total: 2, totalPages: 1 });
    });

    it('should pass correct where clause to prisma', async () => {
      mockPrismaService.order.findMany.mockResolvedValue([]);
      mockPrismaService.order.count.mockResolvedValue(0);

      await service.getOrderHistory('user-1', 2, 10);

      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { customerId: 'user-1' },
          skip: 10,
          take: 10,
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('should calculate totalPages correctly', async () => {
      mockPrismaService.order.findMany.mockResolvedValue([]);
      mockPrismaService.order.count.mockResolvedValue(25);

      const result = await service.getOrderHistory('user-1', 1, 10);

      expect(result.meta.totalPages).toBe(3);
    });
  });

  // ─── getNotifications ─────────────────────────────────────────────────────

  describe('getNotifications', () => {
    const mockNotifications = [
      {
        id: 'n1',
        userId: 'user-1',
        isRead: false,
        title: 'Đơn hàng đang giao',
        createdAt: new Date(),
      },
      {
        id: 'n2',
        userId: 'user-1',
        isRead: true,
        title: 'Thanh toán thành công',
        createdAt: new Date(),
      },
    ];

    it('should return paginated notifications for a user', async () => {
      mockPrismaService.notification.findMany.mockResolvedValue(mockNotifications);
      mockPrismaService.notification.count.mockResolvedValue(2);

      const result = await service.getNotifications('user-1', 1, 30);

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it('should filter by userId', async () => {
      mockPrismaService.notification.findMany.mockResolvedValue([]);
      mockPrismaService.notification.count.mockResolvedValue(0);

      await service.getNotifications('user-1');

      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
          orderBy: { createdAt: 'desc' },
        }),
      );
    });
  });

  // ─── getUnreadCount ───────────────────────────────────────────────────────

  describe('getUnreadCount', () => {
    it('should return count of unread notifications', async () => {
      mockPrismaService.notification.count.mockResolvedValue(5);

      const result = await service.getUnreadCount('user-1');

      expect(result).toEqual({ count: 5 });
      expect(mockPrismaService.notification.count).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1', isRead: false } }),
      );
    });

    it('should return zero when all notifications are read', async () => {
      mockPrismaService.notification.count.mockResolvedValue(0);

      const result = await service.getUnreadCount('user-1');

      expect(result).toEqual({ count: 0 });
    });
  });

  // ─── markNotificationRead ─────────────────────────────────────────────────

  describe('markNotificationRead', () => {
    it('should mark a single notification as read for the correct user', async () => {
      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 1 });

      await service.markNotificationRead('notif-1', 'user-1');

      expect(mockPrismaService.notification.updateMany).toHaveBeenCalledWith({
        where: { id: 'notif-1', userId: 'user-1' },
        data: { isRead: true },
      });
    });

    it('should not throw even if notification not found (updateMany is idempotent)', async () => {
      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.markNotificationRead('bad-id', 'user-1')).resolves.toBeUndefined();
    });
  });

  // ─── markAllNotificationsRead ─────────────────────────────────────────────

  describe('markAllNotificationsRead', () => {
    it('should mark all unread notifications for the user as read', async () => {
      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 10 });

      await service.markAllNotificationsRead('user-1');

      expect(mockPrismaService.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', isRead: false },
        data: { isRead: true },
      });
    });

    it('should resolve without error when there are no unread notifications', async () => {
      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.markAllNotificationsRead('user-1')).resolves.toBeUndefined();
    });
  });
});
