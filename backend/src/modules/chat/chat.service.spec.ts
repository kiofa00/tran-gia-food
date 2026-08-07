import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus, User, UserRole } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  let service: ChatService;

  const mockSender: Partial<User> = { id: 'sender-1', role: UserRole.customer };
  const mockActiveOrder = { id: 'order-1', status: OrderStatus.confirmed };
  const mockCompletedOrder = { id: 'order-2', status: OrderStatus.completed };

  const mockPrismaService = {
    order: { findUnique: jest.fn() },
    chatMessage: { create: jest.fn(), findMany: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<ChatService>(ChatService);
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should send message on active order', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockActiveOrder);
      mockPrismaService.chatMessage.create.mockResolvedValue({ id: 'msg-1' });

      const result = await service.sendMessage(mockSender as User, {
        orderId: 'order-1',
        receiverId: 'receiver-1',
        content: 'Hello',
      });

      expect(result).toHaveProperty('id', 'msg-1');
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
  });

  describe('getOrderMessages', () => {
    it('should return messages ordered by createdAt asc', async () => {
      const mockMessages = [{ id: 'm1' }, { id: 'm2' }];
      mockPrismaService.order.findUnique.mockResolvedValue(mockActiveOrder);
      mockPrismaService.chatMessage.findMany.mockResolvedValue(mockMessages);

      const result = await service.getOrderMessages(mockSender as User, 'order-1');

      expect(result).toEqual(mockMessages);
      expect(mockPrismaService.chatMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'asc' } }),
      );
    });

    it('should throw NotFoundException when order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(service.getOrderMessages(mockSender as User, 'not-exist')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
