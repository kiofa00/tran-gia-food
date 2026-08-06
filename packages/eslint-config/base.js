import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

/**
 * Shared strict base ESLint configuration for Tran Gia Food monorepo.
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      // Disabled: conflicts with optional chaining patterns (a?.b?.c) used throughout the codebase
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_.*?$',
        },
      ],
    },
  },
  {
    ignores: ['node_modules/', '.next/', 'dist/', 'build/', 'coverage/', 'next-env.d.ts', 'out/'],
  },
];
