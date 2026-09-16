import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import unusedImports from 'eslint-plugin-unused-imports';
import sonarjs from 'eslint-plugin-sonarjs';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  sonarjs.configs.recommended,
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*', '..'],
              message: "Please use the '@/' path alias instead of relative parent imports ('..').",
            },
          ],
        },
      ],
      // Fine-tuning Sonar rules for Next.js / React
      'sonarjs/no-duplicate-string': 'off', // Allow reusable string literals like class names or routes
      'sonarjs/pseudo-random': 'off',
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    '.scannerwork/**',
    'next-env.d.ts',
    'node_modules/**',
    'scripts/**',
  ]),
]);

export default eslintConfig;
