# QUY TẮC VẬN HÀNH & GIỚI HẠN HÀNH VI CỦA AI AGENT

---

## 1. QUY TẮC GIT COMMIT & PUSH (BẮT BUỘC SỐ 1)

- **CHỈ CHỈNH SỬA CODE TẠI LOCAL**: Mọi thao tác viết mã, sửa lỗi, tái cấu trúc và kiểm tra bản build chỉ được thực hiện trong workspace local của máy.
- **🛑 CẤM TUYỆT ĐỐI TỰ Ý COMMIT / PUSH**: AI Agent bị cấm hoàn toàn việc tự ý thực thi các lệnh `git commit` hoặc `git push` trong bất kỳ tình huống nào, trừ trường hợp duy nhất bên dưới.
- **CHỈ CHẠY QUA SKILL `push-code`**: Cách DUY NHẤT được phép chạy `git commit` hoặc `git push` là khi người dùng yêu cầu trực tiếp thông qua skill **push-code** (ví dụ: gõ `/push`, `push code`, `push đi`, `commit đi`, `commit và push`). Không có bất kỳ ngữ cảnh hay câu lệnh nào khác được coi là cấp quyền này.
- **DUYỆT PLAN KHÔNG PHẢI LÀ CẤP QUYỀN GIT**: Việc người dùng bấm "Proceed" duyệt kế hoạch (Implementation Plan) chỉ cho phép Agent bắt đầu viết code, KHÔNG đồng nghĩa với việc cho phép commit hay push code.
- **DỪNG LẠI SAU KHI HOÀN THÀNH CODE**: Khi hoàn thành công việc, báo cáo kết quả và DỪNG LẠI. Không tự ý commit hay push. Chờ người dùng ra lệnh rõ ràng.
- **KHÔNG NGOẠI LỆ**: Kể cả khi người dùng nói "xong rồi đấy", "tốt rồi", "đẩy lên đi" một cách bâng quơ — tuyệt đối KHÔNG tự ý push trừ khi skill push-code được kích hoạt rõ ràng.

---

## 2. QUY CHUẨN STYLING CHO REACT / NEXT.JS (`apps/admin_web`)

- **🛑 CẤM DÙNG INLINE STYLE**: Tuyệt đối KHÔNG viết `style={{ ... }}` trên bất kỳ phần tử HTML hoặc component React nào.
- **100% SỬ DỤNG TAILWINDCSS**: Toàn bộ định kiểu (màu sắc, khoảng cách, kích thước chữ, bố cục, đổ bóng, viền, chuyển động) phải sử dụng `className="..."` với các utility classes của TailwindCSS.
- **SỬ DỤNG DESIGN TOKENS CHO MÀU SẮC**: Sử dụng bảng màu Tailwind (`orange-500`, `gray-50`, `green-600`, ...) hoặc tokens từ `adminDesignTokens.*`. Tuyệt đối không hardcode mã Hex (`#FF6B35`) hoặc mã RGB trong JSX.
- **3 Trường hợp ngoại lệ duy nhất được phép dùng `style`**:
  1. **Props của thư viện Ant Design** chỉ chấp nhận object (ví dụ: `styles={{ body: { padding: '...' } }}` trên `<Card>`, `valueStyle={{ ... }}` trên `<Statistic>`).
  2. **Giá trị động tính toán runtime** không thể chuyển thành Tailwind class tĩnh (ví dụ: tọa độ pixel tính theo chuột, kích thước Canvas động).
  3. **Truyền CSS Custom Properties** (`style={{ '--var': value }}`).
- **Modifier `!important` (Dùng có chọn lọc)**: Tiền tố `!` của Tailwind (như `!bg-orange-500`, `!px-0`) được phép dùng khi cần ghi đè các style có độ ưu tiên cao từ CSS-in-JS của Ant Design. Ưu tiên tìm giải pháp không cần `!` trước.

---

## 3. QUY CHUẨN KIỂM THỬ TỰ ĐỘNG (TESTING STRATEGY)

- **UI Components (Không yêu cầu test)**: Các trang JSX/Next.js, Widget Flutter (như `Header.tsx`, `HomeScreen.dart`, `LoginScreen.dart`) KHÔNG cần tạo file unit test giao diện.
- **Logic Nghiệp Vụ & Dịch Vụ (Bắt buộc 100% test)**: Custom Hooks (`use*.ts`), hàm tiện ích (`formatters.ts`), NestJS Services (`*.service.ts`), và các truy vấn cơ sở dữ liệu BẮT BUỘC phải được bao phủ đầy đủ bằng unit test tự động.
- **Lệnh chạy kiểm thử**: Chạy `pnpm test` (`vitest` + `jest`) để xác minh tính đúng đắn của logic.

