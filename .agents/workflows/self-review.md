# SELF-REVIEW WORKFLOW

Mô tả quy trình tự kiểm tra chất lượng (Self-Review Checklist) mà AI Agent cần tự động thực hiện trước khi công bố hoàn thành một công việc:

---

## 📋 Self-Review Checklist

1. **Kiểm tra Lint & Formatting**:
   - Run `pnpm lint` và đảm bảo **0 errors, 0 warnings**.

2. **Kiểm tra Unit & Integration Tests**:
   - Run `pnpm test` và đảm bảo toàn bộ bộ test logic/services/utils pass 100%.

3. **Kiểm tra Design Tokens Compliance**:
   - Đảm bảo không có mã Hex thô (`#...`) hay font size thô (`fontSize: 16`) trong mã UI.
   - 100% tham chiếu qua `AppColors`, `AppFontSize`, `AppFontWeight`, `adminDesignTokens`.

4. **Kiểm tra Git Push Policy**:
   - Giữ tất cả thay đổi ở môi trường Local. KHÔNG chạy `git push` trừ khi người dùng ra lệnh.
