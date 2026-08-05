import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateKycStatusDto, UpdateAppConfigDto, PenalizeShipperDto } from './dto/admin.dto';
import { KycStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardOverview() {
    const totalUsers = await this.prisma.user.count();
    const totalRestaurants = await this.prisma.restaurant.count();
    const totalShippers = await this.prisma.shipper.count();
    const totalOrders = await this.prisma.order.count();

    const revenueAggregation = await this.prisma.commission.aggregate({
      _sum: {
        platformShare: true,
        foodAmount: true,
        shipAmount: true,
      },
    });

    return {
      totalUsers,
      totalRestaurants,
      totalShippers,
      totalOrders,
      totalPlatformRevenue: revenueAggregation._sum.platformShare ?? 0,
      totalFoodGmv: revenueAggregation._sum.foodAmount ?? 0,
      totalShipGmv: revenueAggregation._sum.shipAmount ?? 0,
    };
  }

  async updateShipperKyc(shipperId: string, dto: UpdateKycStatusDto) {
    const shipper = await this.prisma.shipper.findUnique({ where: { id: shipperId } });
    if (!shipper) throw new NotFoundException('Shipper không tồn tại');

    return this.prisma.shipper.update({
      where: { id: shipperId },
      data: { ekycStatus: dto.status },
    });
  }

  async setAppConfig(dto: UpdateAppConfigDto) {
    return this.prisma.appConfig.upsert({
      where: { key: dto.key },
      create: { key: dto.key, value: dto.value },
      update: { value: dto.value },
    });
  }

  async getAppConfigs() {
    return this.prisma.appConfig.findMany();
  }

  async penalizeShipper(shipperId: string, dto: PenalizeShipperDto) {
    const shipper = await this.prisma.shipper.findUnique({ where: { id: shipperId } });
    if (!shipper) throw new NotFoundException('Shipper không tồn tại');

    await this.prisma.shipperPenalty.create({
      data: {
        shipperId,
        level: Number(dto.level),
        reason: 'misconduct',
        description: dto.reason,
      },
    });

    return this.prisma.shipper.update({
      where: { id: shipperId },
      data: { penaltyLevel: dto.level },
    });
  }

  async listPendingShippers() {
    return this.prisma.shipper.findMany({
      where: { ekycStatus: KycStatus.pending },
      include: { user: true },
    });
  }
}
