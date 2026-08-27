import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma, User } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { CreateRestaurantDto, UpdateRestaurantDto } from './dto/restaurant.dto';

@Injectable()
export class RestaurantsService {
  private readonly logger = new Logger(RestaurantsService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  // ──────────────────────────────────────────
  // Public: Browse Restaurants
  // ──────────────────────────────────────────

  /**
   * Helper: Parse a time interval like "11:00-13:00" into [startMinutes, endMinutes]
   */
  private parseTimeRange(interval: string): [number, number] | null {
    const parts = interval.split('-').map((s) => s.trim());
    if (parts.length < 2) return null;

    const [startStr = '', endStr = ''] = parts;
    const startParts = startStr.split(':');
    const endParts = endStr.split(':');
    if (startParts.length < 2 || endParts.length < 2) return null;

    const startMinutes = parseInt(startParts[0] ?? '', 10) * 60 + parseInt(startParts[1] ?? '', 10);
    const endMinutes = parseInt(endParts[0] ?? '', 10) * 60 + parseInt(endParts[1] ?? '', 10);

    if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes)) return null;
    return [startMinutes, endMinutes];
  }

  /**
   * Helper: Check if current time falls within configured peak hour ranges (e.g. "11:00-13:00,17:00-19:00")
   */
  private isTimeInPeakRanges(peakRangesConfig: string, date = new Date()): boolean {
    if (!peakRangesConfig || peakRangesConfig.trim().length === 0) {
      return false;
    }

    const currentMinutes = date.getHours() * 60 + date.getMinutes();
    const intervals = peakRangesConfig.split(',').map((s) => s.trim());

    for (const interval of intervals) {
      const range = this.parseTimeRange(interval);
      if (!range) continue;

      const [startMinutes, endMinutes] = range;
      if (startMinutes <= endMinutes) {
        if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
          return true;
        }
      } else if (currentMinutes >= startMinutes || currentMinutes <= endMinutes) {
        return true;
      }
    }

    return false;
  }

  /**
   * Helper: Split search text into distinct tokens for flexible searching
   */
  private extractKeywords(text: string): string[] {
    return text
      .split(/[\s,&+]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  async findNearby(lat: number, lng: number, radiusKm = 10, category?: string) {
    const cacheKey = `restaurants:nearby:${lat.toFixed(3)}:${lng.toFixed(3)}:${radiusKm}:${category ?? 'all'}`;
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      this.logger.warn(
        `Redis get nearby cache error: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    // 1. Get system & peak configurations dynamically from AppConfig table (Fail-Fast: No silent fallbacks)
    const [sysConfig, peakConfig, peakHoursConfig] = await Promise.all([
      this.prisma.appConfig.findUnique({ where: { key: 'system_radius_km' } }),
      this.prisma.appConfig.findUnique({ where: { key: 'peak_radius_km' } }),
      this.prisma.appConfig.findUnique({ where: { key: 'peak_hours' } }),
    ]);

    if (!sysConfig?.value) {
      throw new InternalServerErrorException('Missing system configuration: system_radius_km');
    }
    if (!peakConfig?.value) {
      throw new InternalServerErrorException('Missing system configuration: peak_radius_km');
    }
    if (!peakHoursConfig?.value) {
      throw new InternalServerErrorException('Missing system configuration: peak_hours');
    }

    const systemRadius = parseFloat(sysConfig.value);
    const peakRadius = parseFloat(peakConfig.value);
    const peakHours = peakHoursConfig.value;

    // 2. Check if currently peak hour based on AppConfig
    const isPeakHour = this.isTimeInPeakRanges(peakHours);
    const maxAllowedRadius = isPeakHour ? Math.min(systemRadius, peakRadius) : systemRadius;
    const effectiveRadius = Math.min(radiusKm, maxAllowedRadius);

    const categoryTokens = category ? this.extractKeywords(category) : [];

    // Using Haversine formula in raw SQL for distance filtering
    const restaurants = await this.prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT r.*,
        (6371 * acos(
          cos(radians(${lat})) * cos(radians(r.lat)) *
          cos(radians(r.lng) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(r.lat))
        )) AS distance_km
      FROM restaurants r
      WHERE r."isOpen" = true
        AND (6371 * acos(
          cos(radians(${lat})) * cos(radians(r.lat)) *
          cos(radians(r.lng) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(r.lat))
        )) <= LEAST(r."radiusKm", ${effectiveRadius})
        ${
          categoryTokens.length > 0
            ? Prisma.sql`AND (${Prisma.join(
                categoryTokens.map(
                  (token) =>
                    Prisma.sql`(
                      r.name ILIKE ${'%' + token + '%'}
                      OR r.description ILIKE ${'%' + token + '%'}
                      OR EXISTS (
                        SELECT 1 FROM menu_categories mc
                        WHERE mc."restaurantId" = r.id
                          AND mc.name ILIKE ${'%' + token + '%'}
                      )
                      OR EXISTS (
                        SELECT 1 FROM menu_items mi
                        JOIN menu_categories mc ON mi."categoryId" = mc.id
                        WHERE mc."restaurantId" = r.id
                          AND mi.name ILIKE ${'%' + token + '%'}
                      )
                    )`,
                ),
                ' OR ',
              )})`
            : Prisma.empty
        }
      ORDER BY distance_km ASC
      LIMIT 50
    `;

    try {
      await this.redis.set(cacheKey, JSON.stringify(restaurants), 60);
    } catch (err) {
      this.logger.warn(
        `Redis set nearby cache error: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    return restaurants;
  }

  async findAll(search?: string, category?: string) {
    const cacheKey = `restaurants:all:${search ?? 'none'}:${category ?? 'all'}`;
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      this.logger.warn(
        `Redis get all cache error: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    const where: Prisma.RestaurantWhereInput = {
      isOpen: true,
    };

    const conditions: Prisma.RestaurantWhereInput[] = [];

    if (search && search.trim().length > 0) {
      const s = search.trim();
      conditions.push({
        OR: [
          { name: { contains: s, mode: 'insensitive' } },
          { description: { contains: s, mode: 'insensitive' } },
          { address: { contains: s, mode: 'insensitive' } },
          {
            categories: {
              some: {
                OR: [
                  { name: { contains: s, mode: 'insensitive' } },
                  {
                    items: {
                      some: {
                        name: { contains: s, mode: 'insensitive' },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      });
    }

    if (category && category.trim().length > 0 && category !== 'Tất cả') {
      const tokens = this.extractKeywords(category);
      if (tokens.length > 0) {
        conditions.push({
          OR: tokens.map((token) => ({
            OR: [
              { name: { contains: token, mode: 'insensitive' } },
              { description: { contains: token, mode: 'insensitive' } },
              {
                categories: {
                  some: {
                    OR: [
                      { name: { contains: token, mode: 'insensitive' } },
                      {
                        items: {
                          some: {
                            name: { contains: token, mode: 'insensitive' },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            ],
          })),
        });
      }
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    const restaurants = await this.prisma.restaurant.findMany({
      where,
      orderBy: [{ avgRating: 'desc' }, { totalReviews: 'desc' }],
      take: 50,
    });

    try {
      await this.redis.set(cacheKey, JSON.stringify(restaurants), 60);
    } catch (err) {
      this.logger.warn(
        `Redis set all cache error: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    return restaurants;
  }

  async findById(id: string) {
    const cacheKey = `restaurants:detail:${id}`;
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      this.logger.warn(
        `Redis get detail cache error: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        categories: {
          where: { isActive: true },
          include: {
            items: { where: { isAvailable: true }, orderBy: { sortOrder: 'asc' } },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!restaurant) throw new NotFoundException('Quán không tồn tại');

    try {
      await this.redis.set(cacheKey, JSON.stringify(restaurant), 300);
    } catch (err) {
      this.logger.warn(
        `Redis set detail cache error: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    return restaurant;
  }

  // ──────────────────────────────────────────
  // Restaurant Owner Operations
  // ──────────────────────────────────────────

  async create(user: User, dto: CreateRestaurantDto) {
    return this.prisma.restaurant.create({
      data: {
        ...dto,
        ownerId: user.id,
      },
    });
  }

  async update(user: User, id: string, dto: UpdateRestaurantDto) {
    await this.assertOwner(user, id);
    return this.prisma.restaurant.update({ where: { id }, data: dto });
  }

  async toggleOpen(user: User, id: string, isOpen: boolean) {
    await this.assertOwner(user, id);
    return this.prisma.restaurant.update({
      where: { id },
      data: { isOpen, isManualOverride: true },
    });
  }

  async getMyRestaurant(user: User) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { ownerId: user.id },
      include: {
        categories: {
          include: { items: { orderBy: { sortOrder: 'asc' } } },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    if (!restaurant) throw new NotFoundException('Bạn chưa có quán ăn nào');
    return restaurant;
  }

  // ──────────────────────────────────────────
  // Cron: Auto Open/Close based on schedule
  // ──────────────────────────────────────────

  @Cron(CronExpression.EVERY_MINUTE)
  async autoOpenClose() {
    try {
      const now = new Date();
      const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      const dayKey = dayNames[now.getDay()]!;
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const restaurants = await this.prisma.restaurant.findMany({
        where: {
          isManualOverride: false,
          openingHours: { not: null as unknown as import('@prisma/client').Prisma.InputJsonValue },
        },
      });

      for (const restaurant of restaurants) {
        const hours = restaurant.openingHours as Record<string, { open: string; close: string }>;
        const todayHours = hours[dayKey];
        if (!todayHours) continue;

        const shouldBeOpen = currentTime >= todayHours.open && currentTime < todayHours.close;

        if (restaurant.isOpen !== shouldBeOpen) {
          await this.prisma.restaurant.update({
            where: { id: restaurant.id },
            data: { isOpen: shouldBeOpen },
          });
          this.logger.debug(
            `Restaurant ${restaurant.name}: ${shouldBeOpen ? 'opened' : 'closed'} (auto)`,
          );
        }
      }
    } catch {
      // Ignore DB connection errors during dev cron ticks
    }
  }

  // ──────────────────────────────────────────
  // Peak Hour: Auto shrink radius
  // ──────────────────────────────────────────

  @Cron('0 11,17 * * *') // Run at 11:00 and 17:00
  async shrinkRadiusPeakHour() {
    const config = await this.prisma.appConfig.findUnique({
      where: { key: 'peak_radius_km' },
    });
    this.logger.log(`Peak hour started — shrinking radius to ${config?.value ?? '7'} km`);
    // This is read dynamically in findNearby, no DB update needed
  }

  @Cron('0 13,19 * * *') // Restore at 13:00 and 19:00
  async restoreRadiusAfterPeak() {
    this.logger.log('Peak hour ended — radius restored');
  }

  // ──────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────

  private async assertOwner(user: User, restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) throw new NotFoundException('Quán không tồn tại');
    if (restaurant.ownerId !== user.id) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa quán này');
    }
    return restaurant;
  }
}
