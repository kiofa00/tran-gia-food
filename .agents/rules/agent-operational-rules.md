# AGENT OPERATIONAL RULES & BEHAVIORAL CONSTRAINTS

## 1. GIT COMMIT & PUSH POLICY (STRICT ENFORCEMENT)

- **LOCAL-ONLY CODE EDITS**: All code edits, build checks, and refactoring must remain local in the workspace.
- **NO AUTO COMMIT / NO AUTO PUSH**: The agent is strictly forbidden from executing `git commit` or `git push` in ANY situation except one (see below).
- **ONLY VIA push-code SKILL**: The ONLY permitted way to run `git commit` or `git push` is when the user explicitly triggers the **push-code skill** (e.g. `/push`, `push code`, `push đi`, `commit đi`). No other context, command, or approval grants this permission.
- **PLAN APPROVAL ≠ GIT PERMISSION**: User approving an implementation plan (clicking Proceed) does NOT grant permission to commit or push. Approval only grants permission to write code.
- **AFTER IMPLEMENTATION**: When implementation is complete, report results and STOP. Do NOT commit or push. Wait for the user to trigger the push-code skill.
- **NO EXCEPTIONS**: Even if the user says "done", "looks good", "ship it" in passing — do NOT commit or push unless the push-code skill is explicitly triggered.

## 2. STYLING POLICY (TAILWINDCSS — STRICT ENFORCEMENT)

- **ZERO INLINE STYLES (NO EXCEPTIONS)**: NEVER write `style={{ ... }}` on any HTML element or React component. This is strictly forbidden.
- **TailwindCSS ONLY**: ALL styling must use `className="..."` with TailwindCSS utility classes. This includes colors, spacing, typography, layout, shadows, borders, gradients, and animations.
- **Design Tokens for Colors**: Use Tailwind color scale (`orange-500`, `gray-50`, `green-600`, etc.) or `adminDesignTokens.*` values. NEVER hardcode hex (`#FF6B35`) or rgb values directly in JSX.
- **Allowed Exceptions** (only these 3 cases permit `style`):
  1. **Ant Design component API props** that only accept object format (e.g. `styles={{ body: { padding: '...' } }}` on `<Card>`, `valueStyle={{ ... }}` on `<Statistic>`). Use sparingly.
  2. **Dynamic runtime values** that cannot be expressed as static Tailwind classes (e.g. calculated pixel offsets, canvas dimensions).
  3. **CSS custom property injection** (`style={{ '--var': value }}`).
- **`!important` modifier — dùng có chọn lọc**: Tailwind's `!` prefix (e.g. `!bg-orange-500`, `!px-0`) được phép dùng **khi cần thiết** để override Ant Design CSS-in-JS hoặc third-party library styles có specificity cao hơn. Ưu tiên dùng giải pháp không cần `!` trước (plain HTML wrapper, restructure, v.v.), nhưng không bắt buộc.
- **Self-Check Before Writing**: Before writing any `style={{ }}`, ask: "Can this be a Tailwind class?" — if yes, use className. If it falls outside the 3 exceptions above, it is FORBIDDEN.

## 3. TESTING ENFORCEMENT & STRATEGY

- **UI Components**: React/Next.js pages/JSX components, Flutter Widget screens (e.g. `Header.tsx`, `HomeScreen.dart`, `LoginScreen.dart`) do NOT require unit test files.
- **Pure Logic & Services**: Custom Hooks (`use*.ts`), Utility functions (`formatters.ts`), NestJS Services (`*.service.ts`), and Database queries MUST be 100% covered by automated tests.
- **Test Command**: Run `pnpm test` (`vitest` + `jest`) to verify logic.

## 4. CODE QUALITY & LINTING

- **Linting**: Run `pnpm lint` to verify code quality. `pnpm lint` automatically runs `--fix` across all subpackages. Maintain 0 errors and 0 warnings.
