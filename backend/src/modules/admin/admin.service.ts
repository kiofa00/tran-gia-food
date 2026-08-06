import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateKycStatusDto, UpdateAppConfigDto, PenalizeShipperDto } from './dto/admin.dto';
import { KycStatus, VoucherType, Prisma } from '@prisma/client';
import {
  QueryOptions,
  CreateVoucherDto,
  RevenueTrendBucket,
  PaymentSplitBucket,
  TopRestaurantRank,
} from './types/admin.types';

function processPaginatedList<T extends Record<string, unknown>>(items: T[], query?: QueryOptions) {
  if (!query || (query.page === undefined && query.limit === undefined && !query.search && !query.status && !query.sortBy)) {
    return items;
  }

  let list = [...items];

  if (query.search) {
    const s = String(query.search).toLowerCase();
    list = list.filter((item) =>
      Object.values(item).some(
        (val) => val != null && String(val).toLowerCase().includes(s)
      )
    );
  }

  if (query.status) {
    const st = String(query.status).toLowerCase();
    list = list.filter((item) => {
      const statusVal = String(item.status ?? item.isActive).toLowerCase();
      return statusVal === st || (st === 'active' && item.isActive === true) || (st === 'inactive' && item.isActive === false);
    });
  }

  if (query.sortBy) {
    const field = query.sortBy;
    const isAsc = query.sortOrder === 'asc';
    list.sort((a, b) => {
      const valA = (a[field] as string | number) ?? '';
      const valB = (b[field] as string | number) ?? '';
      if (valA < valB) return isAsc ? -1 : 1;
      if (valA > valB) return isAsc ? 1 : -1;
      return 0;
    });
  }

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Number(query.limit) || 10);
  const total = list.length;
  const totalPages = Math.ceil(total / limit) || 1;

  const startIndex = (page - 1) * limit;
  const data = list.slice(startIndex, startIndex + limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
  };
}

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
        totalUsers: 0,
        totalRestaurants: 0,
        totalShippers: 0,
        totalOrders: 0,
        totalPlatformRevenue: 0,
        totalFoodGmv: 0,
        totalShipGmv: 0,
      };
    }
  }

  async updateShipperKyc(shipperId: string, dto: UpdateKycStatusDto) {
    const shipper = await this.prisma.shipper.findUnique({ where: { id: shipperId } });
    if (!shipper) throw new NotFoundException('Shipper không tồn tại');

    return this.prisma.shipper.update({
      where: { id: shipperId },
      data: { ekycStatus: dto.status as KycStatus },
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
    const list = await this.prisma.shipper.findMany({
      where: { ekycStatus: KycStatus.pending },
      include: { user: true },
    });
    return list.map((s) => ({
      id: s.id,
      key: s.id,
      name: s.user?.name || '',
      phone: s.user?.phone || '',
      vehicle: s.vehicleType,
      plate: s.vehiclePlate || '',
      status: s.ekycStatus,
      ekycStatus: s.ekycStatus,
    }));
  }

  private inMemoryVouchers: Record<string, unknown>[] = [];

  async getVouchers(query?: QueryOptions) {
    let dbVouchers: Record<string, unknown>[] = [];
    try {
      const vouchers = await this.prisma.voucher.findMany({
        orderBy: { createdAt: 'desc' },
      });
      dbVouchers = vouchers.map((v) => ({ ...v, key: v.id }));
    } catch {}

    const fullList = [...this.inMemoryVouchers, ...dbVouchers];
    return processPaginatedList(fullList, query);
  }

  async createVoucher(dto: CreateVoucherDto) {
    let created: Record<string, unknown> | null = null;
    try {
      const adminUser = (await this.prisma.user.findFirst({
        where: { role: 'admin' },
      })) || (await this.prisma.user.findFirst());

      if (adminUser) {
        const voucherData: Prisma.VoucherCreateInput = {
          code: dto.code.toUpperCase(),
          type: (dto.type as VoucherType) || VoucherType.platform,
          discountType: dto.discountType === 'percent' ? 'percent' : 'fixed',
          discountValue: dto.discountValue,
          minOrderValue: dto.minOrderValue || 0,
          totalLimit: dto.totalLimit || 100,
          validFrom: new Date(dto.validFrom),
          validTo: new Date(dto.validTo),
          issuedById: adminUser.id,
        };
        const dbCreated = await this.prisma.voucher.create({ data: voucherData });
        created = { ...dbCreated, key: dbCreated.id };
      }
    } catch {}

    if (!created) {
      created = {
        id: `v_${Date.now()}`,
        key: `v_${Date.now()}`,
        code: dto.code.toUpperCase(),
        type: dto.type || 'Platform',
        discountType: dto.discountType || 'fixed',
        discountValue: dto.discountValue,
        minOrderValue: dto.minOrderValue || 0,
        totalLimit: dto.totalLimit || 100,
        validFrom: dto.validFrom,
        validTo: dto.validTo,
        usedCount: 0,
        isActive: true,
      };
    }

    this.inMemoryVouchers.unshift(created);
    return created;
  }

  async toggleVoucherStatus(id: string, isActive: boolean) {
    const memVoucher = this.inMemoryVouchers.find((v) => v.id === id || v.key === id);
    if (memVoucher) {
      memVoucher.isActive = isActive;
    }

    try {
      return await this.prisma.voucher.update({
        where: { id },
        data: { isActive } as Prisma.VoucherUpdateInput,
      });
    } catch {
      return { id, isActive };
    }
  }

  async getCommissionsBreakdown(query?: QueryOptions) {
    let commissions: Record<string, unknown>[] = [];
    try {
      const dbCommissions = await this.prisma.commission.findMany({
        orderBy: { id: 'desc' },
      });
      commissions = dbCommissions.map((c) => ({ ...c, key: c.id }));
    } catch {}

    return processPaginatedList(commissions, query);
  }

  async getAnalyticsData(range: string = '7d') {
    const now = new Date();
    let days = 7;
    let comparisonLabel = 'so với tuần trước';

    if (range === '30d') {
      days = 30;
      comparisonLabel = 'so với tháng trước';
    } else if (range === 'quarter') {
      days = 90;
      comparisonLabel = 'so với quý trước';
    }

    const currentStartDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousStartDate = new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000);

    let currentCommissions: Record<string, unknown>[] = [];
    let previousCommissions: Record<string, unknown>[] = [];
    let currentOrdersCount = 0;

    try {
      const dbCurrent = await this.prisma.commission.findMany({
        where: { processedAt: { gte: currentStartDate } },
      });
      currentCommissions = dbCurrent.map((c) => ({ ...c }));

      const dbPrev = await this.prisma.commission.findMany({
        where: {
          processedAt: {
            gte: previousStartDate,
            lt: currentStartDate,
          },
        },
      });
      previousCommissions = dbPrev.map((c) => ({ ...c }));

      currentOrdersCount = await this.prisma.order.count({
        where: { createdAt: { gte: currentStartDate } },
      });
    } catch {}

    const totalGmv = currentCommissions.reduce(
      (sum, c) => sum + (Number(c.foodAmount || 0) + Number(c.shipAmount || 0)),
      0,
    );
    const platformRevenue = currentCommissions.reduce(
      (sum, c) => sum + Number(c.platformShare || 0),
      0,
    );
    const prevGmv = previousCommissions.reduce(
      (sum, c) => sum + (Number(c.foodAmount || 0) + Number(c.shipAmount || 0)),
      0,
    );

    const growthRate = prevGmv > 0
      ? Math.round(((totalGmv - prevGmv) / prevGmv) * 1000) / 10
      : (totalGmv > 0 ? 100 : 0);

    const totalOrders = currentOrdersCount || currentCommissions.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalGmv / totalOrders) : 0;

    const revenueTrend: { date: string; month: string; gmv: number; platformRevenue: number; shipperPayout: number; orders: number }[] = [];

    if (range === '7d') {
      const daysOfWeek = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const label = daysOfWeek[d.getDay()];
        const dayCommissions = currentCommissions.filter((c) => {
          const cd = new Date(String(c.processedAt || c.createdAt || now));
          return cd.getDate() === d.getDate() && cd.getMonth() === d.getMonth();
        });
        const dayGmv = dayCommissions.reduce(
          (sum, c) => sum + (Number(c.foodAmount || 0) + Number(c.shipAmount || 0)),
          0,
        );
        const dayRev = dayCommissions.reduce((sum, c) => sum + Number(c.platformShare || 0), 0);
        const dayShip = dayCommissions.reduce((sum, c) => sum + Number(c.shipperShare || 0), 0);
        revenueTrend.push({
          date: label,
          month: label,
          gmv: dayGmv,
          platformRevenue: dayRev,
          shipperPayout: dayShip,
          orders: dayCommissions.length,
        });
      }
    } else if (range === '30d') {
      for (let w = 1; w <= 4; w++) {
        const label = `Tuần ${w}`;
        const weekStart = new Date(now.getTime() - (5 - w) * 7 * 24 * 60 * 60 * 1000);
        const weekEnd = new Date(now.getTime() - (4 - w) * 7 * 24 * 60 * 60 * 1000);
        const weekCommissions = currentCommissions.filter((c) => {
          const cd = new Date(String(c.processedAt || c.createdAt || now));
          return cd >= weekStart && cd < weekEnd;
        });
        revenueTrend.push({
          date: label,
          month: label,
          gmv: weekCommissions.reduce(
            (sum, c) => sum + (Number(c.foodAmount || 0) + Number(c.shipAmount || 0)),
            0,
          ),
          platformRevenue: weekCommissions.reduce((sum, c) => sum + Number(c.platformShare || 0), 0),
          shipperPayout: weekCommissions.reduce((sum, c) => sum + Number(c.shipperShare || 0), 0),
          orders: weekCommissions.length,
        });
      }
    } else {
      for (let m = 2; m >= 0; m--) {
        const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
        const label = `Tháng ${d.getMonth() + 1}`;
        const monthCommissions = currentCommissions.filter((c) => {
          const cd = new Date(String(c.processedAt || c.createdAt || now));
          return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
        });
        revenueTrend.push({
          date: label,
          month: label,
          gmv: monthCommissions.reduce(
            (sum, c) => sum + (Number(c.foodAmount || 0) + Number(c.shipAmount || 0)),
            0,
          ),
          platformRevenue: monthCommissions.reduce((sum, c) => sum + Number(c.platformShare || 0), 0),
          shipperPayout: monthCommissions.reduce((sum, c) => sum + Number(c.shipperShare || 0), 0),
          orders: monthCommissions.length,
        });
      }
    }

    let paymentSplit: { name: string; value: number; color: string }[] = [];
    try {
      const momoCount = await this.prisma.payment.count({ where: { method: 'momo' } });
      const bankCount = await this.prisma.payment.count({ where: { method: 'bank' } });
      const cashCount = await this.prisma.payment.count({ where: { method: 'cash' } });
      const totalPayments = momoCount + bankCount + cashCount;

      if (totalPayments > 0) {
        paymentSplit = [
          { name: 'MoMo Wallet', value: Math.round((momoCount / totalPayments) * 100), color: '#d82d8b' },
          { name: 'Ngân Hàng / VNPay', value: Math.round((bankCount / totalPayments) * 100), color: '#1677ff' },
          { name: 'Tiền Mặt (COD)', value: Math.round((cashCount / totalPayments) * 100), color: '#52c41a' },
        ];
      } else {
        paymentSplit = [
          { name: 'MoMo Wallet', value: 0, color: '#d82d8b' },
          { name: 'Ngân Hàng / VNPay', value: 0, color: '#1677ff' },
          { name: 'Tiền Mặt (COD)', value: 0, color: '#52c41a' },
        ];
      }
    } catch {
      paymentSplit = [
        { name: 'MoMo Wallet', value: 0, color: '#d82d8b' },
        { name: 'Ngân Hàng / VNPay', value: 0, color: '#1677ff' },
        { name: 'Tiền Mặt (COD)', value: 0, color: '#52c41a' },
      ];
    }

    let topRestaurants: { rank: number; name: string; orders: number; gmv: number; commission: number; rating: number }[] = [];
    try {
      const dbRestaurants = await this.prisma.restaurant.findMany({
        take: 10,
        include: {
          orders: {
            where: { createdAt: { gte: currentStartDate } },
          },
        },
      });

      const mapped = dbRestaurants.map((r) => {
        const rOrders = r.orders.length;
        const rGmv = r.orders.reduce((sum, o) => sum + o.totalAmount, 0);
        const rComm = Math.round(rGmv * r.platformFeeRate);
        return {
          name: r.name,
          orders: rOrders,
          gmv: rGmv,
          commission: rComm,
          rating: r.avgRating || 5.0,
        };
      });

      mapped.sort((a, b) => b.gmv - a.gmv);
      topRestaurants = mapped.slice(0, 3).map((item, idx) => ({
        rank: idx + 1,
        ...item,
      }));
    } catch {}

    const summary = {
      totalGmv,
      platformRevenue,
      totalOrders,
      avgOrderValue,
      growthRate,
      comparisonLabel,
    };

    return {
      range,
      summary,
      revenueTrend,
      paymentSplit,
      topRestaurants,
    };
  }

  async getFleetData(query?: QueryOptions) {
    let shippers: Record<string, unknown>[] = [];
    try {
      const dbShippers = await this.prisma.shipper.findMany({
        include: { user: true },
      });
      shippers = dbShippers.map((s) => ({
        id: s.id,
        key: s.id,
        name: s.user?.name || '',
        phone: s.user?.phone || '',
        vehicle: s.vehicleType,
        plate: s.vehiclePlate || '',
        lat: s.lat ?? 0,
        lng: s.lng ?? 0,
        status: s.ekycStatus === KycStatus.pending ? 'PENDING_KYC' : (s.isActive ? 'DELIVERING' : 'OFFLINE'),
        ekycStatus: s.ekycStatus,
        rating: s.avgRating ?? 0,
      }));
    } catch {}

    return processPaginatedList(shippers, query);
  }
}

