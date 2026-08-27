import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User, UserRole } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { RestaurantsService } from './restaurants.service';

describe('RestaurantsService', () => {
  let service: RestaurantsService;

  const mockOwner: Partial<User> = { id: 'owner-1', role: UserRole.restaurant };
  const mockOtherUser: Partial<User> = { id: 'other-1', role: UserRole.restaurant };

  const mockRestaurant = {
    id: 'rest-1',
    name: 'Phở Bò',
    ownerId: 'owner-1',
    isOpen: false,
    lat: 10.77,
    lng: 106.68,
    radiusKm: 5,
  };

  const mockPrismaService = {
    appConfig: { findUnique: jest.fn() },
    restaurant: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  const mockRedisService = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<RestaurantsService>(RestaurantsService);
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return restaurant with categories and items', async () => {
      mockPrismaService.restaurant.findUnique.mockResolvedValue(mockRestaurant);

      const result = await service.findById('rest-1');

      expect(result).toEqual(mockRestaurant);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrismaService.restaurant.findUnique.mockResolvedValue(null);

      await expect(service.findById('not-exist')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create restaurant for owner', async () => {
      mockPrismaService.restaurant.create.mockResolvedValue(mockRestaurant);

      const result = await service.create(mockOwner as User, {
        name: 'Phở Bò',
        address: '123 Lê Lợi',
        lat: 10.77,
        lng: 106.68,
        phone: '0901234567',
      });

      expect(result).toEqual(mockRestaurant);
    });
  });

  describe('update', () => {
    it('should update restaurant for owner', async () => {
      mockPrismaService.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrismaService.restaurant.update.mockResolvedValue({ ...mockRestaurant, name: 'Updated' });

      const result = await service.update(mockOwner as User, 'rest-1', { name: 'Updated' });

      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException when restaurant not found', async () => {
      mockPrismaService.restaurant.findUnique.mockResolvedValue(null);

      await expect(service.update(mockOwner as User, 'not-exist', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException for non-owner', async () => {
      mockPrismaService.restaurant.findUnique.mockResolvedValue(mockRestaurant);

      await expect(service.update(mockOtherUser as User, 'rest-1', { name: 'X' })).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('toggleOpen', () => {
    it('should toggle restaurant open status', async () => {
      mockPrismaService.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrismaService.restaurant.update.mockResolvedValue({ ...mockRestaurant, isOpen: true });

      const result = await service.toggleOpen(mockOwner as User, 'rest-1', true);

      expect(result.isOpen).toBe(true);
    });

    it('should throw ForbiddenException for non-owner', async () => {
      mockPrismaService.restaurant.findUnique.mockResolvedValue(mockRestaurant);

      await expect(service.toggleOpen(mockOtherUser as User, 'rest-1', true)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findNearby', () => {
    it('should query nearby restaurants when app configs are present', async () => {
      mockPrismaService.appConfig.findUnique.mockImplementation(
        ({ where }: { where: { key: string } }) => {
          if (where.key === 'system_radius_km') return Promise.resolve({ value: '10.0' });
          if (where.key === 'peak_radius_km') return Promise.resolve({ value: '7.0' });
          if (where.key === 'peak_hours')
            return Promise.resolve({ value: '11:00-13:00,17:00-19:00' });
          return Promise.resolve(null);
        },
      );

      mockPrismaService.$queryRaw.mockResolvedValue([mockRestaurant]);

      const result = await service.findNearby(10.77, 106.68, 10, 'Cơm');
      expect(result).toEqual([mockRestaurant]);
      expect(mockPrismaService.$queryRaw).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when required app config is missing', async () => {
      mockPrismaService.appConfig.findUnique.mockResolvedValue(null);

      await expect(service.findNearby(10.77, 106.68)).rejects.toThrow(
        /Missing system configuration/,
      );
    });
  });
});
