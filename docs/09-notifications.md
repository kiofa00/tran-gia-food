# 🔔 09 — Hệ Thống Notifications

## Kênh Thông Báo

| Kênh                  | Công nghệ                      | Dùng khi                               |
| --------------------- | ------------------------------ | -------------------------------------- |
| **Push Notification** | Firebase Cloud Messaging (FCM) | Thông báo real-time khi app background |
| **In-app Alert**      | WebSocket (Socket.IO)          | Thông báo khi đang dùng app            |
| **Email**             | SendGrid                       | Sao kê, xác nhận, marketing            |

---

## 📲 Thông Báo Theo Vai Trò

### Customer

| Sự kiện                      | Push | In-app | Email |
| ---------------------------- | ---- | ------ | ----- |
| Đặt hàng thành công          | ✅   | ✅     | ✅    |
| Quán xác nhận đơn            | ✅   | ✅     | —     |
| Shipper nhận đơn             | ✅   | ✅     | —     |
| Shipper đang đến             | ✅   | ✅     | —     |
| Giao hàng thành công         | ✅   | ✅     | ✅    |
| Quán / hệ thống hủy đơn      | ✅   | ✅     | ✅    |
| Voucher mới                  | ✅   | —      | ✅    |
| Khuyến mãi từ quán yêu thích | ✅   | —      | —     |
| Hoàn tiền thành công         | ✅   | ✅     | ✅    |

### Restaurant

| Sự kiện                    | Push             | In-app | Email |
| -------------------------- | ---------------- | ------ | ----- |
| Đơn hàng mới               | ✅ + 🔔 âm thanh | ✅     | —     |
| Khách hủy đơn              | ✅               | ✅     | —     |
| Shipper đến lấy hàng       | ✅               | ✅     | —     |
| Sao kê doanh thu hàng tuần | —                | —      | ✅    |
| Tài khoản được duyệt       | ✅               | —      | ✅    |
| Payout thành công          | ✅               | —      | ✅    |

### Shipper

| Sự kiện                   | Push             | In-app | Email |
| ------------------------- | ---------------- | ------ | ----- |
| Đơn hàng mới gần đây      | ✅ + 🔔 âm thanh | ✅     | —     |
| Đơn bị hủy sau khi nhận   | ✅               | ✅     | —     |
| Cảnh báo hệ thống phạt    | ✅               | ✅     | ✅    |
| Sao kê thu nhập hàng tuần | —                | —      | ✅    |
| Payout thành công         | ✅               | —      | ✅    |
| Tài khoản được duyệt      | ✅               | —      | ✅    |

### Admin

| Sự kiện                     | Email |
| --------------------------- | ----- |
| Shipper mới cần duyệt       | ✅    |
| Quán mới cần duyệt          | ✅    |
| Báo cáo doanh thu hàng tuần | ✅    |

---

## 📧 Email Templates

### Đặt hàng thành công

```
Tiêu đề: 🎉 Đơn hàng #12345 đã được xác nhận!
Nội dung:
  - Tên quán, danh sách món
  - Tổng tiền (trước/sau voucher)
  - Địa chỉ giao hàng
  - Thời gian dự kiến
  - Link theo dõi đơn hàng
```

### Sao kê shipper hàng tuần

```
Tiêu đề: 📊 Sao kê thu nhập tuần 28/07 – 03/08
Nội dung (dạng bảng):
  - Số đơn hoàn thành
  - Tổng tiền cước ship
  - Tiền thưởng
  - Phí dịch vụ
  - Thu nhập ròng
  - Số dư Cash Wallet hiện tại
```

### Voucher mới

```
Tiêu đề: 🎁 Voucher giảm 20% dành riêng cho bạn!
Nội dung:
  - Mã voucher (highlight)
  - Điều kiện áp dụng
  - Hạn sử dụng
  - Nút CTA: "Đặt ngay"
```

---

## 🏗️ Kiến Trúc Notification Service

```
Business Logic (Order, Payment,...)
      ↓ emit event
Notification Service (NestJS EventEmitter)
      ↓
  ┌───────────────────────────────┐
  │  FCM           SendGrid       │
  │  (Push)        (Email)        │
  │                               │
  │  WebSocket                    │
  │  (In-app real-time)           │
  └───────────────────────────────┘
      ↓
Lưu vào bảng Notifications (DB)
→ Hiển thị trong lịch sử thông báo của app
```

### Cron Jobs liên quan

```
Thứ Ba hàng tuần, 8:00 SA:
  → Chạy generate weekly statement
  → Gửi email sao kê cho Shipper & Restaurant

Mỗi phút:
  → Check giờ mở/đóng cửa restaurant
  → Auto update is_open

Hàng ngày 0:00:
  → Reset peak_hour overrides
  → Check và clear expired lockouts
```

---

## 🔗 Xem Thêm

- [Tech stack](./11-tech-stack.md)
- [Business logic](./03-business-logic.md)
