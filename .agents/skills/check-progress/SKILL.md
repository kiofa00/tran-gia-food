---
name: check-progress
description: Triggered when user types "/progress", "/tiến độ", "check progress", "kiểm tra tiến độ", "tiến độ dự án", or "báo cáo tiến độ". Scans the codebase and compares against docs/implementation_plan.md to report what is done and what is missing.
---

# Check Progress Skill — Tran Gia Food

Khi skill này được kích hoạt, thực hiện các bước sau:

## Bước 1 — Đọc Plan

Đọc file `docs/implementation_plan.md` (đặc biệt phần **Section 15 — Lộ Trình Phát Triển**, các Phase 1–5) để biết những gì cần làm.

## Bước 2 — Scan Codebase

Chạy các lệnh sau để thu thập dữ liệu thực tế:

```bash
# Backend modules
Get-ChildItem backend/src/modules -Directory | Select-Object Name

# Backend services có unit test không
Get-ChildItem backend/src/modules -Recurse -Filter "*.spec.ts" | Select-Object Name

# Flutter: đếm file dart theo từng app
Get-ChildItem apps/customer_app/lib -Recurse -Filter "*.dart" | Measure-Object
Get-ChildItem apps/restaurant_app/lib -Recurse -Filter "*.dart"
Get-ChildItem apps/shipper_app/lib -Recurse -Filter "*.dart"

# Admin web pages
Get-ChildItem apps/admin_web/src/app -Recurse -Filter "page.tsx" | Select-Object FullName

# Prisma schema — đếm models
Select-String "^model " backend/prisma/schema.prisma
```

## Bước 3 — Output Format Bắt Buộc

Báo cáo theo format sau, dùng emoji và bảng rõ ràng:

```
## 📊 Báo Cáo Tiến Độ — Tran Gia Food
> Cập nhật: [ngày giờ hiện tại]

### 🏗️ Backend (NestJS)
[Bảng: Module | Service | Unit Test | Ghi chú]

### 📱 Flutter Apps
[Bảng: App | Số file .dart | Screens có | Screens thiếu]

### 🖥️ Admin Web (Next.js)
[Bảng: Trang | Có code | Ghi chú]

### 📈 Tiến Độ Theo Phase
Phase 1 — MVP:         [████░░░░░░] X%
Phase 2 — Delivery:    [██░░░░░░░░] X%
Phase 3 — Payment:     [████████░░] X%
Phase 4 — Voucher:     [████████░░] X%
Phase 5 — Polish:      [██░░░░░░░░] X%

### 🔥 Ưu Tiên Tiếp Theo
1. [việc cần làm ngay nhất]
2. ...
```

## Lưu ý

- Chỉ báo cáo dựa trên **code thực tế** trong repo, không đoán mò.
- Nếu file tồn tại nhưng chỉ là scaffold (ít hơn 30 dòng code thực), đánh dấu ⚠️ scaffold.
- So sánh với `docs/18-client-implementation-plan.md` cho phần roadmap.
