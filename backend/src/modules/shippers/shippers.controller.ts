import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User, UserRole } from '@prisma/client';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RegisterShipperDto, ToggleActiveDto, UpdateLocationDto } from './dto/shipper.dto';
import { ShippersService } from './shippers.service';

@ApiTags('shippers')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('shippers')
export class ShippersController {
  constructor(private shippersService: ShippersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký trở thành Shipper' })
  register(@CurrentUser() user: User, @Body() dto: RegisterShipperDto) {
    return this.shippersService.register(user, dto);
  }

  @Get('me')
  @Roles(UserRole.shipper)
  @ApiOperation({ summary: '[Shipper] Xem thông tin hồ sơ & 2 ví thu nhập' })
  getMyProfile(@CurrentUser() user: User) {
    return this.shippersService.getMyProfile(user);
  }

  @Patch('toggle-active')
  @Roles(UserRole.shipper)
  @ApiOperation({ summary: '[Shipper] Bật/tắt trạng thái sẵn sàng nhận đơn' })
  toggleActive(@CurrentUser() user: User, @Body() dto: ToggleActiveDto) {
    return this.shippersService.toggleActive(user, dto.isActive);
  }

  @Patch('location')
  @Roles(UserRole.shipper)
  @ApiOperation({ summary: '[Shipper] Cập nhật vị trí GPS real-time' })
  updateLocation(@CurrentUser() user: User, @Body() dto: UpdateLocationDto) {
    return this.shippersService.updateLocation(user, dto);
  }

  @Get('available-orders')
  @Roles(UserRole.shipper)
  @ApiOperation({ summary: '[Shipper] Xem danh sách đơn đang chờ nhận' })
  getAvailableOrders(@CurrentUser() user: User) {
    return this.shippersService.getAvailableOrdersNearby(user);
  }

  @Post('accept-order/:orderId')
  @Roles(UserRole.shipper)
  @ApiOperation({ summary: '[Shipper] Chấp nhận đơn hàng' })
  acceptOrder(@CurrentUser() user: User, @Param('orderId') orderId: string) {
    return this.shippersService.acceptOrder(user, orderId);
  }

  @Get('my-deliveries')
  @Roles(UserRole.shipper)
  @ApiOperation({ summary: '[Shipper] Xem lịch sử đơn hàng đã/đang giao' })
  getMyDeliveries(@CurrentUser() user: User) {
    return this.shippersService.getMyDeliveries(user);
  }
}
