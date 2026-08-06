# 🍜 Tran Gia Food — Monorepo

Nền tảng giao đồ ăn toàn diện gồm 3 Flutter Apps (Customer, Restaurant, Shipper) + 1 Admin Web (Next.js) + Backend REST API (NestJS + PostgreSQL + Redis).

---

## 📁 Cấu Trúc Dự Án

```
tran_gia_app/
├── apps/
│   ├── customer_app/      ← Flutter (Customer) Android + iOS
│   ├── restaurant_app/    ← Flutter (Restaurant) Android + iOS
│   ├── shipper_app/       ← Flutter (Shipper) Android + iOS
│   └── admin_web/         ← Next.js (Admin Dashboard)
├── packages/
│   ├── shared_models/     ← Dart models, enums dùng chung
│   ├── shared_ui/         ← Design system, themes, i18n dùng chung
│   └── api_client/        ← HTTP client, API services dùng chung
├── backend/               ← NestJS REST API + PostgreSQL + Redis
├── docs/                  ← 16 tài liệu thiết kế hệ thống
├── pnpm-workspace.yaml    ← Cấu hình pnpm workspaces & catalog
├── package.json           ← Root scripts & pnpm v9.15.9 engine
├── turbo.json             ← Turborepo build pipeline
├── melos.yaml             ← Melos Flutter workspace orchestration
└── README.md
```

---

## 💻 Danh Sách Các Câu Lệnh Hợp Lệ (Command Cheat Sheet)

### 🚀 1. Lập Trình & Khởi Động (Development)

| Lệnh               | Chức năng                                                           |
| ------------------ | ------------------------------------------------------------------- |
| `pnpm dev`         | **Chạy đồng thời tất cả ứng dụng** (Backend NestJS + Admin Next.js) |
| `pnpm dev:backend` | Chỉ khởi động Backend NestJS (`http://localhost:3000/api/v1`)       |
| `pnpm dev:admin`   | Chỉ khởi động Admin Dashboard Next.js (`http://localhost:3001`)     |

---

### 🧪 2. Kiểm Thử Hệ Thống (Testing & QA)

| Lệnh                | Chức năng                                                             |
| ------------------- | --------------------------------------------------------------------- |
| `pnpm test`         | **Chạy tất cả Unit & Integration tests** (Backend Jest + Web Vitest)  |
| `pnpm test:flutter` | Chạy toàn bộ Unit & Widget tests của 3 Flutter Apps & Shared Packages |
| `pnpm test:all`     | **Chạy 100% test toàn hệ thống** (Web + Backend + Flutter Apps)       |

---

### 🔨 3. Biên Dịch & Dọn Dẹp (Build & Maintenance)

| Lệnh         | Chức năng                                                                |
| ------------ | ------------------------------------------------------------------------ |
| `pnpm build` | **Biên dịch Production** cho Backend NestJS & Admin Web Next.js          |
| `pnpm lint`  | Kiểm tra cú pháp & lỗi tĩnh (ESLint + Next.js Lint) cho toàn bộ mã nguồn |
| `pnpm clean` | **Xóa sạch bộ nhớ tạm & build output** (`dist/` và `.next/`)             |

---

### 🗄️ 4. Quản Lý Database (Prisma & PostgreSQL)

| Lệnh                                                 | Chức năng                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------- |
| `docker compose -f backend/docker-compose.yml up -d` | Khởi động PostgreSQL 15 & Redis 7 trong Docker                |
| `pnpm --filter=backend prisma:migrate`               | Tạo & áp dụng bảng vào PostgreSQL tự động                     |
| `pnpm --filter=backend prisma:studio`                | Mở giao diện Web quản lý Database tại `http://localhost:5555` |
| `pnpm --filter=backend prisma:generate`              | Tạo lại TypeScript Client cho Prisma Models                   |

---

### 📱 5. Quản Lý Flutter Packages (Melos)

| Lệnh                   | Chức năng                                                  |
| ---------------------- | ---------------------------------------------------------- |
| `pnpm melos:bootstrap` | Liên kết dependency giữa các Flutter App & Shared Packages |
| `pnpm melos:analyze`   | Phân tích cú pháp code Dart toàn bộ 3 App                  |
| `pnpm melos:gen`       | Chạy build_runner cho Freezed & JSON Serializable          |

---

## 📚 Tài Liệu Chi Tiết

Xem các tài liệu chi tiết trong thư mục [`docs/`](./docs/00-index.md):

- [00-index.md](./docs/00-index.md) — Mục lục tài liệu
- [01-overview.md](./docs/01-overview.md) — Tổng quan kiến trúc hệ thống
- [10-database.md](./docs/10-database.md) — Schema PostgreSQL 17 models
- [15-monorepo.md](./docs/15-monorepo.md) — Hướng dẫn Monorepo & Melos
