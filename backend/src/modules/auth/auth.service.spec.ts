import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  };

  const mockRedisService = {
    incrementOtpAttempts: jest.fn(),
    setOtp: jest.fn(),
    getOtp: jest.fn(),
    deleteOtp: jest.fn(),
    resetOtpAttempts: jest.fn(),
    setRefreshToken: jest.fn(),
    deleteRefreshToken: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'OTP_EXPIRE_MINUTES') return 5;
      if (key === 'NODE_ENV') return 'test';
      if (key === 'JWT_SECRET') return 'secret';
      if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendOtp', () => {
    it('should generate and send OTP successfully', async () => {
      mockRedisService.incrementOtpAttempts.mockResolvedValue(1);

      const result = await service.sendOtp({ phone: '0901234567' });

      expect(result).toHaveProperty('message');
      expect(mockRedisService.setOtp).toHaveBeenCalledWith('+84901234567', expect.any(String), 5);
    });

    it('should throw BadRequestException if rate limit is exceeded (> 5 attempts)', async () => {
      mockRedisService.incrementOtpAttempts.mockResolvedValue(6);

      await expect(service.sendOtp({ phone: '0901234567' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP and return tokens for valid OTP', async () => {
      mockRedisService.getOtp.mockResolvedValue('123456');
      mockPrismaService.user.findUnique.mockResolvedValue(null); // new user
      mockPrismaService.user.upsert.mockResolvedValue({
        id: 'user-123',
        phone: '+84901234567',
        role: 'customer',
        isActive: true,
      });

      const result = await service.verifyOtp({ phone: '0901234567', otp: '123456' });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.isNewUser).toBe(true);
      expect(mockRedisService.deleteOtp).toHaveBeenCalledWith('+84901234567');
    });

    it('should throw UnauthorizedException if OTP is invalid or expired', async () => {
      mockRedisService.getOtp.mockResolvedValue(null);

      await expect(
        service.verifyOtp({ phone: '0901234567', otp: '999999' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
