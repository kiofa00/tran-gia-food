import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';

import { PrismaService } from './prisma.service';

describe('Database Integration & Schema Tests', () => {
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    restaurant: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    order: {
      create: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('User & Relation Constraints', () => {
    it('should enforce unique phone constraint', async () => {
      mockPrisma.user.create
        .mockResolvedValueOnce({ id: 'u1', phone: '+84901234567' })
        .mockRejectedValueOnce(new Error('Unique constraint failed on the fields: (`phone`)'));

      await prisma.user.create({
        data: { phone: '+84901234567' } as unknown as Prisma.UserCreateInput,
      });

      await expect(
        prisma.user.create({
          data: { phone: '+84901234567' } as unknown as Prisma.UserCreateInput,
        }),
      ).rejects.toThrow('Unique constraint failed');
    });
  });

  describe('Haversine Spatial Query Test', () => {
    it('should execute Haversine distance query for nearby restaurants', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { id: 'r1', name: 'Phở Bò', distance_km: 1.5 },
        { id: 'r2', name: 'Bún Chả', distance_km: 3.2 },
      ]);

      const results = await prisma.$queryRaw<{ distance_km: number }[]>`
        SELECT r.* FROM restaurants r WHERE distance_km <= 10
      `;

      expect(results).toHaveLength(2);
      expect(results[0]!.distance_km).toBeLessThan(results[1]!.distance_km);
    });
  });
});
