import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { KycStatus, User, UserRole, VehicleType } from '@prisma/client';

import { AdminService } from '../modules/admin/admin.service';
import { AuthService } from '../modules/auth/auth.service';
import { ShippersService } from '../modules/shippers/shippers.service';
import { UsersService } from '../modules/users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

describe('E2E Flow 1: Auth, Multi-Role Registration & eKYC Workflow', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let shippersService: ShippersService;
  let adminService: AdminService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    shipper: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockRedisService = {
    incrementOtpAttempts: jest.fn().mockResolvedValue(1),
    setOtp: jest.fn().mockResolvedValue('OK'),
    getOtp: jest.fn().mockResolvedValue('123456'),
    deleteOtp: jest.fn().mockResolvedValue(1),
    resetOtpAttempts: jest.fn().mockResolvedValue('OK'),
    setRefreshToken: jest.fn().mockResolvedValue('OK'),
    deleteRefreshToken: jest.fn().mockResolvedValue(1),
    setShipperLocation: jest.fn().mockResolvedValue('OK'),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token-xyz'),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'OTP_EXPIRE_MINUTES') return 5;
      if (key === 'JWT_SECRET') return 'test-secret';
      if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
      if (key === 'JWT_EXPIRES_IN') return '7d';
      if (key === 'JWT_REFRESH_EXPIRES_IN') return '30d';
      if (key === 'NODE_ENV') return 'test';
      return null;
    }),
    getOrThrow: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'test-secret';
      if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
      if (key === 'JWT_EXPIRES_IN') return '7d';
      if (key === 'JWT_REFRESH_EXPIRES_IN') return '30d';
      return 'test-mock-value';
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        ShippersService,
        AdminService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    shippersService = module.get<ShippersService>(ShippersService);
    adminService = module.get<AdminService>(AdminService);
    jest.clearAllMocks();
  });

  describe('Step 1: Phone OTP Dispatch and Verification for Customers', () => {
    it('should dispatch OTP to customer phone successfully', async () => {
      const res = await authService.sendOtp({ phone: '0901234567' });
      expect(res.message).toContain('901234567');
      expect(mockRedisService.setOtp).toHaveBeenCalled();
    });

    it('should verify correct OTP and return accessToken + user', async () => {
      const mockUser = {
        id: 'cust-1',
        phone: '0901234567',
        role: UserRole.customer,
        name: 'Nguyễn Khách Hàng',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.upsert.mockResolvedValue(mockUser);

      const res = await authService.verifyOtp({
        phone: '0901234567',
        otp: '123456',
      });

      expect(res.accessToken).toBe('mock-jwt-token-xyz');
      expect(res.user.phone).toBe('0901234567');
      expect(res.isNewUser).toBe(true);
    });

    it('should reject invalid OTP', async () => {
      mockRedisService.getOtp.mockResolvedValueOnce('999999');

      await expect(authService.verifyOtp({ phone: '0901234567', otp: '000000' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should fetch user profile by ID using UsersService', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'cust-1',
        phone: '0901234567',
        role: UserRole.customer,
      });

      const user = await usersService.findById('cust-1');
      expect(user.id).toBe('cust-1');
    });
  });

  describe('Step 2: Shipper Role Registration & Location Update', () => {
    it('should register a user as a shipper with vehicle info', async () => {
      mockPrismaService.shipper.findUnique.mockResolvedValue(null);
      mockPrismaService.user.update.mockResolvedValue({});
      mockPrismaService.shipper.create.mockResolvedValue({
        id: 'ship-profile-1',
        userId: 'user-ship-1',
        vehicleType: VehicleType.motorbike,
        vehiclePlate: '43A-99999',
        ekycStatus: KycStatus.pending,
        isActive: true,
      });

      const user = { id: 'user-ship-1' } as unknown as User;
      const shipper = await shippersService.register(user, {
        vehicleType: VehicleType.motorbike,
        vehiclePlate: '43A-99999',
      });

      expect(shipper.id).toBe('ship-profile-1');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-ship-1' },
        data: { role: UserRole.shipper },
      });
    });

    it('should reject registration if user is already a shipper', async () => {
      mockPrismaService.shipper.findUnique.mockResolvedValue({ id: 'ship-1' });

      const user = { id: 'user-ship-1' } as unknown as User;
      await expect(
        shippersService.register(user, {
          vehicleType: VehicleType.motorbike,
          vehiclePlate: '43A-99999',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Step 3: eKYC Verification & Admin Approval Flow', () => {
    it('should allow Admin to approve pending Shipper eKYC', async () => {
      mockPrismaService.shipper.findUnique.mockResolvedValue({
        id: 'ship-profile-1',
        ekycStatus: KycStatus.pending,
      });

      mockPrismaService.shipper.update.mockResolvedValue({
        id: 'ship-profile-1',
        ekycStatus: KycStatus.verified,
        isActive: true,
      });

      const result = await adminService.updateShipperKyc('ship-profile-1', {
        status: KycStatus.verified,
      });

      expect(result.ekycStatus).toBe(KycStatus.verified);
      expect(mockPrismaService.shipper.update).toHaveBeenCalledWith({
        where: { id: 'ship-profile-1' },
        data: { ekycStatus: KycStatus.verified },
      });
    });
  });
});
