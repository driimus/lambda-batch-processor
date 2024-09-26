import eslint from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import importX from 'eslint-plugin-import-x';
import prettier from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import turbo from 'eslint-plugin-turbo';
import unicorn from 'eslint-plugin-unicorn';
import tsEslint from 'typescript-eslint';

export default tsEslint.config(
  { ignores: ['packages/*/dist', 'packages/*/coverage', '**/*.d.ts'] },
  eslint.configs.recommended,
  ...tsEslint.configs.recommendedTypeChecked,
  {
    rules: {
      complexity: ['warn', { max: 5 }],
    },
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['eslint.config.js'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      'import-x': importX,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import-x/first': 'error',
      'import-x/newline-after-import': 'error',
      'import-x/no-duplicates': 'error',
    },
  },
  unicorn.configs['flat/recommended'],
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': tsEslint.plugin,
    },
    rules: {
      'prefer-const': ['error', { destructuring: 'all' }],
      'unicorn/filename-case': ['warn', { case: 'camelCase' }],
      'unicorn/no-null': 'off',
      'unicorn/no-useless-switch-case': 'error',
      'unicorn/prevent-abbreviations': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/member-ordering': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksConditionals: true,
        },
      ],
      '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/require-await': 'warn',
    },
  },
  {
    files: ['**/*.test.ts'],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
    languageOptions: {
      globals: vitest.environments.env.globals,
    },
  },
  {
    files: ['turbo.json'],
    plugins: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      turbo,
    },
    rules: {
      ...tsEslint.configs.disableTypeChecked,
      'turbo/no-undeclared-env-vars': 'error',
    },
  },
  prettier,
);
