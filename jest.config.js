/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@artoon/ast$': '<rootDir>/artoon-ast/src',
    '^@artoon/parser$': '<rootDir>/artoon-parser/src',
    '^@artoon/serializer$': '<rootDir>/artoon-serializer/src',
    '^@artoon/validator$': '<rootDir>/artoon-validator/src',
    '^@artoon/renderer-html$': '<rootDir>/artoon-renderer-html/src',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        module: 'commonjs',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: true,
        skipLibCheck: true,
      }
    }]
  },
  collectCoverageFrom: [
    '**/src/**/*.ts',
    '!**/node_modules/**',
    '!**/dist/**'
  ],
  coverageDirectory: 'coverage',
  verbose: true
};
