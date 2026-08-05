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

@Module({
  imports: [
    // Config (env vars)
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // Rate limiting (global)
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // Cron jobs (auto open/close restaurant, payouts)
    ScheduleModule.forRoot(),

    // Event emitter (notifications, commission splits)
    EventEmitterModule.forRoot(),

    // Core infrastructure
    PrismaModule,
    RedisModule,

    // Feature modules
    AuthModule,
    UsersModule,
    RestaurantsModule,
    MenuModule,
  ],
})
export class AppModule {}
