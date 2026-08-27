# Quy Định Dự Án — Tran Gia Food Monorepo

Tệp tổng hợp và điều hướng các quy định vận hành chính thức cho AI Agents trong dự án Tran Gia Food Monorepo:

---

## 📜 1. Quy Định Cốt Lõi (Core Rules)

- **Quy tắc Git & Vận Hành (BẮT BUỘC SỐ 1)**: [`rules/agent-operational-rules.md`](./rules/agent-operational-rules.md)
  - 🛑 **CẤM TUYỆT ĐỐI**: KHÔNG ĐƯỢC tự ý chạy `git commit` hay `git push` khi chưa có lệnh rõ ràng qua skill `push-code`.
  - 🛑 **CẤM TUYỆT ĐỐI HARDCODE & FALLBACK**: Cấm hardcode URL fallback (`localhost`, `10.0.2.2`), cấm hardcode mock data trên UI, cấm magic strings/numbers; thiếu biến môi trường phải ném `StateError` / `Error` rõ ràng (Fail-Fast).
  - **Quy chuẩn Flutter**: 100% Design tokens (`AppColors`, `AppFontSize`, `AppRadius`), cấm gọi protected API khi chưa đăng nhập, xử lý đủ 4 states (`loading`, `error`, `empty`, `data`), giải phóng tài nguyên triệt để (clean disposal).
  - **Quy chuẩn TailwindCSS**: 100% utility classes trong Next.js (`apps/admin_web`), cấm dùng inline style.
  - **Chiến lược kiểm thử**: Không test UI component, bắt buộc 100% test logic utils/hooks/backend services.
  - **Đa ngôn ngữ & Bản địa hóa (i18n)**: Bắt buộc 100% UI text dùng translation key, cấm hardcode chuỗi trần.
  - **Tập trung hóa cấu hình**: Cấm inline regex, raw routes; phải khai báo file cấu hình tập trung.
  - **Tách biệt trách nhiệm**: Tách biệt 100% logic nghiệp vụ, state, gọi API ra Custom Hooks / Services / Providers; UI component thuần hiển thị.
  - **Chất lượng mã nguồn**: Duy trì 0 lỗi và 0 cảnh báo lint.
- **Ranh Giới Monorepo & Quản Lý Phụ Thuộc**: [`rules/monorepo-boundaries.md`](./rules/monorepo-boundaries.md)
  - Quản lý chiều phụ thuộc giữa `apps/*`, `backend` và `packages/*`.
- **Quy Tắc Review Mã Nguồn Nghiêm Ngặt**: [`rules/strict-code-review.md`](./rules/strict-code-review.md)
- **Quy Chuẩn Kỹ Thuật Flutter & React / Next.js**: [`rules/flutter-react-best-practices.md`](./rules/flutter-react-best-practices.md)

---

## 🛠️ 2. Kỹ Năng Chuyên Biệt (Specialized Skills)

- **Kỹ Năng Review Code**: [`skills/code-review/SKILL.md`](./skills/code-review/SKILL.md)
  - Đánh giá chất lượng code tự động theo 8 trục (Design Tokens, Kiểu dữ liệu, Quy chuẩn đặt tên, Cấm Hardcode & Fallback, An toàn bất đồng bộ, Kiến trúc, Bảo mật & Hiệu năng, Chiến lược kiểm thử).
- **Kỹ Năng Đẩy Mã Nguồn (Push Code)**: [`skills/push-code/SKILL.md`](./skills/push-code/SKILL.md)
  - Quy trình commit và push code lên remote repository an toàn.
- **Kỹ Năng Kiểm Tra Tiến Độ (Check Progress)**: [`skills/check-progress/SKILL.md`](./skills/check-progress/SKILL.md)
  - Đối chiếu mã nguồn thực tế với kế hoạch phát triển.
