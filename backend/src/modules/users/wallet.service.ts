import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { PrismaService } from '../../prisma/prisma.service';
import { DepositWalletDto } from './dto/deposit-wallet.dto';

interface RawWalletRow {
  balance: number | string;
  pending_refund: number | string;
}

interface RawTxRow {
  id: string;
  type: string;
  amount: number | string;
  status: string;
  description: string | null;
  createdAt: Date | string;
}

interface RawCountRow {
  count: number | string | bigint;
}

interface RawBankRow {
  id: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
}

@Injectable()
export class WalletService implements OnModuleInit {
  private readonly logger = new Logger(WalletService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS user_wallets (
          id TEXT PRIMARY KEY,
          user_id TEXT UNIQUE NOT NULL,
          balance DOUBLE PRECISION DEFAULT 0,
          pending_refund DOUBLE PRECISION DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS user_wallet_transactions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          type TEXT NOT NULL,
          amount DOUBLE PRECISION NOT NULL,
          status TEXT DEFAULT 'completed',
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS user_banks (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          bank_code TEXT NOT NULL,
          bank_name TEXT NOT NULL,
          account_number TEXT NOT NULL,
          account_name TEXT NOT NULL,
          is_default BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      this.logger.log('✅ User wallet, transaction, and bank tables initialized');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Could not initialize wallet tables: ${msg}`);
    }
  }

  async getWallet(userId: string): Promise<{ balance: number; pending_refund: number }> {
    try {
      const rows = await this.prisma.$queryRawUnsafe<RawWalletRow[]>(
        `SELECT balance, pending_refund FROM user_wallets WHERE user_id = $1 LIMIT 1`,
        userId,
      );

      if (rows.length > 0 && rows[0]) {
        return {
          balance: Number(rows[0].balance) || 0,
          pending_refund: Number(rows[0].pending_refund) || 0,
        };
      }

      // Initialize default wallet row
      const id = `w_${randomUUID()}`;
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO user_wallets (id, user_id, balance, pending_refund) VALUES ($1, $2, 0, 0)
         ON CONFLICT (user_id) DO NOTHING`,
        id,
        userId,
      );

      return { balance: 0, pending_refund: 0 };
    } catch (err) {
      this.logger.error(`Error fetching wallet for user ${userId}`, err);
      return { balance: 0, pending_refund: 0 };
    }
  }

  async deposit(
    userId: string,
    dto: DepositWalletDto,
  ): Promise<{ success: boolean; message: string; balance: number }> {
    const amount = Number(dto.amount);
    const methodName = this.resolveMethodName(dto.method);

    const currentWallet = await this.getWallet(userId);
    const newBalance = currentWallet.balance + amount;

    await this.prisma.$executeRawUnsafe(
      `UPDATE user_wallets SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2`,
      newBalance,
      userId,
    );

    const txId = `tx_${randomUUID()}`;
    const description = `Nạp tiền vào ví qua ${methodName}`;

    await this.prisma.$executeRawUnsafe(
      `INSERT INTO user_wallet_transactions (id, user_id, type, amount, status, description, created_at)
       VALUES ($1, $2, 'deposit', $3, 'completed', $4, CURRENT_TIMESTAMP)`,
      txId,
      userId,
      amount,
      description,
    );

    return {
      success: true,
      message: 'Nạp tiền thành công!',
      balance: newBalance,
    };
  }

  private resolveMethodName(method?: string): string {
    if (method === 'vnpay') return 'VNPay';
    if (method === 'bank') return 'Ngân hàng';
    return 'Ví MoMo';
  }

  async getTransactions(
    userId: string,
    limit = 20,
    page = 1,
  ): Promise<{
    data: Array<{
      id: string;
      type: string;
      amount: number;
      status: string;
      description: string;
      created_at: string;
    }>;
    meta: { total: number; limit: number; page: number };
  }> {
    const offset = (page - 1) * limit;

    try {
      const rows = await this.prisma.$queryRawUnsafe<RawTxRow[]>(
        `SELECT id, type, amount, status, description, created_at as "createdAt"
         FROM user_wallet_transactions
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        userId,
        limit,
        offset,
      );

      const countRows = await this.prisma.$queryRawUnsafe<RawCountRow[]>(
        `SELECT COUNT(*) as count FROM user_wallet_transactions WHERE user_id = $1`,
        userId,
      );

      const total = countRows[0] ? Number(countRows[0].count) : 0;

      const data = rows.map((r) => ({
        id: r.id,
        type: r.type,
        amount: Number(r.amount) || 0,
        status: r.status,
        description: r.description ?? '',
        created_at: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      }));

      return {
        data,
        meta: { total, limit, page },
      };
    } catch (err) {
      this.logger.error(`Error fetching transactions for user ${userId}`, err);
      return { data: [], meta: { total: 0, limit, page } };
    }
  }

  async getBanks(userId: string): Promise<{
    data: Array<{
      id: string;
      bank_code: string;
      bank_name: string;
      account_number: string;
      account_name: string;
      is_default: boolean;
    }>;
  }> {
    try {
      const rows = await this.prisma.$queryRawUnsafe<RawBankRow[]>(
        `SELECT id, bank_code as "bankCode", bank_name as "bankName", account_number as "accountNumber",
                account_name as "accountName", is_default as "isDefault"
         FROM user_banks
         WHERE user_id = $1
         ORDER BY is_default DESC, created_at DESC`,
        userId,
      );

      const data = rows.map((r) => ({
        id: r.id,
        bank_code: r.bankCode,
        bank_name: r.bankName,
        account_number: r.accountNumber,
        account_name: r.accountName,
        is_default: Boolean(r.isDefault),
      }));

      return { data };
    } catch (err) {
      this.logger.error(`Error fetching banks for user ${userId}`, err);
      return { data: [] };
    }
  }

  async getKycStatus(userId: string): Promise<{ status: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { kycStatus: true },
    });
    return { status: user?.kycStatus ?? 'none' };
  }
}
