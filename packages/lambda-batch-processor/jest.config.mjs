/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['jest-extended/all'],
  transform: {
    '^.+\\.ts$': '@swc/jest',
  },
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
  coveragePathIgnorePatterns: [],
  extensionsToTreatAsEsm: ['.ts'],
};
