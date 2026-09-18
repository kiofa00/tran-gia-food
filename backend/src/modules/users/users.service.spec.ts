import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
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
    userAddress: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((arg: unknown): Promise<unknown> =>
      typeof arg === 'function'
        ? ((arg as (prisma: unknown) => unknown)(mockPrismaService) as Promise<unknown>)
        : Promise.all(arg as Promise<unknown>[]),
    ),
  };

  const mockCloudinaryService = {
    uploadAvatar: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
      ],
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

    it('should update user profile with email, address, and avatarUrl', async () => {
      const updateData = {
        name: 'Trần Gia Khách',
        email: 'customer@trangiafood.vn',
        address: '123 Nguyễn Huệ, Q1, HCM',
        avatarUrl: 'https://example.com/avatar.jpg',
      };
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        ...updateData,
      });

      const result = await service.update('user-1', updateData);

      expect(result).not.toHaveProperty('passwordHash');
      expect(result.name).toBe('Trần Gia Khách');
      expect(result.email).toBe('customer@trangiafood.vn');
      expect(result.address).toBe('123 Nguyễn Huệ, Q1, HCM');
      expect(result.avatarUrl).toBe('https://example.com/avatar.jpg');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: updateData,
      });
    });
  });

  // ─── updateAvatar ─────────────────────────────────────────────────────────

  describe('updateAvatar', () => {
    it('should upload via CloudinaryService and update user avatarUrl in database', async () => {
      const mockCloudinaryUrl =
        'https://res.cloudinary.com/trangia/image/upload/v1/trangia_food/avatars/avatar-user-1.jpg';
      mockCloudinaryService.uploadAvatar.mockResolvedValue({
        avatarUrl: mockCloudinaryUrl,
      });
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        avatarUrl: mockCloudinaryUrl,
      });

      const file = {
        originalname: 'my-avatar.jpg',
        buffer: Buffer.from('fake-image-bytes'),
        mimetype: 'image/jpeg',
      };

      const result = await service.updateAvatar('user-1', file);

      expect(mockCloudinaryService.uploadAvatar).toHaveBeenCalledWith('user-1', file);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { avatarUrl: mockCloudinaryUrl },
      });
      expect(result).toEqual({ avatarUrl: mockCloudinaryUrl });
    });

    it('should propagate errors thrown by CloudinaryService', async () => {
      mockCloudinaryService.uploadAvatar.mockRejectedValue(
        new BadRequestException('Chỉ chấp nhận định dạng ảnh (JPEG, PNG, WEBP, GIF)'),
      );

      const invalidFile = {
        originalname: 'document.pdf',
        buffer: Buffer.from('fake-pdf-bytes'),
        mimetype: 'application/pdf',
      };

      await expect(service.updateAvatar('user-1', invalidFile)).rejects.toThrow(
        BadRequestException,
      );
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

  // ─── Address Tests ────────────────────────────────────────────────────────

  describe('Address operations', () => {
    const mockAddress = {
      id: 'addr-1',
      userId: 'user-1',
      title: 'Nhà riêng',
      recipientName: 'Trần Gia Khách',
      phone: '0901234567',
      street: '123 Nguyễn Huệ',
      ward: 'Phường Bến Nghé',
      district: 'Quận 1',
      city: 'Thành phố Hồ Chí Minh',
      fullAddress: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh',
      lat: 10.7769,
      lng: 106.7009,
      isDefault: true,
      deliveryNote: 'Gọi trước khi giao',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    describe('getAddresses', () => {
      it('should return addresses for the given user', async () => {
        mockPrismaService.userAddress.findMany.mockResolvedValue([mockAddress]);

        const result = await service.getAddresses('user-1');

        expect(result).toHaveLength(1);
        expect(result[0]!.id).toBe('addr-1');
        expect(mockPrismaService.userAddress.findMany).toHaveBeenCalledWith({
          where: { userId: 'user-1' },
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
      });
    });

    describe('createAddress', () => {
      it('should auto-set isDefault to true for the first address', async () => {
        mockPrismaService.userAddress.count.mockResolvedValue(0);
        mockPrismaService.userAddress.updateMany.mockResolvedValue({ count: 0 });
        mockPrismaService.userAddress.create.mockResolvedValue(mockAddress);
        mockPrismaService.user.update.mockResolvedValue(mockUser);

        const dto = {
          title: 'Nhà riêng',
          recipientName: 'Trần Gia Khách',
          phone: '0901234567',
          street: '123 Nguyễn Huệ',
          ward: 'Phường Bến Nghé',
          district: 'Quận 1',
          city: 'Thành phố Hồ Chí Minh',
          fullAddress: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh',
          lat: 10.7769,
          lng: 106.7009,
        };

        const result = await service.createAddress('user-1', dto);

        expect(result.id).toBe('addr-1');
        expect(mockPrismaService.userAddress.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            userId: 'user-1',
            isDefault: true,
          }),
        });
      });

      it('should create non-default address when user already has addresses', async () => {
        mockPrismaService.userAddress.count.mockResolvedValue(1);
        mockPrismaService.userAddress.create.mockResolvedValue({
          ...mockAddress,
          id: 'addr-2',
          isDefault: false,
        });

        const dto = {
          title: 'Công ty',
          recipientName: 'Trần Gia Khách',
          phone: '0901234567',
          street: '456 Lê Lợi',
          ward: 'Phường Bến Thành',
          district: 'Quận 1',
          city: 'Thành phố Hồ Chí Minh',
          fullAddress: '456 Lê Lợi, Phường Bến Thành, Quận 1, Thành phố Hồ Chí Minh',
          lat: 10.7769,
          lng: 106.7009,
          isDefault: false,
        };

        const result = await service.createAddress('user-1', dto);

        expect(result.isDefault).toBe(false);
        expect(mockPrismaService.userAddress.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            userId: 'user-1',
            isDefault: false,
          }),
        });
      });
    });

    describe('updateAddress', () => {
      it('should throw NotFoundException if address not found or not owned', async () => {
        mockPrismaService.userAddress.findFirst.mockResolvedValue(null);

        await expect(
          service.updateAddress('user-1', 'addr-not-exist', { title: 'New' }),
        ).rejects.toThrow(NotFoundException);
      });

      it('should update address fields successfully', async () => {
        mockPrismaService.userAddress.findFirst.mockResolvedValue(mockAddress);
        mockPrismaService.userAddress.update.mockResolvedValue({
          ...mockAddress,
          title: 'Nhà mẹ',
        });

        const result = await service.updateAddress('user-1', 'addr-1', { title: 'Nhà mẹ' });

        expect(result.title).toBe('Nhà mẹ');
        expect(mockPrismaService.userAddress.update).toHaveBeenCalledWith({
          where: { id: 'addr-1' },
          data: expect.objectContaining({ title: 'Nhà mẹ' }),
        });
      });
    });

    describe('deleteAddress', () => {
      it('should throw NotFoundException if address not found', async () => {
        mockPrismaService.userAddress.findFirst.mockResolvedValue(null);

        await expect(service.deleteAddress('user-1', 'addr-not-exist')).rejects.toThrow(
          NotFoundException,
        );
      });

      it('should delete address and reassign default if deleted address was default', async () => {
        mockPrismaService.userAddress.findFirst
          .mockResolvedValueOnce(mockAddress) // check ownership
          .mockResolvedValueOnce({ ...mockAddress, id: 'addr-2', isDefault: false }); // next address to make default
        mockPrismaService.userAddress.delete.mockResolvedValue(mockAddress);
        mockPrismaService.userAddress.update.mockResolvedValue({
          ...mockAddress,
          id: 'addr-2',
          isDefault: true,
        });
        mockPrismaService.user.update.mockResolvedValue(mockUser);

        const result = await service.deleteAddress('user-1', 'addr-1');

        expect(result).toEqual({ success: true });
        expect(mockPrismaService.userAddress.delete).toHaveBeenCalledWith({
          where: { id: 'addr-1' },
        });
        expect(mockPrismaService.userAddress.update).toHaveBeenCalledWith({
          where: { id: 'addr-2' },
          data: { isDefault: true },
        });
      });
    });

    describe('setDefaultAddress', () => {
      it('should throw NotFoundException if address not found', async () => {
        mockPrismaService.userAddress.findFirst.mockResolvedValue(null);

        await expect(service.setDefaultAddress('user-1', 'addr-none')).rejects.toThrow(
          NotFoundException,
        );
      });

      it('should unset previous defaults, mark address as default, and update user profile', async () => {
        mockPrismaService.userAddress.findFirst.mockResolvedValue(mockAddress);
        mockPrismaService.userAddress.updateMany.mockResolvedValue({ count: 1 });
        mockPrismaService.userAddress.update.mockResolvedValue({
          ...mockAddress,
          isDefault: true,
        });
        mockPrismaService.user.update.mockResolvedValue(mockUser);

        const result = await service.setDefaultAddress('user-1', 'addr-1');

        expect(result.isDefault).toBe(true);
        expect(mockPrismaService.userAddress.updateMany).toHaveBeenCalledWith({
          where: { userId: 'user-1' },
          data: { isDefault: false },
        });
        expect(mockPrismaService.user.update).toHaveBeenCalledWith({
          where: { id: 'user-1' },
          data: {
            address: mockAddress.fullAddress,
            lat: mockAddress.lat,
            lng: mockAddress.lng,
          },
        });
      });
    });
  });
});
