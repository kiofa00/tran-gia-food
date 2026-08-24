# STRICT CODE REVIEW & QUALITY ASSURANCE RULES

## 1. ZERO LINT & TYPE ERRORS

- **ESLint & Dart Analysis**: Code baseline must maintain 0 warnings and 0 errors across all subpackages.
- **Strict Typing**: Forbidden to use `any` type in TypeScript. Use exact interface definitions or `unknown` with type narrowing.
- **Preserve Documentation**: Maintain all JSDoc and DartDoc comments when refactoring code.

## 2. REUSE & CLEANLINESS

- **Workspace Reuse**: Always check `packages/shared_ui` and `packages/shared_models` before creating custom helpers or widgets.
- **Dead Code Cleanup**: Remove all unused imports, debug `print()` or `console.log()` statements before finalizing a feature.
- **Mandatory i18n & Translation**: Zero hardcoded strings in UI. All labels, messages, and titles must use translation hooks / localization.
- **Centralized Config & Constants**: Zero hardcoded magic strings/numbers, raw route paths, or inline regex. All must be declared in config/constants files.
- **Separation of Concerns**: Cấm viết business logic / fetch API trực tiếp trong UI component. Phải tách ra Custom Hooks / Services.
