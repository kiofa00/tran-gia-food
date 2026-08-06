# AGENT OPERATIONAL RULES & BEHAVIORAL CONSTRAINTS

## 1. GIT COMMIT & PUSH POLICY (STRICT ENFORCEMENT)

- **LOCAL-ONLY CODE EDITS**: All code edits, build checks, and refactoring must remain local in the workspace.
- **NO AUTO COMMIT / NO AUTO PUSH**: The agent is strictly forbidden from executing `git commit` or `git push` automatically without prior permission.
- **EXPLICIT USER COMMAND REQUIRED**: Execute `git commit` or `git push` ONLY when the user explicitly gives permission or requests it (e.g. _"commit code đi"_, _"push code giúp tôi"_).

## 2. STYLING POLICY (TAILWINDCSS STANDARD)

- **Zero Inline Styles**: Avoid using inline styles (`style={{ ... }}`) unless strictly necessary for dynamic runtime math (e.g. position offsets).
- **TailwindCSS Utility Classes**: Use TailwindCSS utility classes (`className="..."`) across all React/Next.js components.
- **Design Tokens**: Match colors with `adminDesignTokens` tokens and Tailwind colors (`orange-500`, `gray-50`, etc.).

## 3. TESTING ENFORCEMENT & STRATEGY

- **UI Components**: React/Next.js pages/JSX components, Flutter Widget screens (e.g. `Header.tsx`, `HomeScreen.dart`, `LoginScreen.dart`) do NOT require unit test files.
- **Pure Logic & Services**: Custom Hooks (`use*.ts`), Utility functions (`formatters.ts`), NestJS Services (`*.service.ts`), and Database queries MUST be 100% covered by automated tests.
- **Test Command**: Run `pnpm test` (`vitest` + `jest`) to verify logic.

## 4. CODE QUALITY & LINTING

- **Linting**: Run `pnpm lint` to verify code quality. `pnpm lint` automatically runs `--fix` across all subpackages. Maintain 0 errors and 0 warnings.
