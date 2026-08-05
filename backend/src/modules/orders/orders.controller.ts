import {
  Controller, Post, Get, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, CancelOrderDto } from './dto/order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, OrderStatus, UserRole } from '@prisma/client';

@ApiTags('orders')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: '[Customer] Tạo đơn hàng mới' })
  createOrder(@CurrentUser() user: User, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(user, dto);
  }

  @Get('my-orders')
  @ApiOperation({ summary: '[Customer] Danh sách đơn hàng của tôi' })
  getMyOrders(@CurrentUser() user: User) {
    return this.ordersService.findCustomerOrders(user.id);
  }

  @Get('restaurant/:restaurantId')
  @Roles(UserRole.restaurant)
  @ApiOperation({ summary: '[Restaurant] Danh sách đơn hàng của quán' })
  @ApiQuery({ name: 'status', enum: OrderStatus, required: false })
  getRestaurantOrders(
    @Param('restaurantId') restaurantId: string,
    @Query('status') status?: OrderStatus,
  ) {
    return this.ordersService.findRestaurantOrders(restaurantId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết đơn hàng' })
  getOrderById(@Param('id') id: string) {
    return this.ordersService.findOrderById(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Hủy đơn hàng (khi còn PENDING)' })
  cancelOrder(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
  ) {
    return this.ordersService.cancelOrder(user, id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái đơn hàng' })
  updateStatus(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.ordersService.updateOrderStatus(user, id, status);
  }
}
