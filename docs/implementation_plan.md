# 🍜 Food Delivery Platform — System Design Plan

## 👥 1. Các Bên Tham Gia (Actors)

| Vai trò | Mô tả |
|---|---|
| **Customer** | Đặt đồ ăn, chọn pickup hoặc giao hàng, thanh toán, dùng voucher |
| **Restaurant** | Quản lý menu, đơn hàng, xem doanh thu, tạo voucher |
| **Shipper** | Nhận đơn giao hàng, tracking, quản lý ví thu nhập |
| **Admin** | Quản lý toàn hệ thống, cấu hình % chia, duyệt tài khoản, phát hành voucher |

---

## 🗺️ 2. Kiến Trúc Tổng Quan

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENT APPS (Flutter)                  │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐    │
│  │ Customer App │   │Restaurant App│   │ Shipper App  │    │
│  │ Android/iOS  │   │ Android/iOS  │   │ Android/iOS  │    │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘    │
│         └──────────────────┼──────────────────┘             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Admin Dashboard (Next.js Web)           │   │
│  └──────────────────────────┬───────────────────────────┘   │
└─────────────────────────────┼────────────────────────────────┘
                              │ REST API / WebSocket
┌─────────────────────────────▼────────────────────────────────┐
│                        BACKEND (NestJS)                       │
│  Auth │ Order │ Payment │ Delivery │ Restaurant │ Commission  │
│  Notification │ Coupon │ Shipper │ Payout │ Penalty          │
│  Chat │ Call (Masked) │ Cancellation │ KYC/Wallet          │
└─────────────────────────────┬────────────────────────────────┘
                              │
    Google Maps │ MoMo/VNPay │ eKYC │ Firebase │ SendGrid
    Twilio (Masked Call) │ Stream Chat / Socket.IO
```

---

## 📱 3. Tính Năng Theo Từng Vai Trò

### 🧑 Customer App
- Đăng ký / đăng nhập (SĐT, Google, Apple)
- **Xác minh danh tính**: OTP, Face ID, CCCD (eKYC), liên kết ngân hàng
- Xem danh sách quán trong **bán kính giới hạn** (động theo giờ cao điểm)
- Tìm kiếm / lọc theo loại đồ ăn, giá, rating
- Chọn món, áp dụng **coupon/voucher**
- Chọn: **Pickup** (tự lấy) hoặc **Delivery** (giao tận nơi + phí ship)
- Thanh toán: MoMo, Ngân hàng liên kết, Tiền mặt
- **Hủy đơn** nếu đơn còn ở trạng thái PENDING
- **Tracking real-time** của shipper trên Google Maps
- **Chat / Gọi điện** cho Shipper hoặc Quán (số thật được ẩn)
- Xác nhận nhận hàng → đơn hàng COMPLETED
- Đánh giá quán và shipper
- Lịch sử đơn hàng

### 🍽️ Restaurant App / Dashboard
- Quản lý danh mục & menu (thêm, sửa, xóa món)
- **Lịch mở/đóng cửa tự động** — đặt giờ mở cửa, hệ thống tự bật/tắt
- Nhận & xác nhận đơn hàng (với âm thanh thông báo)
- Dashboard doanh thu: ngày / tuần / tháng
- Xem % phí nền tảng đã trừ
- **Tạo voucher** riêng cho quán (discount, free ship,...)
- Cấu hình bán kính phục vụ riêng (≤ bán kính hệ thống cho phép)

### 🚴 Shipper App
- Đăng ký + eKYC (CCCD, bằng lái) qua **3rd party eKYC**
- Nộp phí đăng ký / nhận đồng phục (theo dõi bởi Admin)
- Bật/tắt trạng thái sẵn sàng nhận đơn
- Nhận thông báo đơn tự động trong khu vực (60s để chấp nhận)
- Navigation Google Maps: Quán → Địa chỉ khách
- Update trạng thái đơn
- **Ví thu nhập** (2 loại ví theo mô hình Grab)
- Xem lịch sử đơn, đánh giá, tỉ lệ hủy đơn

### 🛡️ Admin Dashboard (Web)
- Quản lý tài khoản (duyệt quán, duyệt shipper + xem kết quả eKYC)
- Cấu hình % hoa hồng (đồ ăn, ship)
- Cấu hình bán kính giới hạn toàn hệ thống + tự động thu hẹp giờ cao điểm
- **Quản lý hệ thống voucher/coupon** (phát hành toàn platform)
- **Quản lý payout** (duyệt lệnh rút, xem sao kê)
- Quản lý hệ thống phạt shipper
- Báo cáo thống kê toàn hệ thống

---

## 💰 4. Logic Chia % Hoa Hồng

### 4.1 Chia tiền đồ ăn
```
Giá đồ ăn = 100.000đ
Platform fee = 20%  (cấu hình bởi Admin)

