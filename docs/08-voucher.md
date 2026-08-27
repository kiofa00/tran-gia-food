# 🎟️ 08 — Hệ Thống Coupon / Voucher

## Phân Loại Voucher

| Loại                              | Phát hành bởi | Ai chịu chi phí              |
| --------------------------------- | ------------- | ---------------------------- |
| **Platform voucher**              | Admin         | Platform                     |
| **Restaurant voucher**            | Quán          | Quán (trừ vào phần của quán) |
| **Ship voucher** (free/giảm ship) | Admin / Quán  | Platform hoặc Quán           |

---

## 🏷️ Các Kiểu Giảm Giá

```
1. Giảm % tổng đơn
   VD: Giảm 15% (tối đa 30.000đ)

2. Giảm tiền cố định
   VD: Giảm 20.000đ cho đơn từ 50.000đ

3. Miễn phí vận chuyển
   ship_fee = 0 (hoặc giảm 1 phần)

4. Mua X tặng Y
   VD: Đơn ≥ 100.000đ tặng 1 ly trà sữa

5. Combo deal
   VD: Combo A + B giảm 10% so với mua lẻ
```

---

## ✅ Điều Kiện Áp Dụng

```
- Đơn tối thiểu (min_order_value): ≥ 50.000đ
- Thời hạn: valid_from → valid_to
- Số lượt dùng tối đa: total_limit (VD: 1000 lượt toàn hệ thống)
- Giới hạn / user: per_user_limit (VD: mỗi user chỉ dùng 1 lần)
- Chỉ áp dụng cho quán: applicable_restaurant_ids
- Chỉ áp dụng loại hàng: applicable_category_ids
- Giờ áp dụng: applicable_hours (VD: 14h-17h happy hour)
- Kênh áp dụng: applicable_order_type (Delivery / Pickup / Cả hai)
```

---

## 🎁 Cơ Chế Ví Voucher & Lưu Voucher (ShopeeFood / Grab Model)

### 1. Phân biệt "Kho Voucher" và "Ví Của Tôi"

- **Kho Voucher (Public Voucher Center)**: Nơi hiển thị tất cả các voucher đang hoạt động trên hệ thống (Nền tảng, Quán ăn, Freeship). Khách hàng có thể tìm kiếm, xem điều kiện chi tiết và nhấn **"Lưu vào Ví" (Claim)**.
- **Ví Voucher của tôi (My Voucher Wallet)**: Quản lý các voucher mà người dùng đã lưu hoặc được Admin/Quán tặng riêng. Khi vào giỏ hàng hoặc checkout, hệ thống tự động tải các voucher từ ví để chọn nhanh 1 chạm.

### 2. Luồng Lưu (Claim) Voucher:

```
Khách hàng mở Kho Voucher
      ↓
Nhấn nút "Lưu" (Claim)
      ↓
Backend kiểm tra:
  1. Đã đăng nhập chưa?           → Chưa: Yêu cầu đăng nhập
  2. Voucher còn hạn & còn lượt?  → Hết: Thông báo "Voucher đã hết lượt lưu"
  3. User đã lưu trước đó chưa?   → Đã lưu: Thông báo "Bạn đã lưu voucher này"
      ↓
Hợp lệ → Tạo bản ghi UserVoucher (status: 'claimed')
      ↓
UI chuyển nút sang trạng thái "Đã lưu ✓" / "Dùng ngay"
```

---

## 🔄 Luồng Dùng Voucher Khi Đặt Đơn

```
Customer mở Giỏ hàng / Thanh toán
      ↓
Hệ thống tự động hiển thị Voucher từ "Ví Của Tôi" (hoặc nhập mã thủ công)
      ↓
Backend kiểm tra (theo thứ tự):
  1. Mã tồn tại & còn hạn?        → Không: "Mã không hợp lệ hoặc đã hết hạn"
  2. Còn lượt dùng toàn sàn?      → Hết: "Voucher đã được dùng hết"
  3. Giới hạn lượt dùng / user?   → Đã dùng đủ: "Bạn đã hết lượt dùng voucher này"
  4. Đơn tối thiểu đạt?           → Chưa: "Đơn tối thiểu Xđ"
  5. Áp dụng cho quán/danh mục?   → Không: "Voucher không áp dụng cho quán này"
  6. Đúng khung giờ áp dụng?      → Không: "Voucher chỉ dùng được trong khung giờ quy định"
      ↓
Valid → Hiển thị "Tiết kiệm Xđ" + cập nhật tổng tiền thanh toán
      ↓
Customer đặt đơn thành công:
  → Ghi nhận VoucherUsage (used_count++)
  → Cập nhật UserVoucher (status = 'used', used_at = now())
```

