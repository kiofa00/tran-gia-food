# 🍜 Tran Gia Food — Monorepo

Nền tảng giao đồ ăn với 3 Flutter apps + 1 Next.js admin + NestJS backend.

## 📁 Cấu Trúc

```
tran_gia_app/
├── apps/
│   ├── customer_app/      ← Flutter (Customer) Android + iOS
│   ├── restaurant_app/    ← Flutter (Restaurant) Android + iOS
│   ├── shipper_app/       ← Flutter (Shipper) Android + iOS
│   └── admin_web/         ← Next.js (Admin Dashboard)
├── packages/
│   ├── shared_models/     ← Dart models, enums dùng chung
│   ├── shared_ui/         ← Design system, widgets dùng chung
│   └── api_client/        ← HTTP client, API services dùng chung
├── backend/               ← NestJS REST API
├── docs/                  ← Tài liệu hệ thống
├── melos.yaml
└── README.md
```

## 🚀 Quick Start

### Yêu cầu
- Flutter 3.19+, Dart 3.3+
- Node.js 20+
- PostgreSQL 15+, Redis 7+

### Cài đặt

```bash
# Cài melos
dart pub global activate melos

# Bootstrap tất cả Flutter packages
melos bootstrap

# Backend
cd backend && npm install && npx prisma migrate dev

# Admin web
cd apps/admin_web && npm install
```

### Chạy Development

```bash
cd backend && npm run start:dev         # Terminal 1
cd apps/customer_app && flutter run     # Terminal 2
cd apps/admin_web && npm run dev        # Terminal 3
```

## 📚 Tài Liệu

Xem [`docs/00-index.md`](./docs/00-index.md) để biết chi tiết toàn bộ hệ thống.

## 🔧 Melos Scripts

```bash
melos analyze   # Phân tích code
melos test      # Chạy tests
melos format    # Format Dart code
melos gen       # Codegen (freezed, json_serializable)
```
