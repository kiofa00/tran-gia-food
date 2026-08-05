# 🎨 12 — UI/UX Design System

## Triết Lý Thiết Kế

> **"Ấm áp, gần gũi, chuyên nghiệp"**
> - Giao diện thân thiện, cảm giác như đang dùng app của người quen
> - Interaction mượt mà, phản hồi ngay lập tức
> - Mỗi màn hình có 1 mục tiêu rõ ràng

---

## 🎨 Color Palette

### Light Theme (mặc định)
| Token | Hex | RGB | Dùng cho |
|---|---|---|---|
| `primary` | `#FF6635` | 255, 102, 53 | CTA, button chính, accent |
| `primary-light` | `#FF8C69` | 255, 140, 105 | Hover state, chip active |
| `primary-dark` | `#E04A1E` | 224, 74, 30 | Pressed state |
| `secondary` | `#FFD93D` | 255, 217, 61 | Badge, highlight, promo |
| `background` | `#FFF8F2` | 255, 248, 242 | Nền app (kem nhạt) |
| `surface` | `#FFFFFF` | 255, 255, 255 | Card, modal, bottom sheet |
| `surface-alt` | `#F5EDE3` | 245, 237, 227 | Input background |
| `text-primary` | `#2D1B00` | 45, 27, 0 | Text chính (nâu đậm) |
| `text-secondary` | `#7C6E5C` | 124, 110, 92 | Text phụ |
| `text-hint` | `#B5A898` | 181, 168, 152 | Placeholder, disabled |
| `success` | `#51CF66` | 81, 207, 102 | Trạng thái thành công |
| `error` | `#FF4757` | 255, 71, 87 | Lỗi, cảnh báo nguy hiểm |
| `warning` | `#FFB800` | 255, 184, 0 | Cảnh báo nhẹ |
| `divider` | `#EDE4D8` | 237, 228, 216 | Đường kẻ, separator |

### Dark Theme
| Token | Hex | Dùng cho |
|---|---|---|
| `primary` | `#FF6635` | Giữ nguyên — accent không đổi |
| `background` | `#1A1209` | Nền tối ấm (không đen lạnh) |
| `surface` | `#2A1F12` | Card, modal tối |
| `surface-alt` | `#352817` | Input tối |
| `text-primary` | `#FFF0E0` | Text sáng ấm |
| `text-secondary` | `#C4A882` | Text phụ tối |
| `divider` | `#3D2E1E` | Đường kẻ tối |

