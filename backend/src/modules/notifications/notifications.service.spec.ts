import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockPrismaService = {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    user: { findUnique: jest.fn() },
    restaurant: { findUnique: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  describe('send', () => {
    it('should create notification and skip FCM if user has no token', async () => {
      const mockNotif = { id: 'notif-1', title: 'Test' };
      mockPrismaService.notification.create.mockResolvedValue(mockNotif);
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1', fcmToken: null });

      const result = await service.send({
        userId: 'user-1',
        title: 'Test',
        body: 'Test body',
        type: 'general',
      });

      expect(result).toEqual(mockNotif);
      expect(mockPrismaService.notification.create).toHaveBeenCalledTimes(1);
    });

    it('should create notification and trigger FCM push if user has token', async () => {
      const mockNotif = { id: 'notif-1' };
      mockPrismaService.notification.create.mockResolvedValue(mockNotif);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        fcmToken: 'valid-fcm-token',
      });

      const result = await service.send({
        userId: 'user-1',
        title: 'Order Update',
        body: 'Your order is ready',
      });

      expect(result).toEqual(mockNotif);
    });
  });

  describe('getMyNotifications', () => {
    it('should return notifications limited to 50 ordered by createdAt desc', async () => {
      const mockNotifs = [{ id: 'n1' }, { id: 'n2' }];
      mockPrismaService.notification.findMany.mockResolvedValue(mockNotifs);

      const result = await service.getMyNotifications('user-1');

      expect(result).toEqual(mockNotifs);
      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 50, orderBy: { createdAt: 'desc' } }),
      );
    });
  });

  describe('markAsRead', () => {
    it('should update notification isRead to true', async () => {
      mockPrismaService.notification.update.mockResolvedValue({ id: 'n1', isRead: true });

      const result = await service.markAsRead('n1');

      expect(result.isRead).toBe(true);
      expect(mockPrismaService.notification.update).toHaveBeenCalledWith({
        where: { id: 'n1' },
        data: { isRead: true },
      });
    });
  });
});
