import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus, User, UserRole } from '@prisma/client';

import { DeliveryGateway } from '../../gateways/delivery.gateway';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  let service: ChatService;

  const mockSender: Partial<User> = { id: 'sender-1', role: UserRole.customer };
  const mockActiveOrder = { id: 'order-1', status: OrderStatus.confirmed };
  const mockCompletedOrder = { id: 'order-2', status: OrderStatus.completed };

  const mockPrismaService = {
    order: { findUnique: jest.fn() },
    chatMessage: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockDeliveryGateway = {
    emitChatMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: DeliveryGateway, useValue: mockDeliveryGateway },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    jest.clearAllMocks();
  });

  // ─── sendMessage ─────────────────────────────────────────────────────────

  describe('sendMessage', () => {
    it('should send message on active order', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockActiveOrder);
      mockPrismaService.chatMessage.create.mockResolvedValue({
        id: 'msg-1',
        createdAt: new Date(),
      });

      const result = await service.sendMessage(mockSender as User, {
        orderId: 'order-1',
        receiverId: 'receiver-1',
        content: 'Hello',
      });

      expect(result).toHaveProperty('id', 'msg-1');
      expect(mockPrismaService.chatMessage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            orderId: 'order-1',
            senderId: 'sender-1',
            content: 'Hello',
          }),
        }),
      );
    });

    it('should throw NotFoundException when order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(
        service.sendMessage(mockSender as User, {
          orderId: 'not-exist',
          receiverId: 'r',
          content: 'Hi',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when order is completed', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockCompletedOrder);

      await expect(
        service.sendMessage(mockSender as User, {
          orderId: 'order-2',
          receiverId: 'receiver-1',
          content: 'Hello',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when order is cancelled', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...mockActiveOrder,
        status: OrderStatus.cancelled,
      });

      await expect(
        service.sendMessage(mockSender as User, {
          orderId: 'order-1',
          receiverId: 'r',
          content: 'Hi',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should default message type to text when not provided', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockActiveOrder);
      mockPrismaService.chatMessage.create.mockResolvedValue({
        id: 'msg-2',
        type: 'text',
        createdAt: new Date(),
      });

      await service.sendMessage(mockSender as User, {
        orderId: 'order-1',
        receiverId: 'receiver-1',
        content: 'Hello',
      });

      expect(mockPrismaService.chatMessage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ type: 'text' }),
        }),
      );
    });
  });

  // ─── getOrderMessages ─────────────────────────────────────────────────────

  describe('getOrderMessages', () => {
    it('should return messages ordered by createdAt asc', async () => {
      const mockMessages = [{ id: 'm1' }, { id: 'm2' }];
      mockPrismaService.order.findUnique.mockResolvedValue(mockActiveOrder);
      mockPrismaService.chatMessage.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.chatMessage.findMany.mockResolvedValue(mockMessages);

      const result = await service.getOrderMessages(mockSender as User, 'order-1');

      expect(result).toEqual(mockMessages);
      expect(mockPrismaService.chatMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'asc' } }),
      );
    });

    it('should auto-mark received messages as read on fetch', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockActiveOrder);
      mockPrismaService.chatMessage.updateMany.mockResolvedValue({ count: 2 });
      mockPrismaService.chatMessage.findMany.mockResolvedValue([]);

      await service.getOrderMessages(mockSender as User, 'order-1');

      expect(mockPrismaService.chatMessage.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ receiverId: mockSender.id, isRead: false }),
          data: { isRead: true },
        }),
      );
    });

    it('should throw NotFoundException when order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(service.getOrderMessages(mockSender as User, 'not-exist')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── getUnreadMessageCount ────────────────────────────────────────────────

  describe('getUnreadMessageCount', () => {
    it('should return count of unread messages for a user in an order', async () => {
      mockPrismaService.chatMessage.count.mockResolvedValue(3);

      const result = await service.getUnreadMessageCount('receiver-1', 'order-1');

      expect(result).toEqual({ count: 3 });
      expect(mockPrismaService.chatMessage.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            orderId: 'order-1',
            receiverId: 'receiver-1',
            isRead: false,
          }),
        }),
      );
    });

    it('should return zero when all messages are read', async () => {
      mockPrismaService.chatMessage.count.mockResolvedValue(0);

      const result = await service.getUnreadMessageCount('receiver-1', 'order-1');

      expect(result).toEqual({ count: 0 });
    });
  });

  // ─── markMessagesRead ─────────────────────────────────────────────────────

  describe('markMessagesRead', () => {
    it('should mark all unread messages for the user in the order as read', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockActiveOrder);
      mockPrismaService.chatMessage.updateMany.mockResolvedValue({ count: 5 });

      await service.markMessagesRead('receiver-1', 'order-1');

      expect(mockPrismaService.chatMessage.updateMany).toHaveBeenCalledWith({
        where: { orderId: 'order-1', receiverId: 'receiver-1', isRead: false },
        data: { isRead: true },
      });
    });

    it('should throw NotFoundException if order does not exist', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(service.markMessagesRead('receiver-1', 'bad-order')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── deleteMessage ────────────────────────────────────────────────────────

  describe('deleteMessage', () => {
    const mockMessage = { id: 'msg-1', senderId: 'sender-1', content: 'Hello' };

    it('should soft-delete message by replacing content', async () => {
      mockPrismaService.chatMessage.findUnique.mockResolvedValue(mockMessage);
      mockPrismaService.chatMessage.update.mockResolvedValue({
        ...mockMessage,
        content: '[Tin nhắn đã bị xóa]',
      });

      await service.deleteMessage(mockSender as User, 'msg-1');

      expect(mockPrismaService.chatMessage.update).toHaveBeenCalledWith({
        where: { id: 'msg-1' },
        data: { content: '[Tin nhắn đã bị xóa]' },
      });
    });

    it('should throw NotFoundException when message not found', async () => {
      mockPrismaService.chatMessage.findUnique.mockResolvedValue(null);

      await expect(service.deleteMessage(mockSender as User, 'bad-msg')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user is not the sender', async () => {
      mockPrismaService.chatMessage.findUnique.mockResolvedValue({
        ...mockMessage,
        senderId: 'other-user', // different user
      });

      await expect(service.deleteMessage(mockSender as User, 'msg-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
