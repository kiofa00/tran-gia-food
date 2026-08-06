# Project Rules — Tran Gia Food Monorepo

Tệp tổng hợp và điều hướng các quy định vận hành chính thức cho AI Agents trong dự án Tran Gia Food:

## 📜 1. Rules (Quy Định Cốt Lõi)

- **Quy tắc Git & Operational Policy (BẮT BUỘC SỐ 1)**: [`rules/agent-operational-rules.md`](./rules/agent-operational-rules.md)
  - 🛑 **CẤM TUYỆT ĐỐI**: KHÔNG ĐƯỢC tự ý chạy `git commit` hay `git push` khi chưa có lệnh/sự cho phép trực tiếp từ người dùng.
  - Testing Enforcement (không test UI component, chỉ test logic utils/hooks/backend).
  - Design Tokens Policy (không hardcode Hex/fontSize).
  - TailwindCSS Standard (sử dụng 100% TailwindCSS utility classes, cấm dùng inline style).
  - Linting Policy (`pnpm lint` auto-fix, 0 warnings).
- **Quy tắc Monorepo & Dependencies**: [`rules/monorepo-boundaries.md`](./rules/monorepo-boundaries.md)
  - Quản lý phụ thuộc giữa `apps/*`, `backend` và `packages/*`.
- **Quy tắc Review Code Nghiêm Ngặt**: [`rules/strict-code-review.md`](./rules/strict-code-review.md)
- **Quy chuẩn Flutter & React Best Practices**: [`rules/flutter-react-best-practices.md`](./rules/flutter-react-best-practices.md)

## 🛠️ 2. Skills (Kỹ Năng Chuyên Biệt)

- **Code Review Skill**: [`skills/code-review/SKILL.md`](./skills/code-review/SKILL.md)
  - Đánh giá chất lượng code theo 5 trục (Design tokens, Type safety, Logic, Testing, Security).

## 🔄 3. Workflows (Quy Trình Tự Động)

- **Self-Review Workflow**: [`workflows/self-review.md`](./workflows/self-review.md)
  - Checklist tự kiểm tra code (Lint, Test, Design Tokens) trước khi báo cáo kết quả cho người dùng.
