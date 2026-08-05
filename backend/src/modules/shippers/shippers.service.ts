import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { RegisterShipperDto, UpdateLocationDto } from './dto/shipper.dto';
import { User, UserRole, OrderStatus } from '@prisma/client';

@Injectable()
export class ShippersService {
  private readonly logger = new Logger(ShippersService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async register(user: User, dto: RegisterShipperDto) {
    const existing = await this.prisma.shipper.findUnique({ where: { userId: user.id } });
    if (existing) throw new BadRequestException('Tài khoản đã đăng ký shipper');

    // Update user role to shipper
    await this.prisma.user.update({
      where: { id: user.id },
      data: { role: UserRole.shipper },
    });

    return this.prisma.shipper.create({
      data: {
        userId: user.id,
        vehicleType: dto.vehicleType,
        vehiclePlate: dto.vehiclePlate,
      },
    });
  }

  async getMyProfile(user: User) {
    const shipper = await this.prisma.shipper.findUnique({
      where: { userId: user.id },
      include: { user: true },
    });
    if (!shipper) throw new NotFoundException('Không tìm thấy hồ sơ shipper');
    return shipper;
  }

  async toggleActive(user: User, isActive: boolean) {
    const shipper = await this.prisma.shipper.findUnique({ where: { userId: user.id } });
    if (!shipper) throw new NotFoundException('Hồ sơ shipper không tồn tại');

    return this.prisma.shipper.update({
      where: { id: shipper.id },
      data: { isActive },
    });
  }

  async updateLocation(user: User, dto: UpdateLocationDto) {
    const shipper = await this.prisma.shipper.findUnique({ where: { userId: user.id } });
    if (!shipper) throw new NotFoundException('Hồ sơ shipper không tồn tại');

    // Update in Redis (fast cache for realtime matching)
    await this.redis.setShipperLocation(shipper.id, dto.lat, dto.lng);

    // Update in DB
    return this.prisma.shipper.update({
      where: { id: shipper.id },
      data: { lat: dto.lat, lng: dto.lng },
    });
  }

  async getAvailableOrdersNearby(user: User) {
    const shipper = await this.prisma.shipper.findUnique({ where: { userId: user.id } });
    if (!shipper || !shipper.isActive) return [];

    // Get CONFIRMED orders waiting for shipper pickup
    return this.prisma.order.findMany({
      where: {
        status: OrderStatus.confirmed,
        shipperId: null,
      },
      include: { restaurant: true, items: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async acceptOrder(user: User, orderId: string) {
    const shipper = await this.prisma.shipper.findUnique({ where: { userId: user.id } });
    if (!shipper) throw new NotFoundException('Hồ sơ shipper không tồn tại');

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    if (order.shipperId) throw new BadRequestException('Đơn hàng đã được shipper khác nhận');

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        shipperId: shipper.id,
        status: OrderStatus.picking_up,
      },
    });
  }

  async getMyDeliveries(user: User) {
    const shipper = await this.prisma.shipper.findUnique({ where: { userId: user.id } });
    if (!shipper) throw new NotFoundException('Hồ sơ shipper không tồn tại');

    return this.prisma.order.findMany({
      where: { shipperId: shipper.id },
      include: { restaurant: true, customer: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
