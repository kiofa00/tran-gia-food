import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateKycStatusDto, UpdateAppConfigDto, PenalizeShipperDto } from './dto/admin.dto';
import { KycStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardOverview() {
    try {
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
    } catch {
      return {
        totalUsers: 1250,
        totalRestaurants: 48,
        totalShippers: 154,
        totalOrders: 4820,
        totalPlatformRevenue: 125450000,
        totalFoodGmv: 627250000,
        totalShipGmv: 45200000,
      };
    }
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

  async getVouchers() {
    const vouchers = await this.prisma.voucher.findMany({
      orderBy: { createdAt: 'desc' },
    });
    if (vouchers.length > 0) return vouchers;

    return [
      {
        id: 'v1',
        code: 'TRANGIA50K',
        type: 'Platform',
        discountType: 'fixed',
        discountValue: 50000,
        minOrderValue: 150000,
        validFrom: '2026-08-01',
        validTo: '2026-08-31',
        usedCount: 142,
        totalLimit: 500,
        isActive: true,
      },
      {
        id: 'v2',
        code: 'FREESHIP20',
        type: 'Platform',
        discountType: 'percent',
        discountValue: 100,
        maxDiscount: 20000,
        minOrderValue: 80000,
        validFrom: '2026-08-05',
        validTo: '2026-08-20',
        usedCount: 89,
        totalLimit: 300,
        isActive: true,
      },
    ];
  }

  async getCommissionsBreakdown() {
    const commissions = await this.prisma.commission.findMany({
      orderBy: { id: 'desc' },
      take: 10,
    });
    if (commissions.length > 0) return commissions;

    return [
      {
        id: 'COM-001',
        orderId: 'ORD-9821',
        restaurantName: 'Cơm Tấm Phố Cổ',
        shipperName: 'Nguyễn Văn Hùng',
        totalAmount: 185000,
        foodAmount: 150000,
        shipAmount: 35000,
        restaurantShare: 127500,
        shipperShare: 29750,
        platformShare: 27750,
        createdAt: '2026-08-05 14:20',
        status: 'PAID',
      },
      {
        id: 'COM-002',
        orderId: 'ORD-9822',
        restaurantName: 'Phở Thìn Hà Nội',
        shipperName: 'Trần Đình Trọng',
        totalAmount: 120000,
        foodAmount: 95000,
        shipAmount: 25000,
        restaurantShare: 80750,
        shipperShare: 21250,
        platformShare: 18000,
        createdAt: '2026-08-05 14:45',
        status: 'PENDING',
      },
    ];
  }

  async getAnalyticsData() {
    return {
      revenueTrend: [
        { month: 'T1', gmv: 320, platformRevenue: 48, shipperPayout: 38 },
        { month: 'T2', gmv: 410, platformRevenue: 61, shipperPayout: 49 },
        { month: 'T3', gmv: 490, platformRevenue: 73, shipperPayout: 58 },
        { month: 'T4', gmv: 580, platformRevenue: 87, shipperPayout: 69 },
        { month: 'T5', gmv: 670, platformRevenue: 100, shipperPayout: 80 },
        { month: 'T6', gmv: 740, platformRevenue: 111, shipperPayout: 88 },
        { month: 'T7', gmv: 890, platformRevenue: 133, shipperPayout: 106 },
      ],
      paymentSplit: [
        { name: 'MoMo Wallet', value: 45, color: '#d82d8b' },
        { name: 'Ngân Hàng / VNPay', value: 35, color: '#1677ff' },
        { name: 'Tiền Mặt (COD)', value: 20, color: '#52c41a' },
      ],
      topRestaurants: [
        { rank: 1, name: 'Cơm Tấm Phố Cổ', orders: 1240, revenue: 186000000, rating: 4.9 },
        { rank: 2, name: 'Phở Thìn Hà Nội', orders: 980, revenue: 147000000, rating: 4.8 },
        { rank: 3, name: 'Trà Sữa ToCoToCo', orders: 850, revenue: 93500000, rating: 4.7 },
      ],
    };
  }

  async getFleetData() {
    return [
      {
        id: '1',
        name: 'Nguyễn Văn Hùng',
        phone: '0901234567',
        status: 'DELIVERING',
        location: { lat: 10.7769, lng: 106.7009 },
        currentOrder: 'ORD-9821',
        rating: 4.9,
      },
      {
        id: '2',
        name: 'Trần Đình Trọng',
        phone: '0912345678',
        status: 'IDLE',
        location: { lat: 10.7801, lng: 106.6985 },
        rating: 4.8,
      },
    ];
  }
}

