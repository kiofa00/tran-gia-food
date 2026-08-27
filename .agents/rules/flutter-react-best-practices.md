# QUY CHUẨN THỰC THI CHO FLUTTER & REACT / NEXT.JS

Tài liệu quy định chi tiết các chuẩn mực kỹ thuật và kiến trúc cho các ứng dụng Front-end trong dự án Tran Gia Food Monorepo.

---

## 1. QUY CHUẨN REACT / NEXT.JS (`apps/admin_web`)

- **Cấu trúc App Router**: Giữ các trang theo dạng mô-đun trong thư mục `src/app/`. Các component dùng chung đặt tại `src/components/`.
- **Tích hợp Ant Design**: Bao bọc các trang bằng `ConfigProvider` để đồng bộ design tokens. Sử dụng các component bố cục và UI của Ant Design (`Card`, `Table`, `Tag`, `Badge`, `Statistic`, `Row`, `Col`).
- **Design Tokens**: Tham chiếu mô-đun `adminDesignTokens` cho màu sắc, cỡ chữ, độ đậm và bo góc.
- **Bắt buộc Đa ngôn ngữ (i18n)**: Toàn bộ văn bản hiển thị trên UI BẮT BUỘC dùng `t(...)` từ `useLocale()` / `useTranslation()`. Tuyệt đối không hardcode chuỗi trực tiếp.
- **Tập trung hóa Đường dẫn & Cấu hình**: Đường dẫn (`ROUTES`), biểu thức chính quy (`REGEX`), và các hằng số hệ thống phải được import từ các tệp cấu hình tập trung (`src/constants/routes.ts`, `src/constants/regex.ts`, v.v.).
- **Tách biệt Trách nhiệm (Separation of Concerns)**: Giữ JSX thuần túy cho hiển thị. Tách toàn bộ logic tải dữ liệu, xử lý biểu mẫu và cập nhật state vào Custom Hooks (`use<Feature>.ts`).

---

## 2. QUY CHUẨN FLUTTER APPS (`apps/customer_app`, `apps/restaurant_app`, `apps/shipper_app`)

### 🎨 2.1 Hệ Thống Design Tokens (BẮT BUỘC SỐ 1 TRONG FLUTTER UI)

- **100% Sử Dụng Shared Design Tokens**: Mọi widget BẮT BUỘC sử dụng design tokens từ `package:shared_ui`:
  - **Màu sắc**: `AppColors.*` (`AppColors.primary`, `AppColors.surfaceLight`, `AppColors.surfaceDark`, `AppColors.error`, `AppColors.success`, `AppColors.warning`, `AppColors.dividerLight`, v.v.).
    - 🛑 **CẤM TUYỆT ĐỐI**: Không dùng `Color(0x...)`, `Colors.orange`, `Colors.blue`, `Colors.green`, `Colors.red` trong source code.
  - **Typography (Kích thước & Độ đậm của chữ)**:
    - `AppFontSize.*`: `AppFontSize.xs` (11), `AppFontSize.sm` (12), `AppFontSize.body` (13), `AppFontSize.md` (14), `AppFontSize.base` (15), `AppFontSize.title` (16), `AppFontSize.lg` (18), `AppFontSize.xl` (22), `AppFontSize.h1` (24), `AppFontSize.h2` (28). CẤM hardcode `fontSize: 16`.
    - `AppFontWeight.*`: `AppFontWeight.regular`, `AppFontWeight.medium`, `AppFontWeight.semiBold`, `AppFontWeight.bold`, `AppFontWeight.extraBold`. CẤM dùng raw `FontWeight.bold`.
  - **Bo góc & Hiệu ứng**:
    - `AppRadius.*`: `AppRadius.xs` (6), `AppRadius.sm` (10), `AppRadius.md` (16), `AppRadius.lg` (20), `AppRadius.xl` (28), `AppRadius.full` (999). CẤM dùng `BorderRadius.circular(8)`.
    - `AppGradients.*` & `AppShadows.*`: Sử dụng gradient & bóng chuẩn từ `shared_ui`.
- **Tái Sử Dụng Thư Viện Giao Diện Chung**: Trước khi tạo UI mới, luôn kiểm tra và tái sử dụng component từ `package:shared_ui`:
  - `AppButton`, `AppTextField`, `RestaurantCard`, `FoodItemCard`, `CartBadge`, `ShimmerLoading`, `AppBadge`, `AppModalBottomSheet`.

---

### 🛡️ 2.2 Chính Sách Auth Guard & API Yêu Cầu Xác Thực

- 🛑 **CẤM GỌI API CẦN AUTH KHI CHƯA ĐĂNG NHẬP**:
  - Các API yêu cầu xác thực (`/users/me`, `/users/me/orders`, `/users/me/wallet`, `/users/me/notifications`, v.v.) BẮT BUỘC phải kiểm tra token trước khi gửi request:
    ```dart
    final hasToken = await api.hasToken();
    if (!hasToken) return null; // Hoặc trả về empty data, tuyệt đối không gửi request mạng
    ```
