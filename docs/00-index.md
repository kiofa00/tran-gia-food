# 📚 Tài Liệu Hệ Thống — Tran Gia Food Delivery

> Mỗi file tài liệu bên dưới mô tả một khía cạnh cụ thể của hệ thống.
> Đây là nguồn tham khảo chính cho toàn bộ team phát triển.

---

## 📂 Danh Sách Tài Liệu

| File                                                                   | Nội dung                                                                |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [01-overview.md](./01-overview.md)                                     | Tổng quan hệ thống, các bên tham gia, kiến trúc, tính năng theo vai trò |
| [02-order-flow.md](./02-order-flow.md)                                 | Luồng đặt hàng, trạng thái đơn, chính sách hủy đơn                      |
| [03-business-logic.md](./03-business-logic.md)                         | Logic chia % hoa hồng, ví & payout theo mô hình Grab                    |
| [04-shipper.md](./04-shipper.md)                                       | Quản lý shipper, eKYC, phân công đơn, hệ thống phạt                     |
| [05-payment-kyc.md](./05-payment-kyc.md)                               | Thanh toán (MoMo/VNPay/COD), xác minh KYC, liên kết ngân hàng           |
| [06-communication.md](./06-communication.md)                           | Chat & gọi điện (masked), Stringee integration                          |
| [07-maps-radius.md](./07-maps-radius.md)                               | Google Maps, tính phí ship, bán kính giới hạn động                      |
| [08-voucher.md](./08-voucher.md)                                       | Hệ thống coupon/voucher, luồng áp dụng, database schema                 |
| [09-notifications.md](./09-notifications.md)                           | Push notification (FCM), email (SendGrid), in-app alert                 |
| [10-database.md](./10-database.md)                                     | Database schema đầy đủ (PostgreSQL)                                     |
| [11-tech-stack.md](./11-tech-stack.md)                                 | Tech stack: Flutter, NestJS, Next.js, các service bên thứ 3             |
| [12-ui-ux.md](./12-ui-ux.md)                                           | Design system: màu sắc, typography, animation, icon                     |
| [13-i18n-theme.md](./13-i18n-theme.md)                                 | Đa ngôn ngữ (vi/en), theme switching (Light/Dark)                       |
| [14-roadmap.md](./14-roadmap.md)                                       | Lộ trình phát triển theo phase                                          |
| [15-monorepo.md](./15-monorepo.md)                                     | Cấu trúc monorepo, shared packages, melos setup                         |
| [16-design-tokens.md](./16-design-tokens.md)                           | Quy định & hướng dẫn triển khai hệ thống Design Tokens                  |
| [17-strapi-cms-architecture.md](./17-strapi-cms-architecture.md)       | Kiến trúc Quản lý Nội dung Toàn diện (Universal Headless CMS)           |
| [18-client-implementation-plan.md](./18-client-implementation-plan.md) | Bản kế hoạch triển khai dành cho Khách hàng & Đối tác (Non-technical)   |
| [implementation_plan.md](./implementation_plan.md)                     | Bản thiết kế hệ thống kỹ thuật tổng thể System Design Plan (v3)         |

---

## 🏗️ Cấu Trúc Monorepo

```
tran_gia_app/
├── apps/
│   ├── customer_app/      ← Flutter (Customer)
│   ├── restaurant_app/    ← Flutter (Restaurant)
│   ├── shipper_app/       ← Flutter (Shipper)
│   └── admin_web/         ← Next.js (Admin)
├── packages/
│   ├── shared_models/     ← Dart models dùng chung
│   ├── shared_ui/         ← Widget, Theme, Design System
│   └── api_client/        ← Dart HTTP client
├── backend/               ← NestJS API
├── docs/                  ← Tài liệu (folder này)
├── melos.yaml
└── README.md
```

---

## 🚀 Quick Start

```bash
# Cài melos
dart pub global activate melos

# Bootstrap tất cả packages
melos bootstrap

# Chạy customer app
cd apps/customer_app && flutter run

# Chạy backend
cd backend && npm run start:dev

# Chạy admin web
cd apps/admin_web && npm run dev
```
