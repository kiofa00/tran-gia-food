---
name: code-review
description: Kích hoạt khi người dùng yêu cầu "self-review", "/self-review", "self review", "review code", "kiểm tra code", "review pr", hoặc "audit quality". Đánh giá chất lượng logic, tuân thủ design tokens, an toàn kiểu dữ liệu, bảo mật và hiệu năng.
---

# Kỹ Năng Review Code — Tran Gia Food Monorepo

Kỹ năng đánh giá & review chất lượng mã nguồn tự động cho dự án Tran Gia Food.

---

## 1. Các Trục Đánh Giá (8 Review Axes)

### Trục 1 — Tuân Thủ Design Tokens (Design Tokens Compliance)

- 🔴 **[BLOCKER]** Cấm tuyệt đối hardcode mã màu Hex (`#FF6635`), RGB, hoặc cỡ chữ thô (`fontSize: 16`).
- **Flutter**: 100% dùng `AppColors.*`, `AppFontSize.*`, `AppFontWeight.*`, `AppRadius.*` từ `packages/shared_ui`.
- **Next.js**: 100% dùng `adminDesignTokens.*` từ `packages/shared_ui/tokens/` hoặc class TailwindCSS.

### Trục 2 — Kiểu Dữ Liệu & Mã Nguồn Sạch (Type Safety & Clean Code)

- 🔴 **[BLOCKER]** Cấm dùng kiểu `any` trong TypeScript. Phải dùng kiểu rõ ràng hoặc `unknown`.
- 🔴 **[BLOCKER]** Cấm trùng lặp code/enum/model đã có trong `packages/shared_ui` và `packages/shared_models`.
- 🟡 **[WARNING]** Tất cả hàm public phải có kiểu dữ liệu trả về (return type) tường minh.
- 🟡 **[WARNING]** Cấm `@ts-ignore` hoặc `@ts-expect-error` không có comment giải thích rõ lý do.

### Trục 3 — Quy Chuẩn Đặt Tên (Naming Convention)

- 🔴 **[BLOCKER]** Cấm tên biến viết tắt không rõ nghĩa: `d`, `tmp`, `res`, `r`, `cb`, `fn`, `e` (ngoại trừ biến đếm vòng lặp `i`, `j`).
- 🟡 **[WARNING]** Biến boolean phải đặt tên dạng `is*`, `has*`, `can*`, `should*` (ví dụ: `isLoading`, `hasError`).
- 🟡 **[WARNING]** Hàm phải đặt tên theo dạng Động từ + Danh từ (ví dụ: `fetchOrders`, `calculateTotal`, không đặt là `orders` hay `total`).
- 🟢 **[NIT]** Hằng số toàn cục phải viết `SCREAMING_SNAKE_CASE` (ví dụ: `TIMEOUT_MS`, `MAX_RETRY`).

### Trục 4 — Cấm Hardcode, Cấm Fallback & Bắt Buộc Đa Ngôn Ngữ

- 🔴 **[BLOCKER]** Cấm hardcode text hiển thị trên UI: bắt buộc 100% dùng translation/i18n (`t(...)` qua `useLocale()`, `AppLocalizations`).
- 🔴 **[BLOCKER]** Cấm hardcode fallback URLs (`localhost`, `10.0.2.2`). Thiếu biến môi trường phải throw Error tường minh (Fail-Fast).
- 🔴 **[BLOCKER]** Cấm hardcode mock data tĩnh trên UI: Dữ liệu phải được fetch qua Provider/Hook từ API thật.
- 🔴 **[BLOCKER]** Cấm số trơ không có tên trong logic: `setTimeout(fn, 3000)` → phải là `const TIMEOUT_MS = 3000`.
- 🔴 **[BLOCKER]** Cấm chuỗi trơ trong điều kiện: `if (status === 'pending')` → phải dùng enum `OrderStatus.PENDING`.
- 🔴 **[BLOCKER]** Cấm hardcode route URLs / inline regex: Phải đặt trong các file config tập trung (`routes.ts`, `regex.ts`, `constants.ts`, `app_routes.dart`).

### Trục 5 — An Toàn Bất Đồng Bộ & Xử Lý Lỗi (Async Safety & Error Handling)

