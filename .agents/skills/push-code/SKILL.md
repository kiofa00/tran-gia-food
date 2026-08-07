---
name: push-code
description: Triggered when user types "/push", "push code", "commit đi", "push đi", "push lên", "commit và push". Runs git status, asks for commit message if not provided, then stages, commits and pushes all changes.
---

# Push Code Skill — Tran Gia Food

Khi skill này được kích hoạt, thực hiện **tuần tự** các bước sau:

## Bước 1 — Kiểm Tra Trạng Thái

```bash
git status --short
git branch --show-current
```

Hiển thị cho user thấy danh sách file thay đổi và branch hiện tại.

## Bước 2 — Xác Nhận Commit Message

- Nếu user đã cung cấp commit message trong lệnh → dùng luôn.
- Nếu chưa có → dùng `ask_question` tool để hỏi user chọn commit message phù hợp.
- Commit message phải theo **Conventional Commits**: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`

## Bước 3 — Stage + Commit + Push

```bash
git add -A
git commit -m "<commit message>"
git push origin <branch>
```

## Bước 4 — Báo Cáo Kết Quả

Thông báo kết quả rõ ràng:

- ✅ Commit hash
- ✅ Branch đã push
- ✅ Số file thay đổi

## Quy Tắc Bắt Buộc

- **KHÔNG** tự ý chạy skill này khi user chưa gõ lệnh rõ ràng.
- **KHÔNG** push nếu `git status` báo không có thay đổi — thông báo "Không có thay đổi để push".
- **LUÔN** chạy `pnpm fix` trước khi commit nếu có file TypeScript/Dart thay đổi để đảm bảo lint sạch.
- Nếu `git push` thất bại (ví dụ conflict) → báo lỗi rõ ràng, **không** tự ý force push.
