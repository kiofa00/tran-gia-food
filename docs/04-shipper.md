# 🚴 04 — Quản Lý Shipper

## Đăng Ký & eKYC

```
Shipper điền thông tin → Upload CCCD, bằng lái xe
      ↓
Gửi lên 3rd party eKYC service:
  VNPT eKYC / FPT.AI eKYC
  → OCR nhận dạng tự động
  → Xác minh khuôn mặt (face matching / liveness check)
      ↓
Kết quả eKYC → Admin xem xét (với AI pre-screening hỗ trợ)
      ↓
Admin duyệt cuối → Shipper trả phí đăng ký → Tài khoản kích hoạt
```

### Thông tin cần nộp khi đăng ký
- CCCD / CMND (2 mặt)
- Bằng lái xe (loại A1 / B1 / B2)
- Ảnh selfie live (liveness check)
- Thông tin xe (biển số, loại xe)
- Tài khoản ngân hàng nhận payout

---

## 📋 Phân Công Đơn Tự Động

```
Đơn hàng mới tạo (CONFIRMED)
      ↓
Hệ thống tìm shipper phù hợp:
  Tiêu chí ưu tiên (theo thứ tự):
    1. Đang active (is_active = true)
    2. Gần quán nhất (distance)
    3. Tỉ lệ hủy thấp (cancel_rate)
    4. Rating cao (avg_rating)
      ↓
Gửi thông báo cho shipper #1 → 60 giây để chấp nhận
      ↓
[Chấp nhận] → Đơn gán cho shipper, status: PICKING_UP
[Từ chối / Hết giờ] → Gửi cho shipper #2 (tiếp theo trong danh sách)
      ↓
Lặp lại cho đến khi có shipper nhận
(Nếu không có shipper → thông báo quán + khách)
```

---

## ⚖️ Hệ Thống Phạt Shipper

### Tỉ lệ hủy đơn cao
```
> 10% (trong 30 ngày):
  Lần 1: Cảnh báo + email thông báo
  Lần 2: Giảm ưu tiên nhận đơn (xếp sau các shipper khác)
  Lần 3: Tạm khóa tài khoản 7 ngày
  Lần 4: Khóa vĩnh viễn + yêu cầu xét duyệt lại từ Admin
```

### Rating trung bình thấp
```
< 3.5 sao / 5 (sau ít nhất 20 đánh giá):
  → Cảnh báo + yêu cầu cải thiện trong 30 ngày
  → Sau 30 ngày vẫn < 3.5: Tạm khóa, Admin review
```

### Giao hàng trễ thường xuyên
```
Trễ > 30 phút so với ETA > 5 lần/tháng:
  → Ghi chú vào hồ sơ
  → Ảnh hưởng điểm ưu tiên nhận đơn
```

### Bảng penalty level
| Level | Trạng thái | Hậu quả |
|---|---|---|
| 0 | Bình thường | Nhận đơn như thường |
| 1 | Cảnh báo | Email thông báo |
| 2 | Giảm ưu tiên | Xếp sau trong queue |
| 3 | Tạm khóa 7 ngày | Không nhận được đơn |
| 4 | Khóa vĩnh viễn | Cần Admin unlock |

---

## 💰 Thu Nhập Shipper

Xem chi tiết tại [03-business-logic.md](./03-business-logic.md)

```
Mỗi đơn Delivery hoàn thành:
  ship_fee = 25.000đ
  Shipper nhận = 25.000đ × 85% = 21.250đ → Cash Wallet

Thứ Ba hàng tuần:
  → Sao kê tự động
  → Chuyển tiền vào Cash Wallet
  → Shipper rút về ngân hàng bất cứ lúc nào
```

---

## 🔗 Xem Thêm
- [Business logic & payout](./03-business-logic.md)
- [Notifications](./09-notifications.md)
