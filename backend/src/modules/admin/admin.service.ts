import { Injectable, NotFoundException } from '@nestjs/common';
import { KycStatus, Prisma, VoucherType } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import {
  PenalizeShipperDto,
  UpdateAppConfigDto,
  UpdateKycStatusDto,
  UpdateUserStatusDto,
} from './dto/admin.dto';
import {
  CommissionRow,
  CreateVoucherDto,
  QueryOptions,
  QueryUserOptions,
  ShipperRow,
  UserRow,
  VoucherRow,
} from './types/admin.types';

/**
 * Named color constants for payment method chart.
 * Stored in backend to keep chart data self-contained with color metadata.
 * These are chart-specific UI tokens, not application design tokens.
 */
const PAYMENT_CHART_COLORS = {
  MOMO: '#d82d8b',
  BANK: '#1677ff',
  CASH: '#52c41a',
} as const;

/** Magic string constants — cấm hardcode string literal rải rác trong logic */
const PENALTY_REASON_MISCONDUCT = 'misconduct';
const ROLE_ADMIN = 'admin';

/** Default map coordinates for Ho Chi Minh City city center */
const DEFAULT_MAP_LAT = 10.7769;
const DEFAULT_MAP_LNG = 106.7009;

function processPaginatedList<T extends object>(items: T[], query?: QueryOptions) {
  if (
    !query ||
    (query.page === undefined &&
      query.limit === undefined &&
      !query.search &&
      !query.status &&
      !query.sortBy)
  ) {
    return items;
  }

  let list = [...items] as Record<string, unknown>[];

  if (query.search) {
    const searchTerm = String(query.search).toLowerCase();
    list = list.filter((item) =>
      Object.values(item).some(
        (val) => val != null && String(val).toLowerCase().includes(searchTerm),
      ),
    );
  }

  if (query.status) {
    const st = String(query.status).toLowerCase();
    list = list.filter((item) => {
      const statusVal = String(item['status'] ?? item['isActive']).toLowerCase();

      return (
        statusVal === st ||
        (st === 'active' && item['isActive'] === true) ||
        (st === 'inactive' && item['isActive'] === false)
      );
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
    return this.prisma.appConfig.findMany({ orderBy: { key: 'asc' } });
  }

  async penalizeShipper(shipperId: string, dto: PenalizeShipperDto) {
    const shipper = await this.prisma.shipper.findUnique({ where: { id: shipperId } });
    if (!shipper) throw new NotFoundException('Shipper không tồn tại');

    await this.prisma.shipperPenalty.create({
      data: {
        shipperId,
        level: Number(dto.level),
        reason: PENALTY_REASON_MISCONDUCT,
        description: dto.reason,
      },
    });

    return this.prisma.shipper.update({
      where: { id: shipperId },
      data: { penaltyLevel: dto.level },
    });
  }

  async listPendingShippers(query?: QueryOptions) {
    const list = await this.prisma.shipper.findMany({
      where: { ekycStatus: KycStatus.pending },
      include: { user: true },
    });
    const mapped = list.map((s) => ({
      id: s.id,
      key: s.id,
      name: s.user?.name || '',
      phone: s.user?.phone || '',
      vehicle: s.vehicleType,
      plate: s.vehiclePlate || '',
      status: s.ekycStatus,
      ekycStatus: s.ekycStatus,
    }));
    return processPaginatedList(mapped, query);
  }

  async getVouchers(query?: QueryOptions) {
    const vouchers = await this.prisma.voucher.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const list: VoucherRow[] = vouchers.map((v) => ({ ...v, key: v.id }));
    return processPaginatedList(list, query);
  }

  async createVoucher(dto: CreateVoucherDto) {
    const adminUser =
      (await this.prisma.user.findFirst({
        where: { role: ROLE_ADMIN },
      })) || (await this.prisma.user.findFirst());

    if (!adminUser) {
      throw new NotFoundException('Không tìm thấy tài khoản admin để phát hành voucher');
    }

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
    return { ...dbCreated, key: dbCreated.id };
  }

  async toggleVoucherStatus(id: string, isActive: boolean) {
    return this.prisma.voucher.update({
      where: { id },
      data: { isActive } as Prisma.VoucherUpdateInput,
    });
  }

  async getCommissionsBreakdown(query?: QueryOptions) {
    const dbCommissions = await this.prisma.commission.findMany({
      orderBy: { id: 'desc' },
    });
    const commissions: CommissionRow[] = dbCommissions.map((c) => ({ ...c, key: c.id }));
    return processPaginatedList(commissions, query);
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
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

    const dbCurrent = await this.prisma.commission.findMany({
      where: { processedAt: { gte: currentStartDate } },
    });
    const currentCommissions: CommissionRow[] = dbCurrent.map((c) => ({ ...c, key: c.id }));

    const dbPrev = await this.prisma.commission.findMany({
      where: {
        processedAt: {
          gte: previousStartDate,
          lt: currentStartDate,
        },
      },
    });
    const previousCommissions: CommissionRow[] = dbPrev.map((c) => ({ ...c, key: c.id }));

    const currentOrdersCount = await this.prisma.order.count({
      where: { createdAt: { gte: currentStartDate } },
    });

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

    let growthRate = 0;
    if (prevGmv > 0) {
      growthRate = Math.round(((totalGmv - prevGmv) / prevGmv) * 1000) / 10;
    } else if (totalGmv > 0) {
      growthRate = 100;
    }

    const totalOrders = currentOrdersCount || currentCommissions.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalGmv / totalOrders) : 0;

    const revenueTrend: {
      date: string;
      month: string;
      gmv: number;
      platformRevenue: number;
      shipperPayout: number;
      orders: number;
    }[] = [];

    if (range === '7d') {
      const daysOfWeek = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const label = daysOfWeek[d.getDay()]!;
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
          platformRevenue: weekCommissions.reduce(
            (sum, c) => sum + Number(c.platformShare || 0),
            0,
          ),
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
          platformRevenue: monthCommissions.reduce(
            (sum, c) => sum + Number(c.platformShare || 0),
            0,
          ),
          shipperPayout: monthCommissions.reduce((sum, c) => sum + Number(c.shipperShare || 0), 0),
          orders: monthCommissions.length,
        });
      }
    }

    const momoCount = await this.prisma.payment.count({ where: { method: 'momo' } });
    const bankCount = await this.prisma.payment.count({ where: { method: 'bank' } });
    const cashCount = await this.prisma.payment.count({ where: { method: 'cash' } });
    const totalPayments = momoCount + bankCount + cashCount;

    const paymentSplit: { name: string; value: number; color: string }[] =
      totalPayments > 0
        ? [
            {
              name: 'MoMo Wallet',
              value: Math.round((momoCount / totalPayments) * 100),
              color: PAYMENT_CHART_COLORS.MOMO,
            },
            {
              name: 'Ngân Hàng / VNPay',
              value: Math.round((bankCount / totalPayments) * 100),
              color: PAYMENT_CHART_COLORS.BANK,
            },
            {
              name: 'Tiền Mặt (COD)',
              value: Math.round((cashCount / totalPayments) * 100),
              color: PAYMENT_CHART_COLORS.CASH,
            },
          ]
        : [];

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
    const topRestaurants = mapped.slice(0, 3).map((item, idx) => ({
      rank: idx + 1,
      ...item,
    }));

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
    const dbShippers = await this.prisma.shipper.findMany({
      include: { user: true },
    });

    const shippers: ShipperRow[] = dbShippers.map((s) => {
      let status = 'OFFLINE';
      if (s.ekycStatus === KycStatus.pending) {
        status = 'PENDING_KYC';
      } else if (s.isActive) {
        status = 'DELIVERING';
      }
      return {
        id: s.id,
        key: s.id,
        name: s.user?.name || '',
        phone: s.user?.phone || '',
        vehicle: s.vehicleType || 'MOTORBIKE',
        plate: s.vehiclePlate || '',
        lat: s.lat ?? DEFAULT_MAP_LAT,
        lng: s.lng ?? DEFAULT_MAP_LNG,
        status,
        ekycStatus: s.ekycStatus,
        rating: s.avgRating ?? 5.0,
      };
    });

    return processPaginatedList(shippers, query);
  }

  async getUsersList(query?: QueryUserOptions) {
    const dbUsers = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    let users: UserRow[] = dbUsers.map((u) => {
      return {
        id: u.id,
        key: u.id,
        name: u.name || 'Người dùng',
        phone: u.phone || '',
        email: u.email,
        role: String(u.role).toUpperCase(),
        status: 'ACTIVE', // Default — status field managed separately via updateUserStatus
        createdAt: u.createdAt,
      };
    });

    if (query?.role && query.role !== 'ALL') {
      const r = query.role.toUpperCase();
      users = users.filter((u) => u.role === r);
    }
    if (query?.userStatus && query.userStatus !== 'ALL') {
      const st = query.userStatus.toUpperCase();
      users = users.filter((u) => u.status === st);
    }

    return processPaginatedList(users, query);
  }

  async updateUserStatus(id: string, dto: UpdateUserStatusDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    return this.prisma.user.update({
      where: { id },
      data: { status: dto.status } as Prisma.UserUpdateInput,
    });
  }
}
