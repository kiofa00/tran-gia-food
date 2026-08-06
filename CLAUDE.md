# 🍜 Tran Gia Food Delivery — AI Coding Agent Guidelines & Context (`CLAUDE.md`)

File hướng dẫn và quy định tối ưu hóa cho AI Coding Assistants (Claude, Antigravity, Gemini...) khi làm việc trong dự án **Tran Gia Food Monorepo**.

---

## 📌 1. Project Overview & Architecture

Dự án là hệ thống Nền Tảng Giao Đồ Ăn **Tran Gia Food** được thiết kế theo mô hình **Hybrid Monorepo**:

- **Package Manager & Workspaces**: `pnpm v9.15.9` (`pnpm catalog:`).
- **Flutter Orchestration**: `Melos v8.2.2` & `Dart 3.5 Native Pub Workspaces`.

```
tran_gia_app/
├── apps/
│   ├── customer_app/      ← Flutter App (Khách hàng đặt món, tracking realtime)
│   ├── restaurant_app/    ← Flutter App (Quán ăn nhận đơn, quản lý món)
│   ├── shipper_app/       ← Flutter App (Tài xế giao hàng, popup đếm ngược 60s)
│   └── admin_web/         ← Next.js 14 App Router + Ant Design (Dashboard Quản trị & Fleet Map)
├── backend/               ← NestJS REST API + WebSocket Gateway + Prisma ORM (PostgreSQL/Redis)
├── packages/
│   ├── shared_ui/         ← Package chứa Design Tokens & UI Components Flutter dùng chung
│   ├── shared_models/     ← Package chứa Data Models & Enums Dart dùng chung
│   └── api_client/        ← Dart API Client
└── docs/                  ← Thư mục tài liệu kiến trúc (00-index.md ... 16-design-tokens.md)
```

---

## ⛔ 2. Strict Operational Rules for AI Agents (Quy Tắc Bắt Buộc)

### 🔴 Quy Tắc 1: Git Push Policy

- **TÍNH NĂNG CHỈ COMMIT & LƯU Ở LOCAL**: Không tự động `git push` sau mỗi chỉnh sửa.
- **CHỈ PUSH KHI CÓ LỆNH**: Chỉ thực hiện `git push` lên GitHub khi người dùng ra lệnh rõ ràng (Ví dụ: _"push code đi"_, _"push cho tôi"_).

### 🔴 Quy Tắc 2: Testing Strategy Policy

- **UI Components**: Các file UI JSX/Next.js pages, Flutter Widget screens (như `Header.tsx`, `HomeScreen.dart`, `LoginScreen.dart`...) **KHÔNG CẦN VIẾT UNIT TEST**.
- **Pure Logic & Utils & Services**: Tất cả các hàm Utilities (`formatters.ts`), Custom Hooks (`use*.ts`), NestJS Services (`*.service.ts`) và Database Queries **BẮT BUỘC PHẢI TEST 100%**.

### 🔴 Quy Tắc 3: Design Tokens Policy (Zero Hardcode)

- **TUYỆT ĐỐI KHÔNG HARDCODE MÃ HEX THÔ** (như `#FF6635`, `#FFD93D`) hoặc **KÍCH THƯỚC CHỮ THÔ** (`fontSize: 16`, `fontSize: 18`) trong mã nguồn UI.
- **FLUTTER APPS**: 100% sử dụng hằng số Token từ `packages/shared_ui`:
  - Màu sắc: `AppColors.primary`, `AppColors.surface`, `AppColors.success`...
  - Kích thước chữ: `AppFontSize.xs`, `AppFontSize.sm`, `AppFontSize.body`, `AppFontSize.md`, `AppFontSize.base`, `AppFontSize.title`, `AppFontSize.lg`, `AppFontSize.xl`, `AppFontSize.h1`, `AppFontSize.h2`.
  - Trọng lượng chữ: `AppFontWeight.regular`, `AppFontWeight.medium`, `AppFontWeight.semiBold`, `AppFontWeight.bold`, `AppFontWeight.extraBold`.
- **NEXT.JS ADMIN WEB**: 100% sử dụng module `adminDesignTokens` (kết nối từ `packages/shared_ui/tokens/base.json` & `admin-web.json`).

### 🔴 Quy Tắc 4: Linting & Code Quality Policy

- Chạy `pnpm fix` trước khi commit: tự động format (Prettier) + lint fix (ESLint) toàn bộ JS/TS.
- Chạy `pnpm check` trên CI: chỉ kiểm tra, không sửa file, block merge nếu fail.
- Giữ mã nguồn đạt **0 Errors, 0 Warnings**.

---

## 🛠️ 3. Quick CLI Commands Cheat Sheet

| Thao tác                          | Lệnh                | Dùng khi nào          |
| --------------------------------- | ------------------- | --------------------- |
| Chạy dev toàn bộ                  | `pnpm dev`          | Local                 |
| Chạy Backend dev                  | `pnpm dev:backend`  | Local                 |
| Chạy Admin Web dev                | `pnpm dev:admin`    | Local                 |
| Format + Lint fix (JS/TS)         | `pnpm fix`          | Trước khi commit      |
| Check format + lint (tất cả)      | `pnpm check`        | CI / pre-push         |
| Build toàn bộ (JS/TS + Flutter)   | `pnpm build`        | Release / CI          |
| Chạy toàn bộ Tests                | `pnpm test`         | CI                    |
| Sync DB schema                    | `pnpm db:migrate`   | Sau sửa schema.prisma |
| Generate Prisma Client            | `pnpm db:generate`  | Sau sửa schema.prisma |
| Seed dữ liệu mẫu                  | `pnpm db:seed`      | Setup lần đầu         |
| Mở Prisma Studio GUI              | `pnpm db:studio`    | Debug dữ liệu         |
| Generate Flutter code             | `pnpm melos:gen`    | Sau sửa model Dart    |
| Xóa build artifacts               | `pnpm clean`        | Khi cần reset         |

---

## 📚 4. Project Documentation References

- **Mục lục tài liệu**: [`docs/00-index.md`](file:///c:/Users/PC220218/Downloads/tran_gia_app/docs/00-index.md)
- **Quy định Design Tokens**: [`docs/16-design-tokens.md`](file:///c:/Users/PC220218/Downloads/tran_gia_app/docs/16-design-tokens.md)
- **Cấu trúc Monorepo**: [`docs/15-monorepo.md`](file:///c:/Users/PC220218/Downloads/tran_gia_app/docs/15-monorepo.md)
- **Database Schema**: [`docs/10-database.md`](file:///c:/Users/PC220218/Downloads/tran_gia_app/docs/10-database.md)
- **Roadmap lộ trình**: [`docs/14-roadmap.md`](file:///c:/Users/PC220218/Downloads/tran_gia_app/docs/14-roadmap.md)
