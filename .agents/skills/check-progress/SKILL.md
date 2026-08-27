---
name: check-progress
description: Kích hoạt khi người dùng gõ "/progress", "/tiến độ", "check progress", "kiểm tra tiến độ", "tiến độ dự án", hoặc "báo cáo tiến độ". Quét toàn bộ mã nguồn thực tế và đối chiếu với kế hoạch phát triển để báo cáo những gì đã hoàn thành và những gì còn thiếu.
---

# Kỹ Năng Kiểm Tra Tiến Độ — Tran Gia Food Monorepo

Khi kỹ năng này được kích hoạt, thực hiện **tuần tự** các bước sau:

---

## Bước 1 — Đọc Kế Hoạch Phát Triển (Plan)

Đọc tệp `docs/implementation_plan.md` (đặc biệt phần **Section 15 — Lộ Trình Phát Triển**, các Phase 1–5) để nắm rõ các hạng mục cần thực hiện.

---

## Bước 2 — Quét Mã Nguồn Thực Tế (Scan Codebase)

Chạy các lệnh sau để thu thập dữ liệu thực tế:

```bash
# Các module Backend
Get-ChildItem backend/src/modules -Directory | Select-Object Name

# Các Backend services có unit test không
Get-ChildItem backend/src/modules -Recurse -Filter "*.spec.ts" | Select-Object Name

# Flutter: đếm số lượng tệp dart theo từng app
Get-ChildItem apps/customer_app/lib -Recurse -Filter "*.dart" | Measure-Object
Get-ChildItem apps/restaurant_app/lib -Recurse -Filter "*.dart"
Get-ChildItem apps/shipper_app/lib -Recurse -Filter "*.dart"

# Các trang Admin Web
Get-ChildItem apps/admin_web/src/app -Recurse -Filter "page.tsx" | Select-Object FullName

# Đếm các Model trong Prisma schema
Select-String "^model " backend/prisma/schema.prisma
```

---

## Bước 3 — Định Dạng Báo Cáo Bắt Buộc (Output Format)

Báo cáo theo định dạng mẫu sau, sử dụng emoji và bảng biểu rõ ràng:

```
## 📊 Báo Cáo Tiến Độ Dự Án — Tran Gia Food
> Cập nhật: [ngày giờ hiện tại]

### 🏗️ Backend (NestJS)
[Bảng: Module | Service | Unit Test | Ghi chú]

### 📱 Flutter Apps
[Bảng: App | Số tệp .dart | Màn hình đã có | Màn hình còn thiếu]

### 🖥️ Admin Web (Next.js)
[Bảng: Trang | Trạng thái mã nguồn | Ghi chú]

### 📈 Tiến Độ Theo Giai Đoạn (Phase)
Phase 1 — Khởi tạo (MVP):        [████░░░░░░] X%
Phase 2 — Giao hàng (Delivery):  [██░░░░░░░░] X%
Phase 3 — Thanh toán (Payment):  [████████░░] X%
Phase 4 — Khuyến mãi (Voucher):  [████████░░] X%
Phase 5 — Hoàn thiện (Polish):   [██░░░░░░░░] X%

### 🔥 Các Đầu Việc Ưu Tiên Tiếp Theo
1. [việc cần làm ngay nhất]
2. [việc tiếp theo]
```

---

## Bước 4 — Lưu Báo Cáo Ra Tệp Markdown (BẮT BUỘC)

Sau khi tổng hợp xong báo cáo, **BẮT BUỘC** lưu nội dung vào tệp theo các bước:

### 4.1 — Xác định tên tệp theo thời gian hiện tại

- Tên tệp theo định dạng: `progress_YYYY-MM-DD_HH-mm.md`
- Sử dụng múi giờ Việt Nam (UTC+7). Ví dụ: `progress_2026-08-27_11-45.md`.

### 4.2 — Tạo thư mục lưu trữ nếu chưa có

```powershell
New-Item -ItemType Directory -Force -Path "docs/daily-progress" | Out-Null
```

### 4.3 — Ghi tệp bằng lệnh PowerShell

Sử dụng công cụ `run_command` với PowerShell để ghi tệp:

```powershell
$content = @'
[toàn bộ nội dung báo cáo markdown ở Bước 3]
'@

$content | Out-File -FilePath "docs/daily-progress/progress_<timestamp>.md" -Encoding utf8 -Force
Write-Host "Saved OK"
```

- **Thư mục làm việc (Cwd)**: `c:\Users\PC220218\Downloads\tran_gia_app`
- **Thời gian chờ (WaitMsBeforeAsync)**: `8000`

### 4.4 — Thông báo kết quả

Sau khi lưu xong, hiển thị đường dẫn liên kết có thể nhấp được:

```
✅ Báo cáo đã được lưu tại: [progress_<timestamp>.md](file:///c:/Users/PC220218/Downloads/tran_gia_app/docs/daily-progress/progress_<timestamp>.md)
```

---

## Quy Tắc Lưu Ý

- Chỉ báo cáo dựa trên **mã nguồn thực tế** trong kho mã nguồn, tuyệt đối không suy đoán.
- Nếu tệp tồn tại nhưng chỉ là khung sườn (scaffold - ít hơn 30 dòng code thực), đánh dấu ⚠️ Khung sườn (scaffold).
- Đối chiếu với `docs/18-client-implementation-plan.md` cho phần lộ trình.
- Tệp báo cáo **BẮT BUỘC** phải được tạo mỗi lần kỹ năng được kích hoạt, kể cả khi nội dung không đổi so với lần trước.
