# AGENT OPERATIONAL RULES & BEHAVIORAL CONSTRAINTS

## 1. GIT PUSH POLICY (CRITICAL)
- **LOCAL-ONLY BY DEFAULT**: All code edits, commits, and refactorings must remain in the local environment.
- **NO AUTO PUSH**: The agent is strictly forbidden from executing `git push` automatically.
- **EXPLICIT USER COMMAND REQUIRED**: Execute `git push` ONLY when the user explicitly requests it (e.g. *"push code đi"*, *"push cho tôi"*).

## 2. TESTING ENFORCEMENT & STRATEGY
- **UI Components**: React/Next.js pages/JSX components, Flutter Widget screens (e.g. `Header.tsx`, `HomeScreen.dart`, `LoginScreen.dart`) do NOT require unit test files.
- **Pure Logic & Services**: Custom Hooks (`use*.ts`), Utility functions (`formatters.ts`), NestJS Services (`*.service.ts`), and Database queries MUST be 100% covered by automated tests.
- **Test Command**: Run `pnpm test` (`vitest` + `jest`) to verify logic.

## 3. DESIGN TOKENS POLICY (ZERO HARDCODE)
- **Zero Hardcode Colors**: Do NOT hardcode hex colors (`#FF6635`, `#FFD93D`) or font size numbers (`fontSize: 16`) inside UI components or markup.
- **Flutter Apps**: Use `AppColors.*`, `AppFontSize.*`, `AppFontWeight.*` from `packages/shared_ui`.
- **Next.js Admin Web**: Use `adminDesignTokens.*` module connected to central JSON tokens.

## 4. CODE QUALITY & LINTING
- **Linting**: Run `pnpm lint` to verify code quality. `pnpm lint` automatically runs `--fix` across all subpackages. Maintain 0 errors and 0 warnings.
