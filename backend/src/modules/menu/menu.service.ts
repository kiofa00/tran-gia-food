import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { MenuCategory, MenuItem, User } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateCategoryDto,
  CreateMenuItemDto,
  UpdateCategoryDto,
  UpdateMenuItemDto,
} from './dto/menu.dto';

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  // ──────────────────────────────────────────
  // Categories
  // ──────────────────────────────────────────

  async createCategory(user: User, restaurantId: string, dto: CreateCategoryDto): Promise<MenuCategory> {
    await this.assertRestaurantOwner(user, restaurantId);
    return this.prisma.menuCategory.create({
      data: { ...dto, restaurantId },
    });
  }

  async updateCategory(user: User, categoryId: string, dto: UpdateCategoryDto): Promise<MenuCategory> {
    const category = await this.prisma.menuCategory.findUnique({ where: { id: categoryId } });
    if (!category) throw new NotFoundException('Danh mục không tồn tại');
    await this.assertRestaurantOwner(user, category.restaurantId);
    return this.prisma.menuCategory.update({ where: { id: categoryId }, data: dto });
  }

  async deleteCategory(user: User, categoryId: string): Promise<MenuCategory> {
    const category = await this.prisma.menuCategory.findUnique({ where: { id: categoryId } });
    if (!category) throw new NotFoundException('Danh mục không tồn tại');
    await this.assertRestaurantOwner(user, category.restaurantId);
    return this.prisma.menuCategory.update({
      where: { id: categoryId },
      data: { isActive: false },
    });
  }

  // ──────────────────────────────────────────
  // Menu Items
  // ──────────────────────────────────────────

  async createItem(user: User, categoryId: string, dto: CreateMenuItemDto): Promise<MenuItem> {
    const category = await this.prisma.menuCategory.findUnique({ where: { id: categoryId } });
    if (!category) throw new NotFoundException('Danh mục không tồn tại');
    await this.assertRestaurantOwner(user, category.restaurantId);
    return this.prisma.menuItem.create({ data: { ...dto, categoryId } });
  }

  async updateItem(user: User, itemId: string, dto: UpdateMenuItemDto): Promise<MenuItem> {
    const item = await this.prisma.menuItem.findUnique({
      where: { id: itemId },
      include: { category: true },
    });
    if (!item) throw new NotFoundException('Món ăn không tồn tại');
    await this.assertRestaurantOwner(user, item.category.restaurantId);
    return this.prisma.menuItem.update({ where: { id: itemId }, data: dto });
  }

  async deleteItem(user: User, itemId: string): Promise<MenuItem> {
    const item = await this.prisma.menuItem.findUnique({
      where: { id: itemId },
      include: { category: true },
    });
    if (!item) throw new NotFoundException('Món ăn không tồn tại');
    await this.assertRestaurantOwner(user, item.category.restaurantId);
    return this.prisma.menuItem.update({
      where: { id: itemId },
      data: { isAvailable: false },
    });
  }

  async toggleItemAvailability(user: User, itemId: string, isAvailable: boolean): Promise<MenuItem> {
    const item = await this.prisma.menuItem.findUnique({
      where: { id: itemId },
      include: { category: true },
    });
    if (!item) throw new NotFoundException('Món ăn không tồn tại');
    await this.assertRestaurantOwner(user, item.category.restaurantId);
    return this.prisma.menuItem.update({ where: { id: itemId }, data: { isAvailable } });
  }

  // ──────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────

  private async assertRestaurantOwner(user: User, restaurantId: string): Promise<void> {
    let restaurant;
    try {
      restaurant = await this.prisma.restaurant.findUnique({ where: { id: restaurantId } });
    } catch {
      throw new InternalServerErrorException('Lỗi khi truy vấn dữ liệu quán');
    }
    if (!restaurant) throw new NotFoundException('Quán không tồn tại');
    if (restaurant.ownerId !== user.id) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa menu quán này');
    }
  }
}
