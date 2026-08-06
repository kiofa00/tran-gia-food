import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User, UserRole } from '@prisma/client';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CreateCategoryDto,
  CreateMenuItemDto,
  UpdateCategoryDto,
  UpdateMenuItemDto,
} from './dto/menu.dto';
import { MenuService } from './menu.service';

@ApiTags('menu')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.restaurant)
@Controller('menu')
export class MenuController {
  constructor(private menuService: MenuService) {}

  // ── Categories ────────────────────────────

  @Post('categories/:restaurantId')
  @ApiOperation({ summary: '[Restaurant] Tạo danh mục mới' })
  createCategory(
    @CurrentUser() user: User,
    @Param('restaurantId') restaurantId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.menuService.createCategory(user, restaurantId, dto);
  }

  @Patch('categories/:categoryId')
  @ApiOperation({ summary: '[Restaurant] Cập nhật danh mục' })
  updateCategory(
    @CurrentUser() user: User,
    @Param('categoryId') categoryId: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.menuService.updateCategory(user, categoryId, dto);
  }

  @Delete('categories/:categoryId')
  @ApiOperation({ summary: '[Restaurant] Ẩn danh mục' })
  deleteCategory(@CurrentUser() user: User, @Param('categoryId') categoryId: string) {
    return this.menuService.deleteCategory(user, categoryId);
  }

  // ── Items ─────────────────────────────────

  @Post('items/:categoryId')
  @ApiOperation({ summary: '[Restaurant] Thêm món ăn vào danh mục' })
  createItem(
    @CurrentUser() user: User,
    @Param('categoryId') categoryId: string,
    @Body() dto: CreateMenuItemDto,
  ) {
    return this.menuService.createItem(user, categoryId, dto);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: '[Restaurant] Cập nhật món ăn' })
  updateItem(
    @CurrentUser() user: User,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateMenuItemDto,
  ) {
    return this.menuService.updateItem(user, itemId, dto);
  }

  @Patch('items/:itemId/toggle-available')
  @ApiOperation({ summary: '[Restaurant] Bật/tắt sẵn có của món' })
  toggleItem(
    @CurrentUser() user: User,
    @Param('itemId') itemId: string,
    @Body('isAvailable') isAvailable: boolean,
  ) {
    return this.menuService.toggleItemAvailability(user, itemId, isAvailable);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: '[Restaurant] Ẩn món ăn' })
  deleteItem(@CurrentUser() user: User, @Param('itemId') itemId: string) {
    return this.menuService.deleteItem(user, itemId);
  }
}
