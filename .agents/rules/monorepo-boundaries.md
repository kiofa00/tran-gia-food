# MONOREPO BOUNDARIES & WORKSPACE DEPENDENCIES

## 1. WORKSPACE ARCHITECTURE
- **Root**: Managed by `pnpm catalog:` and `Turborepo v2.10.8`.
- **Flutter Workspaces**: Managed by `Melos v8.2.2` and Dart 3.5 native Pub Workspaces (`workspace:` in root `pubspec.yaml`).

## 2. SHARED PACKAGES
- **`packages/shared_ui`**: Contains reusable Flutter theme tokens (`AppColors`, `AppGradients`, `AppFontSize`, `AppFontWeight`), atomic UI widgets (`AppButton`, `AppTextField`, `RestaurantCard`), and central JSON design tokens (`tokens/base.json`, `customer-app.json`, `admin-web.json`...).
- **`packages/shared_models`**: Shared Dart models, DTOs, and Enums (`enums_test.dart`).
- **`backend`**: NestJS REST API, WebSocket Gateway (`delivery.gateway.ts`), and Prisma ORM.

## 3. DEPENDENCY DIRECTION
- Apps (`apps/*`) and Backend (`backend`) may import shared packages (`packages/*`).
- Shared packages MUST NOT import application-specific modules from `apps/*` or `backend`.
