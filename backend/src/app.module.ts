import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';

import { DeliveryGateway } from './gateways/delivery.gateway';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { CmsModule } from './modules/cms/cms.module';
import { CommissionsModule } from './modules/commissions/commissions.module';
import { MenuModule } from './modules/menu/menu.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PayoutsModule } from './modules/payouts/payouts.module';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ShippersModule } from './modules/shippers/shippers.module';
import { UsersModule } from './modules/users/users.module';
import { VouchersModule } from './modules/vouchers/vouchers.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    // Config (env vars)
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // Rate limiting (global)
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // Cron jobs (auto open/close, weekly payout statements)
    ScheduleModule.forRoot(),

    // Event emitter (notifications, auto commission calculations)
    EventEmitterModule.forRoot(),

    // Core infrastructure
    PrismaModule,
    RedisModule,

    // All Feature modules
    AuthModule,
    UsersModule,
    RestaurantsModule,
    MenuModule,
    OrdersModule,
    ShippersModule,
    CommissionsModule,
    PaymentsModule,
    VouchersModule,
    NotificationsModule,
    PayoutsModule,
    ChatModule,
    ReviewsModule,
    AdminModule,
    CmsModule,
  ],
  providers: [DeliveryGateway],
})
export class AppModule {}
