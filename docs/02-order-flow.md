# 📦 02 — Luồng Đặt Hàng & Trạng Thái Đơn

## Luồng Đặt Hàng (Order Flow)

```
Customer chọn món + áp voucher (nếu có)
      ↓
Chọn Pickup hoặc Delivery
      ↓
Xem phí ship (nếu Delivery) + tổng thanh toán sau voucher
      ↓
Thanh toán → Đơn tạo → PENDING
      ↓
Quán xác nhận → CONFIRMED
      ↓
[Delivery]                          [Pickup]
Hệ thống tìm shipper gần nhất       Khách đến quán lấy
      ↓                                    ↓
Shipper nhận → PICKING_UP           Quán bàn giao → COMPLETED
      ↓
Shipper đến quán lấy → DELIVERING
      ↓
Shipper giao xong → DELIVERED
  (shipper xác nhận + chụp ảnh minh chứng)
      ↓
Khách xác nhận OR tự động sau 15 phút → COMPLETED
      ↓
Hệ thống chia tiền tự động
      ↓
Customer đánh giá
```

---

## 🔄 Trạng Thái Đơn Hàng

| Status       | Ý nghĩa                                  | Ai trigger                     |
| ------------ | ---------------------------------------- | ------------------------------ |
| `PENDING`    | Đơn mới tạo, chờ quán xác nhận           | System (sau thanh toán)        |
| `CONFIRMED`  | Quán đã xác nhận, đang chuẩn bị          | Restaurant                     |
| `PICKING_UP` | Shipper đã nhận đơn, đang đến quán       | Shipper                        |
| `DELIVERING` | Shipper lấy hàng xong, đang giao         | Shipper                        |
| `DELIVERED`  | Shipper đã giao xong, chờ khách xác nhận | Shipper                        |
| `COMPLETED`  | Đơn hoàn tất, tiền được giải phóng       | Customer / Auto (15 phút)      |
| `CANCELLED`  | Đơn đã hủy                               | Customer / Restaurant / System |

> **DELIVERED vs COMPLETED:**
>
> - `DELIVERED` = Shipper đã giao xong, chờ khách xác nhận
> - `COMPLETED` = Khách xác nhận nhận hàng (hoặc auto sau 15 phút)
> - Tiền được giải phóng (release) sau khi COMPLETED

---

## ❌ Chính Sách Hủy Đơn

### Khi nào khách được hủy?

```
Trạng thái đơn   Khách được hủy?   Hoàn tiền?
─────────────────────────────────────────────
  PENDING             ✅ Có             Hoàn 100%
  CONFIRMED           ⚠️ Giới hạn     Hoàn 100% (nếu trong 2 phút)
  PICKING_UP          ❌ Không         Không hoàn
  DELIVERING          ❌ Không         Không hoàn
  DELIVERED           ❌ Không         Không hoàn
  COMPLETED           ❌ Không         Không hoàn
```

### Luồng hủy đơn

```
Khách nhấn "Hủy đơn" (chỉ hiện nút khi PENDING)
      ↓
Khách chọn lý do hủy (bắt buộc chọn):
  - Đặt nhầm món
  - Muốn đổi địa chỉ giao
  - Thôi không muốn nữa
  - Khác
      ↓
Hệ thống hủy đơn → status: CANCELLED
      ↓
Nhà hàng nhận thông báo hủy
      ↓
[Thanh toán online]: Hoàn tiền về phương thức ban đầu (MoMo/ngân hàng)
[Tiền mặt COD]: Không cần hoàn
```

### Hủy đơn nhiều lần (anti-abuse)

```
Nếu khách hủy > 5 đơn/tháng:
  → Hiển thị cảnh báo
  → > 10 lần: Yêu cầu xác nhận thêm bước trước khi đặt đơn mới
```

---

## 🔗 Xem Thêm

- [Logic chia tiền](./03-business-logic.md)
- [Quản lý shipper](./04-shipper.md)
- [Thanh toán & KYC](./05-payment-kyc.md)
