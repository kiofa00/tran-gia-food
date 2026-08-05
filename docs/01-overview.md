# 🍜 01 — Tổng Quan Hệ Thống

## Mô Tả

Nền tảng giao đồ ăn tương tự GrabFood/ShopeeFood với 4 vai trò người dùng, hệ thống chia % doanh thu tự động, Google Maps tracking, và giới hạn bán kính đặt hàng.

---

## 👥 Các Bên Tham Gia (Actors)

| Vai trò | Mô tả |
|---|---|
| **Customer** | Đặt đồ ăn, chọn pickup hoặc giao hàng, thanh toán, dùng voucher |
| **Restaurant** | Quản lý menu, đơn hàng, xem doanh thu, tạo voucher |
| **Shipper** | Nhận đơn giao hàng, tracking, quản lý ví thu nhập |
| **Admin** | Quản lý toàn hệ thống, cấu hình % chia, duyệt tài khoản, phát hành voucher |

---

## 🗺️ Kiến Trúc Tổng Quan

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENT APPS (Flutter)                  │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐    │
│  │ Customer App │   │Restaurant App│   │ Shipper App  │    │
│  │ Android/iOS  │   │ Android/iOS  │   │ Android/iOS  │    │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘    │
│         └──────────────────┼──────────────────┘             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Admin Dashboard (Next.js Web)           │   │
│  └──────────────────────────┬───────────────────────────┘   │
└─────────────────────────────┼────────────────────────────────┘
                              │ REST API / WebSocket
┌─────────────────────────────▼────────────────────────────────┐
│                        BACKEND (NestJS)                       │
│  Auth │ Order │ Payment │ Delivery │ Restaurant │ Commission  │
│  Notification │ Coupon │ Shipper │ Payout │ Penalty          │
│  Chat │ Call (Masked) │ Cancellation │ KYC/Wallet           │
└─────────────────────────────┬────────────────────────────────┘
                              │
    Google Maps │ MoMo/VNPay │ eKYC │ Firebase │ SendGrid
    Stringee (Chat/Call) │ VNPT eKYC / FPT.AI
```

---

## 📱 Tính Năng Theo Từng Vai Trò

### 🧑 Customer App
- Đăng ký / đăng nhập (SĐT, Google, Apple, Facebook)
- **Xác minh danh tính**: OTP, Face ID, CCCD (eKYC), liên kết ngân hàng
- Xem danh sách quán trong **bán kính giới hạn** (động theo giờ cao điểm)
- Tìm kiếm / lọc theo loại đồ ăn, giá, rating
- Chọn món, áp dụng **coupon/voucher**
- Chọn: **Pickup** (tự lấy) hoặc **Delivery** (giao tận nơi + phí ship)
- Thanh toán: MoMo, Ngân hàng liên kết, Tiền mặt
- **Hủy đơn** nếu đơn còn ở trạng thái PENDING
- **Tracking real-time** của shipper trên Google Maps
- **Chat / Gọi điện** cho Shipper hoặc Quán (số thật được ẩn)
- Xác nhận nhận hàng → đơn hàng COMPLETED
- Đánh giá quán và shipper
- Lịch sử đơn hàng

### 🍽️ Restaurant App
- Quản lý danh mục & menu (thêm, sửa, xóa món)
- **Lịch mở/đóng cửa tự động** — đặt giờ mở cửa, hệ thống tự bật/tắt
- Nhận & xác nhận đơn hàng (với âm thanh thông báo)
- Dashboard doanh thu: ngày / tuần / tháng
- Xem % phí nền tảng đã trừ
- **Tạo voucher** riêng cho quán
- Cấu hình bán kính phục vụ riêng (≤ bán kính hệ thống cho phép)
- Chat với khách hàng (masked)

### 🚴 Shipper App
- Đăng ký + eKYC (CCCD, bằng lái) qua 3rd party eKYC
- Nộp phí đăng ký / nhận đồng phục
- Bật/tắt trạng thái sẵn sàng nhận đơn
- Nhận thông báo đơn tự động trong khu vực (60s để chấp nhận)
- Navigation Google Maps: Quán → Địa chỉ khách
- Update trạng thái đơn
- **Ví thu nhập** (2 loại ví — Cash Wallet & Account Wallet)
- Xem lịch sử đơn, đánh giá, tỉ lệ hủy đơn
- Chat / gọi với khách và quán (masked)

### 🛡️ Admin Dashboard (Web)
- Quản lý tài khoản (duyệt quán, duyệt shipper + xem kết quả eKYC)
- Cấu hình % hoa hồng (đồ ăn, ship)
- Cấu hình bán kính giới hạn toàn hệ thống + tự động thu hẹp giờ cao điểm
- Quản lý hệ thống voucher/coupon (phát hành toàn platform)
- Quản lý payout (duyệt lệnh rút, xem sao kê)
- Quản lý hệ thống phạt shipper
- Báo cáo thống kê toàn hệ thống

---

## 🔗 Xem Thêm
- [Luồng đặt hàng](./02-order-flow.md)
- [Tech stack](./11-tech-stack.md)
- [Cấu trúc monorepo](./15-monorepo.md)