---

## 4. QUY CHUẨN CHẤT LƯỢNG MÃ NGUỒN & LINTING

- **Chất lượng mã nguồn**: Chạy `pnpm lint` hoặc `pnpm fix` để tự động định dạng và kiểm tra toàn bộ workspace.
- **Yêu cầu bắt buộc**: Duy trì **0 lỗi (errors)** và **0 cảnh báo (warnings)** trên toàn bộ dự án.

---

## 5. QUY ĐỊNH ĐA NGÔN NGỮ & BẢN ĐỊA HÓA (I18N / L10N)

- **BẮT BUỘC DÙNG KHÓA DỊCH**: 100% chuỗi ký tự hiển thị tới người dùng (nhãn nút bấm, tiêu đề modal, nhãn biểu mẫu, placeholder, tiêu đề bảng, thông báo toast, thông điệp lỗi/thành công, trạng thái trống) PHẢI sử dụng hàm dịch thuật:
  - React/Next.js: `t('key')` thông qua `useLocale()` / `useTranslation()`.
  - Flutter: Khai báo qua localization resources / AppLocalizations.
- **🛑 CẤM HARDCODE CHUỖI TRỰC TIẾP**: Tuyệt đối không viết chuỗi văn bản trần (raw text strings) trực tiếp trong JSX hoặc cây Widget Flutter.
- **ĐỒNG BỘ CÁC TẬP TIN NGÔN NGỮ**: Khi thêm khóa dịch mới, bắt buộc phải khai báo đầy đủ ở tất cả các tệp ngôn ngữ được hỗ trợ (`vi.json`, `en.json`).

---

## 6. TẬP TRUNG HÓA CẤU HÌNH, ROUTE & HẰNG SỐ (CẤM HARDCODE & CẤM FALLBACK)

- **🛑 CẤM TUYỆT ĐỐI HARDCODED FALLBACK (NO FALLBACK URLS / CONFIGS)**:
  - **CẤM VIẾT URL FALLBACK**: Tuyệt đối cấm các đoạn mã dạng:
    - ❌ `const String.fromEnvironment('API_URL', defaultValue: 'http://localhost:3000')`
    - ❌ `process.env.API_URL || 'http://localhost:3000/api'`
    - ❌ `kIsWeb ? 'http://localhost:3000' : 'http://10.0.2.2:3000'`
  - **NÉM LỖI TƯỜNG MINH (FAIL-FAST)**: Nếu thiếu biến môi trường trong `.env` hoặc file cấu hình, mã nguồn BẮT BUỘC phải ném lỗi rõ ràng (`throw StateError('Missing API_URL')` hoặc `throw new Error('API_URL is required')`) để lập tức cảnh báo lập trình viên / agent, tuyệt đối không được âm thầm fallback ngầm.
- **🛑 CẤM HARDCODE DỮ LIỆU MẪU TRỰC TIẾP TRÊN UI**:
  - Tuyệt đối không hardcode danh sách quán ăn, món ăn, banner khuyến mãi, danh mục mẫu tĩnh trực tiếp trong cây Widget/JSX. Mọi dữ liệu BẮT BUỘC phải được nạp động từ Backend API thông qua Repository/Provider/Hook.
- **TỆP CẤU HÌNH TẬP TRUNG**: Mọi giá trị cấu hình, định tuyến ứng dụng, biểu thức chính quy (regex), endpoint API, thời gian timeout và luật kiểm tra biểu mẫu PHẢI được khai báo trong các tệp riêng biệt (ví dụ: `routes.ts`, `regex.ts`, `constants.ts`, `config.ts`, `app_routes.dart`, `app_constants.dart`).
- **CẤM INLINE REGEX**: Không viết biểu thức regex trực tiếp trong logic mà không export từ tệp `regex.ts` / constants.
- **CẤM HARDCODE ROUTE STRINGS**: Đường dẫn điều hướng phải sử dụng hằng số (ví dụ: `ROUTES.ORDERS`, `ROUTES.SETTINGS`, `AppRoutes.orders`), không dùng chuỗi thô như `'/orders'`.
- **CẤM MAGIC NUMBERS / STRINGS**: Số trơ và chuỗi trạng thái phải dùng hằng số có tên hoặc Enum từ `package:shared_models`.

---

## 7. NGUYÊN TẮC TÁCH BIỆT TRÁCH NHIỆM (SEPARATION OF CONCERNS)

