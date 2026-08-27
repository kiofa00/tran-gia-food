import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User, UserRole, VoucherType } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateVoucherDto, ValidateVoucherDto } from './dto/voucher.dto';

type VoucherWithUserVouchers = Prisma.VoucherGetPayload<{
  include: {
    restaurant: {
      select: { id: true; name: true; coverImageUrl: true };
    };
  };
}> & {
  userVouchers?: Array<{ id: string; status: string }>;
};

@Injectable()
export class VouchersService {
  constructor(private prisma: PrismaService) {}

  async create(user: User, dto: CreateVoucherDto) {
    const existing = await this.prisma.voucher.findUnique({ where: { code: dto.code } });
    if (existing) throw new BadRequestException('Mã voucher này đã tồn tại');

    let restaurantId: string | undefined;
    if (user.role === UserRole.restaurant) {
      const restaurant = await this.prisma.restaurant.findUnique({ where: { ownerId: user.id } });
      if (!restaurant) throw new BadRequestException('Tài khoản không sở hữu quán ăn nào');
      restaurantId = restaurant.id;
    }

    return this.prisma.voucher.create({
      data: {
        code: dto.code.toUpperCase(),
        type: dto.type,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        maxDiscount: dto.maxDiscount,
        minOrderValue: dto.minOrderValue ?? 0,
        validFrom: new Date(dto.validFrom),
        validTo: new Date(dto.validTo),
        totalLimit: dto.totalLimit,
        perUserLimit: dto.perUserLimit ?? 1,
        applicableOrderType: dto.applicableOrderType ?? 'both',
        issuedById: user.id,
        restaurantId,
      },
    });
  }

  async validateVoucher(dto: ValidateVoucherDto) {
    const voucher = await this.prisma.voucher.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (!voucher) throw new NotFoundException('Mã voucher không hợp lệ');

    const now = new Date();
    if (voucher.validFrom > now || voucher.validTo < now) {
      throw new BadRequestException('Mã voucher đã hết hạn hoặc chưa đến đợt sử dụng');
    }

    if (voucher.totalLimit && voucher.usedCount >= voucher.totalLimit) {
      throw new BadRequestException('Voucher đã hết lượt sử dụng');
    }

    if (dto.subtotal < voucher.minOrderValue) {
      throw new BadRequestException(
        `Đơn hàng phải từ ${voucher.minOrderValue.toLocaleString('vi-VN')}đ để áp dụng`,
      );
    }

    let discountAmount = 0;
    if (voucher.discountType === 'percent') {
      discountAmount = (dto.subtotal * voucher.discountValue) / 100;
      if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
        discountAmount = voucher.maxDiscount;
      }
    } else if (voucher.discountType === 'fixed') {
      discountAmount = voucher.discountValue;
    }

    return {
      valid: true,
      voucher,
      discountAmount,
      finalTotal: Math.max(0, dto.subtotal - discountAmount),
    };
  }

  async findAllActive(search?: string, type?: string, userId?: string) {
    const now = new Date();
    const where: Prisma.VoucherWhereInput = {
      validFrom: { lte: now },
      validTo: { gte: now },
    };

    if (type && type !== 'all') {
      if (type === 'platform') {
        where.type = VoucherType.platform;
      } else if (type === 'restaurant') {
        where.type = VoucherType.restaurant;
      } else if (type === 'ship' || type === 'free_ship') {
        where.type = VoucherType.ship;
      }
    }

    if (search && search.trim() !== '') {
      const q = search.trim();
      where.code = { contains: q, mode: 'insensitive' };
    }

    const vouchers = (await this.prisma.voucher.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        restaurant: {
          select: { id: true, name: true, coverImageUrl: true },
        },
        ...(userId
          ? {
              userVouchers: {
                where: { userId, status: 'claimed' },
                select: { id: true, status: true },
              },
            }
          : {}),
      },
    })) as VoucherWithUserVouchers[];

    return vouchers.map((v) => ({
      ...v,
      isClaimed: userId ? (v.userVouchers?.length ?? 0) > 0 : false,
    }));
  }

  async claimVoucher(userId: string, voucherId: string) {
    const voucher = await this.prisma.voucher.findUnique({
      where: { id: voucherId },
    });

    if (!voucher) {
      throw new NotFoundException('Mã voucher không tồn tại');
    }

    const now = new Date();
    if (voucher.validFrom > now || voucher.validTo < now) {
      throw new BadRequestException('Mã voucher đã hết hạn hoặc chưa tới thời gian áp dụng');
    }

    if (voucher.totalLimit && voucher.usedCount >= voucher.totalLimit) {
      throw new BadRequestException('Voucher đã hết số lượng phát hành');
    }

    // Kiểm tra xem user đã lưu voucher này chưa
    const existingClaim = await this.prisma.userVoucher.findUnique({
      where: {
        userId_voucherId: {
          userId,
          voucherId,
        },
      },
    });

    if (existingClaim) {
      if (existingClaim.status === 'claimed') {
        return {
          success: true,
          message: 'Voucher đã có sẵn trong ví của bạn',
          isAlreadyClaimed: true,
          data: existingClaim,
        };
      }
      if (existingClaim.status === 'used') {
        throw new BadRequestException('Bạn đã sử dụng voucher này rồi');
      }
    }

    const userVoucher = await this.prisma.userVoucher.create({
      data: {
        userId,
        voucherId,
        status: 'claimed',
      },
      include: {
        voucher: {
          include: {
            restaurant: {
              select: { id: true, name: true, coverImageUrl: true },
            },
          },
        },
      },
    });

    return {
      success: true,
      message: 'Lưu voucher vào ví thành công!',
      isAlreadyClaimed: false,
      data: userVoucher,
    };
  }

  async getMyWallet(userId: string, status?: string) {
    const where: Prisma.UserVoucherWhereInput = {
      userId,
    };

    if (status && (status === 'claimed' || status === 'used' || status === 'expired')) {
      where.status = status;
    } else {
      where.status = 'claimed';
    }

    const userVouchers = await this.prisma.userVoucher.findMany({
      where,
      orderBy: { claimedAt: 'desc' },
      include: {
        voucher: {
          include: {
            restaurant: {
              select: { id: true, name: true, coverImageUrl: true },
            },
          },
        },
      },
    });

    return userVouchers.map((uv) => ({
      ...uv.voucher,
      userVoucherId: uv.id,
      status: uv.status,
      claimedAt: uv.claimedAt,
      usedAt: uv.usedAt,
      isClaimed: true,
    }));
  }
}
