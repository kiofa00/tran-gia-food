# 🛣️ 14 — Lộ Trình Phát Triển

## Tổng Quan Timeline

```
Phase 1 (MVP)          → 2-3 tháng
Phase 2 (Delivery)     → 2 tháng
Phase 3 (Payment)      → 1 tháng
Phase 4 (Voucher/Notif)→ 1 tháng
Phase 5 (Polish)       → 1 tháng
─────────────────────────────────
Tổng ước tính          → 7-8 tháng
```

---

## Phase 1 — MVP (2-3 tháng)

**Mục tiêu:** App chạy được end-to-end cho Pickup flow

### Backend
- [ ] Cài đặt NestJS monorepo, PostgreSQL, Prisma
- [ ] Module Auth: OTP (SĐT), Google login, JWT
- [ ] Module Users: CRUD, roles
- [ ] Module Restaurants: CRUD, giờ mở cửa, auto open/close cron
- [ ] Module Menu: Categories + Items
- [ ] Module Orders: Pickup flow (PENDING → CONFIRMED → COMPLETED)
- [ ] Swagger docs

### Customer App
- [ ] Setup Flutter + Riverpod + go_router + Design System
- [ ] Màn đăng ký / đăng nhập (SĐT OTP, Google)
- [ ] Màn Home: danh sách quán, category pills, search
- [ ] Màn Restaurant detail + menu
- [ ] Giỏ hàng
- [ ] Checkout (COD + Pickup)
- [ ] Lịch sử đơn hàng
- [ ] i18n (vi/en) + Theme (Light/Dark)

### Restaurant App
- [ ] Đăng nhập quán
- [ ] Màn quản lý đơn (nhận đơn, âm thanh notification)
- [ ] Màn menu management
- [ ] Dashboard doanh thu cơ bản

### Admin Web
- [ ] Đăng nhập Admin
- [ ] Quản lý quán ăn (duyệt, xem danh sách)
- [ ] Cấu hình platform_fee_rate

---

## Phase 2 — Delivery + Shipper (2 tháng)

**Mục tiêu:** Delivery flow hoạt động với real shipper

### Backend
- [ ] Module Shippers: CRUD, location tracking (Redis), eKYC
- [ ] Module Delivery: Auto-assign algorithm
- [ ] Google Maps integration (Distance Matrix)
- [ ] Phí ship tính tự động theo khoảng cách
- [ ] Bán kính giới hạn (system radius + peak hour auto-shrink)
- [ ] WebSocket: shipper location → customer
- [ ] Hệ thống phạt Shipper (penalty levels)

### Customer App
- [ ] Màn chọn Delivery (nhập địa chỉ, xem phí ship)
- [ ] Tracking màn real-time (Google Maps + WebSocket)
- [ ] Hủy đơn (PENDING only)

### Shipper App
- [ ] Đăng ký + eKYC upload
- [ ] Màn nhận đơn (60s timer)
- [ ] Navigation turn-by-turn (Directions API)
- [ ] Update trạng thái đơn
- [ ] Cash Wallet view

---

## Phase 3 — Payment + Commission (1 tháng)

**Mục tiêu:** Thanh toán online + chia tiền tự động

### Backend
- [ ] MoMo SDK integration + webhook
- [ ] VNPay integration + webhook
- [ ] Refund flow
- [ ] Module Commissions: Auto-split khi COMPLETED
- [ ] Module Payouts: Weekly cron job (Thứ Ba)
- [ ] Email sao kê (SendGrid template)

### Customer App
- [ ] Màn thanh toán MoMo / VNPay
- [ ] KYC flow: CCCD + Face ID để liên kết ngân hàng
- [ ] Ví app + lịch sử giao dịch

### Shipper App
- [ ] Cash Wallet + Account Wallet đầy đủ
- [ ] Lịch sử sao kê hàng tuần
- [ ] Yêu cầu rút tiền

### Restaurant App
- [ ] Dashboard doanh thu chi tiết
- [ ] Payout history

---

## Phase 4 — Voucher + Notification (1 tháng)

**Mục tiêu:** Hệ thống marketing + communication đầy đủ

### Backend
- [ ] Module Vouchers: CRUD, validation logic
- [ ] Module Notifications: FCM + SendGrid + in-app
- [ ] Chat integration (Stringee)
- [ ] Masked call integration (Stringee)

### Customer App
- [ ] Nhập voucher ở giỏ hàng
- [ ] In-app notification center (lịch sử thông báo)
- [ ] Chat với Shipper / Quán
- [ ] Gọi điện (masked)

### Shipper App
- [ ] Chat với Customer / Quán

### Restaurant App
- [ ] Tạo voucher riêng cho quán
- [ ] Chat với khách

### Admin Web
- [ ] Quản lý voucher đầy đủ
- [ ] Notification analytics

---

## Phase 5 — Polish (1 tháng)

**Mục tiêu:** Production-ready, UX tốt, monitoring

- [ ] Đánh giá & review (Customer → Restaurant & Shipper)
- [ ] Analytics dashboard Admin (Recharts)
- [ ] Performance optimization (image caching, lazy load)
- [ ] Error tracking (Sentry)
- [ ] A/B testing voucher
- [ ] Onboarding flow mới user
- [ ] Deep linking (share quán, chia sẻ đơn)
- [ ] App Store / Play Store submission

---

## 🔗 Xem Thêm
- [Tổng quan hệ thống](./01-overview.md)
- [Tech stack](./11-tech-stack.md)
