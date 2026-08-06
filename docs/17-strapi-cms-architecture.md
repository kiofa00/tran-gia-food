# 🖼️ 17 — Universal Strapi Headless CMS Architecture Specification

> **Tầm nhìn:** Strapi Headless CMS đóng vai trò là **Trung tâm Quản lý Nội dung Toàn diện (Universal Dynamic Content Management)** cho toàn bộ hệ sinh thái Tran Gia Food. Cho phép Quản trị viên cập nhật từ bản dịch (Translations), văn bản hiển thị (App Text & Copy), Banner quảng cáo, Điều khoản dịch vụ đến FAQ hỗ trợ mà **không cần đẩy bản cập nhật mới lên App Store / Google Play**.

---

## 1. Tổng Quan Kiến Trúc CMS

```
                            ┌───────────────────────────────────┐
                            │    Strapi Admin Dashboard (CMS)   │
                            │       http://localhost:1337       │
                            └─────────────────┬─────────────────┘
                                              │ (REST / GraphQL API)
        ┌───────────────────┬─────────────────┴─────────────────┬───────────────────┐
        ▼                   ▼                                   ▼                   ▼
 📱 Customer App    🛵 Shipper App          🏪 Restaurant App      💻 Admin Web Portal
 - Dynamic i18n     - Dynamic i18n          - Dynamic i18n          - Embedded Content
 - Banners          - Announcements         - Quán Hướng Dẫn       - Banner Management
 - Help & FAQs      - Điều khoản            - FAQ Đối Tác           - Dynamic Text Rules
```

---

## 2. Danh Mục Quản Lý Nội Dung Toàn Diện (Content Types)

### A. Từ Điển Đa Ngôn Ngữ & Text Động (`api/translations`)

Quản lý toàn bộ nhãn văn bản (Labels, Button Texts, Placeholders, Error Messages) của 4 ứng dụng:

- `key`: String (vd: `home.search_placeholder`, `order.status_picking_up`)
- `locale`: Enum (`vi`, `en`)
- `appTarget`: Enum (`CUSTOMER`, `SHIPPER`, `RESTAURANT`, `ADMIN_WEB`, `ALL`)
- `value`: String (Nội dung văn bản hiển thị)
- `category`: String (Group danh mục: `ORDER`, `AUTH`, `PAYMENT`, `NAV`)

### B. Banner Marketing & Truyền Thông (`api/banners`)

- `title`: String (Tên chiến dịch)
- `imageUrl`: String (URL hình ảnh banner)
- `targetUrl`: String (Deeplink hoặc mã voucher áp dụng)
- `targetAudience`: Enum (`CUSTOMER`, `SHIPPER`, `RESTAURANT`, `ALL`)
- `displayOrder`: Integer (Thứ tự hiển thị)
- `activeFrom`: DateTime
- `activeTo`: DateTime
- `isActive`: Boolean

### C. Tin Tức & Thông Báo Hệ Thống (`api/announcements`)

- `title`: String
- `summary`: String (Tóm tắt hiển thị ở danh sách)
- `content`: Rich Text / Markdown (Nội dung chi tiết có hình ảnh/định dạng)
- `targetAudience`: Enum (`CUSTOMER`, `SHIPPER`, `RESTAURANT`, `ALL`)
- `priority`: Enum (`NORMAL`, `HIGH`, `URGENT`)
- `publishedAt`: DateTime

### D. Trung Tâm Hỗ Trợ FAQ & Hướng Dẫn Sử Dụng (`api/faq-items`)

- `category`: Enum (`ORDERING`, `PAYMENT`, `DELIVERY`, `ACCOUNT`, `PARTNER`)
- `targetApp`: Enum (`CUSTOMER`, `SHIPPER`, `RESTAURANT`)
- `question`: String (Câu hỏi)
- `answer`: Rich Text (Câu trả lời chi tiết)
- `displayOrder`: Integer

### E. Điều Khoản & Chính Sách Pháp Lý (`api/legal-policies`)

- `policyType`: Enum (`TERMS_OF_SERVICE`, `PRIVACY_POLICY`, `REFUND_POLICY`, `SHIPPER_RULES`)
- `version`: String (vd: `v2.1`)
- `content`: Rich Text (Nội dung pháp lý đầy đủ)
- `effectiveDate`: DateTime

---

## 3. Luồng Đồng Bộ Content Trên Client (Caching & Sync Strategy)

```
 Client khởi chạy App
         ↓
 Gọi API Strapi /api/translations?locale=vi
         ↓
 Có kết nối Internet?
   ├── YES ──► Tải bản dịch mới nhất ──► Lưu Cục bộ (Hive / LocalStorage Cache)
   └── NO  ──► Đọc bản dịch từ Cache Cục bộ ──► Hiển thị App bình thường
```

---

## 4. Lợi Ích Của Universal Headless CMS

1. **Cập nhật Instant (Thời gian thực)**: Sửa lỗi chính tả, thay đổi câu chữ nút bấm, cập nhật Banner chỉ trong 1 giây mà không cần Build lại App.
2. **Quản lý đa ngôn ngữ tập trung**: Dễ dàng bổ sung ngôn ngữ mới (Tiếng Anh, Tiếng Trung, Tiếng Hàn) từ một giao diện Web duy nhất.
3. **Phân quyền người dùng (Role-Based Access Control)**: Đội ngũ Marketing chỉ sửa Banner/Tin tức, Đội ngũ CSKH chỉ cập nhật FAQ mà không đụng vào cấu hình Kỹ thuật.
