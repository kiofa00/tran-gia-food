import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderStatus, OrderType, PaymentStatus, Prisma, User, UserRole } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { CancelOrderDto, CreateOrderDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  // eslint-disable-next-line sonarjs/cognitive-complexity
  async createOrder(customer: User, dto: CreateOrderDto) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: dto.restaurantId },
    });
    if (!restaurant) throw new NotFoundException('Quán ăn không tồn tại');
    if (!restaurant.isOpen) throw new BadRequestException('Quán hiện đang đóng cửa');

    // 1. Calculate items subtotal
    let subtotal = 0;
    const orderItemData: Prisma.OrderItemCreateManyOrderInput[] = [];

    for (const itemInput of dto.items) {
      const menuItem = await this.prisma.menuItem.findUnique({
        where: { id: itemInput.itemId },
      });
      if (!menuItem || !menuItem.isAvailable) {
        throw new BadRequestException(
          `Món ${menuItem?.name ?? itemInput.itemId} hiện không khả dụng`,
        );
      }
      const itemTotal = menuItem.price * itemInput.quantity;
      subtotal += itemTotal;

      orderItemData.push({
        itemId: menuItem.id,
        itemName: menuItem.name,
        quantity: itemInput.quantity,
        unitPrice: menuItem.price,
        totalPrice: itemTotal,
      });
    }

    // 2. Shipping calculation
    let shipFee = 0;
    let distanceKm = 0;

    if (dto.orderType === OrderType.delivery) {
      if (!dto.deliveryLat || !dto.deliveryLng) {
        throw new BadRequestException('Vui lòng cung cấp tọa độ giao hàng');
      }

      // Distance calculation (Haversine formula in km)
      distanceKm = this.calculateDistance(
        restaurant.lat,
        restaurant.lng,
        dto.deliveryLat,
        dto.deliveryLng,
      );

      if (distanceKm > restaurant.radiusKm) {
        throw new BadRequestException('Địa chỉ giao hàng vượt quá bán kính phục vụ của quán');
      }

      // Base fee 10,000 + 3,000/km
      shipFee = 10000 + Math.ceil(distanceKm) * 3000;
    }

    // 3. Voucher calculation
    let discountAmount = 0;
    let voucherId: string | undefined;

    if (dto.voucherCode) {
      const voucher = await this.prisma.voucher.findUnique({
        where: { code: dto.voucherCode },
      });
      if (voucher && voucher.validFrom <= new Date() && voucher.validTo >= new Date()) {
        if (subtotal >= voucher.minOrderValue) {
          voucherId = voucher.id;
          if (voucher.discountType === 'percent') {
            discountAmount = (subtotal * voucher.discountValue) / 100;
            if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
              discountAmount = voucher.maxDiscount;
            }
          } else if (voucher.discountType === 'fixed') {
            discountAmount = voucher.discountValue;
          } else if (voucher.discountType === 'free_ship') {
            discountAmount = shipFee;
          }
        }
      }
    }

    const platformFee = subtotal * restaurant.platformFeeRate;
    const totalAmount = Math.max(0, subtotal + shipFee - discountAmount);

    // 4. Create Order Transaction
    let order: Prisma.OrderGetPayload<{ include: { items: true; restaurant: true } }>;

    try {
      order = await this.prisma.order.create({
        data: {
          customerId: customer.id,
          restaurantId: restaurant.id,
          orderType: dto.orderType,
          status: OrderStatus.pending,
          subtotal,
          shipFee,
          discountAmount,
          platformFee,
          totalAmount,
          paymentMethod: dto.paymentMethod,
          paymentStatus: PaymentStatus.pending,
          voucherId,
          deliveryAddress: dto.deliveryAddress,
          deliveryLat: dto.deliveryLat,
          deliveryLng: dto.deliveryLng,
          distanceKm,
          note: dto.note,
          items: {
            createMany: {
              data: orderItemData,
            },
          },
        },
        include: {
          items: true,
          restaurant: true,
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown DB error';
      throw new InternalServerErrorException(`Không thể tạo đơn hàng: ${message}`);
    }

    // 5. Trigger notifications & auto-assign events
    this.eventEmitter.emit('order.created', order);

    return order;
  }

  async cancelOrder(user: User, orderId: string, dto: CancelOrderDto) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    // Only allow customer to cancel if status is PENDING
    if (
      order.customerId !== user.id &&
      user.role !== UserRole.admin &&
      user.role !== UserRole.restaurant
    ) {
      throw new ForbiddenException('Bạn không có quyền hủy đơn hàng này');
    }

    if (order.status !== OrderStatus.pending && user.role === UserRole.customer) {
      throw new BadRequestException('Chỉ có thể hủy đơn khi ở trạng thái PENDING');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.cancelled,
        cancelReason: dto.reason,
      },
    });

    this.eventEmitter.emit('order.cancelled', updatedOrder);
    return updatedOrder;
  }

  async updateOrderStatus(_user: User, orderId: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    const updateData: Prisma.OrderUpdateInput = { status };
    if (status === OrderStatus.delivered) updateData.deliveredAt = new Date();
    if (status === OrderStatus.completed) {
      updateData.completedAt = new Date();
      updateData.paymentStatus = PaymentStatus.paid;
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    if (status === OrderStatus.completed) {
      this.eventEmitter.emit('order.completed', updatedOrder);
    } else {
      this.eventEmitter.emit('order.status_updated', updatedOrder);
    }

    return updatedOrder;
  }

  async findCustomerOrders(customerId: string) {
    return this.prisma.order.findMany({
      where: { customerId },
      include: { items: true, restaurant: true, shipper: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findRestaurantOrders(restaurantId: string, status?: OrderStatus) {
    return this.prisma.order.findMany({
      where: { restaurantId, ...(status ? { status } : {}) },
      include: { items: true, customer: true, shipper: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOrderById(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        restaurant: true,
        customer: true,
        shipper: { include: { user: true } },
        payment: true,
      },
    });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    return order;
  }

  public calculateShippingFee(distanceKm: number): number {
    if (distanceKm <= 0) return 0;
    // Base fee 10,000 for first km + 3,000/km for subsequent km
    return 10000 + Math.ceil(distanceKm) * 3000;
  }

  public estimateDelivery(lat1: number, lon1: number, lat2: number, lon2: number) {
    const distanceKm = this.calculateDistance(lat1, lon1, lat2, lon2);
    const shipFee = this.calculateShippingFee(distanceKm);
    const estimatedMinutes = Math.round(distanceKm * 5 + 10);
    return {
      distanceKm: parseFloat(distanceKm.toFixed(2)),
      shipFee,
      estimatedMinutes,
    };
  }

  public calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
