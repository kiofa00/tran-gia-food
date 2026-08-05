import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/notification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('notifications')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get('my-notifications')
  @ApiOperation({ summary: 'Lấy lịch sử thông báo của tôi' })
  getMyNotifications(@CurrentUser() user: User) {
    return this.notificationsService.getMyNotifications(user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Đánh dấu thông báo đã đọc' })
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Post('send')
  @ApiOperation({ summary: 'Gửi thông báo đến user (Admin / System)' })
  sendNotification(@Body() dto: SendNotificationDto) {
    return this.notificationsService.send(dto);
  }
}
