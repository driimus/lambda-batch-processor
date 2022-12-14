/** @type {import('@types/eslint').ESLint.ConfigData} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jest', 'simple-import-sort', 'import', 'unicorn', 'turbo'],
  env: {
    node: true,
    es6: true,
  },
  extends: ['eslint:recommended', 'plugin:jest/recommended', 'plugin:unicorn/recommended'],
  parserOptions: {
    ecmaVersion: 2021,
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json', './packages/*/tsconfig.json', './packages/**/*/tsconfig.json'],
  },
  ignorePatterns: ['*.d.ts'],
  overrides: [
    {
      files: ['*.ts'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:prettier/recommended',
        'plugin:jest/recommended',
      ],
      rules: {
        'prefer-const': ['error', { destructuring: 'all' }],
        'prettier/prettier': 'warn',
        '@typescript-eslint/member-ordering': 'warn',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-return': 'warn',
        '@typescript-eslint/no-unsafe-call': 'error',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-misused-promises': [
          'error',
          {
            checksConditionals: true,
          },
        ],
        '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/require-await': 'warn',
        '@typescript-eslint/restrict-plus-operands': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/consistent-type-imports': 'error',
        // https://github.com/lydell/eslint-plugin-simple-import-sort
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        'import/first': 'error',
        'import/newline-after-import': 'error',
        'import/no-duplicates': 'error',
        'unicorn/filename-case': ['warn', { case: 'camelCase' }],
        'unicorn/prevent-abbreviations': 'warn',
        'unicorn/no-null': 'off',
        'unicorn/no-useless-switch-case': 'error',
        'turbo/no-undeclared-env-vars': 'error',
      },
    },
  ],
  settings: {
    jest: {
      version: 29,
    },
  },
};
