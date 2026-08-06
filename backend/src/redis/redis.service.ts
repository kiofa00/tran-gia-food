import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private config: ConfigService) {
    this.client = new Redis(config.get<string>('REDIS_URL') ?? 'redis://localhost:6379', {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy(times) {
        if (times > 2) return null; // Stop retrying if Redis is offline
        return 1000;
      },
    });

    this.client.on('connect', () => this.logger.log('✅ Connected to Redis'));
    this.client.on('error', () => {
      // Suppress ECONNREFUSED logs when local Redis server is offline
    });
  }

  /** Store OTP (expires in minutes) */
  async setOtp(phone: string, otp: string, minutes = 5): Promise<void> {
    await this.client.setex(`otp:${phone}`, minutes * 60, otp);
  }

  async getOtp(phone: string): Promise<string | null> {
    return this.client.get(`otp:${phone}`);
  }

  async deleteOtp(phone: string): Promise<void> {
    await this.client.del(`otp:${phone}`);
  }

  /** OTP attempt rate limiting */
  async incrementOtpAttempts(phone: string): Promise<number> {
    const key = `otp_attempts:${phone}`;
    const count = await this.client.incr(key);
    if (count === 1) await this.client.expire(key, 15 * 60); // 15 min window
    return count;
  }

  async resetOtpAttempts(phone: string): Promise<void> {
    await this.client.del(`otp_attempts:${phone}`);
  }

  /** Refresh token blacklist (on logout) */
  async blacklistToken(jti: string, ttlSeconds: number): Promise<void> {
    await this.client.setex(`blacklist:${jti}`, ttlSeconds, '1');
  }

  async isTokenBlacklisted(jti: string): Promise<boolean> {
    return (await this.client.exists(`blacklist:${jti}`)) === 1;
  }

  /** Store refresh token (user -> token mapping) */
  async setRefreshToken(userId: string, token: string, ttlSeconds: number): Promise<void> {
    await this.client.setex(`refresh:${userId}`, ttlSeconds, token);
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    return this.client.get(`refresh:${userId}`);
  }

  async deleteRefreshToken(userId: string): Promise<void> {
    await this.client.del(`refresh:${userId}`);
  }

  /** Shipper real-time location */
  async setShipperLocation(shipperId: string, lat: number, lng: number): Promise<void> {
    await this.client.setex(
      `shipper:location:${shipperId}`,
      10, // TTL 10 seconds
      JSON.stringify({ lat, lng, updatedAt: new Date().toISOString() }),
    );
  }

  async getShipperLocation(shipperId: string): Promise<{ lat: number; lng: number } | null> {
    const raw = await this.client.get(`shipper:location:${shipperId}`);
    return raw ? JSON.parse(raw) : null;
  }

  /** Generic get/set */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
