# RANH GIỚI MONOREPO & QUẢN LÝ PHỤ THUỘC WORKSPACE

---

## 1. KIẾN TRÚC WORKSPACE

- **Gốc (Root Workspace)**: Quản lý thông qua `pnpm catalog:` và `Turborepo v2.10.8`.
- **Flutter Workspaces**: Quản lý thông qua `Melos v8.2.2` và Dart 3.5 native Pub Workspaces (`workspace:` trong `pubspec.yaml` gốc).

---

## 2. CÁC GÓI DÙNG CHUNG (SHARED PACKAGES)

- **`packages/shared_ui`**: Chứa toàn bộ Design Tokens Flutter (`AppColors`, `AppGradients`, `AppFontSize`, `AppFontWeight`, `AppRadius`, `AppShadows`), các component giao diện cơ bản (`AppButton`, `AppTextField`, `RestaurantCard`), và tệp JSON token thiết kế trung tâm (`tokens/base.json`, `customer-app.json`, `admin-web.json`...).
- **`packages/shared_models`**: Chứa các Dart Models, DTOs, và Enums dùng chung cho toàn bộ dự án (`OrderStatus`, `UserRole`, `PaymentMethod`, `TransactionType`, ...).
- **`packages/api_client`**: Client gọi HTTP REST API và WebSocket Service dùng chung cho các ứng dụng Flutter.
- **`backend`**: NestJS REST API, WebSocket Gateway (`delivery.gateway.ts`), và Prisma ORM kết nối cơ sở dữ liệu PostgreSQL.

---

## 3. CHIỀU PHỤ THUỘC BẮT BUỘC (DEPENDENCY DIRECTION)

- **Được phép**: Các ứng dụng con (`apps/*`) và Backend (`backend`) được phép import và sử dụng các gói dùng chung (`packages/*`).
- **🛑 CẤM TUYỆT ĐỐI**: Các gói dùng chung (`packages/*`) KHÔNG ĐƯỢC PHÉP import ngược lại các mô-đun thuộc các ứng dụng cụ thể trong `apps/*` hoặc `backend`.
