import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { User, UserRole } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateVoucherDto, ValidateVoucherDto } from './dto/voucher.dto';

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

  async findAllActive() {
    const now = new Date();
    return this.prisma.voucher.findMany({
      where: {
        validFrom: { lte: now },
        validTo: { gte: now },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
