# 🔧 11 — Tech Stack

## Mobile Apps (3 app riêng — Android + iOS)

| Layer                 | Package / Tech              | Ghi chú                     |
| --------------------- | --------------------------- | --------------------------- |
| **Framework**         | Flutter (Dart)              | 1 codebase → Android + iOS  |
| **State Management**  | flutter_riverpod            | Reactive, testable          |
| **Navigation**        | go_router                   | Declarative routing         |
| **HTTP Client**       | dio                         | Interceptors, retry         |
| **Maps**              | flutter_map (OpenStreetMap) | Không cần API key           |
| **Realtime**          | socket_io_client            | Tracking shipper            |
| **Push Notification** | firebase_messaging          | FCM                         |
| **Local Storage**     | hive                        | Fast, type-safe             |
| **Auth**              | firebase_auth               | Google/Apple/Facebook login |
| **eKYC**              | VNPT eKYC SDK / FPT.AI      | Shipper verification        |
| **Chat & Call**       | stringee_flutter_plugin     | In-app chat + masked call   |
| **Payments**          | momo_payment / vnpay        | MoMo, VNPay                 |

### Shared Packages (Monorepo)

| Package         | Nội dung                        |
| --------------- | ------------------------------- |
| `shared_models` | Dart models, enums, DTOs        |
| `shared_ui`     | Widget, Theme, Design System    |
| `api_client`    | HTTP client + all API endpoints |

### UI/UX Packages

| Package                | Mục đích              |
| ---------------------- | --------------------- |
| `flex_color_scheme`    | Theme Light/Dark      |
| `easy_localization`    | i18n (vi/en)          |
| `iconsax`              | Friendly icon set     |
| `lottie`               | Animation             |
| `shimmer`              | Skeleton loading      |
| `flutter_animate`      | Micro-animations      |
| `google_fonts`         | Inter + Nunito        |
| `cached_network_image` | Image với placeholder |

---

## Backend (NestJS)

| Layer                | Tech                                | Ghi chú                   |
| -------------------- | ----------------------------------- | ------------------------- |
| **Runtime**          | Node.js 20+                         | LTS                       |
| **Framework**        | NestJS                              | Modular, TypeScript       |
| **Database**         | PostgreSQL 15                       | Main DB                   |
| **Cache / Realtime** | Redis                               | Location, sessions        |
| **ORM**              | Prisma                              | Type-safe queries         |
| **Realtime**         | Socket.IO                           | Tracking, chat            |
| **Auth**             | Passport.js + JWT                   | Multi-strategy auth       |
| **Email**            | SendGrid                            | Transactional + marketing |
| **Push**             | Firebase Admin SDK                  | FCM notifications         |
| **File Storage**     | Firebase Storage                    | Images, documents         |
| **Maps**             | @googlemaps/google-maps-services-js | Distance Matrix           |
| **Payment**          | MoMo API, VNPay SDK                 | Payment gateway           |
| **Cron**             | @nestjs/schedule                    | Payout, open/close        |
| **API Docs**         | Swagger (OpenAPI)                   | Auto-gen từ decorators    |
| **Validation**       | class-validator                     | DTO validation            |

### Backend Module Structure

```
backend/src/
├── modules/
│   ├── auth/           ← JWT, OTP, social login
│   ├── users/          ← User CRUD, KYC
│   ├── restaurants/    ← Restaurant management
│   ├── menu/           ← Categories, items
│   ├── orders/         ← Order lifecycle
│   ├── shippers/       ← Shipper management, location
│   ├── payments/       ← MoMo, VNPay, COD
│   ├── commissions/    ← Auto fee splitting
│   ├── vouchers/       ← Coupon system
│   ├── notifications/  ← FCM + email
│   ├── chat/           ← Stringee integration
│   ├── maps/           ← Google Maps utils
│   └── admin/          ← Admin-only endpoints
├── common/
│   ├── guards/         ← Auth, roles
│   ├── decorators/
│   └── pipes/
└── main.ts
```

---

## Admin Dashboard (Next.js)

| Layer             | Tech                                     |
| ----------------- | ---------------------------------------- |
| **Framework**     | Next.js 14 (App Router)                  |
| **UI Components** | Ant Design 5                             |
| **Charts**        | Recharts                                 |
| **Maps**          | @vis.gl/react-google-maps                |
| **Data Fetching** | TanStack Query (React Query)             |
| **Forms**         | React Hook Form + Zod                    |
| **API Types**     | Auto-gen từ Swagger (openapi-typescript) |
| **Auth**          | NextAuth.js                              |
| **State**         | Zustand                                  |

---

## Infrastructure & DevOps

| Layer                | Tech                            |
| -------------------- | ------------------------------- |
| **Containerization** | Docker + Docker Compose         |
| **CI/CD**            | GitHub Actions                  |
| **Backend Deploy**   | Railway / Render / DigitalOcean |
| **Database**         | Supabase (PostgreSQL managed)   |
| **Redis**            | Upstash Redis (serverless)      |
| **Monitoring**       | Sentry (error tracking)         |
| **Logs**             | Logtail / Papertrail            |

---

## 🔗 Xem Thêm

- [Cấu trúc monorepo](./15-monorepo.md)
- [Database schema](./10-database.md)
