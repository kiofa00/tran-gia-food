import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Lay profile cua minh' })
  getMe(@CurrentUser() user: User) {
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Cap nhat profile' })
  update(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.id, dto);
  }

  @Get('me/orders')
  @ApiOperation({ summary: 'Lich su don hang cua customer' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getOrderHistory(
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.getOrderHistory(
      user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('me/notifications')
  @ApiOperation({ summary: 'Danh sach thong bao' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  getNotifications(@CurrentUser() user: User, @Query('page') page?: string) {
    return this.usersService.getNotifications(user.id, page ? parseInt(page) : 1);
  }

  @Get('me/notifications/unread-count')
  @ApiOperation({ summary: 'So thong bao chua doc' })
  getUnreadCount(@CurrentUser() user: User) {
    return this.usersService.getUnreadCount(user.id);
  }

  @Patch('me/notifications/:id/read')
  @ApiOperation({ summary: 'Danh dau thong bao da doc' })
  markRead(@CurrentUser() user: User, @Param('id') id: string) {
    return this.usersService.markNotificationRead(id, user.id);
  }

  @Patch('me/notifications/read-all')
  @ApiOperation({ summary: 'Danh dau tat ca thong bao da doc' })
  markAllRead(@CurrentUser() user: User) {
    return this.usersService.markAllNotificationsRead(user.id);
  }
}
