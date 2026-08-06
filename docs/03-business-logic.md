# 💰 03 — Business Logic: Hoa Hồng & Payout

## Logic Chia % Hoa Hồng

### Chia tiền đồ ăn

```
Giá đồ ăn = 100.000đ
Platform fee = 20%  (cấu hình bởi Admin)

→ Quán nhận:    80.000đ  (80%)
→ Platform:     20.000đ  (20%)
```

### Chia tiền phí ship

```
Phí ship = 25.000đ
Shipper share = 85%  (cấu hình bởi Admin)
Platform share = 15%

→ Shipper nhận: 21.250đ  (85%)
→ Platform:      3.750đ  (15%)
```

### Tổng platform revenue từ 1 đơn

```
Platform revenue = (food_subtotal × platform_food_rate%)
                 + (ship_fee × platform_ship_rate%)
```

### Voucher ảnh hưởng đến chia tiền

```
Nếu voucher giảm 20.000đ:
  Trước voucher: đồ ăn = 100.000đ
  Sau voucher:   khách trả = 80.000đ

Ai chịu voucher?
  → Voucher do Platform phát hành → Platform tự bù
  → Voucher do Quán phát hành     → Quán chịu (trừ vào phần của quán)
```

> **Lưu ý:** Admin có thể cấu hình % khác nhau cho từng quán hoặc theo tier (quán mới, quán VIP).

---

## 💼 Hệ Thống Ví & Payout (Mô Hình Grab)

### 2 loại ví cho Shipper

| Ví                                | Nguồn tiền             | Khấu trừ                   | Rút tiền                           |
| --------------------------------- | ---------------------- | -------------------------- | ---------------------------------- |
| **Cash Wallet (Ví tiền mặt)**     | Cước ship, thưởng, tip | Không                      | ✅ Rút về ngân hàng bất cứ lúc nào |
| **Account Wallet (Ví tài khoản)** | Tiền thưởng platform   | Phí dịch vụ, phí hoạt động | ❌ Không rút trực tiếp             |

### Chu kỳ payout hàng tuần (Grab model)

```
Thứ Hai → Chủ Nhật:
  Shipper chạy đơn, thu nhập tích lũy vào Cash Wallet

Thứ Ba (tuần tiếp theo):
  → Hệ thống tạo bản sao kê tự động
  → Gửi email sao kê cho shipper
  → Chuyển thu nhập ròng vào Cash Wallet

Shipper rút tiền:
  → Bất cứ lúc nào từ Cash Wallet → ngân hàng
  → Xử lý trong 1-2 ngày làm việc
```

### Nội dung bản sao kê hàng tuần

| Mục                   | Nguồn                   |
| --------------------- | ----------------------- |
| Tổng tiền cước ship   | Đơn Delivery hoàn thành |
| Tiền thưởng / hỗ trợ  | Thưởng từ platform      |
| Phí dịch vụ           | Trừ vào Account Wallet  |
| Điều chỉnh / khấu trừ | Admin override          |
| Lịch sử lệnh rút      | Cash Wallet → ngân hàng |

### Xử lý đơn COD (tiền mặt)

```
Shipper thu tiền mặt 100.000đ từ khách
      ↓
Platform khấu trừ platform_fee từ Cash Wallet của shipper
  (ví dụ platform_fee = 20.000đ)
      ↓
Thu nhập ròng của shipper = ship_fee × 85% (vào Cash Wallet)
```

### Payout cho Quán

- Tương tự shipper — nhận tiền đồ ăn trừ phí platform mỗi tuần
- Dashboard doanh thu theo ngày / tuần / tháng
- Lệnh rút on-demand về tài khoản ngân hàng đã liên kết

---

## 🔗 Xem Thêm

- [Luồng đặt hàng](./02-order-flow.md)
- [Thanh toán & KYC](./05-payment-kyc.md)
- [Voucher system](./08-voucher.md)
