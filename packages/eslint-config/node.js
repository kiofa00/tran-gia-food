import sonarjs from 'eslint-plugin-sonarjs';

import { config as baseConfig } from './base.js';

/**
 * Strict ESLint configuration for NestJS backend services.
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  ...baseConfig,
  {
    plugins: {
      sonarjs: sonarjs,
    },
    rules: {
      ...sonarjs.configs.recommended.rules,
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_.*?$',
        },
      ],
      'sonarjs/no-nested-functions': 'off',
      'sonarjs/todo-tag': 'warn',
    },
  },
];
