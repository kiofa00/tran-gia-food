# 💬 06 — Chat & Gọi Điện

## Nguyên Tắc Bảo Mật — Masked Number

```
Khách gọi cho Shipper:
  Không dùng số thật của khách hay shipper
  → Giao tiếp qua số trung gian (proxy number)
  → Cả hai không biết số thật của nhau
  → Sau khi đơn kết thúc (COMPLETED/CANCELLED), kết nối bị hủy
```

---

## 📲 In-app Chat

```
Khách mở đơn đang giao → nhấn nút "Chat"
  ↓
  Chat với Shipper:
    - Nhắn tin văn bản
    - Gửi ảnh (hướng dẫn đường, số nhà)
    - Template nhanh:
        "Giao trước cổng nhé"
        "Gọi khi đến nha"
        "Để đồ ở đầu hẻm giúp mình"

  Chat với Quán:
    - Hỏi về món, yêu cầu thêm
    - Template nhanh:
        "Ít đường thôi nha"
        "Thêm đá vào giúp mình"
        "Không hành không tỏi"
```

---

## 📞 In-app Call (Masked)

```
Khách nhấn "Gọi Shipper"
  ↓
Backend tạo proxy session (Stringee)
  ↓
Khách được kết nối tới Shipper qua proxy
  → Cả hai nghe/nói bình thường qua VOIP
  → Không ai biết số thật của nhau
  → Không cần dùng sim (chỉ cần internet)
```

---

## 👥 Ma Trận Giao Tiếp

| Từ | Tới | Chat | Gọi | Thời điểm |
|---|---|---|---|---|
| Customer | Shipper | ✅ | ✅ (masked) | Sau khi shipper nhận đơn |
| Customer | Quán | ✅ | ✅ (masked) | Sau khi đặt xong |
| Shipper | Customer | ✅ | ✅ (masked) | Khi đang giao |
| Shipper | Quán | ✅ | ✅ (masked) | Khi đến lấy hàng |
| Quán | Customer | ✅ | ✅ (masked) | Sau khi nhận đơn |

---

## 🔒 Giới Hạn & Bảo Vệ

```
Thời gian hoạt động:
  Chat/Call chỉ mở khi đơn active (CONFIRMED → DELIVERED)
  Sau COMPLETED: Khóa chat, lưu lịch sử 30 ngày

Lưu trữ:
  Admin có thể xem lịch sử chat nếu có tranh chấp
  Không lưu nội dung call (chỉ lưu log: thời gian, duration)

Báo cáo:
  Nút "Report" trong chat
  Lý do: Ngôn từ không phù hợp, quấy rối, spam
  → Admin nhận cảnh báo, xem xét xử lý
```

---

## 🛠️ Tech Stack

| Layer | Lựa chọn chính | Lựa chọn thay thế |
|---|---|---|
| **In-app Chat** | **Stringee Chat SDK** | Stream Chat SDK |
| **Masked Call / VOIP** | **Stringee Voice** | Twilio Proxy + Voice |
| **Lưu trữ chat** | Firebase Realtime DB | PostgreSQL |

> 💡 **Tại sao Stringee?**
> - Giải pháp Việt Nam → latency thấp hơn
> - Giá rẻ hơn Twilio đáng kể
> - Flutter SDK sẵn có
> - Hỗ trợ tiếng Việt

---

## 🔗 Xem Thêm
- [Order flow](./02-order-flow.md)
- [Notifications](./09-notifications.md)
- [Tech stack](./11-tech-stack.md)
