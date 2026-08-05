import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, ParseFloatPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto, UpdateRestaurantDto, ToggleOpenDto } from './dto/restaurant.dto';
import { JwtAuthGuard, Public } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '@prisma/client';

@ApiTags('restaurants')
@UseGuards(JwtAuthGuard)
@Controller('restaurants')
export class RestaurantsController {
  constructor(private restaurantsService: RestaurantsService) {}

  // ── Public Endpoints ──────────────────────

  @Public()
  @Get('nearby')
  @ApiOperation({ summary: 'Lấy danh sách quán gần vị trí khách (trong bán kính)' })
  @ApiQuery({ name: 'lat', type: Number, example: 10.7769 })
  @ApiQuery({ name: 'lng', type: Number, example: 106.7009 })
  @ApiQuery({ name: 'radius', type: Number, required: false, example: 10 })
  findNearby(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
    @Query('radius') radius?: number,
  ) {
    return this.restaurantsService.findNearby(lat, lng, radius);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết quán + menu' })
  findOne(@Param('id') id: string) {
    return this.restaurantsService.findById(id);
  }

  // ── Restaurant Owner ──────────────────────

  @Get('me/restaurant')
  @Roles(UserRole.restaurant)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Restaurant] Lấy thông tin quán của mình' })
  getMyRestaurant(@CurrentUser() user: User) {
    return this.restaurantsService.getMyRestaurant(user);
  }

  @Post()
  @Roles(UserRole.restaurant)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Restaurant] Tạo quán mới' })
  create(@CurrentUser() user: User, @Body() dto: CreateRestaurantDto) {
    return this.restaurantsService.create(user, dto);
  }

  @Patch(':id')
  @Roles(UserRole.restaurant)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Restaurant] Cập nhật thông tin quán' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateRestaurantDto,
  ) {
    return this.restaurantsService.update(user, id, dto);
  }

  @Patch(':id/toggle-open')
  @Roles(UserRole.restaurant)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Restaurant] Mở/đóng cửa thủ công' })
  toggleOpen(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: ToggleOpenDto,
  ) {
    return this.restaurantsService.toggleOpen(user, id, dto.isOpen);
  }
}
