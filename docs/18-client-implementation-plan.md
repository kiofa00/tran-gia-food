# 📋 Kế Hoạch Triển Khai Hệ Thống Tran Gia Food — (Bản Dành Cho Đối Tác & Khách Hàng)

> Tài liệu tổng quan lộ trình phát triển và tính năng hệ thống giao đồ ăn **Tran Gia Food**, được trình bày ngắn gọn, trực quan và dễ hiểu dành cho Khách hàng, Đối tác nhà hàng và Nhà đầu tư.

---

## 🎯 1. Mục Tiêu & Tầm Nhìn Dự Án

Hệ thống **Tran Gia Food** được xây dựng nhằm cung cấp một nền tảng giao đồ ăn **hiện đại, ấm áp và thân thiện**, mang lại sự tiện lợi tối đa cho 4 nhóm người dùng:

```
                            ┌───────────────────────────────────┐
                            │    Hệ Sinh Thái Tran Gia Food     │
                            └─────────────────┬─────────────────┘
                                              │
        ┌───────────────────┬─────────────────┴─────────────────┬───────────────────┐
        ▼                   ▼                                   ▼                   ▼
 🧑 Khách Hàng       🍽️ Nhà Hàng                         🚴 Tài Xế (Shipper)  🛡️ Ban Quản Trị
 (Đặt món, voucher)   (Quản lý menu, doanh thu)           (Nhận đơn, giao hàng) (Điều hành hệ thống)
```

---

## 📱 2. 4 Ứng Dụng Trong Hệ Sinh Thái

### 🧑 1. Ứng Dụng Khách Hàng (Customer App)

- **Tìm kiếm đồ ăn nhanh chóng**: Tìm món ăn theo từ khóa, danh mục, đánh giá hoặc khoảng cách gần nhất.
- **Áp dụng Mã giảm giá (Voucher)**: Chọn mã giảm giá toàn sàn hoặc từ chính quán ăn để tiết kiệm chi phí.
- **Linh hoạt hình thức nhận hàng**: Chọn **Giao tận nơi** hoặc **Tự đến lấy (Pickup)** tại quán.
- **Theo dõi đơn hàng thời gian thực**: Xem tài xế di chuyển trực tiếp trên bản đồ Google Maps.
- **Liên lạc bảo mật (Ẩn số điện thoại)**: Chat hoặc Gọi điện với tài xế và quán ăn mà không sợ bị lộ số điện thoại cá nhân.

### 🍽️ 2. Ứng Dụng Nhà Hàng (Restaurant App & Web)

- **Quản lý Thực đơn (Menu)**: Dễ dàng thêm món mới, cập nhật giá, hình ảnh hoặc tạm ẩn món khi hết hàng.
- **Nhận đơn tự động**: Âm thanh chuông báo tức thì khi có đơn hàng mới.
- **Lịch mở cửa tự động**: Đặt giờ mở/đóng cửa theo ngày trong tuần, hệ thống tự động bật/tắt đúng giờ.
- **Báo cáo doanh thu minh bạch**: Xem chi tiết doanh thu thực nhận, số đơn đã bán và % phí dịch vụ.

### 🚴 3. Ứng Dụng Tài Xế (Shipper App)

- **Nhận đơn thông minh**: Tự động nhận đề xuất đơn hàng gần vị trí đứng trong vòng 60 giây.
- **Định vị & Dẫn đường chuẩn xác**: Tích hợp bản đồ chỉ đường từ Nhà hàng đến tận nhà Khách hàng.
- **Quản lý Ví thu nhập**: Phân định rõ ràng Tiền mặt thu hộ và Tiền cước ship thực nhận.
- **Rút tiền tiện lợi**: Tự động sao kê và hỗ trợ rút tiền về ngân hàng hàng tuần.

### 🛡️ 4. Trang Quản Trị Hệ Thống (Admin Web Dashboard)

