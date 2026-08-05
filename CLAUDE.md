# tran_gia_app — Flutter Project Context

This file provides context to AI coding assistants (Claude, Antigravity, Gemini, etc.)
about this project so they can give better, more accurate help.

---

## 📌 Project Overview

- **Name:** tran_gia_app
- **Type:** Flutter mobile / web application
- **Purpose:** A Dart language learning app with 6 interactive demo pages
- **Language:** Dart (Flutter SDK)
- **Target platforms:** Android, Web (Chrome/Edge)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Flutter (stable channel, 3.44.x) |
| Language | Dart |
| State | `StatefulWidget` + `setState()` |
| Navigation | `Navigator.push` / `Navigator.pop` (imperative) |
| Packages | Flutter SDK only (no third-party packages) |

---

## 📁 Project Structure

```
lib/
├── main.dart                   ← App entry, MaterialApp, dark theme
└── pages/
    ├── demo_scaffold.dart      ← Shared reusable layout (DemoScaffold, DemoSection)
    ├── home_page.dart          ← Grid menu, navigates to all topic pages
    ├── variables_page.dart     ← Demo: var, String, int, double, bool, const, final
    ├── functions_page.dart     ← Demo: basic, arrow, named params, higher-order
    ├── lists_maps_page.dart    ← Demo: List, Map, Set, .map(), .where(), .fold()
    ├── classes_page.dart       ← Demo: class, constructor, getter, extends, @override
    ├── null_safety_page.dart   ← Demo: ?, ??, ?., !, nullable types
    └── async_page.dart         ← Demo: Future, async, await, try/catch
```

---

## 🎨 Design System

- **Theme:** Dark mode (`Brightness.dark`), Material 3
- **Background:** `#0F0F1A` (deep navy)
- **Card bg:** `#1A1A2E`
- **Code block bg:** `#111120`
- **Font:** Roboto (Flutter default)
- **Border radius:** `16px` (cards), `12px` (icon containers), `8px` (small elements)

### Accent colors (one per page)
| Page | Color |
|---|---|
| Variables | `#6C63FF` purple |
| Functions | `#00BCD4` cyan |
| Lists & Maps | `#4CAF50` green |
| Classes | `#FF9800` orange |
| Null Safety | `#E91E63` pink |
| Async/Await | `#9C27B0` deep purple |

---

## 🧱 Key Patterns

### Adding a new demo page

1. Create `lib/pages/my_topic_page.dart`
2. Extend `StatefulWidget` or `StatelessWidget`
3. Return `DemoScaffold` with a list of `DemoSection` objects
4. Add a card to `home_page.dart` topics list
5. Import the new page in `home_page.dart`

### DemoSection usage
```dart
DemoSection(
  label: 'Section title',
  code: 'dart code here',       // shown in monospace code block
  result: 'plain result text',  // shown below code
  resultWidget: SomeWidget(),   // optional: replaces result text
)
```

### StatefulWidget with setState
```dart
class MyPage extends StatefulWidget {
  const MyPage({super.key});
  @override
  State<MyPage> createState() => _MyPageState();
}

class _MyPageState extends State<MyPage> {
  int counter = 0;

  @override
  Widget build(BuildContext context) {
    return DemoScaffold(
      title: 'My Page',
      color: const Color(0xFF6C63FF),
      sections: [ ... ],
    );
  }
}
```

---

## ⚠️ Known Constraints

- **`const` fields in a class body must be `static const`** — not just `const`
- **Avoid `$variable` interpolation inside code-snippet strings** — use raw strings `r'...'` or escape with `\$`
- No state management library — uses only built-in `setState()`
- No routing library — uses `Navigator.push` directly

---

## 🚀 Running the App

```bash
# Android emulator
flutter run -d emulator-5554

# Chrome browser
flutter run -d chrome

# List all devices
flutter devices
```

### Hot reload (while running)
| Key | Action |
|---|---|
| `r` | Hot reload (fast, keeps state) |
| `R` | Hot restart |
| `q` | Quit |

---

## 📚 Learning Goals

This app is built to help the developer learn:
1. Dart variable types and declarations
2. Functions (basic, arrow, named/optional params, higher-order)
3. Collections (List, Map, Set) and functional methods
4. OOP (classes, constructors, getters, inheritance, override)
5. Null safety (`?`, `??`, `?.`, `!`)
6. Asynchronous programming (`Future`, `async`/`await`, `try/catch`)