→ Quán nhận:    80.000đ
→ Platform:     20.000đ
```

### 4.2 Chia tiền phí ship
```
Phí ship = 25.000đ
Shipper share = 85%
Platform share = 15%

→ Shipper nhận: 21.250đ
→ Platform:      3.750đ
```

### 4.3 Voucher ảnh hưởng đến chia tiền
```
Nếu voucher giảm 20.000đ:
  Trước voucher: đồ ăn = 100.000đ
  Sau voucher:   khách trả = 80.000đ

Ai chịu voucher?
  → Nếu voucher do Platform phát hành → Platform tự bù
  → Nếu voucher do Quán phát hành → Quán chịu (trừ vào phần của quán)
```

---

## 📦 5. Luồng Đặt Hàng (Order Flow)

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

> **DELIVERED vs COMPLETED:**
> - `DELIVERED` = Shipper đã giao xong, chờ khách xác nhận
> - `COMPLETED` = Khách xác nhận nhận hàng (hoặc auto sau 15 phút)
> - Tiền được giải phóng (release) sau khi COMPLETED

---

## ❌ 5b. Chính Sách Hủy Đơn

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

### Hủy đơn nhiều lần
```
Nếu khách hủy > 5 đơn/tháng:
  → Hiển thị cảnh báo
  → > 10 lần: Yêu cầu xác nhận thêm bước trước khi đặt đơn mới
```

---

## 🔐 5c. Xác Minh Khách Hàng & Liên Kết Ngân Hàng (Grab Model)

### Các lớp xác thực

```
Layer 1 — Bắt buộc khi đăng ký:
  Số điện thoại + OTP
      ↓
  Tài khoản cơ bản (chỉ được đặt đồ ăn, COD hoặc MoMo)

Layer 2 — Nếu muốn liên kết ngân hàng:
  Nhập thông tin CCCD + chụp ảnh CCCD (eKYC)
  Xác minh khuôn mặt (Face ID / selfie live)
  NHẬP vào phần mềm eKYC đối tác (VNPT / FPT.AI)
      ↓
  Liên kết thẻ ngân hàng / tài khoản ngân hàng
  Xác nhận qua OTP ngân hàng
      ↓
  Mở khóa thanh toán ngân hàng + hoàn tiền tự động

Layer 3 — Bảo mật giao dịch:
  Giao dịch lớn yêu cầu xác thực lại qua Face ID hoặc PIN
```

### Tính năng ví trong app (Grab Wallet)
| Tính năng | Mô tả |
|---|---|
| **Liên kết ngân hàng** | Visa/Mastercard, ATM nội địa, VNPay QR |
| **Xác thực Face ID** | Thêm thẻ mới, giao dịch lớn |
| **Nạp tiền vào ví** | Qua ngân hàng, ATM, MoMo |
| **Lịch sử giao dịch** | Xem tất cả giao dịch vào/ra |
| **Hoàn tiền** | Tự động về ví khi hủy đơn |

---

## 💬 5d. Chat & Gọi Điện (Customer ↔ Shipper ↔ Quán) *(MỚI)*

### Nguyên tắc bảo mật — Masked Number
```
Khách gọi cho Shipper:
  Không dùng số thật của khách hay shipper
  → Giao tiếp qua số trung gian (Twilio Masked Calling)
  → Cả hai không biết số thật của nhau
  → Sau khi đơn kết thúc, số trung gian bị hủy
```

### In-app Chat
```
Khách mở đơn đang giao → nhấn nút Chat
      ↓
  Chat với Shipper:
    - Nhắn tin văn bản
    - Gửi ảnh (hướng dẫn đường)
    - Template nhanh: "Giao trước cổng", "Gọi khi tới"
  Chat với Quán:
    - Hỏi về món, yêu cầu thêm
    - Template: "Ít đường", "Thêm đá"
```

### In-app Call (Masked)
```
Khách nhấn "Gọi Shipper"
      ↓
