# 🗂️ 15 — Cấu Trúc Monorepo

## Tại Sao Monorepo?

| | Monorepo | 4 Repo riêng |
|---|---|---|
| Chia sẻ code chung | ✅ Import trực tiếp | ❌ Phải publish package |
| Thay đổi API → cập nhật client | ✅ 1 commit, thấy ngay | ❌ Phải sync 4 repo |
| Quản lý | ✅ 1 git history | ❌ 4 CI/CD riêng |
| Phù hợp team nhỏ | ✅ | ❌ |

---

## 📁 Cấu Trúc Thư Mục

```
tran_gia_app/
│
├── apps/                              ← Các ứng dụng
│   ├── customer_app/                  ← Flutter (Customer)
│   │   ├── lib/
│   │   │   ├── main.dart
│   │   │   ├── features/
│   │   │   │   ├── home/
│   │   │   │   ├── restaurant/
│   │   │   │   ├── order/
│   │   │   │   ├── tracking/
│   │   │   │   └── profile/
│   │   │   └── app.dart
│   │   └── pubspec.yaml
│   │
│   ├── restaurant_app/                ← Flutter (Restaurant)
│   │   ├── lib/
│   │   │   ├── features/
│   │   │   │   ├── orders/           ← Nhận & quản lý đơn
│   │   │   │   ├── menu/
│   │   │   │   └── revenue/
│   │   └── pubspec.yaml
│   │
│   ├── shipper_app/                   ← Flutter (Shipper)
│   │   ├── lib/
│   │   │   ├── features/
│   │   │   │   ├── delivery/         ← Nhận đơn, navigation
│   │   │   │   ├── earnings/         ← Ví & payout
│   │   │   │   └── profile/
│   │   └── pubspec.yaml
│   │
│   └── admin_web/                     ← Next.js (Admin)
│       ├── src/
│       │   ├── app/                  ← Next.js App Router
│       │   ├── components/
│       │   └── lib/
│       └── package.json
│
├── packages/                          ← Code CHUNG cho Flutter apps
│   ├── shared_models/                 ← Dart models, enums, DTOs
│   │   ├── lib/
│   │   │   ├── models/
│   │   │   │   ├── user.dart
│   │   │   │   ├── order.dart
│   │   │   │   ├── restaurant.dart
│   │   │   │   ├── menu_item.dart
│   │   │   │   └── shipper.dart
│   │   │   └── enums/
│   │   │       ├── order_status.dart
│   │   │       ├── payment_method.dart
│   │   │       └── user_role.dart
│   │   └── pubspec.yaml
│   │
│   ├── shared_ui/                     ← Widget, Theme, Design System
│   │   ├── lib/
│   │   │   ├── theme/
│   │   │   │   ├── app_theme.dart    ← Light + Dark ThemeData
│   │   │   │   ├── app_colors.dart   ← Color tokens
│   │   │   │   └── app_typography.dart
│   │   │   ├── widgets/
│   │   │   │   ├── restaurant_card.dart
│   │   │   │   ├── food_item_tile.dart
│   │   │   │   ├── order_status_badge.dart
│   │   │   │   ├── app_button.dart
│   │   │   │   └── loading_shimmer.dart
│   │   │   └── providers/
│   │   │       └── theme_provider.dart
│   │   └── pubspec.yaml
│   │
│   └── api_client/                    ← HTTP client + endpoints
│       ├── lib/
│       │   ├── api_client.dart        ← Dio setup, interceptors
│       │   └── services/
│       │       ├── auth_service.dart
│       │       ├── order_service.dart
│       │       ├── restaurant_service.dart
│       │       └── shipper_service.dart
│       └── pubspec.yaml
│
├── backend/                           ← NestJS API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── orders/
│   │   │   ├── restaurants/
│   │   │   ├── shippers/
│   │   │   └── ...
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
├── docs/                              ← Tài liệu (folder này)
│   ├── 00-index.md
│   └── ...
│
├── melos.yaml                         ← Melos monorepo config
└── README.md
```

---

