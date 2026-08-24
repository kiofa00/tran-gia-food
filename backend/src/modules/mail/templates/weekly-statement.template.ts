import { formatVND } from './order-invoice.template';

export interface RestaurantWeeklyStatementData {
  restaurantName: string;
  ownerName: string;
  periodStart: Date | string;
  periodEnd: Date | string;
  totalOrders: number;
  grossRevenue: number;
  commissionRate: number; // e.g. 15 (%)
  commissionAmount: number;
  netPayoutAmount: number;
  bankName?: string;
  bankAccountNumber?: string;
}

export interface ShipperWeeklyStatementData {
  shipperName: string;
  periodStart: Date | string;
  periodEnd: Date | string;
  totalTrips: number;
  deliveryFeesEarned: number;
  tipsEarned: number;
  bonusAmount: number;
  penaltyAmount: number;
  cashCollected: number; // Tiền mặt COD đã thu hộ
  netPayoutAmount: number;
  bankName?: string;
  bankAccountNumber?: string;
}

export function renderRestaurantStatementHtml(data: RestaurantWeeklyStatementData): string {
  const startStr = new Date(data.periodStart).toLocaleDateString('vi-VN');
  const endStr = new Date(data.periodEnd).toLocaleDateString('vi-VN');

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sao Kê Doanh Thu Hàng Tuần - ${data.restaurantName}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px; color: #1E293B;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); border: 1px solid #E2E8F0;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #EA580C 0%, #9A3412 100%); padding: 32px 24px; text-align: center; color: #FFFFFF;">
      <h1 style="margin: 0; font-size: 22px; font-weight: 800;">TRAN GIA FOOD - ĐỐI TÁC NHÀ HÀNG</h1>
      <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.95;">Báo Cáo & Quyết Toán Doanh Thu Hàng Tuần</p>
    </div>

    <!-- Info -->
    <div style="padding: 24px;">
      <div style="background-color: #FFF7ED; border-left: 4px solid #EA580C; padding: 14px 16px; border-radius: 4px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 14px; color: #9A3412;">
          Kính gửi Quý đối tác <strong>${data.restaurantName}</strong> (${data.ownerName}),<br>
          Dưới đây là sao kê doanh thu và quyết toán chi trả tự động từ kỳ <strong>${startStr}</strong> đến <strong>${endStr}</strong>.
        </p>
      </div>

      <!-- Metrics Grid -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 12px 0; color: #64748B; font-size: 14px;">Tổng số đơn hoàn thành:</td>
          <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #0F172A; font-size: 15px;">${data.totalOrders} đơn</td>
        </tr>
        <tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 12px 0; color: #64748B; font-size: 14px;">Tổng doanh thu đơn hàng:</td>
          <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #0F172A; font-size: 15px;">${formatVND(data.grossRevenue)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 12px 0; color: #64748B; font-size: 14px;">Phí dịch vụ nền tảng (${data.commissionRate}%):</td>
          <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #DC2626; font-size: 14px;">-${formatVND(data.commissionAmount)}</td>
        </tr>
      </table>

      <!-- Payout Box -->
      <div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 12px; padding: 18px; margin-bottom: 20px; text-align: center;">
        <div style="font-size: 13px; color: #065F46; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Số tiền thực nhận quyết toán:</div>
        <div style="font-size: 26px; font-weight: 800; color: #059669; margin: 8px 0 4px;">${formatVND(data.netPayoutAmount)}</div>
        <div style="font-size: 12px; color: #047857;">
          Tài khoản nhận: ${data.bankName ? `<strong>${data.bankName}</strong> - ` : ''} ${data.bankAccountNumber || 'Đã lưu trên hệ thống'}
        </div>
      </div>

      <!-- Footer note -->
      <div style="text-align: center; color: #64748B; font-size: 12px; line-height: 1.5;">
        <p style="margin: 0 0 4px;">Tiền sẽ được chuyển tự động vào tài khoản ngân hàng của quý đối tác trong vòng 24 giờ.</p>
        <p style="margin: 0;">Mọi thắc mắc đối soát xin vui lòng liên hệ bộ phận Kế toán: <a href="mailto:finance@trangiafood.vn" style="color: #EA580C; font-weight: 600;">finance@trangiafood.vn</a></p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

export function renderShipperStatementHtml(data: ShipperWeeklyStatementData): string {
  const startStr = new Date(data.periodStart).toLocaleDateString('vi-VN');
  const endStr = new Date(data.periodEnd).toLocaleDateString('vi-VN');

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sao Kê Thu Nhập Hàng Tuần - Tài Xế ${data.shipperName}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px; color: #1E293B;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); border: 1px solid #E2E8F0;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #EA580C 0%, #D97706 100%); padding: 32px 24px; text-align: center; color: #FFFFFF;">
      <h1 style="margin: 0; font-size: 22px; font-weight: 800;">TRAN GIA FOOD - ĐỘI NGŨ TÀI XẾ</h1>
      <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.95;">Bảng Sao Kê Thu Nhập & Quyết Toán Tuần</p>
    </div>

    <!-- Info -->
    <div style="padding: 24px;">
      <p style="margin: 0 0 16px; font-size: 14px; color: #334155;">
        Chào Tài xế <strong>${data.shipperName}</strong>,<br>
        Dưới đây là chi tiết thu nhập của bạn từ ngày <strong>${startStr}</strong> đến ngày <strong>${endStr}</strong>:
      </p>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 10px 0; color: #64748B; font-size: 14px;">Tổng số chuyến hoàn thành:</td>
          <td style="padding: 10px 0; text-align: right; font-weight: 700; color: #0F172A;">${data.totalTrips} chuyến</td>
        </tr>
        <tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 10px 0; color: #64748B; font-size: 14px;">Cước phí ship thực nhận:</td>
          <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #16A34A;">+${formatVND(data.deliveryFeesEarned)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 10px 0; color: #64748B; font-size: 14px;">Tiền Tip từ khách:</td>
          <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #16A34A;">+${formatVND(data.tipsEarned)}</td>
        </tr>
        ${
          data.bonusAmount > 0
            ? `
        <tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 10px 0; color: #64748B; font-size: 14px;">Thưởng hiệu suất:</td>
          <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #16A34A;">+${formatVND(data.bonusAmount)}</td>
        </tr>`
            : ''
        }
        ${
          data.penaltyAmount > 0
            ? `
        <tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 10px 0; color: #64748B; font-size: 14px;">Phạt hủy đơn vi phạm:</td>
          <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #DC2626;">-${formatVND(data.penaltyAmount)}</td>
        </tr>`
            : ''
        }
      </table>

      <!-- Payout Box -->
      <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 18px; margin-bottom: 20px; text-align: center;">
        <div style="font-size: 13px; color: #1E40AF; font-weight: 600; text-transform: uppercase;">Số tiền quyết toán chuyển khoản:</div>
        <div style="font-size: 26px; font-weight: 800; color: #2563EB; margin: 8px 0 4px;">${formatVND(data.netPayoutAmount)}</div>
        <div style="font-size: 12px; color: #3B82F6;">
          Ngân hàng: ${data.bankName ? `<strong>${data.bankName}</strong> - ` : ''} ${data.bankAccountNumber || 'Đã liên kết ví'}
        </div>
      </div>

      <div style="text-align: center; color: #64748B; font-size: 12px;">
        <p style="margin: 0;">Chúc bạn luôn vững tay lái và lái xe an toàn cùng <strong>Tran Gia Food</strong>! 🛵</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
