# STRICT CODE REVIEW & QUALITY ASSURANCE RULES

## 1. ZERO LINT & TYPE ERRORS

- **ESLint & Dart Analysis**: Code baseline must maintain 0 warnings and 0 errors across all subpackages.
- **Strict Typing**: Forbidden to use `any` type in TypeScript. Use exact interface definitions or `unknown` with type narrowing.
- **Preserve Documentation**: Maintain all JSDoc and DartDoc comments when refactoring code.

## 2. REUSE & CLEANLINESS

- **Workspace Reuse**: Always check `packages/shared_ui` and `packages/shared_models` before creating custom helpers or widgets.
- **Dead Code Cleanup**: Remove all unused imports, debug `print()` or `console.log()` statements before finalizing a feature.