## 🔗 Cách Liên Kết Các Source

### Flutter Apps → Shared Packages

```yaml
# apps/customer_app/pubspec.yaml
name: customer_app

dependencies:
  flutter:
    sdk: flutter

  # Shared packages (local path)
  shared_models:
    path: ../../packages/shared_models
  shared_ui:
    path: ../../packages/shared_ui
  api_client:
    path: ../../packages/api_client

  # App-specific dependencies
  go_router: ^13.0.0
  flutter_riverpod: ^2.5.0
  google_maps_flutter: ^2.6.0
  firebase_messaging: ^14.9.0
  easy_localization: ^3.0.7
```

### Melos Setup

```yaml
# melos.yaml (root)
name: tran_gia_app

packages:
  - apps/**
  - packages/**

command:
  bootstrap:
    usePubspecOverrides: true

scripts:
  # Chạy tất cả apps
  analyze:
    run: melos run analyze --no-select
    description: Analyze all packages

  test:
    run: melos run test --no-select
    description: Test all packages

  # Build apps
  build:customer:
    run: flutter build apk --release
    packageFilters:
      scope: customer_app

  build:restaurant:
    run: flutter build apk --release
    packageFilters:
      scope: restaurant_app
```

### Admin Web → Backend (qua Swagger)

```bash
# Backend tự gen Swagger → http://localhost:3000/api-docs

# Admin web gen TypeScript types tự động từ Swagger:
npx openapi-typescript http://localhost:3000/api-json \
  -o apps/admin_web/src/types/api.ts

# Dùng types trong admin web:
import type { components } from '@/types/api';
type Order = components['schemas']['OrderDto'];
```

---

## 🚀 Quick Start

### Cài đặt lần đầu
```bash
# 1. Cài melos (nếu chưa có)
dart pub global activate melos

# 2. Bootstrap tất cả Flutter packages
cd tran_gia_app
melos bootstrap

# 3. Cài backend dependencies
cd backend
npm install

# 4. Cài admin web dependencies
cd apps/admin_web
npm install
```

### Chạy development
```bash
# Chạy backend
cd backend
npm run start:dev

# Chạy customer app
cd apps/customer_app
flutter run

# Chạy admin web
cd apps/admin_web
npm run dev

# Chạy tất cả cùng lúc (dùng tmux hoặc split terminal)
```

### Workflow thêm tính năng mới
```bash
# 1. Thêm model mới vào shared_models
# 2. Melos bootstrap lại để sync
melos bootstrap

# 3. Dùng model trong app
import 'package:shared_models/models/new_model.dart';

# 4. Thêm API endpoint vào backend (NestJS)
# 5. Thêm service vào api_client package
# 6. Gen lại types cho admin web
npx openapi-typescript ...
```

---

## 📦 Packages pubspec.yaml Mẫu

### shared_models/pubspec.yaml
```yaml
name: shared_models
description: Shared Dart models for Tran Gia Food apps
version: 0.0.1

environment:
  sdk: ">=3.0.0 <4.0.0"
  flutter: ">=3.16.0"

dependencies:
  flutter:
    sdk: flutter
  freezed_annotation: ^2.4.1
  json_annotation: ^4.8.1

dev_dependencies:
  build_runner: ^2.4.8
  freezed: ^2.4.7
  json_serializable: ^6.7.1
```

### shared_ui/pubspec.yaml
```yaml
name: shared_ui
description: Shared UI components and design system
version: 0.0.1

dependencies:
  flutter:
    sdk: flutter
  shared_models:
    path: ../shared_models
  flutter_riverpod: ^2.5.0
  flex_color_scheme: ^7.3.1
  easy_localization: ^3.0.7
  iconsax: ^0.0.8
  lottie: ^3.1.0
  shimmer: ^3.0.0
  flutter_animate: ^4.5.0
  google_fonts: ^6.2.1
  cached_network_image: ^3.3.1
```

---

## 🔗 Xem Thêm
- [Tech stack](./11-tech-stack.md)
- [Roadmap](./14-roadmap.md)