- **Xử lý trạng thái Chưa Đăng Nhập (Unauthenticated State)**:
  - Khi người dùng là khách (chưa có token): Widget BẮT BUỘC hiển thị giao diện Unauthenticated (`_UnauthenticatedView`) với icon, thông điệp rõ ràng và nút bấm **"Đăng Nhập / Đăng Ký"** (`context.push(AppRoutes.auth)`).
  - Bắt lỗi `ApiException` với mã 401 để tự động clear token và hiển thị UI unauthenticated, không bao giờ để sập màn hình đỏ hoặc báo lỗi 500.

---

### ⚡ 2.3 Quản Lý Trạng Thái & Mô Hình Riverpod

- **Tách Biệt 100% Logic & Hiển Thị**:
  - Widget CHỈ làm nhiệm vụ hiển thị (Presentation) và bắt sự kiện người dùng (onTap, onChanged).
  - CẤM TUYỆT ĐỐI gọi `ApiClient` hay xử lý nghiệp vụ phức tạp trực tiếp trong `build()` hoặc `initState()`.
  - Mọi thao tác tải dữ liệu, biến đổi state phải nằm trong **Riverpod Providers** (`FutureProvider`, `StateNotifierProvider`, `NotifierProvider`).
- **4 Trạng thái bắt buộc của UI**:
  - Mọi màn hình tải dữ liệu từ API BẮT BUỘC dùng `asyncValue.when(...)` xử lý đủ 4 trường hợp:
    1. `loading`: Hiển thị Skeleton / Shimmer (`_buildSkeleton()`).
    2. `error`: Hiển thị `_ErrorView` thân thiện kèm nút **"Thử lại"** (`ref.invalidate(...)`).
    3. `empty`: Hiển thị `_EmptyView` với icon minh họa khi danh sách rỗng (ví dụ: chưa có đơn hàng, chưa có giao dịch).
    4. `data`: Render danh sách dữ liệu thực tế.
- **Giải Phóng Bộ Nhớ Tự Động (AutoDispose)**:
  - Sử dụng `FutureProvider.autoDispose` và `StateNotifierProvider.autoDispose` cho các màn hình tạm thời hoặc chi tiết để giải phóng bộ nhớ khi rời màn hình.

---

### 📦 2.4 Tập Trung Hóa Cấu Hình, Đường Dẫn & Ranh Giới Monorepo

- **Hằng Số Đường Dẫn (Route Constants)**:
  - 100% điều hướng màn hình qua GoRouter phải dùng hằng số `AppRoutes.*` (khai báo trong `app_routes.dart`), CẤM dùng chuỗi trần `context.go('/orders')` $\rightarrow$ phải là `context.go(AppRoutes.orders)`.
- **Biến Môi Trường (Environment Variables)**:
  - `API_URL` và `WS_URL` nạp qua `const String.fromEnvironment('API_URL')` và flag `--dart-define-from-file=.env`.
  - 🛑 **CẤM TUYỆT ĐỐI**: Không viết URL fallback inline (`http://localhost:3000`, `http://10.0.2.2:3000`). Nếu thiếu biến môi trường, phải ném `StateError` chỉ rõ lỗi cấu hình.
- **Shared Models & Enums**:
  - 100% tái sử dụng Enums (`OrderStatus`, `PaymentMethod`, `UserRole`, `TransactionType`, `NotificationType`, `KycStatus`) từ `package:shared_models`. CẤM tạo lại enum trùng lặp trong từng app.

---

### 🔄 2.5 Vòng Đời Widget & Giải Phóng Tài Nguyên (Resource Disposal)

- **Giải Phóng Bộ Nhớ Triệt Để (Chống Memory Leak)**:
  - Mọi controller: `TextEditingController`, `AnimationController`, `ScrollController`, `TabController`, `PageController`, `FocusNode` và các `StreamSubscription` BẮT BUỘC phải được gọi `.dispose()` / `.cancel()` trong phương thức `dispose()` của `StatefulWidget`.
- **Tối Ưu Với Const Constructors**:
  - Tất cả widget không chứa state động BẮT BUỘC phải có từ khóa `const` constructor để tối ưu render pipeline của Flutter engine.
- **Chia Nhỏ Widget**:
  - CẤM viết một hàm `build()` dài hơn 150 dòng. Phải tách nhỏ các sub-views thành các private `StatelessWidget` hoặc methods `_buildX()`.

---

### 🧹 2.6 Kiểm Tra Phân Tích Tĩnh (Static Analysis Quality Gate)

- **0 Lỗi & Cảnh Báo (Zero Lint & Warnings)**:
  - BẮT BUỘC chạy `dart analyze apps/<app_name>` trước khi hoàn thành task.
  - Chuẩn mực: **0 errors, 0 warnings, 0 lints**.