Backend tạo số proxy tạm (Twilio)
      ↓
Khách được kết nối tới Shipper qua số proxy
  → Cả hai nghe/nói bình thường
  → Không ai biết số thật của nhau

Hoặc: Gọi VOIP trong app (Agora / Twilio Voice SDK)
  → Không cần dùng sim, chỉ cần internet
```

### Ai có thể chat / gọi ai?

| Từ | Tới | Chat | Gọi |
|---|---|---|---|
| Customer | Shipper | ✅ (trong khi đơn đang giao) | ✅ (masked) |
| Customer | Quán | ✅ (sau khi đặt) | ✅ (masked) |
| Shipper | Customer | ✅ | ✅ (masked) |
| Shipper | Quán | ✅ (khi đến lấy hàng) | ✅ (masked) |
| Quán | Customer | ✅ | ✅ (masked) |

### Giới hạn chat
```
- Chỉ mở chat khi đơn đang active (CONFIRMED → DELIVERED)
- Sau khi COMPLETED: Khóa chat, lưu lịch sử 30 ngày (admin có thể xem)
- Có nút báo cáo (report) nếu có hành vi xấu
```

### Tech cho Chat & Call
| Layer | Option 1 | Option 2 |
|---|---|---|
| **In-app Chat** | **Stream Chat SDK** (Flutter) | Socket.IO custom |
| **Masked Call** | **Twilio Proxy** | Stringee (VN local) |
| **VOIP in-app** | **Agora** | Twilio Voice |
| **Lưu trữ chat** | **Firebase Realtime DB** | PostgreSQL |

> 💡 **Gợi ý:** Dùng **Stringee** cho cả chat lẫn voice call — là giải pháp Việt Nam, hỗ trợ tốt, giá rẻ hơn Twilio, có sẵn Flutter SDK.

---

## 🗺️ 6. Google Maps & Bán Kính Giới Hạn

### Tính phí ship theo khoảng cách
```
Phí ship = base_fee + (distance_km × rate_per_km)

Ví dụ:
  base_fee = 10.000đ
  rate_per_km = 3.000đ/km
  distance = 5km → Phí ship = 25.000đ
```

### Hệ thống bán kính động (theo mô hình Grab)

```
Bình thường:
  Admin cấu hình radius = 10km (toàn hệ thống)
  Mỗi quán tự đặt radius riêng ≤ 10km

Giờ cao điểm (11h-13h, 17h-19h):
  Hệ thống tự động thu hẹp radius xuống (ví dụ 7km)
  để giảm tải shipper

Khách đặt ngoài vùng:
  → Hiển thị "Ngoài vùng giao hàng" và không cho đặt đơn

Sau giờ cao điểm:
  → Bán kính tự động quay về mức bình thường
```

- **Quán tự giới hạn nhỏ hơn:** ✅ Có — quán đặt radius riêng ≤ system limit
- **Khách không thể chỉnh:** ✅ Đúng — chỉ Admin và Quán mới cấu hình được

### Google Maps tích hợp
| Feature | API |
|---|---|
| Hiển thị bản đồ | Maps SDK for Flutter |
| Tính khoảng cách thực | Distance Matrix API |
| Tính phí ship | Distance Matrix API |
| Tracking shipper real-time | Maps SDK + WebSocket |
| Bán kính giới hạn | Geometry Library (Circle) |
| Navigation cho shipper | Directions API |

---

## 🕒 7. Giờ Mở Cửa Tự Động (Restaurant)

```
Restaurant cấu hình lịch:
  Thứ 2 - Thứ 6: 08:00 - 22:00
  Thứ 7 - CN:    09:00 - 23:00

Hệ thống backend chạy cron job mỗi phút:
  → Kiểm tra giờ hiện tại
  → Tự động set is_open = true/false

Restaurant cũng có thể override thủ công:
  "Đóng cửa sớm hôm nay" → ghi đè tạm thời
