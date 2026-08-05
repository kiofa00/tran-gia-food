import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { RequestWithdrawalDto } from './dto/payout.dto';
import { User, PayoutStatus } from '@prisma/client';

@Injectable()
export class PayoutsService {
  private readonly logger = new Logger(PayoutsService.name);

  constructor(private prisma: PrismaService) {}

  async requestShipperWithdrawal(user: User, dto: RequestWithdrawalDto) {
    const shipper = await this.prisma.shipper.findUnique({ where: { userId: user.id } });
    if (!shipper) throw new NotFoundException('Hồ sơ shipper không tồn tại');

    if (shipper.walletCash < dto.amount) {
      throw new BadRequestException('Số dư ví tiền mặt không đủ để thực hiện giao dịch');
    }

    // Deduct wallet cash & create payout entry
    await this.prisma.shipper.update({
      where: { id: shipper.id },
      data: { walletCash: { decrement: dto.amount } },
    });

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

    return this.prisma.shipperPayout.create({
      data: {
        shipperId: shipper.id,
        amount: dto.amount,
        periodStart,
        periodEnd: now,
        status: PayoutStatus.pending,
      },
    });
  }

  async getShipperPayoutHistory(user: User) {
    const shipper = await this.prisma.shipper.findUnique({ where: { userId: user.id } });
    if (!shipper) throw new NotFoundException('Hồ sơ shipper không tồn tại');

    return this.prisma.shipperPayout.findMany({
      where: { shipperId: shipper.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ──────────────────────────────────────────
  // Weekly Automatic Statement Generator (Every Tuesday at 08:00 AM)
  // ──────────────────────────────────────────

  @Cron('0 8 * * 2')
  async generateWeeklyStatements() {
    this.logger.log('🚀 Running Weekly Statement & Payout Generator (Every Tuesday 08:00)');

    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);

    const shippers = await this.prisma.shipper.findMany({ where: { isActive: true } });

    for (const shipper of shippers) {
      if (shipper.walletCash > 0) {
        await this.prisma.shipperPayout.create({
          data: {
            shipperId: shipper.id,
            amount: shipper.walletCash,
            periodStart: start,
            periodEnd: end,
            status: PayoutStatus.completed,
            processedAt: new Date(),
          },
        });
        this.logger.log(`Auto statement generated for Shipper ${shipper.id}: ${shipper.walletCash}đ`);
      }
    }
  }
}
