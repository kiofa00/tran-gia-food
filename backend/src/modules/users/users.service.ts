import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

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

  async updateAvatar(
    userId: string,
    file: { originalname: string; buffer: Buffer; mimetype: string },
    _baseUrl?: string,
  ): Promise<{ avatarUrl: string }> {
    const { avatarUrl } = await this.cloudinaryService.uploadAvatar(userId, file);

    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    return { avatarUrl };
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

  // ─── User Addresses ────────────────────────────────────────────────────────

  /** Lay danh sach dia chi da luu cua user */
  async getAddresses(userId: string) {
    return this.prisma.userAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /** Them dia chi moi */
  async createAddress(userId: string, dto: CreateAddressDto) {
    const existingCount = await this.prisma.userAddress.count({ where: { userId } });
    const isDefault = dto.isDefault || existingCount === 0;

    if (isDefault) {
      await this.prisma.userAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const newAddress = await this.prisma.userAddress.create({
      data: {
        userId,
        title: dto.title,
        recipientName: dto.recipientName,
        phone: dto.phone,
        street: dto.street,
        ward: dto.ward,
        district: dto.district,
        city: dto.city,
        fullAddress: dto.fullAddress,
        lat: dto.lat,
        lng: dto.lng,
        isDefault,
        deliveryNote: dto.deliveryNote,
      },
    });

    if (isDefault) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          address: newAddress.fullAddress,
          lat: newAddress.lat,
          lng: newAddress.lng,
        },
      });
    }

    return newAddress;
  }

  /** Cap nhat dia chi */
  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    const existing = await this.prisma.userAddress.findFirst({
      where: { id: addressId, userId },
    });
    if (!existing) throw new NotFoundException('Khong tim thay dia chi');

    if (dto.isDefault) {
      await this.prisma.userAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const updated = await this.prisma.userAddress.update({
      where: { id: addressId },
      data: {
        ...dto,
      },
    });

    if (updated.isDefault) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          address: updated.fullAddress,
          lat: updated.lat,
          lng: updated.lng,
        },
      });
    }

    return updated;
  }

  /** Xoa dia chi */
  async deleteAddress(userId: string, addressId: string) {
    const existing = await this.prisma.userAddress.findFirst({
      where: { id: addressId, userId },
    });
    if (!existing) throw new NotFoundException('Khong tim thay dia chi');

    await this.prisma.userAddress.delete({ where: { id: addressId } });

    if (existing.isDefault) {
      const latest = await this.prisma.userAddress.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (latest) {
        await this.prisma.userAddress.update({
          where: { id: latest.id },
          data: { isDefault: true },
        });
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            address: latest.fullAddress,
            lat: latest.lat,
            lng: latest.lng,
          },
        });
      } else {
        await this.prisma.user.update({
          where: { id: userId },
          data: { address: null, lat: null, lng: null },
        });
      }
    }

    return { success: true };
  }

  /** Dat dia chi lam mac dinh */
  async setDefaultAddress(userId: string, addressId: string) {
    const existing = await this.prisma.userAddress.findFirst({
      where: { id: addressId, userId },
    });
    if (!existing) throw new NotFoundException('Khong tim thay dia chi');

    await this.prisma.$transaction([
      this.prisma.userAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      }),
      this.prisma.userAddress.update({
        where: { id: addressId },
        data: { isDefault: true },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          address: existing.fullAddress,
          lat: existing.lat,
          lng: existing.lng,
        },
      }),
    ]);

    return { ...existing, isDefault: true };
  }
}
