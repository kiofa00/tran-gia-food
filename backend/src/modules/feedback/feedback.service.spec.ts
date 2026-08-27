import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma/prisma.service';
import { FeedbackService } from './feedback.service';

describe('FeedbackService', () => {
  let service: FeedbackService;

  const mockFeedback = {
    id: 'fb-1',
    rating: 5,
    comment: 'App tuyệt vời',
    platform: 'android',
    appVersion: '1.0.0',
    userId: 'user-1',
    createdAt: new Date(),
  };

  const mockPrismaService = {
    appFeedback: {
      create: jest.fn().mockResolvedValue(mockFeedback),
      findMany: jest.fn().mockResolvedValue([mockFeedback]),
      count: jest.fn().mockResolvedValue(1),
      aggregate: jest.fn().mockResolvedValue({ _avg: { rating: 5.0 } }),
      groupBy: jest.fn().mockResolvedValue([{ rating: 5, _count: { rating: 1 } }]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeedbackService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should save feedback successfully with user id', async () => {
      mockPrismaService.appFeedback.create.mockResolvedValue(mockFeedback);

      const result = await service.create(
        { rating: 5, comment: 'App tuyệt vời', platform: 'android', appVersion: '1.0.0' },
        'user-1',
      );

      expect(result).toEqual(mockFeedback);
      expect(mockPrismaService.appFeedback.create).toHaveBeenCalledWith({
        data: {
          rating: 5,
          comment: 'App tuyệt vời',
          platform: 'android',
          appVersion: '1.0.0',
          userId: 'user-1',
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated feedbacks', async () => {
      mockPrismaService.appFeedback.findMany.mockResolvedValue([mockFeedback]);
      mockPrismaService.appFeedback.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10, 'android');

      expect(result.items).toEqual([mockFeedback]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('getStats', () => {
    it('should compute CSAT percent and rating distribution correctly', async () => {
      mockPrismaService.appFeedback.count.mockResolvedValue(10);
      mockPrismaService.appFeedback.aggregate.mockResolvedValue({ _avg: { rating: 4.8 } });
      mockPrismaService.appFeedback.groupBy.mockResolvedValue([
        { rating: 5, _count: { rating: 8 } },
        { rating: 4, _count: { rating: 2 } },
      ]);

      const stats = await service.getStats();

      expect(stats.total).toBe(10);
      expect(stats.avgRating).toBe(4.8);
      expect(stats.csatPercent).toBe(100);
      expect(stats.distribution[5]).toBe(8);
      expect(stats.distribution[4]).toBe(2);
    });
  });
});
