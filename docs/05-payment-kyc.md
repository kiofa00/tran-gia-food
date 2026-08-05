# 💳 05 — Thanh Toán & KYC Khách Hàng

## Phương Thức Thanh Toán

### MoMo / VNPay (online)
- Tích hợp SDK, redirect sang cổng thanh toán
- Webhook nhận xác nhận thanh toán → release đơn hàng
- Refund tự động về ví MoMo/ngân hàng nếu quán hủy

### Ngân hàng liên kết
- Hỗ trợ: Visa/Mastercard, ATM nội địa, VNPay QR
- Liên kết qua eKYC (CCCD + Face ID)
- Thanh toán 1-click sau khi đã liên kết

### Tiền mặt COD
- Shipper thu tiền mặt từ khách khi giao hàng
- Platform khấu trừ phí từ Cash Wallet của shipper
- Chỉ áp dụng cho đơn Delivery

---

## 🔐 Xác Minh Danh Tính Khách Hàng (Grab Model)

### Các lớp xác thực

```
Layer 1 — Bắt buộc khi đăng ký:
  Số điện thoại + OTP (6 chữ số)
      ↓
  Tài khoản cơ bản:
    ✅ Đặt đồ ăn Pickup
    ✅ Thanh toán COD hoặc MoMo
    ❌ Chưa liên kết ngân hàng

Layer 2 — Nâng cấp để liên kết ngân hàng:
  Upload CCCD (2 mặt) → eKYC OCR tự động
  Selfie live (liveness check + face matching)
  Xác nhận qua OTP ngân hàng
      ↓
  ✅ Mở khóa: Thanh toán ngân hàng + hoàn tiền tự động

Layer 3 — Bảo mật giao dịch cao:
  Giao dịch > 500.000đ → Yêu cầu Face ID hoặc PIN
  Thêm thẻ mới → Yêu cầu Face ID
```

### Tính năng ví trong app

| Tính năng | Mô tả |
|---|---|
| **Liên kết ngân hàng** | Visa/Mastercard, ATM nội địa, VNPay QR |
| **Xác thực Face ID / PIN** | Giao dịch lớn, thêm thẻ mới |
| **Nạp tiền vào ví app** | Qua ngân hàng, ATM, MoMo |
| **Lịch sử giao dịch** | Tất cả giao dịch vào/ra |
| **Hoàn tiền tự động** | Về ví app khi hủy đơn |

---

## 🔄 Luồng Hoàn Tiền (Refund)

```
Đơn bị hủy (CANCELLED)
      ↓
Xác định phương thức thanh toán ban đầu:
  MoMo      → Hoàn về ví MoMo (1-3 ngày)
  VNPay     → Hoàn về tài khoản ngân hàng (3-5 ngày)
  Ngân hàng → Hoàn về thẻ (3-7 ngày)
  COD       → Không cần hoàn
      ↓
Ghi nhận refund_transaction
      ↓
Thông báo khách: "Hoàn tiền đang xử lý"
```

---

## 🛡️ Bảo Mật Thanh Toán

- HTTPS cho tất cả API calls
- Không lưu thông tin thẻ trực tiếp (dùng token từ payment gateway)
- OTP xác nhận cho mọi giao dịch lần đầu
- Rate limiting: tối đa 5 lần thử OTP sai → khóa 15 phút
- PCI DSS compliance (qua payment gateway)

---

## 🔗 Xem Thêm
- [Business logic](./03-business-logic.md)
- [Order flow](./02-order-flow.md)