---

## 🗄️ Database Schema

```sql
Vouchers
  id                         VARCHAR(36) PRIMARY KEY
  code                       VARCHAR(20) UNIQUE NOT NULL
  type                       ENUM('platform', 'restaurant', 'ship')
  discount_type              ENUM('percent', 'fixed', 'free_ship', 'buy_x_get_y')
  discount_value             DECIMAL(10,2)       -- % hoặc số tiền
  max_discount               DECIMAL(10,2)       -- cap cho % discount
  min_order_value            DECIMAL(10,2)
  valid_from                 TIMESTAMP
  valid_to                   TIMESTAMP
  total_limit                INT                 -- NULL = unlimited
  used_count                 INT DEFAULT 0
  per_user_limit             INT DEFAULT 1
  applicable_restaurant_ids  VARCHAR(36)[]       -- NULL/empty = tất cả quán
  applicable_category_ids    VARCHAR(36)[]       -- NULL/empty = tất cả danh mục
  applicable_hours           JSONB               -- {from: "14:00", to: "17:00"}
  applicable_order_type      ENUM('delivery', 'pickup', 'both')
  restaurant_id              VARCHAR(36) REFERENCES Restaurants(id)
  issued_by                  VARCHAR(36) REFERENCES Users(id)
  created_at                 TIMESTAMP

UserVouchers (Ví Voucher Người Dùng)
  id          VARCHAR(36) PRIMARY KEY
  user_id     VARCHAR(36) REFERENCES Users(id) ON DELETE CASCADE
  voucher_id  VARCHAR(36) REFERENCES Vouchers(id) ON DELETE CASCADE
  status      ENUM('claimed', 'used', 'expired') DEFAULT 'claimed'
  claimed_at  TIMESTAMP DEFAULT NOW()
  used_at     TIMESTAMP NULL
  UNIQUE(user_id, voucher_id)

VoucherUsages (Lịch Sử Áp Dụng Đơn Hàng)
  id               VARCHAR(36) PRIMARY KEY
  voucher_id       VARCHAR(36) REFERENCES Vouchers(id)
  user_id          VARCHAR(36) REFERENCES Users(id)
  order_id         VARCHAR(36) REFERENCES Orders(id)
  discount_applied DECIMAL(10,2)     -- Số tiền thực tế được giảm
  used_at          TIMESTAMP DEFAULT NOW()
```

---

## 🌐 API Endpoints

| Method | Endpoint                     | Auth                   | Mô tả                                                                       |
| :----- | :--------------------------- | :--------------------- | :-------------------------------------------------------------------------- |
| `GET`  | `/api/v1/vouchers/active`    | Public / Optional Auth | Lấy danh sách voucher công khai trong Kho (trả kèm `isClaimed` nếu có Auth) |
| `POST` | `/api/v1/vouchers/:id/claim` | Bearer JWT             | Lưu voucher vào ví người dùng                                               |
| `GET`  | `/api/v1/vouchers/my-wallet` | Bearer JWT             | Lấy danh sách voucher trong ví của người dùng                               |
| `POST` | `/api/v1/vouchers/validate`  | Public / Bearer JWT    | Kiểm tra điều kiện áp dụng voucher cho đơn hàng                             |

---

## 📊 Admin Dashboard — Quản Lý Voucher

- Tạo mới / chỉnh sửa / vô hiệu hóa voucher
- Xem thống kê: % sử dụng, tổng tiền đã giảm, số đơn áp dụng
- Phân tích hiệu quả: Voucher nào mang lại nhiều đơn nhất
- Gửi voucher cá nhân hóa trực tiếp vào Ví của customer (qua notification/email)

---

## 🔗 Xem Thêm

- [Business logic](./03-business-logic.md)
- [Notifications](./09-notifications.md)