```

---

## 💳 8. Thanh Toán

### MoMo / VNPay (online)
- Tích hợp SDK, redirect thanh toán
- Webhook nhận xác nhận → release đơn hàng
- Refund nếu quán hủy

### Tiền mặt (COD)
- Shipper thu tiền mặt từ khách
- Grab model: Grab khấu trừ phần platform fee từ ví tiền mặt của shipper
- Thu nhập ròng của shipper vào ví tiền mặt

---

## 💼 9. Hệ Thống Ví & Payout (Mô Hình Grab)

### 2 loại ví cho Shipper
| Ví | Nguồn tiền | Khấu trừ | Rút tiền |
|---|---|---|---|
| **Ví tiền mặt** | Cước ship, thưởng, tip | Không | ✅ Rút về ngân hàng |
| **Ví tài khoản** | Tiền thưởng platform | Phí dịch vụ, phí hoạt động | ❌ Không rút trực tiếp |

### Chu kỳ payout (theo Grab)
```
Thứ Hai → Chủ Nhật: Shipper chạy đơn, thu nhập tích lũy vào ví

Thứ Ba (tuần sau):
  → Hệ thống tạo bản sao kê tự động
  → Gửi email sao kê cho shipper
  → Chuyển tiền vào ví tiền mặt

Shipper rút tiền:
  → Bất cứ lúc nào từ ví tiền mặt → ngân hàng
```

### Bản sao kê hàng tuần bao gồm
- Tổng tiền cước ship nhận được
- Tiền thưởng / hỗ trợ
- Phí sử dụng ứng dụng (trừ vào ví tài khoản)
- Điều chỉnh / khấu trừ khác
- Lịch sử lệnh rút (đang xử lý / đã duyệt / từ chối)

### Payout cho Quán
- Tương tự: nhận tiền đồ ăn trừ phí platform mỗi tuần
- Dashboard xem doanh thu theo ngày / tuần / tháng

---

## 🚴 10. Quản Lý Shipper

### Đăng ký & eKYC
```
Shipper điền thông tin → Upload CCCD, bằng lái xe
      ↓
Gửi lên 3rd party eKYC service:
  VNDirect eKYC / VNPT eKYC / FPT.AI eKYC
  → OCR nhận dạng tự động
  → Xác minh khuôn mặt (face matching)
      ↓
Kết quả eKYC → Admin xem xét (với AI pre-screening hỗ trợ)
      ↓
Admin duyệt cuối → Shipper trả phí đăng ký → Tài khoản kích hoạt
```

### Phân công đơn tự động
```
Đơn hàng mới tạo
      ↓
Hệ thống tìm shipper:
  1. Đang active + gần quán nhất
  2. Tỉ lệ hủy thấp + rating cao (ưu tiên)
      ↓
Gửi thông báo cho shipper → 60 giây để chấp nhận
      ↓
Nếu từ chối / không phản hồi → gửi cho shipper tiếp theo
```

### Hệ thống phạt Shipper
```
Tỉ lệ hủy đơn cao (> 10%):
  Cảnh báo lần 1 → Giảm ưu tiên nhận đơn
  Cảnh báo lần 2 → Tạm khóa tài khoản 7 ngày
  Cảnh báo lần 3 → Khóa vĩnh viễn, yêu cầu xét duyệt lại

Rating trung bình thấp (< 3.5 sao / 5):
  → Cảnh báo + yêu cầu cải thiện trong 30 ngày
  → Không đạt → tạm khóa, review bởi Admin

Giao hàng trễ thường xuyên:
  → Ghi chú vào hồ sơ, ảnh hưởng điểm ưu tiên nhận đơn
```

---

## 🎟️ 11. Hệ Thống Coupon / Voucher *(MỚI)*

### Phân loại voucher
| Loại | Phát hành bởi | Ai chịu chi phí |
|---|---|---|
| **Platform voucher** | Admin | Platform |
| **Restaurant voucher** | Quán | Quán (trừ vào phần của quán) |
| **Shipper voucher** (free/giảm ship) | Admin / Quán | Platform hoặc Quán |

### Các kiểu giảm giá
```
1. Giảm % tổng đơn       → VD: Giảm 15% (tối đa 30.000đ)
2. Giảm tiền cố định      → VD: Giảm 20.000đ
3. Miễn phí vận chuyển   → ship_fee = 0
4. Mua X tặng Y          → Order ≥ 100.000đ tặng 1 món cụ thể
5. Combo deal            → Giảm giá cho combo món nhất định
```

### Điều kiện áp dụng voucher
```
- Đơn tối thiểu: Ví dụ áp dụng khi order ≥ 50.000đ
- Thời hạn: Từ ngày → đến ngày
- Số lượt dùng tối đa: Toàn hệ thống (VD: 1000 lượt)
- Giới hạn / user: VD mỗi user chỉ dùng 1 lần
- Chỉ áp dụng quán: Voucher chỉ dùng được tại quán A, B
- Chỉ áp dụng loại hàng: VD voucher chỉ dùng được cho đồ uống
- Giờ áp dụng: VD chỉ dùng được 14h-17h (happy hour)
```

### Luồng dùng voucher
```
Customer nhập mã voucher ở màn giỏ hàng
      ↓
