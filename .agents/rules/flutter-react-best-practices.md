# FLUTTER & REACT BEST PRACTICES

## 1. REACT / NEXT.JS BEST PRACTICES (`apps/admin_web`)

- **App Router Structure**: Keep pages modular inside `src/app/`. Use `src/components/` for shared components.
- **Ant Design Integration**: Wrap Next.js pages with `ConfigProvider` for theme token propagation. Use `antd` layout and UI components (`Card`, `Table`, `Tag`, `Badge`, `Statistic`, `Row`, `Col`).
- **Design Tokens**: Reference `adminDesignTokens` module for colors, font sizes, weights, and radius.
- **Mandatory Translation (i18n)**: All UI texts MUST use `t(...)` from `useLocale()` / `useTranslation()`. Never hardcode raw strings.
- **Centralized Routes & Configs**: Routes (`ROUTES`), regex patterns (`REGEX`), and system constants must be imported from centralized config files (`src/constants/routes.ts`, `src/constants/regex.ts`, etc.).
- **Separation of Concerns**: Keep JSX pure & presentation-focused. Extract data fetching, form handling, and state mutation into custom hooks (`use<Feature>.ts`).

## 2. FLUTTER BEST PRACTICES (`apps/customer_app`, `apps/restaurant_app`, `apps/shipper_app`)

- **State Management**: Use `StatefulWidget` or `Riverpod` providers cleanly. Keep transient state local.
- **Widgets Isolation**: Extract complex UI sub-trees into private `_buildX()` helper methods or separate Widget classes.
- **Design System Tokens**: Reference `AppColors`, `AppFontSize`, `AppFontWeight`, `AppRadius`, `AppShadows` from `shared_ui`.
- **Localization (l10n)**: All screen text and dialogs must use AppLocalizations / translation resources.
- **Centralized Routes & Constants**: Route names and regex/validation rules must be declared in `AppRoutes`, `AppConstants`, or `AppRegex`.
- **Separation of Logic**: Widgets must not directly perform network/database calls. Use Repositories and State Notifiers.
