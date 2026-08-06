# 🎨 16 — Quy Định Sử Dụng Design Tokens

Tài liệu quy định và hướng dẫn sử dụng hệ thống Design Tokens dùng chung cho toàn bộ dự án Monorepo (3 Flutter Apps + 1 Next.js Admin Web).

---

## I. Cấu Trúc Thư Mục Tokens

```
packages/shared_ui/tokens/
├── base.json              ← Primitive color scales (Nguồn sự thật duy nhất - Source of Truth)
├── customer-app.json      ← Semantic tokens dành riêng cho Customer App
├── restaurant-app.json    ← Semantic tokens dành riêng cho Restaurant App
├── shipper-app.json       ← Semantic tokens dành riêng cho Shipper App
└── admin-web.json         ← Semantic tokens dành riêng cho Admin Web Next.js
```

---

## II. Quy Tắc Định Nghĩa & Khởi Tạo

1. **Primitive Tokens (`base.json`)**:
   - Chứa mã màu thô không mang ý nghĩa ngữ cảnh.
   - Ví dụ: `"orange-500": "#FF6635"`, `"yellow-400": "#FFD93D"`, `"green-500": "#2E7D32"`.

2. **Semantic Tokens (`[app-name].json`)**:
   - Gán ý nghĩa giao diện (primary, background, surface, status-success...).
   - Luôn sử dụng cú pháp `{token-name}` tham chiếu về `base.json`, tuyệt đối không hardcode hex thô vào component.
   - Ví dụ trong `customer-app.json`:
     ```json
     {
       "primary": "{orange-500}",
       "status-success": "{green-500}"
     }
     ```

---

## III. Sử Dụng Trong Giao Diện UI

### 1. Trong Flutter Apps (Customer / Shipper / Restaurant)

- Sử dụng trực tiếp các token constants trong `AppColors`, `AppGradients`, `AppRadius`:
  ```dart
  import 'package:shared_ui/shared_ui.dart';

  Container(
    color: AppColors.primary,
    borderRadius: const BorderRadius.all(AppRadius.md),
  );
  ```

### 2. Trong Next.js Admin Web (`apps/admin_web`)

- Tham chiếu các tokens trong `admin-web.json` để đồng bộ màu sắc thương hiệu `#FF6635` toàn hệ thống.
