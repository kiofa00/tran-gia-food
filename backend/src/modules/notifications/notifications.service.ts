import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { SendNotificationDto } from './dto/notification.dto';
import { Order } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async send(dto: SendNotificationDto) {
    // 1. Save notification to DB
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        title: dto.title,
        body: dto.body,
        type: dto.type ?? 'general',
        data: dto.data,
      },
    });

    // 2. Trigger FCM Push Notification
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (user?.fcmToken) {
      await this.sendFcmPush(user.fcmToken, dto.title, dto.body, dto.data);
    }

    return notification;
  }

  async getMyNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  // ──────────────────────────────────────────
  // Event Listeners for Automatic Notifications
  // ──────────────────────────────────────────

  @OnEvent('order.created')
  async handleOrderCreated(order: Order) {
    // Notify Restaurant
    const restaurant = await this.prisma.restaurant.findUnique({ where: { id: order.restaurantId } });
    if (restaurant) {
      await this.send({
        userId: restaurant.ownerId,
        title: '🔔 Có đơn hàng mới!',
        body: `Đơn hàng #${order.id.slice(-5)} vừa được khởi tạo (${order.totalAmount.toLocaleString('vi-VN')}đ).`,
        type: 'new_order',
        data: { orderId: order.id },
      });
    }
  }

  @OnEvent('order.cancelled')
  async handleOrderCancelled(order: Order) {
    // Notify Customer & Restaurant
    await this.send({
      userId: order.customerId,
      title: '❌ Đơn hàng đã bị hủy',
      body: `Đơn hàng #${order.id.slice(-5)} đã hủy. Lý do: ${order.cancelReason ?? 'Hệ thống'}`,
      type: 'order_cancelled',
      data: { orderId: order.id },
    });
  }

  private async sendFcmPush(fcmToken: string, title: string, _body: string, _data?: any) {
    this.logger.log(`[FCM Push] → Token ${fcmToken.slice(0, 10)}... | Title: ${title}`);
    // Integration with Firebase Admin SDK:
    // await admin.messaging().send({ token: fcmToken, notification: { title, body }, data });
  }
}
