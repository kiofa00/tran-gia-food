import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { Order } from '@prisma/client';

@Injectable()
export class CommissionsService {
  private readonly logger = new Logger(CommissionsService.name);

  constructor(private prisma: PrismaService) {}

  @OnEvent('order.completed')
  async handleOrderCompleted(order: Order) {
    this.logger.log(`Processing commission split for order ${order.id}`);

    // Check if commission already recorded
    const existing = await this.prisma.commission.findUnique({ where: { orderId: order.id } });
    if (existing) return;

    // Rates (can be read from config or defaulted)
    const platformFoodRate = order.platformFee / order.subtotal || 0.20; // 20%
    const platformShipRate = 0.15; // 15% platform fee on shipping
    const shipperShareRate = 0.85; // 85% to shipper

    const foodAmount = order.subtotal;
    const shipAmount = order.shipFee;

    const restaurantShare = foodAmount * (1 - platformFoodRate);
    const shipperShare = shipAmount * shipperShareRate;
    const platformShare = (foodAmount * platformFoodRate) + (shipAmount * platformShipRate);

    // Record Commission Record
    await this.prisma.commission.create({
      data: {
        orderId: order.id,
        foodAmount,
        shipAmount,
        restaurantShare,
        shipperShare,
        platformShare,
        processedAt: new Date(),
      },
    });

    // Update Shipper Cash Wallet if order was delivery and assigned to a shipper
    if (order.shipperId) {
      await this.prisma.shipper.update({
        where: { id: order.shipperId },
        data: {
          walletCash: { increment: shipperShare },
          totalDeliveries: { increment: 1 },
        },
      });
    }

    this.logger.log(
      `Commission calculated for order ${order.id}: Restaurant=${restaurantShare}đ, Shipper=${shipperShare}đ, Platform=${platformShare}đ`,
    );
  }
}
