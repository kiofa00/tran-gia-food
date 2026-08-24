import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import {
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
  User,
  UserRole,
} from '@prisma/client';
import * as crypto from 'crypto';

import { DeliveryGateway } from '../gateways/delivery.gateway';
import { ChatService } from '../modules/chat/chat.service';
import { OrdersService } from '../modules/orders/orders.service';
import { PaymentsService } from '../modules/payments/payments.service';
import { MOMO_SANDBOX_CONFIG } from '../modules/payments/utils/payment-crypto.util';
import { ReviewsService } from '../modules/reviews/reviews.service';
import { ShippersService } from '../modules/shippers/shippers.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

describe('E2E Flow 4: Full Order, Delivery, Payment & Review Lifecycle Flow', () => {
  let ordersService: OrdersService;
  let paymentsService: PaymentsService;
  let shippersService: ShippersService;
  let chatService: ChatService;
  let reviewsService: ReviewsService;

  const mockCustomer = { id: 'user-cust-1', role: UserRole.customer } as unknown as User;
  const mockRestaurantOwner = { id: 'owner-rest-1', role: UserRole.restaurant } as unknown as User;
  const mockShipperUser = { id: 'user-ship-1', role: UserRole.shipper } as unknown as User;

  const mockPrismaService = {
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    restaurant: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    menuItem: {
      findUnique: jest.fn(),
    },
    voucher: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    shipper: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    chatMessage: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    review: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      aggregate: jest.fn().mockResolvedValue({
        _avg: { restaurantRating: 5, shipperRating: 5 },
        _count: 1,
      }),
    },
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const mockDeliveryGateway = {
    emitOrderStatusChanged: jest.fn(),
    emitNewOrderAvailable: jest.fn(),
    emitChatMessage: jest.fn(),
  };

  const mockRedisService = {
    setShipperLocation: jest.fn(),
    getShipperLocation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        PaymentsService,
        ShippersService,
        ChatService,
        ReviewsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: DeliveryGateway, useValue: mockDeliveryGateway },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    ordersService = module.get<OrdersService>(OrdersService);
    paymentsService = module.get<PaymentsService>(PaymentsService);
    shippersService = module.get<ShippersService>(ShippersService);
    chatService = module.get<ChatService>(ChatService);
    reviewsService = module.get<ReviewsService>(ReviewsService);
    jest.clearAllMocks();
  });

  it('should complete the entire order lifecycle from creation to payment, delivery, chat, and review', async () => {
    // -------------------------------------------------------------
    // Phase 1: Customer Creates Order with Items & Voucher
    // -------------------------------------------------------------
    mockPrismaService.restaurant.findUnique.mockResolvedValue({
      id: 'rest-1',
      name: 'Cơm Tấm Sài Gòn',
      lat: 16.068,
      lng: 108.212,
      radiusKm: 10,
      isOpen: true,
      platformFeeRate: 0.15,
    });

    mockPrismaService.menuItem.findUnique.mockResolvedValue({
      id: 'item-1',
      name: 'Cơm Sườn Trứng',
      price: 50000,
      isAvailable: true,
    });

    mockPrismaService.voucher.findUnique.mockResolvedValue({
      id: 'vouch-1',
      code: 'GIAM10K',
      discountType: 'fixed',
      discountValue: 10000,
      minOrderValue: 50000,
      validFrom: new Date('2026-01-01'),
      validTo: new Date('2026-12-31'),
    });

    const mockCreatedOrder = {
      id: 'order-e2e-100',
      customerId: 'user-cust-1',
      restaurantId: 'rest-1',
      orderType: OrderType.delivery,
      status: OrderStatus.pending,
      subtotal: 100000,
      shipFee: 16000,
      discountAmount: 10000,
      totalAmount: 106000,
      paymentMethod: PaymentMethod.momo,
      paymentStatus: PaymentStatus.pending,
    };

    mockPrismaService.order.create.mockResolvedValue(mockCreatedOrder);

    const createdOrder = await ordersService.createOrder(mockCustomer, {
      restaurantId: 'rest-1',
      orderType: OrderType.delivery,
      deliveryAddress: '456 Lê Duẩn, Đà Nẵng',
      deliveryLat: 16.072,
      deliveryLng: 108.218,
      paymentMethod: PaymentMethod.momo,
      voucherCode: 'GIAM10K',
      items: [{ itemId: 'item-1', quantity: 2 }],
    });

    expect(createdOrder.id).toBe('order-e2e-100');
    expect(createdOrder.totalAmount).toBe(106000);
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('order.created', expect.any(Object));
    expect(mockDeliveryGateway.emitNewOrderAvailable).toHaveBeenCalled();

    // -------------------------------------------------------------
    // Phase 2: MoMo Payment URL Generation & Webhook Confirmation
    // -------------------------------------------------------------
    mockPrismaService.order.findUnique.mockResolvedValue(mockCreatedOrder);
    mockPrismaService.payment.upsert.mockResolvedValue({});

    const paymentUrlRes = await paymentsService.createPaymentUrl({ orderId: 'order-e2e-100' });
    expect(paymentUrlRes.payUrl).toContain('momo.vn');
    expect(paymentUrlRes.signature).toBeDefined();

    // Simulating MoMo Webhook IPN Callback with Valid Signature
    const rawSig =
      `accessKey=${MOMO_SANDBOX_CONFIG.accessKey}` +
      `&amount=106000` +
      `&extraData=` +
      `&message=Success` +
      `&orderId=order-e2e-100` +
      `&orderInfo=` +
      `&orderType=momo_wallet` +
      `&partnerCode=${MOMO_SANDBOX_CONFIG.partnerCode}` +
      `&payType=qr` +
      `&requestId=req-e2e-1` +
      `&responseTime=` +
      `&resultCode=0` +
      `&transId=`;

    const momoSignature = crypto
      .createHmac('sha256', MOMO_SANDBOX_CONFIG.secretKey)
      .update(rawSig)
      .digest('hex');

    mockPrismaService.payment.upsert.mockResolvedValue({});
    mockPrismaService.order.update.mockResolvedValue({
      ...mockCreatedOrder,
      paymentStatus: PaymentStatus.paid,
    });

    const webhookRes = await paymentsService.handleMoMoWebhook({
      partnerCode: MOMO_SANDBOX_CONFIG.partnerCode,
      orderId: 'order-e2e-100',
      requestId: 'req-e2e-1',
      amount: '106000',
      resultCode: '0',
      message: 'Success',
      signature: momoSignature,
    });

    expect(webhookRes.RspCode).toBe('00');
    expect(mockPrismaService.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order-e2e-100' },
        data: { paymentStatus: PaymentStatus.paid },
      }),
    );

    // -------------------------------------------------------------
    // Phase 3: Restaurant Kitchen Preparation
    // -------------------------------------------------------------
    mockPrismaService.order.findUnique.mockResolvedValue({
      ...mockCreatedOrder,
      paymentStatus: PaymentStatus.paid,
      status: OrderStatus.pending,
    });

    mockPrismaService.order.update.mockResolvedValue({
      ...mockCreatedOrder,
      status: OrderStatus.confirmed,
    });

    const confirmedOrder = await ordersService.updateOrderStatus(
      mockRestaurantOwner,
      'order-e2e-100',
      OrderStatus.confirmed,
    );
    expect(confirmedOrder.status).toBe(OrderStatus.confirmed);
    expect(mockDeliveryGateway.emitOrderStatusChanged).toHaveBeenCalledWith(
      'order-e2e-100',
      OrderStatus.confirmed,
    );

    // -------------------------------------------------------------
    // Phase 4: Shipper Accepts Order & Delivers
    // -------------------------------------------------------------
    mockPrismaService.shipper.findUnique.mockResolvedValue({
      id: 'ship-10',
      userId: 'user-ship-1',
      isActive: true,
    });

    mockPrismaService.order.findUnique.mockResolvedValue({
      ...mockCreatedOrder,
      status: OrderStatus.confirmed,
      shipperId: null,
    });

    mockPrismaService.order.update.mockResolvedValue({
      ...mockCreatedOrder,
      status: OrderStatus.picking_up,
      shipperId: 'ship-10',
    });

    const acceptedOrder = await shippersService.acceptOrder(mockShipperUser, 'order-e2e-100');
    expect(acceptedOrder.status).toBe(OrderStatus.picking_up);
    expect(acceptedOrder.shipperId).toBe('ship-10');

    // Shipper updates to delivered
    mockPrismaService.order.findUnique.mockResolvedValue({
      ...mockCreatedOrder,
      status: OrderStatus.delivering,
      shipperId: 'ship-10',
    });

    mockPrismaService.order.update.mockResolvedValue({
      ...mockCreatedOrder,
      status: OrderStatus.delivered,
      shipperId: 'ship-10',
    });

    const deliveredOrder = await ordersService.updateOrderStatus(
      mockShipperUser,
      'order-e2e-100',
      OrderStatus.delivered,
    );
    expect(deliveredOrder.status).toBe(OrderStatus.delivered);

    // -------------------------------------------------------------
    // Phase 5: In-App Masked Chat Between Customer and Shipper
    // -------------------------------------------------------------
    mockPrismaService.chatMessage.create.mockResolvedValue({
      id: 'chat-1',
      orderId: 'order-e2e-100',
      senderId: 'user-cust-1',
      senderName: 'Khách hàng',
      content: 'Shipper đến ngõ 45 alo em nhé',
      type: 'text',
      createdAt: new Date(),
    });

    const chatMsg = await chatService.sendMessage(mockCustomer, {
      orderId: 'order-e2e-100',
      receiverId: 'user-ship-1',
      content: 'Shipper đến ngõ 45 alo em nhé',
    });

    expect(chatMsg.id).toBe('chat-1');
    expect(mockDeliveryGateway.emitChatMessage).toHaveBeenCalled();

    // -------------------------------------------------------------
    // Phase 6: Post-Delivery Customer Rating & Review
    // -------------------------------------------------------------
    mockPrismaService.order.findUnique.mockResolvedValue({
      ...mockCreatedOrder,
      status: OrderStatus.completed,
      customerId: 'user-cust-1',
    });
    mockPrismaService.review.findUnique = jest.fn().mockResolvedValue(null);
    mockPrismaService.review.create.mockResolvedValue({
      id: 'rev-1',
      orderId: 'order-e2e-100',
      customerId: 'user-cust-1',
      restaurantId: 'rest-1',
      restaurantRating: 5,
      shipperRating: 5,
      comment: 'Cơm rất ngon, giao siêu nhanh!',
    });

    const review = await reviewsService.createReview(mockCustomer, {
      orderId: 'order-e2e-100',
      restaurantRating: 5,
      shipperRating: 5,
      comment: 'Cơm rất ngon, giao siêu nhanh!',
    });

    expect(review.restaurantRating).toBe(5);
    expect(mockPrismaService.review.create).toHaveBeenCalled();
  });
});