Hệ thống kiểm tra:
  1. Mã tồn tại?
  2. Còn hạn?
  3. Còn lượt?
  4. User đã dùng chưa?
  5. Điều kiện đơn tối thiểu đạt?
  6. Áp dụng cho quán này?
      ↓
Valid → Hiển thị số tiền tiết kiệm
Invalid → Hiển thị lý do lỗi rõ ràng
      ↓
Đặt đơn → Voucher trừ vào đơn hàng → Ghi nhận lượt dùng
```

### Database Voucher
```
Vouchers
  id, code, type (platform/restaurant), discount_type,
  discount_value, max_discount, min_order_value,
  valid_from, valid_to, total_limit, used_count,
  per_user_limit, applicable_restaurant_ids,
  applicable_category_ids, issued_by

VoucherUsages
  id, voucher_id, user_id, order_id, discount_applied, used_at
```

---

## 🔔 12. Hệ Thống Notification *(MỚI)*

### Kênh thông báo
| Kênh | Công nghệ | Dùng khi |
|---|---|---|
| **Push Notification** | Firebase Cloud Messaging (FCM) | Thông báo real-time trong app |
| **Email** | SendGrid / Nodemailer | Sao kê, xác nhận, marketing |
| **In-app Alert** | WebSocket / local | Thông báo khi đang dùng app |

### Thông báo theo từng vai trò

#### 📲 Customer
| Sự kiện | Push | Email |
|---|---|---|
| Đặt hàng thành công | ✅ | ✅ |
| Quán xác nhận đơn | ✅ | - |
| Shipper nhận đơn | ✅ | - |
| Shipper đang đến | ✅ | - |
| Giao hàng thành công | ✅ | ✅ |
| Quán hủy đơn | ✅ | ✅ |
| Voucher mới | ✅ | ✅ |
| Khuyến mãi từ quán yêu thích | ✅ | - |

#### 📲 Restaurant
| Sự kiện | Push | Email |
|---|---|---|
| Đơn hàng mới | ✅ (âm thanh) | - |
| Shipper đến lấy hàng | ✅ | - |
| Sao kê doanh thu hàng tuần | - | ✅ |
| Tài khoản được duyệt | ✅ | ✅ |
| Payout thành công | ✅ | ✅ |

#### 📲 Shipper
| Sự kiện | Push | Email |
|---|---|---|
| Đơn hàng mới gần đây | ✅ | - |
| Đơn bị hủy | ✅ | - |
| Bị cảnh báo phạt | ✅ | ✅ |
| Sao kê thu nhập hàng tuần | - | ✅ |
| Payout thành công | ✅ | ✅ |
| Tài khoản được duyệt | ✅ | ✅ |

#### 📲 Admin
| Sự kiện | Push | Email |
|---|---|---|
| Shipper mới cần duyệt | ✅ | ✅ |
| Quán mới cần duyệt | ✅ | ✅ |
| Báo cáo doanh thu hàng tuần | - | ✅ |

### Template Email mẫu
```
[Đặt hàng thành công]
  Tiêu đề: Đơn hàng #12345 đã được xác nhận 🎉
  Nội dung: Chi tiết đơn, tổng tiền, thời gian dự kiến

[Sao kê shipper hàng tuần]
  Tiêu đề: Sao kê thu nhập tuần 28/07 - 03/08
  Nội dung: Bảng chi tiết (số đơn, tổng cước, phí dịch vụ, thu nhập ròng)

[Voucher mới]
  Tiêu đề: 🎁 Voucher giảm 20% dành riêng cho bạn!
  Nội dung: Mã voucher, điều kiện, hạn sử dụng
```

### Notification Service Architecture
```
Backend emit event → Notification Service
      ↓
Notification Service xử lý:
  → FCM → Push đến thiết bị
  → SendGrid → Gửi email theo template
  → WebSocket → In-app real-time (nếu đang mở app)

Lưu trữ:
  → Bảng notifications trong DB (để hiển thị lịch sử thông báo trong app)
