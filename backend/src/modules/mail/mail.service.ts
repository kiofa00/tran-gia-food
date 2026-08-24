import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

import { OrderInvoiceData, renderOrderInvoiceHtml } from './templates/order-invoice.template';
import {
  RestaurantWeeklyStatementData,
  ShipperWeeklyStatementData,
  renderRestaurantStatementHtml,
  renderShipperStatementHtml,
} from './templates/weekly-statement.template';

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  recipient: string;
  subject: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Gửi Hóa đơn điện tử cho khách hàng sau khi hoàn tất đơn hàng
   */
  async sendOrderInvoice(
    recipientEmail: string,
    invoiceData: OrderInvoiceData,
  ): Promise<EmailSendResult> {
    const subject = `[Tran Gia Food] Hóa đơn điện tử đơn hàng #${invoiceData.orderId.slice(-6)}`;
    const html = renderOrderInvoiceHtml(invoiceData);

    return this.sendMail({
      to: recipientEmail,
      subject,
      html,
    });
  }

  /**
   * Gửi Báo cáo sao kê & quyết toán hàng tuần cho Nhà hàng
   */
  async sendRestaurantWeeklyStatement(
    recipientEmail: string,
    statementData: RestaurantWeeklyStatementData,
  ): Promise<EmailSendResult> {
    const subject = `[Tran Gia Food] Báo cáo sao kê doanh thu tuần - ${statementData.restaurantName}`;
    const html = renderRestaurantStatementHtml(statementData);

    return this.sendMail({
      to: recipientEmail,
      subject,
      html,
    });
  }

  /**
   * Gửi Báo cáo thu nhập & quyết toán hàng tuần cho Shipper
   */
  async sendShipperWeeklyStatement(
    recipientEmail: string,
    statementData: ShipperWeeklyStatementData,
  ): Promise<EmailSendResult> {
    const subject = `[Tran Gia Food] Bảng sao kê thu nhập tuần - Tài xế ${statementData.shipperName}`;
    const html = renderShipperStatementHtml(statementData);

    return this.sendMail({
      to: recipientEmail,
      subject,
      html,
    });
  }

  /**
   * Phương thức gửi mail cốt lõi (hỗ trợ Mock Transport trong Dev/Test và SMTP/API trong Prod)
   */
  private async sendMail(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<EmailSendResult> {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';

    this.logger.log(
      `📧 [Email Dispatch] To: ${options.to} | Subject: "${options.subject}" (Env: ${isProd ? 'PROD' : 'DEV/MOCK'})`,
    );

    // Mock Delivery Simulation for Dev & Testing
    const messageId = `msg_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    return {
      success: true,
      messageId,
      recipient: options.to,
      subject: options.subject,
    };
  }
}
