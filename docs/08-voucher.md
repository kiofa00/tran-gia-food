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

## 🔄 Luồng Dùng Voucher

```
Customer nhập mã voucher ở màn giỏ hàng
      ↓
Backend kiểm tra (theo thứ tự):
  1. Mã tồn tại?                  → Không: "Mã không hợp lệ"
  2. Còn hạn?                     → Hết: "Voucher đã hết hạn"
  3. Còn lượt?                    → Hết: "Voucher đã được dùng hết"
  4. User đã dùng chưa?           → Rồi: "Bạn đã dùng voucher này"
  5. Đơn tối thiểu đạt?           → Chưa: "Đơn tối thiểu Xđ"
  6. Áp dụng cho quán này?        → Không: "Voucher không áp dụng cho quán này"
  7. Đúng giờ áp dụng?            → Không: "Voucher chỉ dùng được 14h-17h"
      ↓
Valid → Hiển thị "Tiết kiệm Xđ" + cập nhật tổng tiền
      ↓
Customer đặt đơn → Ghi nhận VoucherUsage → used_count++
```

---

## 🗄️ Database Schema

```sql
Vouchers
  id              UUID PRIMARY KEY
  code            VARCHAR(20) UNIQUE NOT NULL
  type            ENUM('platform', 'restaurant', 'ship')
  discount_type   ENUM('percent', 'fixed', 'free_ship', 'buy_x_get_y')
  discount_value  DECIMAL(10,2)       -- % hoặc số tiền
  max_discount    DECIMAL(10,2)       -- cap cho % discount
  min_order_value DECIMAL(10,2)
  valid_from      TIMESTAMP
  valid_to        TIMESTAMP
  total_limit     INT                 -- NULL = unlimited
  used_count      INT DEFAULT 0
  per_user_limit  INT DEFAULT 1
  applicable_restaurant_ids  UUID[]  -- NULL = tất cả quán
  applicable_category_ids    UUID[]  -- NULL = tất cả danh mục
  applicable_hours           JSONB   -- {from: "14:00", to: "17:00"}
  applicable_order_type      ENUM('delivery', 'pickup', 'both')
  issued_by       UUID REFERENCES Users(id)
  created_at      TIMESTAMP

VoucherUsages
  id              UUID PRIMARY KEY
  voucher_id      UUID REFERENCES Vouchers(id)
  user_id         UUID REFERENCES Users(id)
  order_id        UUID REFERENCES Orders(id)
  discount_applied DECIMAL(10,2)     -- Số tiền thực tế được giảm
  used_at         TIMESTAMP
```

---

## 📊 Admin Dashboard — Quản Lý Voucher

- Tạo mới / chỉnh sửa / vô hiệu hóa voucher
- Xem thống kê: % sử dụng, tổng tiền đã giảm, số đơn áp dụng
- Phân tích hiệu quả: Voucher nào mang lại nhiều đơn nhất
- Gửi voucher cá nhân hóa cho customer (qua notification/email)

---

## 🔗 Xem Thêm

- [Business logic](./03-business-logic.md)
- [Notifications](./09-notifications.md)
