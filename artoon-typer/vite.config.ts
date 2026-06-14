import { defineConfig } from 'vite';
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
  // Development server configuration
  server: {
    port: 3000,
    open: true,
  },
  // Build configuration - can switch between app and library mode
  build: process.env.BUILD_LIB === 'true' 
    ? {
        // Library mode
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'ArtoonTyper',
          formats: ['es', 'cjs'],
          fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
        },
        rollupOptions: {
          external: [
            'react',
            'react-dom',
            '@artoon/ast',
            '@artoon/parser',
            '@artoon/serializer',
            '@artoon/state',
          ],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
            },
          },
        },
      }
    : {
        // Application mode
        outDir: 'dist-app',
      },
});
