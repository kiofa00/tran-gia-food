import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { User, UserRole } from '@prisma/client';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackService } from './feedback.service';

@ApiTags('App Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Gửi đánh giá và góp ý ứng dụng (Rate App & Feedback)' })
  submitFeedback(@Body() dto: CreateFeedbackDto, @CurrentUser() user?: User) {
    return this.feedbackService.create(dto, user?.id);
  }

  @Get()
  @ApiBearerAuth('JWT')
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Danh sách đánh giá ứng dụng (Admin Web)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'platform', required: false, type: String, example: 'android' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('platform') platform?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.feedbackService.findAll(pageNum, limitNum, platform);
  }

  @Get('stats')
  @ApiBearerAuth('JWT')
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Thống kê mức độ hài lòng CSAT và phân bố sao (Admin Web)' })
  getStats() {
    return this.feedbackService.getStats();
  }
}
