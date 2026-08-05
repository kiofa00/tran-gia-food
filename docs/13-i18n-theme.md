# 🌐 13 — i18n & Theme Switching

## Đa Ngôn Ngữ (i18n)

### Ngôn ngữ hỗ trợ
| Code | Ngôn ngữ | Mặc định |
|---|---|---|
| `vi` | Tiếng Việt | ✅ |
| `en` | English | Chuyển trong Settings |

### Package
```yaml
# pubspec.yaml (shared_ui hoặc mỗi app)
dependencies:
  easy_localization: ^3.0.7
  intl: ^0.19.0

flutter:
  assets:
    - assets/translations/
```

### Cấu trúc file
```
assets/translations/
  vi.json
  en.json
```

### vi.json (mẫu đầy đủ)
```json
{
  "app_name": "Tran Gia Food",
  "home": {
    "greeting_morning": "Chào buổi sáng, {name}! 🌤️",
    "greeting_afternoon": "Buổi chiều vui vẻ, {name}! ☀️",
    "greeting_evening": "Chào buổi tối, {name}! 🌙",
    "search_placeholder": "Tìm kiếm đồ ăn, quán ăn...",
    "section_hot": "🔥 Đang hot gần bạn",
    "section_fast": "⚡ Giao nhanh 15 phút",
    "section_nearby": "📍 Gần bạn nhất"
  },
  "order": {
    "status_pending": "Đang chờ xác nhận",
    "status_confirmed": "Quán đã xác nhận",
    "status_picking_up": "Shipper đang đến quán",
    "status_delivering": "Đang giao hàng 🛵",
    "status_delivered": "Đã giao, chờ xác nhận",
    "status_completed": "Hoàn thành ✅",
    "status_cancelled": "Đã hủy",
    "eta": "Dự kiến {min} phút nữa",
    "cancel_btn": "Hủy đơn",
    "confirm_received": "Đã nhận hàng"
  },
  "payment": {
    "method_momo": "Ví MoMo",
    "method_bank": "Ngân hàng liên kết",
    "method_cash": "Tiền mặt khi nhận hàng",
    "total": "Tổng cộng",
    "ship_fee": "Phí giao hàng",
    "discount": "Giảm giá"
  },
  "common": {
    "btn_order": "Đặt hàng ngay",
    "btn_cancel": "Hủy",
    "btn_confirm": "Xác nhận",
    "btn_chat": "Chat",
    "btn_call": "Gọi điện",
    "btn_retry": "Thử lại",
    "unit_km": "{n} km",
    "unit_min": "{n} phút",
    "open": "Đang mở",
    "closed": "Đã đóng cửa",
    "out_of_range": "Ngoài vùng giao hàng",
    "loading": "Đang tải...",
    "error_generic": "Đã có lỗi xảy ra, vui lòng thử lại"
  },
  "settings": {
    "language": "Ngôn ngữ",
    "theme": "Giao diện",
    "theme_light": "Sáng",
    "theme_dark": "Tối",
    "theme_system": "Theo hệ thống"
  }
}
```

### en.json (mẫu)
```json
{
  "app_name": "Tran Gia Food",
  "home": {
    "greeting_morning": "Good morning, {name}! 🌤️",
    "greeting_afternoon": "Good afternoon, {name}! ☀️",
    "greeting_evening": "Good evening, {name}! 🌙",
    "search_placeholder": "Search for food, restaurants...",
    "section_hot": "🔥 Trending near you",
    "section_fast": "⚡ Delivered in 15 mins",
    "section_nearby": "📍 Nearest to you"
  },
  "order": {
    "status_pending": "Waiting for confirmation",
    "status_confirmed": "Restaurant confirmed",
    "status_picking_up": "Shipper heading to restaurant",
    "status_delivering": "Out for delivery 🛵",
    "status_delivered": "Delivered, awaiting confirmation",
    "status_completed": "Completed ✅",
    "status_cancelled": "Cancelled",
    "eta": "{min} mins away",
    "cancel_btn": "Cancel Order",
    "confirm_received": "Confirm Received"
  }
}
```

### Cách dùng trong code
```dart
// main.dart
void main() async {
  await EasyLocalization.ensureInitialized();
  runApp(
    EasyLocalization(
      supportedLocales: [Locale('vi'), Locale('en')],
      path: 'assets/translations',
      fallbackLocale: Locale('vi'),
      child: MyApp(),
    ),
  );
}

// Dùng trong widget
Text('home.greeting_morning'.tr(namedArgs: {'name': userName}))
// → "Chào buổi sáng, Gia! 🌤️"

// Format tiền tệ
Text(NumberFormat.currency(
  locale: context.locale.languageCode == 'vi' ? 'vi_VN' : 'en_US',
  symbol: context.locale.languageCode == 'vi' ? 'đ' : '\$',
).format(85000))
// → "85.000đ" (vi) hoặc "$85,000" (en)

// Chuyển ngôn ngữ
context.setLocale(Locale('en')); // lưu tự động vào SharedPreferences
```

---

## 🌙 Theme Switching

### 3 Chế Độ
```
○ Theo hệ thống (mặc định) ← Tự động theo cài đặt Android/iOS
● Sáng (Light)
○ Tối (Dark)
```

### Setup AppTheme
```dart
// packages/shared_ui/lib/theme/app_theme.dart
class AppTheme {
  static const _primary = Color(0xFFFF6635);

  static ThemeData light = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.light(
      primary: _primary,
      onPrimary: Colors.white,
      surface: Color(0xFFFFF8F2),
      onSurface: Color(0xFF2D1B00),
    ),
    scaffoldBackgroundColor: Color(0xFFFFF8F2),
    cardColor: Colors.white,
    fontFamily: GoogleFonts.nunito().fontFamily,
    // ... extensions
  );

  static ThemeData dark = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.dark(
      primary: _primary,
      onPrimary: Colors.white,
      surface: Color(0xFF2A1F12),
      onSurface: Color(0xFFFFF0E0),
    ),
    scaffoldBackgroundColor: Color(0xFF1A1209),
    cardColor: Color(0xFF2A1F12),
    fontFamily: GoogleFonts.nunito().fontFamily,
  );
}
```

### Riverpod Provider
```dart
// packages/shared_ui/lib/providers/theme_provider.dart
final themeProvider =
    StateNotifierProvider<ThemeNotifier, ThemeMode>((ref) {
  return ThemeNotifier();
});

class ThemeNotifier extends StateNotifier<ThemeMode> {
  ThemeNotifier() : super(ThemeMode.system) {
    _loadFromPrefs();
  }

  Future<void> _loadFromPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString('theme_mode') ?? 'system';
    state = _parse(saved);
  }

  void set(ThemeMode mode) async {
    state = mode;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('theme_mode', mode.name);
  }

  ThemeMode _parse(String val) => switch (val) {
    'light' => ThemeMode.light,
    'dark'  => ThemeMode.dark,
    _       => ThemeMode.system,
  };
}
```

### Dùng trong main.dart
```dart
// apps/customer_app/lib/main.dart
Consumer(builder: (context, ref, _) {
  final themeMode = ref.watch(themeProvider);
  return MaterialApp.router(
    theme: AppTheme.light,
    darkTheme: AppTheme.dark,
    themeMode: themeMode,
    // ...
  );
})
```

---

## 🔗 Xem Thêm
- [UI/UX Design System](./12-ui-ux.md)
- [Tech stack](./11-tech-stack.md)
