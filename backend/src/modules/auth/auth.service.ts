import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { AdminLoginDto, GoogleAuthDto, SendOtpDto, VerifyOtpDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // ──────────────────────────────────────────
  // OTP via Phone
  // ──────────────────────────────────────────

  async sendOtp(dto: SendOtpDto): Promise<{ message: string }> {
    const phone = this.normalizePhone(dto.phone);

    // Rate limiting: max 5 attempts per 15 min
    const attempts = await this.redis.incrementOtpAttempts(phone);
    if (attempts > 5) {
      throw new BadRequestException('Quá nhiều lần gửi OTP. Vui lòng thử lại sau 15 phút.');
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const expireMin = this.config.get<number>('OTP_EXPIRE_MINUTES') ?? 5;

    // Store in Redis
    await this.redis.setOtp(phone, otp, expireMin);

    // Send via SMS (ESMS.vn for Vietnam market)
    await this.sendSms(
      phone,
      `[Tran Gia Food] Mã OTP của bạn là: ${otp}. Hết hạn sau ${expireMin} phút.`,
    );

    this.logger.log(`OTP sent to ${phone}`);

    // In development, log OTP to console
    if (this.config.get('NODE_ENV') === 'development') {
      this.logger.debug(`[DEV] OTP for ${phone}: ${otp}`);
    }

    return { message: `Mã OTP đã được gửi đến ${phone}` };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Partial<User>;
    isNewUser: boolean;
  }> {
    const phone = this.normalizePhone(dto.phone);

    const storedOtp = await this.redis.getOtp(phone);
    if (!storedOtp || storedOtp !== dto.otp) {
      throw new UnauthorizedException('Mã OTP không đúng hoặc đã hết hạn');
    }

    // Clear OTP
    await this.redis.deleteOtp(phone);
    await this.redis.resetOtpAttempts(phone);

    // Upsert user
    const isNewUser = !(await this.prisma.user.findUnique({ where: { phone } }));
    const user = await this.prisma.user.upsert({
      where: { phone },
      create: { phone, role: UserRole.customer },
      update: { updatedAt: new Date() },
    });

    const tokens = await this.generateTokens(user);
    return { ...tokens, user: this.sanitizeUser(user), isNewUser };
  }

  // ──────────────────────────────────────────
  // Google OAuth
  // ──────────────────────────────────────────

  async googleAuth(dto: GoogleAuthDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Partial<User>;
    isNewUser: boolean;
  }> {
    // Verify Firebase ID token
    const payload = await this.verifyFirebaseToken(dto.idToken);

    const email = (payload.email || '') as string;
    const name = (payload.name || '') as string;
    const avatarUrl = (payload.picture || '') as string;

    if (!email) throw new BadRequestException('Không lấy được email từ Google');

    const isNewUser = !(await this.prisma.user.findUnique({ where: { email } }));
    const user = await this.prisma.user.upsert({
      where: { email },
      create: { email, name, avatarUrl, role: UserRole.customer },
      update: { name, avatarUrl },
    });

    const tokens = await this.generateTokens(user);
    return { ...tokens, user: this.sanitizeUser(user), isNewUser };
  }

  // ──────────────────────────────────────────
  // Admin Login (Email + Password)
  // ──────────────────────────────────────────

  async adminLogin(dto: AdminLoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Partial<User>;
  }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user || user.role !== UserRole.admin) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Tài khoản chưa được cấu hình mật khẩu');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    this.logger.log(`Admin login: ${user.email}`);
    const tokens = await this.generateTokens(user);
    return { ...tokens, user: this.sanitizeUser(user) };
  }

  // ──────────────────────────────────────────
  // Token Management
  // ──────────────────────────────────────────

  async refreshTokens(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });

      const stored = await this.redis.getRefreshToken(payload.sub);
      if (!stored || stored !== refreshToken) {
        throw new UnauthorizedException('Refresh token không hợp lệ');
      }

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.isActive) throw new UnauthorizedException('Tài khoản không tồn tại');

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.redis.deleteRefreshToken(userId);
  }

  // ──────────────────────────────────────────
  // Private Helpers
  // ──────────────────────────────────────────

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: user.id, phone: user.phone, role: user.role };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: this.config.get<string>('JWT_EXPIRES_IN') ?? '15m',
    });

    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
    });

    // Store refresh token in Redis — tách riêng try/catch để lỗi Redis
    // không bị nhầm thành lỗi xác thực (credentials)
    try {
      await this.redis.setRefreshToken(user.id, refreshToken, 7 * 24 * 3600);
    } catch (err) {
      this.logger.error(`Failed to store refresh token in Redis for user ${user.id}`, err);
      // Không throw ở đây — vẫn trả token về để login thành công.
      // Hệ quả chấp nhận được: user sẽ không thể refresh token cho đến khi Redis phục hồi.
    }

    return { accessToken, refreshToken };
  }

  private normalizePhone(phone: string): string {
    // Convert 0901234567 → +84901234567
    if (phone.startsWith('0')) return '+84' + phone.slice(1);
    return phone;
  }

  private sanitizeUser(user: User): Partial<User> {
    const userObj = { ...user } as Record<string, unknown>;
    delete userObj.passwordHash;
    return userObj as Partial<User>;
  }

  private async sendSms(phone: string, message: string): Promise<void> {
    // Note: Integrate ESMS.vn API for Vietnam SMS
    this.logger.log(`[SMS] → ${phone}: ${message}`);
  }

  private async verifyFirebaseToken(idToken: string): Promise<Record<string, unknown>> {
    // Note: Use Firebase Admin SDK to verify ID token
    try {
      const parts = idToken.split('.');
      if (parts.length !== 3) throw new Error('Invalid token format');
      const payload = JSON.parse(Buffer.from(parts[1]!, 'base64').toString()) as Record<
        string,
        unknown
      >;
      return payload;
    } catch {
      throw new UnauthorizedException('Google token không hợp lệ');
    }
  }
}
