import { Test, TestingModule } from '@nestjs/testing';
import { ShippersService } from './shippers.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { BadRequestException } from '@nestjs/common';
import { VehicleType, OrderStatus, KycStatus } from '@prisma/client';

describe('ShippersService', () => {
  let service: ShippersService;

  const mockPrismaService = {
    shipper: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: { update: jest.fn() },
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockRedisService = {
    setShipperLocation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShippersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<ShippersService>(ShippersService);
  });

  describe('register', () => {
    it('should register new shipper successfully', async () => {
      mockPrismaService.shipper.findUnique.mockResolvedValue(null);
      mockPrismaService.shipper.create.mockResolvedValue({
        id: 'shipper-1',
        userId: 'user-1',
        vehicleType: VehicleType.motorbike,
      });

      const user = { id: 'user-1' } as any;
      const result = await service.register(user, {
        vehicleType: VehicleType.motorbike,
        vehiclePlate: '59P1-12345',
      });

      expect(result.id).toBe('shipper-1');
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user is already a shipper', async () => {
      mockPrismaService.shipper.findUnique.mockResolvedValue({ id: 'existing-shipper' });

      await expect(
        service.register({ id: 'user-1' } as any, { vehicleType: VehicleType.motorbike }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('acceptOrder', () => {
    it('should assign order to shipper if unassigned', async () => {
      mockPrismaService.shipper.findUnique.mockResolvedValue({ id: 'shipper-1' });
      mockPrismaService.order.findUnique.mockResolvedValue({ id: 'order-1', shipperId: null });
      mockPrismaService.order.update.mockResolvedValue({
        id: 'order-1',
        shipperId: 'shipper-1',
        status: OrderStatus.picking_up,
      });

      const result = await service.acceptOrder({ id: 'user-1' } as any, 'order-1');

      expect(result.shipperId).toBe('shipper-1');
      expect(result.status).toBe(OrderStatus.picking_up);
    });
  });

  describe('findNearestAvailableShipper', () => {
    it('should find nearest online approved shipper within radius', async () => {
      mockPrismaService.shipper.findMany = jest.fn().mockResolvedValue([
        { id: 's1', isActive: true, ekycStatus: KycStatus.verified, lat: 10.762622, lng: 106.68222 }, // ~0.8km away
        { id: 's2', isActive: true, ekycStatus: KycStatus.verified, lat: 10.8231, lng: 106.6297 },   // ~10km away
      ]);

      const nearest = await service.findNearestAvailableShipper(10.755, 106.68, 3.0);
      expect(nearest).toBeDefined();
      expect(nearest?.id).toBe('s1');
    });
  });
});
