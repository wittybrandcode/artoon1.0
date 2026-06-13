import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@artoon/ast': resolve(__dirname, '../artoon-ast/src'),
      '@artoon/parser': resolve(__dirname, '../artoon-parser/src'),
      '@artoon/serializer': resolve(__dirname, '../artoon-serializer/src'),
      '@artoon/core': resolve(__dirname, '../artoon-core/src'), '@artoon/state': resolve(__dirname, '../artoon-state/src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.d.ts', 'src/index.ts'],
    },
  },
});