```

---

## 🗄️ 13. Database Schema (Cập Nhật)

```
Users               → id, role, name, phone, email, address, lat, lng, fcm_token
Restaurants         → id, owner_id, name, address, lat, lng, radius_km,
                       is_open, opening_hours (JSON), is_manual_override
MenuCategories      → id, restaurant_id, name
MenuItems           → id, category_id, name, price, image, is_available
Orders              → id, customer_id, restaurant_id, shipper_id, status,
                       subtotal, ship_fee, discount_amount, platform_fee,
                       payment_method, order_type, voucher_id
OrderItems          → id, order_id, item_id, quantity, price
Shippers            → id, user_id, vehicle_type, lat, lng, is_active,
                       cancel_rate, avg_rating, wallet_cash, wallet_account,
                       ekyc_status, penalty_level
Payments            → id, order_id, method, status, amount, transaction_id
Commissions         → id, order_id, restaurant_share, shipper_share, platform_share
Vouchers            → id, code, type, discount_type, discount_value, max_discount,
                       min_order_value, valid_from, valid_to, total_limit,
                       used_count, per_user_limit, issued_by, restaurant_ids
VoucherUsages       → id, voucher_id, user_id, order_id, discount_applied
AppConfig           → key, value
ShipperPayouts      → id, shipper_id, amount, period_start, period_end, status
RestaurantPayouts   → id, restaurant_id, amount, period_start, period_end, status
ShipperPenalties    → id, shipper_id, reason, level, created_at, expires_at
Notifications       → id, user_id, title, body, type, is_read, created_at
Reviews             → id, order_id, customer_id, restaurant_rating, shipper_rating, comment
```

---

## 🔧 14. Tech Stack

### Mobile Apps (3 app riêng biệt — Android + iOS song song)
| Layer | Tech |
|---|---|
| Framework | **Flutter** (code 1 lần → Android + iOS) |
| State Management | **Riverpod** |
| Maps | **google_maps_flutter** |
| Real-time tracking | **Socket.IO** client |
| HTTP | **Dio** |
| Push Notification | **Firebase Cloud Messaging** |
| Local Storage | **Hive** |
| eKYC | SDK của VNPT eKYC / FPT.AI |

### Backend
| Layer | Tech |
|---|---|
| Runtime | **Node.js** |
| Framework | **NestJS** |
| Database | **PostgreSQL** + **Redis** |
| Real-time | **Socket.IO** |
| Email | **SendGrid** |
| Push Notification | **Firebase Admin SDK** |
| File Storage | **Firebase Storage** |
| Maps | **Google Maps Platform APIs** |
| Cron Jobs | **@nestjs/schedule** (giờ mở cửa, payout) |

### Admin Dashboard
| Layer | Tech |
|---|---|
| Framework | **Next.js** (React) |
| UI | **Ant Design** |
| Charts | **Recharts** |
| Maps | **Google Maps JS API** |

---

## 🛣️ 15. Lộ Trình Phát Triển

### Phase 1 — MVP (2-3 tháng)
- [ ] Auth (Customer, Restaurant, Admin)
- [ ] Quản lý menu cơ bản
- [ ] Đặt hàng Pickup
- [ ] Thanh toán tiền mặt
- [ ] Giờ mở cửa tự động
- [ ] Push notification cơ bản

### Phase 2 — Delivery + Shipper (2 tháng)
- [ ] Đăng ký Shipper + eKYC tích hợp
- [ ] Phân công đơn tự động
- [ ] Google Maps tracking real-time
- [ ] Phí ship theo khoảng cách
- [ ] Bán kính giới hạn động (giờ cao điểm)
- [ ] Hệ thống phạt Shipper

### Phase 3 — Payment + Commission (1 tháng)
- [ ] Tích hợp MoMo / VNPay
- [ ] Hệ thống chia % tự động
- [ ] Ví 2 loại cho Shipper
- [ ] Payout hàng tuần tự động (Thứ Ba)
- [ ] Email sao kê

### Phase 4 — Voucher + Notification (1 tháng)
- [ ] Hệ thống coupon/voucher đầy đủ
- [ ] Email notification theo template
- [ ] Lịch sử thông báo trong app
- [ ] Marketing voucher từ Admin

### Phase 5 — Polish (1 tháng)
- [ ] Đánh giá & review
- [ ] Analytics dashboard Admin
- [ ] Tối ưu UX / hiệu năng
- [ ] A/B testing voucher
