import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from './wallet.service';

describe('WalletService', () => {
  let service: WalletService;

  const mockPrismaService = {
    $executeRawUnsafe: jest.fn(),
    $queryRawUnsafe: jest.fn(),
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should execute DDL to create tables', async () => {
      mockPrismaService.$executeRawUnsafe.mockResolvedValue(0);
      await service.onModuleInit();
      expect(mockPrismaService.$executeRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS user_wallets'),
      );
    });
  });

  describe('getWallet', () => {
    it('should return existing wallet balance', async () => {
      mockPrismaService.$queryRawUnsafe.mockResolvedValueOnce([
        { balance: 250000, pending_refund: 50000 },
      ]);

      const wallet = await service.getWallet('user-1');
      expect(wallet).toEqual({ balance: 250000, pending_refund: 50000 });
      expect(mockPrismaService.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('SELECT balance, pending_refund'),
        'user-1',
      );
    });

    it('should initialize default wallet if not found', async () => {
      mockPrismaService.$queryRawUnsafe.mockResolvedValueOnce([]);
      mockPrismaService.$executeRawUnsafe.mockResolvedValueOnce(1);

      const wallet = await service.getWallet('user-new');
      expect(wallet).toEqual({ balance: 0, pending_refund: 0 });
      expect(mockPrismaService.$executeRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO user_wallets'),
        expect.any(String),
        'user-new',
      );
    });
  });

  describe('deposit', () => {
    it('should increase balance and insert a transaction', async () => {
      mockPrismaService.$queryRawUnsafe.mockResolvedValueOnce([
        { balance: 100000, pending_refund: 0 },
      ]);
      mockPrismaService.$executeRawUnsafe.mockResolvedValue(1);

      const result = await service.deposit('user-1', {
        amount: 200000,
        method: 'momo',
      });

      expect(result.success).toBe(true);
      expect(result.balance).toBe(300000);
      expect(mockPrismaService.$executeRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE user_wallets SET balance'),
        300000,
        'user-1',
      );
      expect(mockPrismaService.$executeRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO user_wallet_transactions'),
        expect.any(String),
        'user-1',
        200000,
        expect.stringContaining('Ví MoMo'),
      );
    });
  });

  describe('getTransactions', () => {
    it('should return transaction history and metadata', async () => {
      const now = new Date();
      mockPrismaService.$queryRawUnsafe
        .mockResolvedValueOnce([
          {
            id: 'tx_1',
            type: 'deposit',
            amount: 500000,
            status: 'completed',
            description: 'Nạp tiền',
            createdAt: now,
          },
        ])
        .mockResolvedValueOnce([{ count: 1 }]);

      const result = await service.getTransactions('user-1', 20, 1);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.amount).toBe(500000);
      expect(result.meta.total).toBe(1);
      expect(result.meta.limit).toBe(20);
    });
  });

  describe('getBanks', () => {
    it('should return user linked banks', async () => {
      mockPrismaService.$queryRawUnsafe.mockResolvedValueOnce([
        {
          id: 'b_1',
          bankCode: 'VCB',
          bankName: 'Vietcombank',
          accountNumber: '123456789',
          accountName: 'TEST USER',
          isDefault: true,
        },
      ]);

      const result = await service.getBanks('user-1');
      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.bank_code).toBe('VCB');
      expect(result.data[0]?.is_default).toBe(true);
    });
  });

  describe('getKycStatus', () => {
    it('should return kycStatus from user record', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        kycStatus: 'verified',
      });

      const result = await service.getKycStatus('user-1');
      expect(result.status).toBe('verified');
    });

    it('should return none when user has no kycStatus', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      const result = await service.getKycStatus('user-unknown');
      expect(result.status).toBe('none');
    });
  });
});
