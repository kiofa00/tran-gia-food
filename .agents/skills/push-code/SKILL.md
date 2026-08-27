---
name: push-code
description: Kích hoạt khi người dùng gõ "/push", "push code", "commit đi", "push đi", "push lên", "commit và push". Chạy kiểm tra git status, xác nhận thông điệp commit nếu chưa có, sau đó thêm vào staging, commit và push toàn bộ thay đổi lên remote repository.
---

# Kỹ Năng Đẩy Mã Nguồn (Push Code) — Tran Gia Food Monorepo

Khi kỹ năng này được kích hoạt, thực hiện **tuần tự** các bước sau:

---

## Bước 1 — Kiểm Tra Trạng Thái Git (Git Status)

```bash
git status --short
git branch --show-current
```

Hiển thị cho người dùng thấy danh sách tệp thay đổi và nhánh (branch) hiện tại.

---

## Bước 2 — Xác Nhận Thông Điệp Commit (Commit Message)

- Nếu người dùng đã cung cấp thông điệp commit trong câu lệnh $\rightarrow$ sử dụng trực tiếp.
- Nếu chưa có $\rightarrow$ sử dụng công cụ `ask_question` để hỏi người dùng lựa chọn thông điệp commit phù hợp.
- Thông điệp commit phải tuân thủ chuẩn **Conventional Commits**: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`.

---

## Bước 3 — Đưa Vào Staging, Tạo Commit và Push

```bash
git add -A
git commit -m "<commit message>"
git push origin <branch>
```

---

## Bước 4 — Báo Cáo Kết Quả

Thông báo kết quả rõ ràng tới người dùng:

- ✅ Mã băm Commit (Commit hash)
- ✅ Nhánh đã đẩy mã nguồn (Pushed branch)
- ✅ Số lượng tệp tin thay đổi

---

## Quy Tắc Bắt Buộc

- 🛑 **CẤM TUYỆT ĐỐI**: KHÔNG tự ý chạy kỹ năng này khi người dùng chưa gõ lệnh rõ ràng.
- **KHÔNG push khi không có thay đổi**: Nếu `git status` báo không có tệp nào thay đổi $\rightarrow$ thông báo "Không có thay đổi để push".
- **LUÔN kiểm tra lint**: Chạy `pnpm fix` trước khi commit nếu có tệp TypeScript hoặc Dart thay đổi để đảm bảo mã nguồn sạch.
- **Xử lý xung đột**: Nếu `git push` thất bại (ví dụ: xung đột mã nguồn / conflict) $\rightarrow$ báo lỗi rõ ràng cho người dùng, **tuyệt đối KHÔNG tự ý force push (`--force`)**.
