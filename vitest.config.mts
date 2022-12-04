import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    silent: true,
    coverage: {
      provider: 'c8',
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
});
