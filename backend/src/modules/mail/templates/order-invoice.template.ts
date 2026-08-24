export interface OrderInvoiceItem {
  name: string;
  quantity: number;
  price: number;
  options?: string;
}

export interface OrderInvoiceData {
  orderId: string;
  customerName: string;
  customerPhone?: string;
  deliveryAddress: string;
  restaurantName: string;
  createdAt: Date | string;
  paymentMethod: string;
  items: OrderInvoiceItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalAmount: number;
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function renderOrderInvoiceHtml(data: OrderInvoiceData): string {
  const formattedDate = new Date(data.createdAt).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
  });

  const itemRows = data.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 12px 0; color: #1E293B; font-size: 14px;">
          <strong>${item.name}</strong>
          ${item.options ? `<div style="color: #64748B; font-size: 12px; margin-top: 2px;">${item.options}</div>` : ''}
        </td>
        <td style="padding: 12px 0; text-align: center; color: #475569; font-size: 14px;">x${item.quantity}</td>
        <td style="padding: 12px 0; text-align: right; color: #0F172A; font-weight: 600; font-size: 14px;">${formatVND(item.price * item.quantity)}</td>
      </tr>
    `,
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hóa Đơn Điện Tử Tran Gia Food - #${data.orderId.slice(-6)}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px; color: #1E293B;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); border: 1px solid #E2E8F0;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #EA580C 0%, #C2410C 100%); padding: 32px 24px; text-align: center; color: #FFFFFF;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">TRAN GIA FOOD</h1>
      <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.95;">Hóa Đơn Điện Tử Đặt Món</p>
    </div>

    <!-- Content -->
    <div style="padding: 24px;">
      <div style="border-bottom: 2px dashed #E2E8F0; padding-bottom: 16px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #64748B; font-size: 13px;">Mã đơn hàng:</span>
          <strong style="color: #EA580C; font-size: 14px;">#${data.orderId}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #64748B; font-size: 13px;">Thời gian:</span>
          <span style="color: #334155; font-size: 13px;">${formattedDate}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #64748B; font-size: 13px;">Nhà hàng:</span>
          <strong style="color: #1E293B; font-size: 13px;">${data.restaurantName}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #64748B; font-size: 13px;">Địa chỉ giao:</span>
          <span style="color: #334155; font-size: 13px; text-align: right; max-width: 60%;">${data.deliveryAddress}</span>
        </div>
      </div>

      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="border-bottom: 2px solid #CBD5E1; color: #475569; font-size: 13px; text-transform: uppercase;">
            <th style="text-align: left; padding-bottom: 8px;">Món ăn</th>
            <th style="text-align: center; padding-bottom: 8px;">SL</th>
            <th style="text-align: right; padding-bottom: 8px;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <!-- Summary Calculation -->
      <div style="background-color: #F8FAFC; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: #475569;">
          <span>Tạm tính:</span>
          <span>${formatVND(data.subtotal)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: #16A34A;">
          <span>Giảm giá (Voucher):</span>
          <span>-${formatVND(data.discount)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px; color: #475569;">
          <span>Phí giao hàng:</span>
          <span>${formatVND(data.shippingFee)}</span>
        </div>
        <div style="border-top: 1px solid #CBD5E1; padding-top: 12px; display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #0F172A; font-size: 16px;">Tổng thanh toán:</strong>
          <strong style="color: #EA580C; font-size: 20px;">${formatVND(data.totalAmount)}</strong>
        </div>
        <div style="margin-top: 6px; font-size: 12px; color: #64748B; text-align: right;">
          Phương thức: <strong>${data.paymentMethod.toUpperCase()}</strong>
        </div>
      </div>

      <!-- Footer message -->
      <div style="text-align: center; color: #64748B; font-size: 12px; line-height: 1.5;">
        <p style="margin: 0 0 4px;">Cảm ơn bạn đã lựa chọn <strong>Tran Gia Food</strong>! Chúc bạn có bữa ăn ngon miệng.</p>
        <p style="margin: 0;">Hotline hỗ trợ: <a href="tel:19001234" style="color: #EA580C; text-decoration: none; font-weight: 600;">1900 1234</a> | Email: support@trangiafood.vn</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
