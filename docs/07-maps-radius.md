# 🗺️ 07 — Google Maps & Bán Kính Giới Hạn

## Tính Phí Ship Theo Khoảng Cách

```
Phí ship = base_fee + (distance_km × rate_per_km)

Cấu hình mặc định (Admin chỉnh được):
  base_fee    = 10.000đ
  rate_per_km = 3.000đ/km

Ví dụ:
  distance = 2km → 10.000 + (2 × 3.000) = 16.000đ
  distance = 5km → 10.000 + (5 × 3.000) = 25.000đ
  distance = 8km → 10.000 + (8 × 3.000) = 34.000đ

Phí tối đa (cap): 50.000đ (Admin cấu hình)
```

### Cách tính khoảng cách
- Dùng **Google Distance Matrix API** — tính khoảng cách đường thực tế (không phải đường chim bay)
- Tính từ: địa chỉ quán → địa chỉ giao hàng của khách

---

## 📍 Hệ Thống Bán Kính Giới Hạn (Grab Model)

### Cơ chế hoạt động

```
Bình thường:
  Admin cấu hình system_radius = 10km
  Mỗi quán tự đặt radius riêng (restaurant_radius ≤ system_radius)

Khách đặt hàng:
  effective_radius = min(system_radius, restaurant_radius)
  Nếu distance > effective_radius → "Ngoài vùng giao hàng"

Giờ cao điểm (11h-13h, 17h-19h):
  Hệ thống tự động thu hẹp:
    system_radius = 7km (thay vì 10km)
  Lý do: Giảm tải shipper, đảm bảo tốc độ giao hàng

Sau giờ cao điểm:
  → Bán kính tự động quay về mức bình thường (10km)
```

### Ai có thể cấu hình?
- **Admin**: Đặt `system_radius` và `peak_hour_radius`
- **Restaurant**: Đặt `restaurant_radius` ≤ `system_radius`
- **Customer**: ❌ Không được chỉnh — chỉ thấy kết quả

### Thông báo ngoài vùng
```
Khi khách chọn địa chỉ ngoài vùng:
  → Ẩn quán đó khỏi danh sách kết quả
  → Hoặc hiển thị "Ngoài vùng giao hàng" với icon gray
  → Không cho thêm vào giỏ hàng
```

---

## 🚴 Tracking Shipper Real-time

```
Shipper app gửi location mỗi 3 giây (WebSocket)
      ↓
Backend lưu vào Redis (TTL: 10 giây)
      ↓
Customer app nhận location qua WebSocket
      ↓
Cập nhật marker shipper trên Google Maps (animate smooth)
```

### Độ chính xác & tối ưu pin
```
Khi shipper PICKING_UP / DELIVERING:
  → GPS update mỗi 3 giây (high accuracy)

Khi shipper idle (chờ đơn):
  → GPS update mỗi 30 giây (battery saver)
```

---

## 🗺️ Google Maps APIs Sử Dụng

| Feature | API | Ghi chú |
|---|---|---|
| Hiển thị bản đồ | Maps SDK for Flutter | Customer + Shipper app |
| Tính khoảng cách thực | Distance Matrix API | Tính phí ship |
| Bán kính giới hạn | Geometry Library (Circle) | Hiển thị vùng phủ |
| Navigation shipper | Directions API | Turn-by-turn |
| Tracking real-time | Maps SDK + WebSocket | Live marker |
| Geocoding địa chỉ | Geocoding API | Nhập địa chỉ → tọa độ |

### Chi phí API cần lưu ý
- Distance Matrix: $5/1000 requests → cache kết quả khi cùng tọa độ
- Maps SDK: Miễn phí đến 28k map loads/tháng

---

## 🔗 Xem Thêm
- [Tech stack](./11-tech-stack.md)
- [Order flow](./02-order-flow.md)
