import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SendChatMessageDto } from './dto/chat.dto';
import { User, OrderStatus } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(sender: User, dto: SendChatMessageDto) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    // Chat is only permitted when order is active
    if (order.status === OrderStatus.completed || order.status === OrderStatus.cancelled) {
      throw new ForbiddenException('Đơn hàng đã hoàn thành hoặc bị hủy. Phiên chat đã đóng.');
    }

    return this.prisma.chatMessage.create({
      data: {
        orderId: dto.orderId,
        senderId: sender.id,
        receiverId: dto.receiverId,
        content: dto.content,
        type: dto.type ?? 'text',
      },
    });
  }

  async getOrderMessages(user: User, orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    return this.prisma.chatMessage.findMany({
      where: { orderId },
      include: {
        sender: { select: { id: true, name: true, role: true, avatarUrl: true } },
        receiver: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
