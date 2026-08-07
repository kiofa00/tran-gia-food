import {
  DiscountType,
  KycStatus,
  OrderStatus,
  OrderType,
  OrderTypeFilter,
  PaymentMethod,
  PaymentStatus,
  PrismaClient,
  UserRole,
  VehicleType,
  VoucherType,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed for Tran Gia Food...');

  // 1. Clean existing records in safe order
  await prisma.commission.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.voucherUsage.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.restaurantPayout.deleteMany();
  await prisma.shipperPayout.deleteMany();
  await prisma.shipperPenalty.deleteMany();
  await prisma.review.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.shipper.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database tables.');

  // 2. Create Users
  const ADMIN_DEFAULT_PASSWORD = 'Admin@123456'; // Change after first login!
  const adminPasswordHash = await bcrypt.hash(ADMIN_DEFAULT_PASSWORD, 10);

  const adminUser = await prisma.user.create({
    data: {
      phone: '+84900000000',
      email: 'admin@trangiafood.vn',
      name: 'Quản Trị Viên Trần Gia',
      role: UserRole.admin,
      address: '720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP.HCM',
      passwordHash: adminPasswordHash,
    },
  });

  console.log(`🔑 Admin account: admin@trangiafood.vn / ${ADMIN_DEFAULT_PASSWORD}`);

  const customer1 = await prisma.user.create({
    data: {
      phone: '+84901111222',
      email: 'khachhang1@gmail.com',
      name: 'Lê Thu Thảo',
      role: UserRole.customer,
      address: '15 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM',
      lat: 10.778,
      lng: 106.702,
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
    },
  });

  const owner1 = await prisma.user.create({
    data: {
      phone: '+84911111111',
      email: 'sabichung@trangiafood.vn',
      name: 'Chủ Quán Sà Bì Chưởng',
      role: UserRole.restaurant,
      address: '179 Trần Hưng Đạo, Quận 1, TP.HCM',
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      phone: '+84922222222',
      email: 'phothin@trangiafood.vn',
      name: 'Chủ Quán Phở Thìn',
      role: UserRole.restaurant,
      address: '110 Lò Đúc, Hai Bà Trưng, Hà Nội',
    },
  });

  const owner3 = await prisma.user.create({
    data: {
      phone: '+84933333333',
      email: 'huynhhoa@trangiafood.vn',
      name: 'Chủ Quán Bánh Mì Huỳnh Hoa',
      role: UserRole.restaurant,
      address: '26 Lê Thị Riêng, Phường Bến Thành, Quận 1, TP.HCM',
    },
  });

  // 3. Create Shippers
  const shipperUser1 = await prisma.user.create({
    data: {
      phone: '+84912345678',
      name: 'Nguyễn Văn Cường',
      role: UserRole.shipper,
      kycStatus: KycStatus.verified,
    },
  });

  const shipper1 = await prisma.shipper.create({
    data: {
      userId: shipperUser1.id,
      vehicleType: VehicleType.motorbike,
      vehiclePlate: '59P1-999.88',
      lat: 10.7626,
      lng: 106.6822,
      isActive: true,
      ekycStatus: KycStatus.verified,
      totalDeliveries: 420,
      avgRating: 4.9,
    },
  });

  const shipperUser2 = await prisma.user.create({
    data: {
      phone: '+84987654321',
      name: 'Lê Hoàng Nam',
      role: UserRole.shipper,
      kycStatus: KycStatus.pending,
    },
  });

  const shipper2 = await prisma.shipper.create({
    data: {
      userId: shipperUser2.id,
      vehicleType: VehicleType.motorbike,
      vehiclePlate: '59X2-123.45',
      lat: 10.755,
      lng: 106.68,
      isActive: true,
      ekycStatus: KycStatus.pending,
      totalDeliveries: 85,
      avgRating: 4.7,
    },
  });

  const shipperUser3 = await prisma.user.create({
    data: {
      phone: '+84903111222',
      name: 'Phan Thanh Bình',
      role: UserRole.shipper,
      kycStatus: KycStatus.verified,
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
    },
  });

  console.log('👥 Created Users and Shippers with eKYC.');

  // 4. Create Restaurants and Menus
  const rest1 = await prisma.restaurant.create({
    data: {
      ownerId: owner1.id,
      name: 'Cơm Tấm Sà Bì Chưởng - Quận 1',
      description: 'Cơm tấm sườn nướng mật ong thơm lừng chuẩn vị Sài Gòn',
      address: '179 Trần Hưng Đạo, Quận 1, TP.HCM',
      lat: 10.7626,
      lng: 106.6822,
      phone: '+84911111111',
      coverImageUrl:
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop',
      isOpen: true,
      avgRating: 4.9,
      totalReviews: 350,
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
                  description: 'Sườn nướng thơm lừng kèm chả trứng nướng',
                  imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
                },
                {
                  name: 'Cơm Tấm Sườn Bì Chả Trứng Ốp La',
                  price: 79000,
                  description: 'Đầy đủ topping chuẩn vị sà bì chưởng',
                  imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
                },
              ],
            },
          },
          {
            name: 'Giải Khát & Canh',
            sortOrder: 2,
            items: {
              create: [
                { name: 'Trà Đá Khổ Qua Rừng', price: 10000, description: 'Mát lạnh thanh nhiệt' },
                {
                  name: 'Canh Khổ Qua Thịt Băm',
                  price: 20000,
                  description: 'Tô canh nóng hổi đậm đà',
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
      description: 'Phở tái lăn truyền thống Hà Nội nước dùng đậm đà hương vị thơm ngon',
      address: '110 Lò Đúc, Hai Bà Trưng, Hà Nội',
      lat: 21.0182,
      lng: 105.8562,
      phone: '+84922222222',
      coverImageUrl:
        'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop',
      isOpen: true,
      avgRating: 4.8,
      totalReviews: 290,
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
                  description: 'Bò xào xèo lửa xanh hành hoa tươi thơm phức',
                  imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
                },
                {
                  name: 'Phở Nạm Gầu Bò',
                  price: 75000,
                  description: 'Nước dùng ninh xương 12 tiếng',
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
      avgRating: 4.9,
      totalReviews: 512,
      categories: {
        create: [
          {
            name: 'Bánh Mì Kẹp',
            sortOrder: 1,
            items: {
              create: [
                {
                  name: 'Bánh Mì Đặc Biệt Đầy Đủ',
                  price: 68000,
                  description: 'Ổ bánh mì nén đầy paté bơ tươi và 5 loại thịt nguội',
                  imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400',
                },
              ],
            },
          },
        ],
      },
    },
    include: { categories: { include: { items: true } } },
  });

  console.log('🍲 Created Restaurants and Menu Items.');

  // 5. Create Vouchers
  const voucher1 = await prisma.voucher.create({
    data: {
      code: 'TRANGIA50K',
      type: VoucherType.platform,
      discountType: DiscountType.fixed,
      discountValue: 50000,
      minOrderValue: 150000,
      validFrom: new Date('2026-08-01'),
      validTo: new Date('2026-08-31'),
      totalLimit: 500,
      usedCount: 142,
      issuedById: adminUser.id,
    },
  });

  const voucher2 = await prisma.voucher.create({
    data: {
      code: 'FREESHIP20',
      type: VoucherType.ship,
      discountType: DiscountType.fixed,
      discountValue: 20000,
      minOrderValue: 80000,
      validFrom: new Date('2026-08-01'),
      validTo: new Date('2026-08-31'),
      totalLimit: 300,
      usedCount: 89,
      issuedById: adminUser.id,
    },
  });

  console.log('🎫 Created Platform Vouchers.');

  // 6. Create Orders, Payments & Commissions
  const item1 = rest1.categories[0].items[0];
  const item2 = rest1.categories[0].items[1];

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
      voucherId: voucher2.id,
      deliveryAddress: '15 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM',
      deliveryLat: 10.778,
      deliveryLng: 106.702,
      distanceKm: 2.5,
      completedAt: new Date('2026-08-05T14:20:00Z'),
      items: {
        create: [
          {
            itemId: item1.id,
            itemName: item1.name,
            quantity: 1,
            unitPrice: 65000,
            totalPrice: 65000,
          },
          {
            itemId: item2.id,
            itemName: item2.name,
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
      transactionId: 'MOMO-9821034',
    },
  });

  await prisma.commission.create({
    data: {
      orderId: order1.id,
      foodAmount: 144000,
      shipAmount: 25000,
      restaurantShare: 122400,
      shipperShare: 25000,
      platformShare: 21600,
      processedAt: new Date('2026-08-05T14:20:00Z'),
    },
  });

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
      completedAt: new Date('2026-08-05T15:10:00Z'),
      items: {
        create: [
          {
            itemId: rest2.categories[0].items[0].id,
            itemName: rest2.categories[0].items[0].name,
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
      transactionId: 'VNPAY-8871249',
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
      processedAt: new Date('2026-08-05T15:10:00Z'),
    },
  });

  console.log('✅ Successfully seeded complete production-ready database data!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
