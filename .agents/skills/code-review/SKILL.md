---
name: code-review
description: Triggered when user asks to "self-review", "/self-review", "self review", "review code", "kiểm tra code", "review pr", or "audit quality". Evaluates logic, design tokens compliance, type safety, security, and performance.
---

# Code Review Skill — Tran Gia Food Monorepo

Kỹ năng đánh giá & review chất lượng mã nguồn tự động cho dự án Tran Gia Food.

## 1. Các Trục Đánh Giá (5 Review Axes)

1. **Design Tokens Compliance**: Kiểm tra 100% màu sắc (`AppColors`, `adminDesignTokens`) và kích thước chữ (`AppFontSize`, `AppFontWeight`). Cấm tuyệt đối hardcode Hex hay font size thô.
2. **Type Safety & Clean Code**: Cấm dùng `any`. Không trùng lặp code đã có sẵn trong `packages/shared_ui` và `packages/shared_models`.
3. **Logic & Edge Cases**: Bắt buộc xử lý các trạng thái null, loading, error, empty state.
4. **Testing Strategy**: Đảm bảo các utils (`formatters.ts`), custom hooks và backend services đều được test. (Không yêu cầu test cho UI Component).
5. **Security & Performance**: Cấm lộ secret key, cấm leak memory WebSocket/Timer hay re-render không cần thiết.

## 2. Phân Loại Mức Độ Lỗi (Severity Tiers)

- 🔴 **[BLOCKER]**: Lỗi logic nặng, crash runtime, hardcode màu/font thô, lộ secret key. (Must fix trước khi commit).
- 🟡 **[WARNING]**: Code smell, lặp code, thiếu handle error case. (Should fix).
- 🟢 **[NIT]**: Đổi tên biến rõ nghĩa hơn, format code. (Optional).