- **UI COMPONENT THUẦN HIỂN THỊ (PRESENTATION-ONLY)**: Component React và Widget Flutter chỉ tập trung vào bố cục, render giao diện, gắn design tokens và bắt sự kiện người dùng. Tuyệt đối không chứa logic gọi API hay xử lý nghiệp vụ phức tạp.
- **TÁCH VÀO CUSTOM HOOKS & CONTROLLERS/PROVIDERS**:
  - React/Next.js: Tách toàn bộ quản lý state, gọi API, submit form và biến đổi dữ liệu vào Custom Hooks (`use<Feature>.ts` / `use<Feature>Modal.ts`).
  - Flutter: Tách logic nghiệp vụ, gọi API và biến đổi state vào Riverpod Providers (`FutureProvider`, `NotifierProvider`, `StateNotifierProvider`) hoặc Repositories.
- **KIẾN TRÚC CONTAINER & PRESENTER**: UI Component nhận dữ liệu sạch và các hàm xử lý hành động từ Hook / Provider (ví dụ: `const { data, loading, handleSave } = useFeatureModal(...)`).
- **KHẢ NĂNG TEST ĐỘC LẬP**: Các Hook, Service, Provider sau khi tách phải có khả năng viết unit test độc lập mà không cần dựng cây UI phức tạp.

---

## 8. QUY CHUẨN VẬN HÀNH FLUTTER APPS (CUSTOMER, RESTAURANT, SHIPPER)

- **100% SỬ DỤNG DESIGN TOKENS**:
  - 🛑 **CẤM DÙNG MÀU TỰ DO**: Không dùng `Color(0x...)`, `Colors.orange`, `Colors.blue`, `Colors.green`, `Colors.red`... Phải dùng `AppColors.*` từ `package:shared_ui`.
  - 🛑 **CẤM HARDCODE FONT SIZE / WEIGHT / RADIUS**: Phải dùng `AppFontSize.*`, `AppFontWeight.*`, `AppRadius.*` từ `package:shared_ui`. Cấm `fontSize: 16`, `FontWeight.bold`, `BorderRadius.circular(8)`.
- **BẢO VỆ API CẦN XÁC THỰC (AUTH GUARD POLICY)**:
  - 🛑 **CẤM GỌI PROTECTED API KHI CHƯA ĐĂNG NHẬP**: Mọi Provider / Service gọi endpoint cần đăng nhập (`/users/me`, `/orders`, `/wallet`, `/notifications`, ...) BẮT BUỘC kiểm tra `await api.hasToken()`. Nếu `false`, dừng ngay lập tức và trả về trạng thái rỗng/unauthenticated mà KHÔNG gửi request mạng lên server để tránh lỗi 401.
  - **Giao diện Chưa Đăng Nhập**: Khi chưa có token, Widget BẮT BUỘC hiển thị giao diện thân thiện `_UnauthenticatedView` kèm nút bấm dẫn sang màn hình đăng nhập (`context.push(AppRoutes.auth)`).
- **XỬ LÝ ĐỦ 4 TRẠNG THÁI UI VỚI RIVERPOD**:
  - Mọi màn hình tải dữ liệu từ API BẮT BUỘC dùng `asyncValue.when(...)` xử lý đủ 4 trường hợp:
    1. `loading`: Skeleton loading / Shimmer.
    2. `error`: Thông báo lỗi rõ ràng + Nút "Thử lại" (`ref.invalidate(...)`).
    3. `empty`: Giao diện trạng thái trống (icon + thông điệp) khi danh sách rỗng.
    4. `data`: Render danh sách dữ liệu thực tế.
- **QUẢN LÝ VÒNG ĐỜI & GIẢI PHÓNG TÀI NGUYÊN (DISPOSAL)**:
  - BẮT BUỘC gọi `.dispose()` / `.cancel()` cho tất cả `TextEditingController`, `AnimationController`, `ScrollController`, `TabController`, `FocusNode`, `StreamSubscription` trong hàm `dispose()` của `StatefulWidget` để chống rò rỉ bộ nhớ (memory leak).
- **TỐI ƯU HIỆU NĂNG RENDER**:
  - Sử dụng `const` constructor cho toàn bộ Widget không có trạng thái động.
  - Tách nhỏ widget thay vì viết một hàm `build()` dài hàng trăm dòng.
- **CHẤT LƯỢNG PHÂN TÍCH TĨNH (STATIC ANALYSIS)**:
  - BẮT BUỘC duy trì **0 lỗi, 0 cảnh báo, 0 lint** khi chạy `dart analyze`.
