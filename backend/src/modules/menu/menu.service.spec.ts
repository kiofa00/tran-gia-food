import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma/prisma.service';
import { MenuService } from './menu.service';

describe('MenuService', () => {
  let service: MenuService;

  const mockOwner = { id: 'owner-1', role: 'restaurant_owner' } as any;
  const mockOtherUser = { id: 'other-user', role: 'restaurant_owner' } as any;

  const mockRestaurant = { id: 'rest-1', ownerId: 'owner-1', isOpen: true };
  const mockCategory = { id: 'cat-1', restaurantId: 'rest-1', name: 'Món Chính', isActive: true };
  const mockItem = {
    id: 'item-1',
    categoryId: 'cat-1',
    name: 'Phở Bò',
    price: 50000,
    isAvailable: true,
    category: mockCategory,
  };

  const mockPrismaService = {
    restaurant: { findUnique: jest.fn() },
    menuCategory: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    menuItem: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<MenuService>(MenuService);
    jest.clearAllMocks();
  });

  describe('createCategory', () => {
    it('should create category for restaurant owner', async () => {
      mockPrismaService.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrismaService.menuCategory.create.mockResolvedValue(mockCategory);

      const result = await service.createCategory(mockOwner, 'rest-1', { name: 'Món Chính' });

      expect(result).toEqual(mockCategory);
    });

    it('should throw ForbiddenException for non-owner', async () => {
      mockPrismaService.restaurant.findUnique.mockResolvedValue(mockRestaurant);

      await expect(
        service.createCategory(mockOtherUser, 'rest-1', { name: 'Món Chính' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when restaurant not found', async () => {
      mockPrismaService.restaurant.findUnique.mockResolvedValue(null);

      await expect(
        service.createCategory(mockOwner, 'not-exist', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteItem', () => {
    it('should soft-delete item (set isAvailable=false)', async () => {
      mockPrismaService.menuItem.findUnique.mockResolvedValue(mockItem);
      mockPrismaService.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrismaService.menuItem.update.mockResolvedValue({ ...mockItem, isAvailable: false });

      const result = await service.deleteItem(mockOwner, 'item-1');

      expect(result.isAvailable).toBe(false);
    });

    it('should throw NotFoundException when item not found', async () => {
      mockPrismaService.menuItem.findUnique.mockResolvedValue(null);

      await expect(service.deleteItem(mockOwner, 'not-exist')).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleItemAvailability', () => {
    it('should toggle item availability', async () => {
      mockPrismaService.menuItem.findUnique.mockResolvedValue(mockItem);
      mockPrismaService.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrismaService.menuItem.update.mockResolvedValue({ ...mockItem, isAvailable: false });

      const result = await service.toggleItemAvailability(mockOwner, 'item-1', false);

      expect(mockPrismaService.menuItem.update).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: { isAvailable: false },
      });
      expect(result.isAvailable).toBe(false);
    });
  });
});
