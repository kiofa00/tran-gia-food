import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderType, PaymentMethod, OrderStatus } from '@prisma/client';

describe('OrdersService', () => {
  let service: OrdersService;

  const mockPrismaService = {
    restaurant: { findUnique: jest.fn() },
    menuItem: { findUnique: jest.fn() },
    voucher: { findUnique: jest.fn() },
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockEventEmitter = { emit: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe('createOrder', () => {
    it('should create order and calculate subtotal and distance fee correctly', async () => {
      mockPrismaService.restaurant.findUnique.mockResolvedValue({
        id: 'rest-1',
        isOpen: true,
        lat: 10.7769,
        lng: 106.7009,
        radiusKm: 10,
        platformFeeRate: 0.20,
      });

      mockPrismaService.menuItem.findUnique.mockResolvedValue({
        id: 'item-1',
        name: 'Phở Tái',
        price: 50000,
        isAvailable: true,
      });

      mockPrismaService.order.create.mockResolvedValue({
        id: 'order-123',
        subtotal: 100000,
        shipFee: 13000,
        totalAmount: 113000,
        status: OrderStatus.pending,
      });

      const customer = { id: 'cust-1' } as any;

      const result = await service.createOrder(customer, {
        restaurantId: 'rest-1',
        orderType: OrderType.delivery,
        paymentMethod: PaymentMethod.cash,
        items: [{ itemId: 'item-1', quantity: 2 }],
        deliveryLat: 10.7800,
        deliveryLng: 106.7050,
      });

      expect(result.id).toBe('order-123');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('order.created', expect.any(Object));
    });

    it('should throw BadRequestException if restaurant is closed', async () => {
      mockPrismaService.restaurant.findUnique.mockResolvedValue({
        id: 'rest-1',
        isOpen: false,
      });

      await expect(
        service.createOrder({ id: 'cust-1' } as any, {
          restaurantId: 'rest-1',
          orderType: OrderType.pickup,
          paymentMethod: PaymentMethod.cash,
          items: [{ itemId: 'item-1', quantity: 1 }],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel PENDING order successfully', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-123',
        customerId: 'cust-1',
        status: OrderStatus.pending,
      });

      mockPrismaService.order.update.mockResolvedValue({
        id: 'order-123',
        status: OrderStatus.cancelled,
        cancelReason: 'Đổi ý',
      });

      const result = await service.cancelOrder({ id: 'cust-1', role: 'customer' } as any, 'order-123', {
        reason: 'Đổi ý',
      });

      expect(result.status).toBe(OrderStatus.cancelled);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('order.cancelled', expect.any(Object));
    });
  });
});
