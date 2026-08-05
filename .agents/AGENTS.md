# Project Rules — Tran Gia Food Monorepo

Tệp tổng hợp và điều hướng các quy định vận hành chính thức cho AI Agents trong dự án Tran Gia Food:

## 📜 1. Rules (Quy Định Cốt Lõi)
- **Quy tắc Vận Hành & Testing Policy**: [`rules/agent-operational-rules.md`](./rules/agent-operational-rules.md)
  - Git Push Policy (chỉ push khi có lệnh).
  - Testing Enforcement (không test UI component, chỉ test logic utils/hooks/backend).
  - Design Tokens Policy (không hardcode Hex/fontSize).
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
  - Checklist tự kiểm tra code (Lint, Test, Design Tokens, Git Push) trước khi kết thúc task.
