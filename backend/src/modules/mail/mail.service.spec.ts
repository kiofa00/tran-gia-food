import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { MailService } from './mail.service';
import { OrderInvoiceData } from './templates/order-invoice.template';
import {
  RestaurantWeeklyStatementData,
  ShipperWeeklyStatementData,
} from './templates/weekly-statement.template';

describe('MailService', () => {
  let service: MailService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'NODE_ENV') return 'development';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailService, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendOrderInvoice', () => {
    it('should successfully format and dispatch order invoice email', async () => {
      const invoiceData: OrderInvoiceData = {
        orderId: 'ord-test-999',
        customerName: 'Nguyễn Văn A',
        deliveryAddress: '123 Đường Trần Phú, Đà Nẵng',
        restaurantName: 'Cơm Tấm Sài Gòn 39',
        createdAt: new Date(),
        paymentMethod: 'momo',
        items: [
          { name: 'Cơm Sườn Bì Chả', quantity: 2, price: 45000, options: 'Ít mỡ hành, thêm ớt' },
          { name: 'Canh Khổ Qua Nhồi Thịt', quantity: 1, price: 20000 },
        ],
        subtotal: 110000,
        discount: 20000,
        shippingFee: 15000,
        totalAmount: 105000,
      };

      const result = await service.sendOrderInvoice('customer@example.com', invoiceData);

      expect(result.success).toBe(true);
      expect(result.recipient).toBe('customer@example.com');
      expect(result.subject).toContain('#st-999');
      expect(result.messageId).toBeDefined();
    });
  });

  describe('sendRestaurantWeeklyStatement', () => {
    it('should successfully format and dispatch restaurant statement email', async () => {
      const statementData: RestaurantWeeklyStatementData = {
        restaurantName: 'Quán Phở Thìn Lò Đúc',
        ownerName: 'Trần Văn Chủ Quán',
        periodStart: new Date('2026-08-10'),
        periodEnd: new Date('2026-08-17'),
        totalOrders: 142,
        grossRevenue: 8500000,
        commissionRate: 15,
        commissionAmount: 1275000,
        netPayoutAmount: 7225000,
        bankName: 'Vietcombank',
        bankAccountNumber: '9988776655',
      };

      const result = await service.sendRestaurantWeeklyStatement(
        'restaurant@example.com',
        statementData,
      );

      expect(result.success).toBe(true);
      expect(result.subject).toContain('Quán Phở Thìn Lò Đúc');
    });
  });

  describe('sendShipperWeeklyStatement', () => {
    it('should successfully format and dispatch shipper statement email', async () => {
      const statementData: ShipperWeeklyStatementData = {
        shipperName: 'Lê Văn Tài Xế',
        periodStart: new Date('2026-08-10'),
        periodEnd: new Date('2026-08-17'),
        totalTrips: 68,
        deliveryFeesEarned: 1360000,
        tipsEarned: 150000,
        bonusAmount: 100000,
        penaltyAmount: 0,
        cashCollected: 4500000,
        netPayoutAmount: 1610000,
        bankName: 'Techcombank',
        bankAccountNumber: '19034567890123',
      };

      const result = await service.sendShipperWeeklyStatement('shipper@example.com', statementData);

      expect(result.success).toBe(true);
      expect(result.subject).toContain('Lê Văn Tài Xế');
    });
  });
});