- **Bản đồ giám sát toàn hệ thống**: Theo dõi vị trí các tài xế đang hoạt động và mật độ đơn hàng.
- **Duyệt đối tác**: Kiểm tra thông tin đăng ký của Nhà hàng và Tài xế mới.
- **Tạo chương trình Khuyến mãi**: Phát hành các mã giảm giá, chiến dịch Marketing toàn sàn.
- **Biểu đồ thống kê chuyên sâu**: Đồ thị trực quan về tổng doanh số, tăng trưởng đơn hàng và hiệu quả kinh doanh.

---

## 💡 3. Luồng Khách Hàng Đặt Đơn (Customer Journey)

```
 Khách chọn món & áp Voucher
              ↓
 Chọn Giao hàng hoặc Tự đến lấy
              ↓
 Thanh toán (Online / Tiền mặt) ──► Nhà hàng nhận đơn & chế biến
                                              ↓
 Khách theo dõi Tài xế trên bản đồ ◄── Shipper đến lấy hàng & giao đi
              ↓
 Khách nhận đồ ăn ──► Xác nhận & Đánh giá dịch vụ 🌟🌟🌟🌟🌟
```

---

## 🛡️ 4. Các Tính Năng Đổi Mới & Bảo Mật Nổi Bật

1. 🔒 **Bảo Mật Số Điện Thoại Cá Nhân (Masked Call & Chat)**:
   - Khi Khách hàng gọi điện hoặc nhắn tin cho Tài xế, hệ thống sẽ kết nối qua số tổng đài trung gian. Cả hai bên đều nghe gọi bình thường nhưng không ai thấy số điện thoại thật của nhau.
2. ⚡ **Bán Kính Giao Hàng Linh Hoạt**:
   - Trong giờ cao điểm, hệ thống tự động thu hẹp bán kính giao hàng phù hợp để đảm bảo món ăn được giao đến nơi luôn nóng hổi và đúng giờ.
3. 💳 **Sao Kê & Thanh Toán Tự Động Minh Bạch**:
   - Doanh thu của Nhà hàng và Tài xế được hệ thống tự động tổng hợp và gửi báo cáo sao kê minh bạch hàng tuần.

---

## 🗓️ 5. Lộ Trình Triển Khai Dự Án (Roadmap)

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Nền Tảng Cơ Bản                                                         │
│ ➔ Đăng ký/Đăng nhập, Quản lý Menu, Đặt hàng Pickup, Thanh toán Tiền mặt            │
├───────────────────────────────────────────────────────────────────────────────────┤
│ Phase 2: Đội Ngũ Giao Hàng & Bản Đồ                                              │
│ ➔ Định vị bản đồ Realtime, Phân công Tài xế tự động, Bán kính giao hàng động      │
├───────────────────────────────────────────────────────────────────────────────────┤
│ Phase 3: Khuyến Mãi & Báo Cáo Doanh Thu                                          │
│ ➔ Mã giảm giá Voucher, Tự động chia hoa hồng & Đồ thị báo cáo tài chính          │
├───────────────────────────────────────────────────────────────────────────────────┤
│ Phase 4: Quản Lý Nội Dung & Truyền Thông                                          │
│ ➔ Quản lý Banner quảng cáo, Thông báo tin tức, Chat/Gọi ẩn số & Hỗ trợ KH         │
├───────────────────────────────────────────────────────────────────────────────────┤
│ Phase 5: Tối Ưu Trải Nghiệm & Bàn Giao Vận Hành                                   │
│ ➔ Đánh giá dịch vụ, Tối ưu tốc độ ứng dụng & Đưa vào vận hành chính thức           │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🤝 6. Cam Kết Chất Lượng & Hỗ Trợ

- **Trải nghiệm mượt mà**: Giao diện thiết kế theo tông màu cam ấm thân thiện, bắt mắt và dễ thao tác trên mọi điện thoại.
- **Sẵn sàng hoạt động 24/7**: Hệ thống vận hành ổn định, dữ liệu được đồng bộ tức thì trên cả ứng dụng di động và trang web.
