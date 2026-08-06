import nextPlugin from '@next/eslint-plugin-next';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import sonarjs from 'eslint-plugin-sonarjs';
import unusedImports from 'eslint-plugin-unused-imports';

import { config as baseConfig } from './base.js';

/**
 * Strict ESLint configuration for Next.js web applications.
 * Integrates Prettier as an ESLint rule so formatting violations show as lint errors.
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  ...baseConfig,
  {
    plugins: {
      '@next/next': nextPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'unused-imports': unusedImports,
      sonarjs: sonarjs,
      prettier: prettierPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...sonarjs.configs.recommended.rules,
      // Prettier: show formatting issues as ESLint warnings
      'prettier/prettier': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': 'off',
      'react/self-closing-comp': 'error',
      'max-nested-callbacks': ['error', 4],
      'padding-line-between-statements': [
        'warn',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
      ],
      'sonarjs/no-nested-functions': 'off',
      'sonarjs/todo-tag': 'warn',
    },
  },
];
