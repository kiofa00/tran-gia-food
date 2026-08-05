import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/review.dto';
import { User, OrderStatus } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(customer: User, dto: CreateReviewDto) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    if (order.customerId !== customer.id) {
      throw new BadRequestException('Bạn không phải là người đặt đơn hàng này');
    }
    if (order.status !== OrderStatus.completed) {
      throw new BadRequestException('Chỉ có thể đánh giá khi đơn hàng đã COMPLETED');
    }

    const existingReview = await this.prisma.review.findUnique({ where: { orderId: dto.orderId } });
    if (existingReview) throw new BadRequestException('Đơn hàng này đã được đánh giá rồi');

    const review = await this.prisma.review.create({
      data: {
        orderId: dto.orderId,
        customerId: customer.id,
        restaurantId: order.restaurantId,
        shipperId: order.shipperId,
        restaurantRating: dto.restaurantRating,
        shipperRating: dto.shipperRating,
        comment: dto.comment,
      },
    });

    // Update restaurant avg rating
    const restaurantReviews = await this.prisma.review.aggregate({
      where: { restaurantId: order.restaurantId },
      _avg: { restaurantRating: true },
      _count: true,
    });
    await this.prisma.restaurant.update({
      where: { id: order.restaurantId },
      data: {
        avgRating: restaurantReviews._avg.restaurantRating ?? 5,
        totalReviews: restaurantReviews._count,
      },
    });

    // Update shipper avg rating if applicable
    if (order.shipperId && dto.shipperRating) {
      const shipperReviews = await this.prisma.review.aggregate({
        where: { shipperId: order.shipperId },
        _avg: { shipperRating: true },
      });
      await this.prisma.shipper.update({
        where: { id: order.shipperId },
        data: {
          avgRating: shipperReviews._avg.shipperRating ?? 5,
        },
      });
    }

    return review;
  }

  async getRestaurantReviews(restaurantId: string) {
    return this.prisma.review.findMany({
      where: { restaurantId },
      include: { customer: { select: { name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
