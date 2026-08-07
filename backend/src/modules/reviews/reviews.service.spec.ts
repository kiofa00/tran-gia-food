import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus, User } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { ReviewsService } from './reviews.service';

describe('ReviewsService', () => {
  let service: ReviewsService;

  const mockCustomer = { id: 'cust-1' } as Pick<User, 'id'>;
  const mockCompletedOrder = {
    id: 'order-1',
    customerId: 'cust-1',
    restaurantId: 'rest-1',
    shipperId: 'ship-1',
    status: OrderStatus.completed,
  };

  const mockPrismaService = {
    order: { findUnique: jest.fn() },
    review: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      aggregate: jest.fn(),
    },
    restaurant: { update: jest.fn() },
    shipper: { update: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewsService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    jest.clearAllMocks();
  });

  describe('createReview', () => {
    it('should create review for completed order', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockCompletedOrder);
      mockPrismaService.review.findUnique.mockResolvedValue(null);
      mockPrismaService.review.create.mockResolvedValue({ id: 'review-1' });
      mockPrismaService.review.aggregate.mockResolvedValue({
        _avg: { restaurantRating: 4.5, shipperRating: 5 },
        _count: 10,
      });
      mockPrismaService.restaurant.update.mockResolvedValue({});
      mockPrismaService.shipper.update.mockResolvedValue({});

      const result = await service.createReview(mockCustomer, {
        orderId: 'order-1',
        restaurantRating: 5,
        shipperRating: 5,
        comment: 'Ngon!',
      });

      expect(result).toHaveProperty('id', 'review-1');
    });

    it('should throw NotFoundException when order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(
        service.createReview(mockCustomer, { orderId: 'not-exist', restaurantRating: 5 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when order not completed', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...mockCompletedOrder,
        status: OrderStatus.pending,
      });

      await expect(
        service.createReview(mockCustomer, { orderId: 'order-1', restaurantRating: 5 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when review already exists', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockCompletedOrder);
      mockPrismaService.review.findUnique.mockResolvedValue({ id: 'existing-review' });

      await expect(
        service.createReview(mockCustomer, { orderId: 'order-1', restaurantRating: 5 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when customer is not order owner', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...mockCompletedOrder,
        customerId: 'other-customer',
      });

      await expect(
        service.createReview(mockCustomer, { orderId: 'order-1', restaurantRating: 5 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getRestaurantReviews', () => {
    it('should return reviews ordered by createdAt desc', async () => {
      const mockReviews = [{ id: 'r1' }, { id: 'r2' }];
      mockPrismaService.review.findMany.mockResolvedValue(mockReviews);

      const result = await service.getRestaurantReviews('rest-1');

      expect(result).toEqual(mockReviews);
      expect(mockPrismaService.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
    });
  });
});