- 🔴 **[BLOCKER]** Mọi `async/await` trong NestJS service phải bọc `try/catch` hoặc có `.catch()`. Cấm unhandled rejection.
- 🔴 **[BLOCKER]** Flutter: mọi `Future` phải có `.catchError()` hoặc được bọc trong `try/catch`.
- 🔴 **[BLOCKER]** Flutter: Cấm gọi protected API khi chưa đăng nhập (`hasToken == false`).
- 🟡 **[WARNING]** Bắt buộc xử lý đầy đủ 4 trạng thái: `loading`, `error`, `empty`, `data` cho mọi UI component có tải dữ liệu.
- 🟡 **[WARNING]** Cấm `catch (e) {}` rỗng (swallow errors). Phải log hoặc rethrow.

### Trục 6 — Kiến Trúc & Tách Biệt Trách Nhiệm (Separation of Concerns)

- 🔴 **[BLOCKER]** Cấm viết business logic / fetch API / state mutation phức tạp trực tiếp trong UI component. Bắt buộc tách ra Custom Hook (`use<Feature>.ts`) hoặc Riverpod Provider.
- 🔴 **[BLOCKER]** NestJS: Service không được import `Module` khác trực tiếp. Phải nhận dependency qua `constructor` (Dependency Injection).
- 🔴 **[BLOCKER]** Flutter: Widget không được gọi API trực tiếp. Phải qua Riverpod Provider/Repository.
- 🟡 **[WARNING]** Flutter: Widget không thay đổi state phải dùng `const constructor`.

### Trục 7 — Bảo Mật & Hiệu Năng (Security & Performance)

- 🔴 **[BLOCKER]** Cấm commit secret key, API key, password, token trong source code.
- 🔴 **[BLOCKER]** WebSocket listener / Timer / Stream subscription / Controller phải được `dispose()` / `cancel()` đúng chỗ. Cấm memory leak.
- 🟡 **[WARNING]** React component phải dùng `useMemo` / `useCallback` khi props là object / callback function để tránh re-render thừa.
- 🟡 **[WARNING]** Prisma query phải có `select` hoặc `include` cụ thể. Cấm `findMany()` không giới hạn trường.

### Trục 8 — Chiến Lược Kiểm Thử (Testing Strategy)

- 🔴 **[BLOCKER]** Tất cả NestJS Service (`*.service.ts`), utils (`formatters.ts`), custom hooks (`use*.ts`) **BẮT BUỘC có unit test**.
- 🟢 **[NIT]** UI Component (JSX/Flutter Widget) không yêu cầu unit test.

---

## 2. Phân Loại Mức Độ Lỗi (Severity Tiers)

| Mức     | Ký hiệu | Ý nghĩa                                                            | Hành động                       |
| ------- | ------- | ------------------------------------------------------------------ | ------------------------------- |
| Blocker | 🔴      | Crash runtime, lộ secret, hardcode token/màu/font, unhandled error | **Must fix trước khi hoàn tất** |
| Warning | 🟡      | Code smell, thiếu error state, magic number, vi phạm naming        | **Should fix**                  |
| Nit     | 🟢      | Đổi tên rõ hơn, thêm comment, tối ưu nhỏ                           | Optional                        |

---

## 3. Định Dạng Báo Cáo Bắt Buộc (Output Format)

Khi review, báo cáo theo mẫu sau:

```
## 🔍 Báo Cáo Review Mã Nguồn

### 🔴 Lỗi Nghiêm Trọng / Blocker (Bắt buộc sửa)
- [file:line] Mô tả lỗi + cách sửa

### 🟡 Cảnh Báo / Warning (Nên sửa)
- [file:line] Mô tả lỗi + cách sửa

### 🟢 Góp Ý / Nit (Tùy chọn)
- [file:line] Gợi ý cải thiện

### ✅ Tổng Kết
- Blockers: X | Warnings: Y | Nits: Z
- Trạng thái: PASS / FAIL (FAIL nếu còn bất kỳ blocker nào)
```

---

## 4. Quy Trình Kiểm Tra Bắt Buộc Trước Khi Báo Cáo

Trước khi xuất báo cáo review cho người dùng, AI Agent **BẮT BUỘC** thực hiện tuần tự:

1. **`pnpm fix`** — Tự động định dạng Prettier + ESLint --fix toàn workspace.
2. **`pnpm build`** — Đảm bảo toàn bộ workspace compile thành công (Next.js, NestJS, Flutter).
3. **Chính sách Git Push** — Giữ mọi thay đổi ở local. **KHÔNG** chạy `git commit` hay `git push` trừ khi người dùng kích hoạt skill push-code.
