import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    phone: '0901234567',
    role: 'customer',
    passwordHash: 'hashed',
    fcmToken: null,
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return user without passwordHash', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById('user-1');

      expect(result).not.toHaveProperty('passwordHash');
      expect(result).toHaveProperty('name', 'Test User');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('not-exist')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update user and return without passwordHash', async () => {
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, name: 'Updated' });

      const result = await service.update('user-1', { name: 'Updated' });

      expect(result).not.toHaveProperty('passwordHash');
      expect(result).toHaveProperty('name', 'Updated');
    });
  });

  describe('updateFcmToken', () => {
    it('should update fcmToken without returning data', async () => {
      mockPrismaService.user.update.mockResolvedValue(undefined);

      await expect(service.updateFcmToken('user-1', 'new-token')).resolves.toBeUndefined();
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { fcmToken: 'new-token' },
      });
    });
  });
});
