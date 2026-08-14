import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, User } from '@prisma/client';

import { DeliveryGateway } from '../../gateways/delivery.gateway';
import { PrismaService } from '../../prisma/prisma.service';
import { SendChatMessageDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private deliveryGateway: DeliveryGateway,
  ) {}

  // ─── Send ─────────────────────────────────────────────────────────────────

  async sendMessage(sender: User, dto: SendChatMessageDto) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException('Don hang khong ton tai');

    // Chat is only permitted when order is active
    if (order.status === OrderStatus.completed || order.status === OrderStatus.cancelled) {
      throw new ForbiddenException('Don hang da hoan thanh hoac bi huy. Phien chat da dong.');
    }

    const saved = await this.prisma.chatMessage.create({
      data: {
        orderId: dto.orderId,
        senderId: sender.id,
        receiverId: dto.receiverId,
        content: dto.content,
        type: dto.type ?? 'text',
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
      },
    });

    // Relay to order room via WebSocket
    this.deliveryGateway.emitChatMessage(dto.orderId, {
      id: saved.id,
      senderId: saved.senderId,
      senderName: saved.sender?.name ?? '',
      content: saved.content,
      type: saved.type,
      createdAt: saved.createdAt.toISOString(),
    });

    return saved;
  }

  // ─── Read ─────────────────────────────────────────────────────────────────

  async getOrderMessages(user: User, orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Don hang khong ton tai');

    // Auto-mark messages received by this user as read
    await this.prisma.chatMessage.updateMany({
      where: { orderId, receiverId: user.id, isRead: false },
      data: { isRead: true },
    });

    return this.prisma.chatMessage.findMany({
      where: { orderId },
      include: {
        sender: { select: { id: true, name: true, role: true, avatarUrl: true } },
        receiver: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ─── Unread count ─────────────────────────────────────────────────────────

  async getUnreadMessageCount(userId: string, orderId: string): Promise<{ count: number }> {
    const count = await this.prisma.chatMessage.count({
      where: { orderId, receiverId: userId, isRead: false },
    });
    return { count };
  }

  // ─── Mark read ────────────────────────────────────────────────────────────

  async markMessagesRead(userId: string, orderId: string): Promise<void> {
    // Verify order exists before marking
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Don hang khong ton tai');

    await this.prisma.chatMessage.updateMany({
      where: { orderId, receiverId: userId, isRead: false },
      data: { isRead: true },
    });
  }

  // ─── Delete (soft-delete via blanking content) ────────────────────────────

  async deleteMessage(sender: User, messageId: string): Promise<void> {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) throw new NotFoundException('Tin nhan khong ton tai');
    if (message.senderId !== sender.id) {
      throw new ForbiddenException('Ban khong co quyen xoa tin nhan nay');
    }

    // Soft-delete: replace content with placeholder
    await this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { content: '[Tin nhắn đã bị xóa]' },
    });
  }
}
