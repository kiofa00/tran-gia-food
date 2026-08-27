# QUY TẮC REVIEW MÃ NGUỒN NGHIÊM NGẶT & ĐẢM BẢO CHẤT LƯỢNG

---

## 1. KHÔNG LỖI LINT VÀ KHÔNG LỖI TYPE (ZERO LINT & TYPE ERRORS)

- **ESLint & Dart Analysis**: Toàn bộ mã nguồn phải duy trì 0 cảnh báo (warnings) và 0 lỗi (errors) trên tất cả các subpackage.
- **Strict Typing (Kiểu Dữ Liệu Chặt Chẽ)**: CẤM TUYỆT ĐỐI sử dụng kiểu `any` trong TypeScript. Bắt buộc định nghĩa interface/type rõ ràng hoặc dùng `unknown` kèm type narrowing.
- **Bảo Toàn Tài Liệu Code**: Giữ nguyên tất cả các chú thích JSDoc và DartDoc khi tái cấu trúc mã nguồn.

---

## 2. TÁI SỬ DỤNG VÀ GIỮ MÃ NGUỒN SẠCH

- **Tái Sử Dụng Gói Dùng Chung**: Luôn kiểm tra `packages/shared_ui`, `packages/shared_models`, `packages/api_client` trước khi tạo helper hoặc widget mới.
- **Dọn Dẹp Mã Thừa (Dead Code Cleanup)**: Xóa toàn bộ imports không sử dụng, các lệnh `print()` hoặc `console.log()` debug trước khi hoàn tất tính năng.
- **Bắt Buộc Đa Ngôn Ngữ & Bản Địa Hóa**: Tuyệt đối không hardcode chuỗi text trên UI. Tất cả nhãn, thông báo, tiêu đề phải dùng localization / i18n hooks.
- **Tập Trung Hóa Cấu Hình & Hằng Số**: CẤM hardcode magic strings, magic numbers, đường dẫn route hoặc inline regex. Phải khai báo trong các file cấu hình tập trung.
- **🛑 CẤM TUYỆT ĐỐI HARDCODE & FALLBACK**: Cấm hardcode URL fallback (`localhost`, `10.0.2.2`), cấm hardcode mock data trên UI; thiếu biến môi trường phải ném `StateError` / `Error` rõ ràng (Fail-Fast).
- **Tách Biệt Trách Nhiệm (Separation of Concerns)**: Cấm viết business logic hoặc gọi API trực tiếp trong UI component. Phải tách ra Custom Hooks / Services / Providers.