> 💡 Tông màu cam-đỏ ấm (#FF6635) + nền kem (#FFF8F2) tạo cảm giác
> đồ ăn ngon, kích thích. Dark mode dùng nền nâu tối thay vì đen lạnh.

---

## ✍️ Typography

**Font chính:** [Nunito](https://fonts.google.com/specimen/Nunito) (heading) + [Inter](https://fonts.google.com/specimen/Inter) (body)

| Style | Font | Size | Weight | Line Height | Dùng cho |
|---|---|---|---|---|---|
| `heading-xl` | Nunito | 28sp | 700 (Bold) | 36 | Tên màn hình lớn |
| `heading-lg` | Nunito | 22sp | 700 | 28 | Section header |
| `heading-md` | Nunito | 18sp | 600 (SemiBold) | 24 | Tên quán, tên món |
| `heading-sm` | Nunito | 16sp | 600 | 22 | Card title |
| `body-lg` | Inter | 16sp | 400 (Regular) | 24 | Nội dung chính |
| `body-md` | Inter | 14sp | 400 | 20 | Description, mô tả |
| `body-sm` | Inter | 12sp | 400 | 16 | Caption, badge text |
| `label` | Inter | 13sp | 500 (Medium) | 18 | Button text, tab label |
| `price` | Nunito | 16sp | 700 | 22 | Giá tiền (màu primary) |

---

## 📐 Shape & Spacing

```dart
// Border Radius
const kRadiusXS  = 6.0;   // Tags, chips nhỏ
const kRadiusSM  = 10.0;  // Button nhỏ, input
const kRadiusMD  = 16.0;  // Card, bottom sheet
const kRadiusLG  = 20.0;  // Modal, hero card
const kRadiusXL  = 28.0;  // Bottom nav bar, FAB
const kRadiusFull = 999.0; // Pill, avatar circle

// Spacing (8pt grid)
// 4, 8, 12, 16, 20, 24, 32, 40, 48...
```

### Warm Shadows
```dart
// Dùng màu primary với opacity thấp thay vì shadow đen lạnh
const kShadowSM = BoxShadow(
  color: Color(0x14FF6635),  // rgba(255,102,53, 0.08)
  blurRadius: 8, offset: Offset(0, 2),
);
const kShadowMD = BoxShadow(
  color: Color(0x1FFF6635),  // rgba(255,102,53, 0.12)
  blurRadius: 16, offset: Offset(0, 4),
);
const kShadowLG = BoxShadow(
  color: Color(0x29FF6635),  // rgba(255,102,53, 0.16)
  blurRadius: 32, offset: Offset(0, 8),
);
```

---

## ✨ Interaction & Animation

### Micro-animations
| Tình huống | Animation | Duration |
|---|---|---|
| Nhấn button | Scale 1.0 → 0.95 → bounce back | 150ms |
| Loading | Shimmer skeleton (warm tone) | Loop |
| Thêm vào giỏ | Icon fly to cart với arc | 400ms |
| Chuyển màn | Slide + fade (ease-out) | 300ms |
| Pull to refresh | Lottie (fork & spoon spin) | Loop |
| Đặt hàng thành công | Lottie checkmark animation | 1.5s |
| Bottom sheet mở/đóng | Spring physics | 350ms |
| Like / yêu thích | Heart pop (scale + color) | 250ms |
| Toast thông báo | Slide up + auto dismiss | 3s |

### Haptic Feedback
```dart
// Nhấn button chính
HapticFeedback.lightImpact();

// Thêm vào giỏ hàng
HapticFeedback.mediumImpact();

// Đặt hàng thành công
HapticFeedback.heavyImpact(); // hoặc custom success pattern

// Lỗi / cảnh báo
HapticFeedback.vibrate();
```

### Accessibility
- Minimum touch target: **48×48dp** (Material guidelines)
- Text contrast: ≥ 4.5:1 (WCAG AA)
- Support dynamic text size
- Screen reader labels cho mọi icon button

---

## 🖼️ Icon System

**Package:** [`iconsax`](https://pub.dev/packages/iconsax) — outlined mặc định, filled khi active

| Context | Variant | Size |
|---|---|---|
| Bottom nav (inactive) | Outlined | 24dp |
| Bottom nav (active) | Filled | 24dp |
| Action button | Outlined | 20dp |
| Status icon nhỏ | Filled | 16dp |

**Nguyên tắc:**
- Dùng emoji kết hợp icon ở greeting, empty state (thân thiện)
- Không dùng icon quá kỹ thuật / corporate
- Mỗi icon phải rõ nghĩa — test với người không quen app

---

## 🌟 Key UI Patterns

### Restaurant Card
```
┌──────────────────────────────┐
│  [Food photo 16:9]           │
│  🟢 Đang mở • 4.8⭐(234)    │  ← Overlay badges
├──────────────────────────────┤
│  Phở Bắc Hà                  │  ← heading-md
│  🕐 20 phút  📍 2.3 km  🛵 15k│  ← body-sm, text-secondary
└──────────────────────────────┘
```

### Home Screen Structure
```
Greeting + Avatar       (heading-lg, màu primary)
Search bar              (kRadiusFull, shadow-sm)
Category pills          (horizontal scroll, kRadiusSM)
Section: "🔥 Đang hot" (heading-md)
  Restaurant card grid  (2 cột)
Section: "⚡ Giao nhanh"
  Restaurant card grid  (2 cột)
Bottom navigation       (kRadiusXL, shadow-lg)
```

### Empty States
- Dùng Lottie animation vui vẻ (không dùng ảnh tĩnh buồn)
- Text ngắn, thân thiện, có emoji
- Luôn có action button màu primary

### Loading Skeleton
```dart
// Shimmer với màu warm thay vì xám lạnh
Shimmer.fromColors(
  baseColor: Color(0xFFF5EDE3),   // surface-alt
  highlightColor: Color(0xFFFFF8F2), // background
  child: ...
)
```

---

## 🔗 Xem Thêm
- [i18n và Theme switching](./13-i18n-theme.md)
- [Tech stack](./11-tech-stack.md)
