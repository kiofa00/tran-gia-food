# FLUTTER & REACT BEST PRACTICES

## 1. REACT / NEXT.JS BEST PRACTICES (`apps/admin_web`)

- **App Router Structure**: Keep pages modular inside `src/app/`. Use `src/components/` for shared components.
- **Ant Design Integration**: Wrap Next.js pages with `ConfigProvider` for theme token propagation. Use `antd` layout and UI components (`Card`, `Table`, `Tag`, `Badge`, `Statistic`, `Row`, `Col`).
- **Design Tokens**: Reference `adminDesignTokens` module for colors, font sizes, weights, and radius.

## 2. FLUTTER BEST PRACTICES (`apps/customer_app`, `apps/restaurant_app`, `apps/shipper_app`)

- **State Management**: Use `StatefulWidget` or `Riverpod` providers cleanly. Keep transient state local.
- **Widgets Isolation**: Extract complex UI sub-trees into private `_buildX()` helper methods or separate Widget classes.
- **Design System Tokens**: Reference `AppColors`, `AppFontSize`, `AppFontWeight`, `AppRadius`, `AppShadows` from `shared_ui`.
