import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { MenuModule } from './modules/menu/menu.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ShippersModule } from './modules/shippers/shippers.module';
import { CommissionsModule } from './modules/commissions/commissions.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { VouchersModule } from './modules/vouchers/vouchers.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PayoutsModule } from './modules/payouts/payouts.module';
import { ChatModule } from './modules/chat/chat.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { AdminModule } from './modules/admin/admin.module';
import { CmsModule } from './modules/cms/cms.module';
import { DeliveryGateway } from './gateways/delivery.gateway';

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
