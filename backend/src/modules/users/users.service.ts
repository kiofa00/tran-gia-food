import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Partial<User>> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Khong tim thay nguoi dung');
    const userObj = { ...user } as Record<string, unknown>;
    delete userObj.passwordHash;
    return userObj as Partial<User>;
  }

  async update(id: string, dto: UpdateUserDto): Promise<Partial<User>> {
    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
    });
    const userObj = { ...user } as Record<string, unknown>;
    delete userObj.passwordHash;
    return userObj as Partial<User>;
  }

  async updateFcmToken(id: string, fcmToken: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { fcmToken },
    });
  }

  /** Lich su don hang cua customer (phan trang, sort moi nhat truoc) */
  async getOrderHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { customerId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          restaurant: { select: { id: true, name: true, coverImageUrl: true } },
          items: {
            include: { item: { select: { name: true, price: true } } },
          },
        },
      }),
      this.prisma.order.count({ where: { customerId: userId } }),
    ]);

    return {
      data: orders,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Danh sach thong bao cua user (phan trang) */
  async getNotifications(userId: string, page = 1, limit = 30) {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return {
      data: notifications,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /** So thong bao chua doc */
  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  /** Danh dau mot thong bao da doc */
  async markNotificationRead(notificationId: string, userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  /** Danh dau tat ca thong bao da doc */
  async markAllNotificationsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
