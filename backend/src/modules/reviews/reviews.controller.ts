import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/review.dto';
import { JwtAuthGuard, Public } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Customer] Đánh giá quán ăn & shipper sau đơn hàng' })
  createReview(@CurrentUser() user: User, @Body() dto: CreateReviewDto) {
    return this.reviewsService.createReview(user, dto);
  }

  @Public()
  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Xem tất cả đánh giá của một quán ăn' })
  getRestaurantReviews(@Param('restaurantId') restaurantId: string) {
    return this.reviewsService.getRestaurantReviews(restaurantId);
  }
}
