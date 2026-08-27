import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Save customer in-app rating and feedback
   */
  async create(dto: CreateFeedbackDto, userId?: string) {
    this.logger.log(
      `Received app feedback: ${dto.rating} stars, platform=${dto.platform ?? 'unknown'}`,
    );
    return this.prisma.appFeedback.create({
      data: {
        rating: dto.rating,
        comment: dto.comment?.trim() || null,
        platform: dto.platform?.toLowerCase() || null,
        appVersion: dto.appVersion || null,
        userId: userId || null,
      },
    });
  }

  /**
   * List feedbacks for Admin Portal with pagination
   */
  async findAll(page = 1, limit = 20, platform?: string) {
    const skip = (page - 1) * limit;
    const where = platform ? { platform: platform.toLowerCase() } : {};

    const [items, total] = await Promise.all([
      this.prisma.appFeedback.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.appFeedback.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get CSAT metrics & distribution for Admin Dashboard
   */
  async getStats() {
    const [total, aggregate, distribution] = await Promise.all([
      this.prisma.appFeedback.count(),
      this.prisma.appFeedback.aggregate({
        _avg: { rating: true },
      }),
      this.prisma.appFeedback.groupBy({
        by: ['rating'],
        _count: { rating: true },
      }),
    ]);

    const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const d of distribution) {
      ratingCounts[d.rating] = d._count.rating;
    }

    const avgRating = Number(aggregate._avg.rating?.toFixed(2) ?? 0);
    const positiveCount = (ratingCounts[4] ?? 0) + (ratingCounts[5] ?? 0);
    const csatPercent = total > 0 ? Math.round((positiveCount / total) * 100) : 100;

    return {
      total,
      avgRating,
      csatPercent,
      distribution: ratingCounts,
    };
  }
}
