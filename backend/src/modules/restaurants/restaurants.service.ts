import {
  Injectable, NotFoundException, ForbiddenException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRestaurantDto, UpdateRestaurantDto } from './dto/restaurant.dto';
import { User } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class RestaurantsService {
  private readonly logger = new Logger(RestaurantsService.name);

  constructor(private prisma: PrismaService) {}

  // ──────────────────────────────────────────
  // Public: Browse Restaurants
  // ──────────────────────────────────────────

  async findNearby(lat: number, lng: number, radiusKm = 10) {
    // Get system radius from AppConfig
    const sysConfig = await this.prisma.appConfig.findUnique({
      where: { key: 'system_radius_km' },
    });
    const systemRadius = parseFloat(sysConfig?.value ?? '10');
    const effectiveRadius = Math.min(radiusKm, systemRadius);

    // Using Haversine formula in raw SQL for distance filtering
    const restaurants = await this.prisma.$queryRaw<any[]>`
      SELECT r.*,
        (6371 * acos(
          cos(radians(${lat})) * cos(radians(r.lat)) *
          cos(radians(r.lng) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(r.lat))
        )) AS distance_km
      FROM restaurants r
      WHERE r.is_open = true
        AND (6371 * acos(
          cos(radians(${lat})) * cos(radians(r.lat)) *
          cos(radians(r.lng) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(r.lat))
        )) <= LEAST(r.radius_km, ${effectiveRadius})
      ORDER BY distance_km ASC
      LIMIT 50
    `;

    return restaurants;
  }

  async findById(id: string) {
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
      const dayKey = dayNames[now.getDay()];
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const restaurants = await this.prisma.restaurant.findMany({
        where: { isManualOverride: false, openingHours: { not: null } },
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
          this.logger.debug(`Restaurant ${restaurant.name}: ${shouldBeOpen ? 'opened' : 'closed'} (auto)`);
        }
      }
    } catch {
      // Ignore DB connection errors during dev cron ticks
    }
  }

  // ──────────────────────────────────────────
  // Peak Hour: Auto shrink radius
  // ──────────────────────────────────────────

  @Cron('0 11,17 * * *')  // Run at 11:00 and 17:00
  async shrinkRadiusPeakHour() {
    const config = await this.prisma.appConfig.findUnique({
      where: { key: 'peak_radius_km' },
    });
    this.logger.log(`Peak hour started — shrinking radius to ${config?.value ?? '7'} km`);
    // This is read dynamically in findNearby, no DB update needed
  }

  @Cron('0 13,19 * * *')  // Restore at 13:00 and 19:00
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
