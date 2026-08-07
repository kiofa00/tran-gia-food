---
name: code-review
description: Triggered when user asks to "self-review", "/self-review", "self review", "review code", "kiểm tra code", "review pr", or "audit quality". Evaluates logic, design tokens compliance, type safety, security, and performance.
---

# Code Review Skill — Tran Gia Food Monorepo

Kỹ năng đánh giá & review chất lượng mã nguồn tự động cho dự án Tran Gia Food.

---

## 1. Các Trục Đánh Giá (8 Review Axes)

### Trục 1 — Design Tokens Compliance

- 🔴 **[BLOCKER]** Cấm tuyệt đối hardcode Hex (`#FF6635`), RGB, hoặc font size thô (`fontSize: 16`).
- **Flutter**: 100% dùng `AppColors.*`, `AppFontSize.*`, `AppFontWeight.*` từ `packages/shared_ui`.
- **Next.js**: 100% dùng `adminDesignTokens.*` từ `packages/shared_ui/tokens/`.

### Trục 2 — Type Safety & Clean Code

- 🔴 **[BLOCKER]** Cấm dùng `any` trong TypeScript. Phải dùng kiểu rõ ràng hoặc `unknown`.
- 🔴 **[BLOCKER]** Cấm trùng lặp code đã có trong `packages/shared_ui` và `packages/shared_models`.
- 🟡 **[WARNING]** Tất cả hàm public phải có return type annotation tường minh.
- 🟡 **[WARNING]** Cấm `@ts-ignore` hoặc `@ts-expect-error` không có comment giải thích rõ lý do.

### Trục 3 — Naming Convention

- 🔴 **[BLOCKER]** Cấm tên biến viết tắt không rõ nghĩa: `d`, `tmp`, `res`, `r`, `cb`, `fn`, `e` (ngoại trừ loop `i`, `j`).
- 🟡 **[WARNING]** Biến boolean phải đặt tên dạng `is*`, `has*`, `can*`, `should*` (vd: `isLoading`, `hasError`).
- 🟡 **[WARNING]** Hàm phải đặt tên theo verb + noun (vd: `fetchOrders`, `calculateTotal`, không phải `orders` hay `total`).
- 🟢 **[NIT]** Constant global phải viết SCREAMING_SNAKE_CASE (vd: `TIMEOUT_MS`, `MAX_RETRY`).

### Trục 4 — No Magic Numbers/Strings

- 🔴 **[BLOCKER]** Cấm số trơ không có tên trong logic: `setTimeout(fn, 3000)` → phải là `const TIMEOUT_MS = 3000`.
- 🔴 **[BLOCKER]** Cấm string trơ trong điều kiện: `if (status === 'pending')` → phải dùng enum `OrderStatus.PENDING`.
- 🟡 **[WARNING]** Cấm hardcode URL, port, endpoint trong source code. Phải đọc từ `process.env.*` hoặc config.

### Trục 5 — Async Safety & Error Handling

- 🔴 **[BLOCKER]** Mọi `async/await` trong NestJS service phải bọc `try/catch` hoặc có `.catch()`. Cấm unhandled rejection.
- 🔴 **[BLOCKER]** Flutter: mọi `Future` phải có `.catchError()` hoặc được bọc trong `try/catch`.
- 🟡 **[WARNING]** Bắt buộc xử lý đầy đủ 4 state: `loading`, `error`, `empty`, `success` cho mọi UI component có data fetching.
- 🟡 **[WARNING]** Cấm `catch (e) {}` rỗng (swallow errors). Phải log hoặc rethrow.

### Trục 6 — Architecture & Dependency Rules

- 🔴 **[BLOCKER]** NestJS: Service không được import `Module` khác trực tiếp. Phải nhận dependency qua `constructor` (Dependency Injection).
- 🔴 **[BLOCKER]** Flutter: Widget không được gọi API trực tiếp. Phải qua Repository/Provider/Riverpod.
- 🟡 **[WARNING]** Import order phải theo thứ tự: `React/Next` → Third-party → `@trangia/*` → Relative (`./`, `../`). Prettier plugin sort-imports tự động xử lý, nhưng cần check thủ công nếu có exception.
- 🟡 **[WARNING]** Flutter: Widget không thay đổi state phải dùng `const constructor`.

### Trục 7 — Security & Performance

- 🔴 **[BLOCKER]** Cấm commit secret key, API key, password, token trong source code.
- 🔴 **[BLOCKER]** WebSocket listener / Timer / Stream subscription phải được `dispose()`/`cancel()` đúng chỗ. Cấm memory leak.
- 🟡 **[WARNING]** Cấm re-render không cần thiết: React component phải dùng `useMemo`/`useCallback` khi props là object/function.
- 🟡 **[WARNING]** Prisma query phải có `select` hoặc `include` cụ thể. Cấm `findMany()` không giới hạn trường.

### Trục 8 — Testing Strategy

- 🔴 **[BLOCKER]** Tất cả NestJS Service (`*.service.ts`), utils (`formatters.ts`), custom hooks (`use*.ts`) **BẮT BUỘC có unit test**.
- 🟢 **[NIT]** UI Component (JSX/Flutter Widget) không yêu cầu unit test.

---

## 2. Phân Loại Mức Độ Lỗi (Severity Tiers)

| Mức     | Ký hiệu | Ý nghĩa                                                            | Hành động                     |
| ------- | ------- | ------------------------------------------------------------------ | ----------------------------- |
| Blocker | 🔴      | Crash runtime, lộ secret, hardcode token/màu/font, unhandled error | **Must fix trước khi commit** |
| Warning | 🟡      | Code smell, thiếu error state, magic number, vi phạm naming        | **Should fix**                |
| Nit     | 🟢      | Đổi tên rõ hơn, thêm comment, tối ưu nhỏ                           | Optional                      |

---

## 3. Output Format Bắt Buộc

Khi review, báo cáo theo format:

```
## 🔍 Code Review Report

### 🔴 BLOCKERs (must fix)
- [file:line] Mô tả lỗi + cách fix

### 🟡 WARNINGs (should fix)
- [file:line] Mô tả lỗi + cách fix

### 🟢 NITs (optional)
- [file:line] Gợi ý cải thiện

### ✅ Tổng kết
- Blockers: X | Warnings: Y | Nits: Z
- Trạng thái: PASS / FAIL (fail nếu có bất kỳ blocker nào)
```

---

## 4. Verification Checklist (Bắt Buộc Trước Khi Báo Cáo)

Trước khi xuất báo cáo review cho người dùng, AI Agent **BẮT BUỘC** thực hiện tuần tự:

1. **`pnpm fix`** — Auto-format Prettier + ESLint --fix toàn workspace.
2. **`pnpm build`** — Đảm bảo toàn bộ workspace compile thành công (Next.js, NestJS, Flutter).
3. **Git Push Policy** — Giữ mọi thay đổi ở local. **KHÔNG** chạy `git commit` hay `git push` trừ khi người dùng ra lệnh rõ ràng.
