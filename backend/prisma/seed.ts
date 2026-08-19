import {
  DiscountType,
  KycStatus,
  MessageType,
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
  PayoutStatus,
  PenaltyLevel,
  PenaltyReason,
  PrismaClient,
  UserRole,
  VehicleType,
  VoucherType,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting 100% comprehensive database seed for Tran Gia Food Platform...');

  // =========================================================================
  // 1. CLEAN EXISTING RECORDS IN SAFE CASCADE ORDER
  // =========================================================================
  await prisma.chatMessage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.shipperPenalty.deleteMany();
  await prisma.restaurantPayout.deleteMany();
  await prisma.shipperPayout.deleteMany();
  await prisma.commission.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.voucherUsage.deleteMany();
  await prisma.order.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.shipper.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.appConfig.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned all 18 database tables.');

  // =========================================================================
  // 2. PASSWORDS & SECURITY SETUP
  // =========================================================================
  const ADMIN_PASSWORD = 'Admin@123456';
  const DEFAULT_USER_PASSWORD = 'User@123456';

  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const userPasswordHash = await bcrypt.hash(DEFAULT_USER_PASSWORD, 10);

  // =========================================================================
  // 3. SEED APP CONFIGURATIONS
  // =========================================================================
  const configs = [
    {
      key: 'platform_fee_rate',
      value: '0.20',
      description: 'Tỷ lệ phí hoa hồng nền tảng mặc định (20%)',
    },
    { key: 'base_ship_fee', value: '15000', description: 'Phí ship cơ bản cho 2km đầu tiên (VND)' },
    { key: 'base_ship_distance_km', value: '2.0', description: 'Khoảng cách ship cơ bản (km)' },
    {
      key: 'ship_fee_per_km',
      value: '5000',
      description: 'Phí ship cộng thêm cho mỗi km tiếp theo (VND)',
    },
    {
      key: 'shipper_countdown_seconds',
      value: '60',
      description: 'Thời gian đếm ngược nhận đơn của tài xế (giây)',
    },
    { key: 'kyc_auto_approval', value: 'false', description: 'Tự động duyệt eKYC tài xế' },
    {
      key: 'hotline_support',
      value: '1900 6868',
      description: 'Tổng đài chăm sóc khách hàng 24/7',
    },
    {
      key: 'app_version_min',
      value: '1.0.0',
      description: 'Phiên bản ứng dụng tối thiểu yêu cầu cập nhật',
    },
  ];

  for (const cfg of configs) {
    await prisma.appConfig.create({ data: cfg });
  }
  console.log('⚙️ Seeded AppConfig system settings.');

  // =========================================================================
  // 4. SEED USERS (Admin, Customers, Restaurant Owners, Shippers)
  // =========================================================================
  const adminUser = await prisma.user.create({
    data: {
      phone: '+84900000000',
      email: 'admin@trangiafood.vn',
      name: 'Quản Trị Viên Trần Gia',
      role: UserRole.admin,
      address: '720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP.HCM',
      passwordHash: adminPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      kycStatus: KycStatus.verified,
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      phone: '+84901111222',
      email: 'khachhang1@gmail.com',
      name: 'Lê Thu Thảo',
      role: UserRole.customer,
      address: '15 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM',
      lat: 10.778,
      lng: 106.702,
      passwordHash: userPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      phone: '+84903333444',
      email: 'khachhang2@gmail.com',
      name: 'Trần Minh Hoàng',
      role: UserRole.customer,
      address: '88 Nguyễn Thượng Hiền, Phường 5, Quận 3, TP.HCM',
      lat: 10.772,
      lng: 106.685,
      passwordHash: userPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    },
  });

  const customer3 = await prisma.user.create({
    data: {
      phone: '+84905555666',
      email: 'khachhang3@gmail.com',
      name: 'Nguyễn Phương Mai',
      role: UserRole.customer,
      address: '280 Phan Xích Long, Phường 2, Phú Nhuận, TP.HCM',
      lat: 10.796,
      lng: 106.689,
      passwordHash: userPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    },
  });

  const owner1 = await prisma.user.create({
    data: {
      phone: '+84911111111',
      email: 'sabichung@trangiafood.vn',
      name: 'Chủ Quán Sà Bì Chưởng',
      role: UserRole.restaurant,
      address: '179 Trần Hưng Đạo, Quận 1, TP.HCM',
      passwordHash: userPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200',
      kycStatus: KycStatus.verified,
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      phone: '+84922222222',
      email: 'phothin@trangiafood.vn',
      name: 'Chủ Quán Phở Thìn',
      role: UserRole.restaurant,
      address: '110 Lò Đúc, Hai Bà Trưng, Hà Nội',
      passwordHash: userPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      kycStatus: KycStatus.verified,
    },
  });

  const owner3 = await prisma.user.create({
    data: {
      phone: '+84933333333',
      email: 'huynhhoa@trangiafood.vn',
      name: 'Chủ Quán Bánh Mì Huỳnh Hoa',
      role: UserRole.restaurant,
      address: '26 Lê Thị Riêng, Phường Bến Thành, Quận 1, TP.HCM',
      passwordHash: userPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
      kycStatus: KycStatus.verified,
    },
  });

  const shipperUser1 = await prisma.user.create({
    data: {
      phone: '+84912345678',
      email: 'cuong.shipper@trangiafood.vn',
      name: 'Nguyễn Văn Cường (Tài xế Pro)',
      role: UserRole.shipper,
      kycStatus: KycStatus.verified,
      passwordHash: userPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    },
  });

  const shipperUser2 = await prisma.user.create({
    data: {
      phone: '+84987654321',
      email: 'nam.shipper@trangiafood.vn',
      name: 'Lê Hoàng Nam (Chờ duyệt KYC)',
      role: UserRole.shipper,
      kycStatus: KycStatus.pending,
      passwordHash: userPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200',
    },
  });

  const shipperUser3 = await prisma.user.create({
    data: {
      phone: '+84903111222',
      email: 'binh.shipper@trangiafood.vn',
      name: 'Phan Thanh Bình (Tài xế Active)',
      role: UserRole.shipper,
      kycStatus: KycStatus.verified,
      passwordHash: userPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200',
    },
  });

  console.log('👥 Seeded Users with bcrypt password hashes.');

  // =========================================================================
  // 5. SEED SHIPPERS WITH WALLETS & VEHICLES
  // =========================================================================
  const shipper1 = await prisma.shipper.create({
    data: {
      userId: shipperUser1.id,
      vehicleType: VehicleType.motorbike,
      vehiclePlate: '59P1-999.88',
      lat: 10.775,
      lng: 106.698,
      isActive: true,
      ekycStatus: KycStatus.verified,
      totalDeliveries: 420,
      avgRating: 4.95,
      walletCash: 850000,
      walletAccount: 2450000,
      penaltyLevel: PenaltyLevel.normal,
      bankAccount: {
        bank: 'Techcombank',
        accountNumber: '19034567890123',
        holder: 'NGUYEN VAN CUONG',
      },
    },
  });

  const shipper2 = await prisma.shipper.create({
    data: {
      userId: shipperUser2.id,
      vehicleType: VehicleType.motorbike,
      vehiclePlate: '59X2-123.45',
      lat: 10.755,
      lng: 106.68,
      isActive: false,
      ekycStatus: KycStatus.pending,
      totalDeliveries: 85,
      avgRating: 4.7,
      walletCash: 120000,
      walletAccount: 450000,
      penaltyLevel: PenaltyLevel.warned,
      bankAccount: { bank: 'MBBank', accountNumber: '098765432199', holder: 'LE HOANG NAM' },
    },
  });

  const shipper3 = await prisma.shipper.create({
    data: {
      userId: shipperUser3.id,
      vehicleType: VehicleType.motorbike,
      vehiclePlate: '59Z1-888.99',
      lat: 10.77,
      lng: 106.69,
      isActive: true,
      ekycStatus: KycStatus.verified,
      totalDeliveries: 310,
      avgRating: 4.85,
      walletCash: 540000,
      walletAccount: 1890000,
      penaltyLevel: PenaltyLevel.normal,
      bankAccount: {
        bank: 'Vietcombank',
        accountNumber: '0071001234567',
        holder: 'PHAN THANH BINH',
      },
    },
  });

  console.log('🛵 Seeded Shippers with Wallets & Bank Accounts.');

  // =========================================================================
  // 6. SEED RESTAURANTS, CATEGORIES & MENU ITEMS
  // =========================================================================
  const rest1 = await prisma.restaurant.create({
    data: {
      ownerId: owner1.id,
      name: 'Cơm Tấm Sà Bì Chưởng - Quận 1',
      description:
        'Cơm tấm sườn nướng mật ong thơm lừng chuẩn vị Sài Gòn, thương hiệu của bộ 3 streamer',
      address: '179 Trần Hưng Đạo, Quận 1, TP.HCM',
      lat: 10.7626,
      lng: 106.6822,
      phone: '+84911111111',
      coverImageUrl:
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop',
      isOpen: true,
      radiusKm: 15.0,
      avgRating: 4.9,
      totalReviews: 350,
      platformFeeRate: 0.2,
      openingHours: {
        mon: { open: '07:00', close: '22:00' },
        tue: { open: '07:00', close: '22:00' },
        wed: { open: '07:00', close: '22:00' },
        thu: { open: '07:00', close: '22:00' },
        fri: { open: '07:00', close: '22:30' },
        sat: { open: '07:00', close: '23:00' },
        sun: { open: '07:00', close: '23:00' },
      },
      bankAccount: {
        bank: 'Vietcombank',
        accountNumber: '0011004567890',
        holder: 'CONG TY SA BI CHUONG',
      },
      categories: {
        create: [
          {
            name: 'Món Chính Đặc Biệt',
            sortOrder: 1,
            items: {
              create: [
                {
                  name: 'Cơm Tấm Sườn Cốt Lết Mật Ong',
                  price: 65000,
                  description: 'Sườn nướng mật ong thơm lừng kèm chả trứng nướng',
                  imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
                  sortOrder: 1,
                },
                {
                  name: 'Cơm Tấm Sườn Bì Chả Trứng Ốp La',
                  price: 79000,
                  description: 'Đầy đủ topping chuẩn vị sà bì chưởng với nước mắm chua ngọt',
                  imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
                  sortOrder: 2,
                },
                {
                  name: 'Cơm Tấm Sườn Cây Khổng Lồ',
                  price: 99000,
                  description: 'Sườn cây nướng than hoa sốt BBQ mộc mạc đậm đà',
                  imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
                  sortOrder: 3,
                },
              ],
            },
          },
          {
            name: 'Giải Khát & Canh',
            sortOrder: 2,
            items: {
              create: [
                {
                  name: 'Trà Đá Khổ Qua Rừng',
                  price: 10000,
                  description: 'Mát lạnh thanh nhiệt giải ngấy',
                  sortOrder: 1,
                },
                {
                  name: 'Canh Khổ Qua Thịt Băm',
                  price: 20000,
                  description: 'Tô canh nóng hổi thịt băm mềm',
                  sortOrder: 2,
                },
                {
                  name: 'Nước Mía Sầu Riêng',
                  price: 25000,
                  description: 'Nước mía béo ngậy ngọt ngào',
                  sortOrder: 3,
                },
              ],
            },
          },
        ],
      },
    },
    include: { categories: { include: { items: true } } },
  });

  const rest2 = await prisma.restaurant.create({
    data: {
      ownerId: owner2.id,
      name: 'Phở Thìn Bờ Hồ - Hà Nội',
      description: 'Phở tái lăn truyền thống Hà Nội nước dùng đậm đà béo ngậy ngập hành hoa',
      address: '110 Lò Đúc, Hai Bà Trưng, Hà Nội',
      lat: 21.0182,
      lng: 105.8562,
      phone: '+84922222222',
      coverImageUrl:
        'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop',
      isOpen: true,
      radiusKm: 12.0,
      avgRating: 4.8,
      totalReviews: 290,
      platformFeeRate: 0.15,
      openingHours: {
        mon: { open: '06:00', close: '21:00' },
        tue: { open: '06:00', close: '21:00' },
        wed: { open: '06:00', close: '21:00' },
        thu: { open: '06:00', close: '21:00' },
        fri: { open: '06:00', close: '21:00' },
        sat: { open: '06:00', close: '22:00' },
        sun: { open: '06:00', close: '22:00' },
      },
      bankAccount: { bank: 'BIDV', accountNumber: '2151000987654', holder: 'PHO THIN LO DUC' },
      categories: {
        create: [
          {
            name: 'Phở Truyền Thống',
            sortOrder: 1,
            items: {
              create: [
                {
                  name: 'Phở Bò Tái Lăn Đặc Biệt',
                  price: 85000,
                  description: 'Thịt bò xào xèo lửa xanh trên chảo gang với tỏi thơm nức',
                  imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
                  sortOrder: 1,
                },
                {
                  name: 'Phở Nạm Gầu Bò',
                  price: 75000,
                  description: 'Nước dùng ninh ống tủy 12 tiếng cùng quế hồi thảo quả',
                  imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
                  sortOrder: 2,
                },
                {
                  name: 'Quẩy Giòn Hà Nội (3 chiếc)',
                  price: 15000,
                  description: 'Quẩy vàng rụm chấm nước dùng phở nóng hổi',
                  sortOrder: 3,
                },
              ],
            },
          },
        ],
      },
    },
    include: { categories: { include: { items: true } } },
  });

  const rest3 = await prisma.restaurant.create({
    data: {
      ownerId: owner3.id,
      name: 'Bánh Mì Huỳnh Hoa - Quận 1',
      description: 'Bánh mì ô môi siêu paté thịt nguội nổi tiếng bậc nhất Sài Gòn',
      address: '26 Lê Thị Riêng, Phường Bến Thành, Quận 1, TP.HCM',
      lat: 10.771,
      lng: 106.692,
      phone: '+84933333333',
      coverImageUrl:
        'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop',
      isOpen: true,
      radiusKm: 20.0,
      avgRating: 4.9,
      totalReviews: 512,
      platformFeeRate: 0.2,
      openingHours: {
        mon: { open: '10:00', close: '22:00' },
        tue: { open: '10:00', close: '22:00' },
        wed: { open: '10:00', close: '22:00' },
        thu: { open: '10:00', close: '22:00' },
        fri: { open: '10:00', close: '22:00' },
        sat: { open: '09:00', close: '23:00' },
        sun: { open: '09:00', close: '23:00' },
      },
      bankAccount: { bank: 'ACB', accountNumber: '234567899', holder: 'TIEM BANH MI HUYNH HOA' },
      categories: {
        create: [
          {
            name: 'Bánh Mì Kẹp Thịt',
            sortOrder: 1,
            items: {
              create: [
                {
                  name: 'Bánh Mì Đặc Biệt Đầy Đủ',
                  price: 68000,
                  description:
                    'Ổ bánh mì nén đầy paté gan hảo hạng, bơ béo và 5 loại thịt nguội chả lụa',
                  imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400',
                  sortOrder: 1,
                },
                {
                  name: 'Bánh Mì Chả Lụa Xá Xíu',
                  price: 55000,
                  description: 'Chả lụa thủ công kèm thịt xá xíu mềm ngọt nước sốt đặc biệt',
                  sortOrder: 2,
                },
              ],
            },
          },
          {
            name: 'Đồ Uống Kèm',
            sortOrder: 2,
            items: {
              create: [
                {
                  name: 'Sữa Đậu Nành Lá Dứa',
                  price: 18000,
                  description: 'Nấu mới mỗi ngày thơm mát',
                  sortOrder: 1,
                },
                {
                  name: 'Cà Phê Sữa Đá Sài Gòn',
                  price: 25000,
                  description: 'Cà phê pha phin truyền thống đậm đà',
                  sortOrder: 2,
                },
              ],
            },
          },
        ],
      },
    },
    include: { categories: { include: { items: true } } },
  });

  console.log('🍲 Seeded Restaurants with Menus, Items & Operating Hours.');

  // =========================================================================
  // 7. SEED VOUCHERS (Platform, Restaurant, Free Ship)
  // =========================================================================
  await prisma.voucher.create({
    data: {
      code: 'TRANGIA50K',
      type: VoucherType.platform,
      discountType: DiscountType.fixed,
      discountValue: 50000,
      minOrderValue: 150000,
      validFrom: new Date('2026-08-01T00:00:00Z'),
      validTo: new Date('2026-12-31T23:59:59Z'),
      totalLimit: 500,
      usedCount: 142,
      perUserLimit: 2,
      issuedById: adminUser.id,
    },
  });

  const voucherShip = await prisma.voucher.create({
    data: {
      code: 'FREESHIP20',
      type: VoucherType.ship,
      discountType: DiscountType.fixed,
      discountValue: 20000,
      minOrderValue: 80000,
      validFrom: new Date('2026-08-01T00:00:00Z'),
      validTo: new Date('2026-12-31T23:59:59Z'),
      totalLimit: 1000,
      usedCount: 90,
      perUserLimit: 5,
      issuedById: adminUser.id,
    },
  });

  await prisma.voucher.create({
    data: {
      code: 'SABICHUNG10',
      type: VoucherType.restaurant,
      discountType: DiscountType.percent,
      discountValue: 10,
      maxDiscount: 30000,
      minOrderValue: 100000,
      validFrom: new Date('2026-08-01T00:00:00Z'),
      validTo: new Date('2026-12-31T23:59:59Z'),
      totalLimit: 200,
      usedCount: 15,
      restaurantId: rest1.id,
      applicableRestaurantIds: [rest1.id],
      issuedById: owner1.id,
    },
  });

  console.log('🎫 Seeded Platform & Restaurant Vouchers.');

  // =========================================================================
  // 8. SEED ORDERS WITH COMPLETE LIFECYCLE (Completed, Delivering, Picking Up, Pending, Cancelled)
  // =========================================================================
  const sbcItem1 = rest1.categories[0]!.items[0]!;
  const sbcItem2 = rest1.categories[0]!.items[1]!;
  const phoItem1 = rest2.categories[0]!.items[0]!;
  const bmItem1 = rest3.categories[0]!.items[0]!;

  // -------------------------------------------------------------------------
  // Order 1: Completed Order (With Payment, Commission, VoucherUsage, Review, Chat)
  // -------------------------------------------------------------------------
  const order1 = await prisma.order.create({
    data: {
      customerId: customer1.id,
      restaurantId: rest1.id,
      shipperId: shipper1.id,
      status: OrderStatus.completed,
      orderType: OrderType.delivery,
      subtotal: 144000,
      shipFee: 25000,
      discountAmount: 20000,
      platformFee: 21600,
      totalAmount: 149000,
      paymentMethod: PaymentMethod.momo,
      paymentStatus: PaymentStatus.paid,
      voucherId: voucherShip.id,
      deliveryAddress: '15 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM',
      deliveryLat: 10.778,
      deliveryLng: 106.702,
      distanceKm: 2.5,
      note: 'Giao giờ trưa giúp mình nhé, sườn ít mỡ nhiều nạc',
      estimatedDeliveryAt: new Date('2026-08-18T12:30:00Z'),
      deliveredAt: new Date('2026-08-18T12:28:00Z'),
      completedAt: new Date('2026-08-18T12:35:00Z'),
      createdAt: new Date('2026-08-18T12:00:00Z'),
      items: {
        create: [
          {
            itemId: sbcItem1.id,
            itemName: sbcItem1.name,
            quantity: 1,
            unitPrice: 65000,
            totalPrice: 65000,
          },
          {
            itemId: sbcItem2.id,
            itemName: sbcItem2.name,
            quantity: 1,
            unitPrice: 79000,
            totalPrice: 79000,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: order1.id,
      method: PaymentMethod.momo,
      status: PaymentStatus.paid,
      amount: 149000,
      transactionId: 'MOMO-20260818-9821034',
      gatewayResponse: { partnerCode: 'MOMO', resultCode: 0, message: 'Giao dịch thành công' },
    },
  });

  await prisma.commission.create({
    data: {
      orderId: order1.id,
      foodAmount: 144000,
      shipAmount: 25000,
      restaurantShare: 115200,
      shipperShare: 25000,
      platformShare: 28800,
      processedAt: new Date('2026-08-18T12:35:00Z'),
    },
  });

  await prisma.voucherUsage.create({
    data: {
      voucherId: voucherShip.id,
      userId: customer1.id,
      orderId: order1.id,
      discountApplied: 20000,
      usedAt: new Date('2026-08-18T12:00:00Z'),
    },
  });

  await prisma.review.create({
    data: {
      orderId: order1.id,
      customerId: customer1.id,
      restaurantId: rest1.id,
      shipperId: shipper1.id,
      restaurantRating: 5,
      shipperRating: 5,
      comment: 'Cơm tấm sườn mềm thơm lừng, shipper Cường giao siêu nhanh và rất nhiệt tình!',
      createdAt: new Date('2026-08-18T13:00:00Z'),
    },
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        orderId: order1.id,
        senderId: customer1.id,
        receiverId: shipperUser1.id,
        content: 'Anh ơi, khi đến gọi trước cho em 2 phút nhé, em xuống sảnh lấy.',
        type: MessageType.text,
        isRead: true,
        createdAt: new Date('2026-08-18T12:15:00Z'),
      },
      {
        orderId: order1.id,
        senderId: shipperUser1.id,
        receiverId: customer1.id,
        content: 'Dạ vâng chị Thảo, em đã lấy món xong và đang trên đường giao tới sảnh rồi ạ!',
        type: MessageType.text,
        isRead: true,
        createdAt: new Date('2026-08-18T12:18:00Z'),
      },
    ],
  });

  // -------------------------------------------------------------------------
  // Order 2: Completed Order (Bank VNPay, Rest2)
  // -------------------------------------------------------------------------
  const order2 = await prisma.order.create({
    data: {
      customerId: customer2.id,
      restaurantId: rest2.id,
      shipperId: shipper3.id,
      status: OrderStatus.completed,
      orderType: OrderType.delivery,
      subtotal: 170000,
      shipFee: 30000,
      discountAmount: 0,
      platformFee: 25500,
      totalAmount: 200000,
      paymentMethod: PaymentMethod.bank,
      paymentStatus: PaymentStatus.paid,
      deliveryAddress: '88 Nguyễn Thượng Hiền, Phường 5, Quận 3, TP.HCM',
      distanceKm: 3.8,
      completedAt: new Date('2026-08-18T15:10:00Z'),
      createdAt: new Date('2026-08-18T14:30:00Z'),
      items: {
        create: [
          {
            itemId: phoItem1.id,
            itemName: phoItem1.name,
            quantity: 2,
            unitPrice: 85000,
            totalPrice: 170000,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: order2.id,
      method: PaymentMethod.bank,
      status: PaymentStatus.paid,
      amount: 200000,
      transactionId: 'VNPAY-20260818-8871249',
    },
  });

  await prisma.commission.create({
    data: {
      orderId: order2.id,
      foodAmount: 170000,
      shipAmount: 30000,
      restaurantShare: 144500,
      shipperShare: 30000,
      platformShare: 25500,
      processedAt: new Date('2026-08-18T15:10:00Z'),
    },
  });

  await prisma.review.create({
    data: {
      orderId: order2.id,
      customerId: customer2.id,
      restaurantId: rest2.id,
      shipperId: shipper3.id,
      restaurantRating: 5,
      shipperRating: 4,
      comment: 'Phở bò tái lăn chuẩn vị Hà Nội, nước dùng nóng hổi rất thơm ngon.',
    },
  });

  // -------------------------------------------------------------------------
  // Order 3: Active "delivering" Order (For Live GPS Tracking Demo)
  // -------------------------------------------------------------------------
  const order3 = await prisma.order.create({
    data: {
      customerId: customer3.id,
      restaurantId: rest3.id,
      shipperId: shipper1.id,
      status: OrderStatus.delivering,
      orderType: OrderType.delivery,
      subtotal: 136000,
      shipFee: 20000,
      discountAmount: 0,
      platformFee: 20400,
      totalAmount: 156000,
      paymentMethod: PaymentMethod.cash,
      paymentStatus: PaymentStatus.pending,
      deliveryAddress: '280 Phan Xích Long, Phường 2, Phú Nhuận, TP.HCM',
      deliveryLat: 10.796,
      deliveryLng: 106.689,
      distanceKm: 3.2,
      note: 'Mang theo tiền lẻ 500k thối lại giúp mình',
      estimatedDeliveryAt: new Date(Date.now() + 15 * 60 * 1000), // +15 mins
      createdAt: new Date(Date.now() - 15 * 60 * 1000),
      items: {
        create: [
          {
            itemId: bmItem1.id,
            itemName: bmItem1.name,
            quantity: 2,
            unitPrice: 68000,
            totalPrice: 136000,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: order3.id,
      method: PaymentMethod.cash,
      status: PaymentStatus.pending,
      amount: 156000,
    },
  });

  await prisma.chatMessage.create({
    data: {
      orderId: order3.id,
      senderId: shipperUser1.id,
      receiverId: customer3.id,
      content: 'Chào chị Mai, em đang chạy xe qua Cầu Bông, khoảng 5-7 phút nữa là tới ạ!',
      type: MessageType.text,
      isRead: false,
    },
  });

  // -------------------------------------------------------------------------
  // Order 4: Active "picking_up" Order (Shipper on the way to Restaurant)
  // -------------------------------------------------------------------------
  const order4 = await prisma.order.create({
    data: {
      customerId: customer2.id,
      restaurantId: rest1.id,
      shipperId: shipper3.id,
      status: OrderStatus.picking_up,
      orderType: OrderType.delivery,
      subtotal: 99000,
      shipFee: 15000,
      discountAmount: 0,
      platformFee: 19800,
      totalAmount: 114000,
      paymentMethod: PaymentMethod.momo,
      paymentStatus: PaymentStatus.paid,
      deliveryAddress: '88 Nguyễn Thượng Hiền, Phường 5, Quận 3, TP.HCM',
      deliveryLat: 10.772,
      deliveryLng: 106.685,
      distanceKm: 1.8,
      estimatedDeliveryAt: new Date(Date.now() + 25 * 60 * 1000),
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
      items: {
        create: [
          {
            itemId: rest1.categories[0]!.items[2]!.id,
            itemName: rest1.categories[0]!.items[2]!.name,
            quantity: 1,
            unitPrice: 99000,
            totalPrice: 99000,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: order4.id,
      method: PaymentMethod.momo,
      status: PaymentStatus.paid,
      amount: 114000,
      transactionId: 'MOMO-LIVE-004',
    },
  });

  // -------------------------------------------------------------------------
  // Order 5: "pending" Order (For Restaurant App acceptance testing)
  // -------------------------------------------------------------------------
  const order5 = await prisma.order.create({
    data: {
      customerId: customer1.id,
      restaurantId: rest3.id,
      status: OrderStatus.pending,
      orderType: OrderType.delivery,
      subtotal: 68000,
      shipFee: 15000,
      discountAmount: 0,
      platformFee: 10200,
      totalAmount: 83000,
      paymentMethod: PaymentMethod.cash,
      paymentStatus: PaymentStatus.pending,
      deliveryAddress: '15 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM',
      deliveryLat: 10.778,
      deliveryLng: 106.702,
      distanceKm: 1.5,
      note: 'Không lấy ớt tươi, cho nhiều dưa leo',
      createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 mins ago
      items: {
        create: [
          {
            itemId: bmItem1.id,
            itemName: bmItem1.name,
            quantity: 1,
            unitPrice: 68000,
            totalPrice: 68000,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: order5.id,
      method: PaymentMethod.cash,
      status: PaymentStatus.pending,
      amount: 83000,
    },
  });

  // -------------------------------------------------------------------------
  // Order 6: "cancelled" Order (With Refund Status)
  // -------------------------------------------------------------------------
  const order6 = await prisma.order.create({
    data: {
      customerId: customer3.id,
      restaurantId: rest2.id,
      status: OrderStatus.cancelled,
      orderType: OrderType.delivery,
      subtotal: 85000,
      shipFee: 20000,
      discountAmount: 0,
      platformFee: 0,
      totalAmount: 105000,
      paymentMethod: PaymentMethod.momo,
      paymentStatus: PaymentStatus.refunded,
      deliveryAddress: '280 Phan Xích Long, Phú Nhuận, TP.HCM',
      cancelReason: 'Quán ăn hết nguyên liệu món phở tái lăn',
      createdAt: new Date('2026-08-17T18:00:00Z'),
      items: {
        create: [
          {
            itemId: phoItem1.id,
            itemName: phoItem1.name,
            quantity: 1,
            unitPrice: 85000,
            totalPrice: 85000,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: order6.id,
      method: PaymentMethod.momo,
      status: PaymentStatus.refunded,
      amount: 105000,
      transactionId: 'MOMO-REFUND-006',
    },
  });

  console.log(
    '📦 Seeded Orders with complete lifecycle (completed, delivering, picking_up, pending, cancelled).',
  );

  // =========================================================================
  // 9. SEED NOTIFICATIONS (Customers, Restaurant, Shipper, Admin)
  // =========================================================================
  const notifications = [
    {
      userId: customer1.id,
      title: 'Đơn hàng đã hoàn thành 🎉',
      body: 'Đơn hàng #SBC-001 của bạn đã được giao thành công. Hãy đánh giá để nhận xu thưởng!',
      type: 'order_completed',
      data: { orderId: order1.id },
      isRead: true,
    },
    {
      userId: customer3.id,
      title: 'Tài xế đang giao đơn hàng 🛵',
      body: 'Tài xế Nguyễn Văn Cường đang trên đường giao 2 Bánh Mì Đặc Biệt đến bạn.',
      type: 'order_delivering',
      data: { orderId: order3.id },
      isRead: false,
    },
    {
      userId: owner1.id,
      title: 'Doanh thu mới ghi nhận 💰',
      body: 'Đơn hàng hoàn tất đã cộng 115.200đ vào số dư ví của quán.',
      type: 'revenue_received',
      data: { orderId: order1.id },
      isRead: true,
    },
    {
      userId: shipperUser1.id,
      title: 'Thu nhập chuyến xe 🛵',
      body: 'Bạn vừa nhận được 25.000đ cước vận chuyển từ đơn hàng hoàn thành.',
      type: 'shipper_earnings',
      data: { orderId: order1.id },
      isRead: true,
    },
    {
      userId: adminUser.id,
      title: 'Yêu cầu eKYC mới từ tài xế 📄',
      body: 'Tài xế Lê Hoàng Nam đã gửi hồ sơ định danh KYC cần xét duyệt.',
      type: 'kyc_pending',
      data: { shipperId: shipper2.id },
      isRead: false,
    },
  ];

  for (const notif of notifications) {
    await prisma.notification.create({ data: notif });
  }
  console.log('🔔 Seeded in-app Notifications.');

  // =========================================================================
  // 10. SEED SHIPPER PAYOUTS & RESTAURANT PAYOUTS
  // =========================================================================
  await prisma.shipperPayout.create({
    data: {
      shipperId: shipper1.id,
      amount: 1500000,
      periodStart: new Date('2026-08-01T00:00:00Z'),
      periodEnd: new Date('2026-08-15T23:59:59Z'),
      status: PayoutStatus.completed,
      bankTransactionId: 'VCB-PAYOUT-99128',
      processedAt: new Date('2026-08-16T10:00:00Z'),
    },
  });

  await prisma.shipperPayout.create({
    data: {
      shipperId: shipper3.id,
      amount: 850000,
      periodStart: new Date('2026-08-10T00:00:00Z'),
      periodEnd: new Date('2026-08-17T23:59:59Z'),
      status: PayoutStatus.pending,
    },
  });

  await prisma.restaurantPayout.create({
    data: {
      restaurantId: rest1.id,
      amount: 12450000,
      periodStart: new Date('2026-08-01T00:00:00Z'),
      periodEnd: new Date('2026-08-15T23:59:59Z'),
      status: PayoutStatus.completed,
      processedAt: new Date('2026-08-16T11:30:00Z'),
    },
  });

  await prisma.restaurantPayout.create({
    data: {
      restaurantId: rest2.id,
      amount: 5200000,
      periodStart: new Date('2026-08-01T00:00:00Z'),
      periodEnd: new Date('2026-08-15T23:59:59Z'),
      status: PayoutStatus.processing,
    },
  });

  console.log('💳 Seeded Shipper & Restaurant Payout settlements.');

  // =========================================================================
  // 11. SEED SHIPPER PENALTIES (Audit & Sanctions)
  // =========================================================================
  await prisma.shipperPenalty.create({
    data: {
      shipperId: shipper2.id,
      reason: PenaltyReason.late_delivery,
      level: 1,
      description:
        'Giao trễ đơn hàng quá 30 phút mà không có lý do xác đáng và không liên hệ tổng đài.',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  });

  console.log('⚠️ Seeded Shipper Penalty records.');

  // =========================================================================
  // SUMMARY REPORT
  // =========================================================================
  console.log('\n================================================================');
  console.log('🎉 100% DATABASE SEED COMPLETED SUCCESSFULLY!');
  console.log('================================================================');
  console.log(`🔑 ADMIN:        admin@trangiafood.vn   | Password: ${ADMIN_PASSWORD}`);
  console.log(`👤 CUSTOMERS:    +84901111222           | Password: ${DEFAULT_USER_PASSWORD}`);
  console.log(`🍲 RESTAURANTS:  +84911111111           | Password: ${DEFAULT_USER_PASSWORD}`);
  console.log(`🛵 SHIPPERS:     +84912345678           | Password: ${DEFAULT_USER_PASSWORD}`);
  console.log('================================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
