/// <reference types="vitest" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: 'index',
      formats: ['es'],
      name: 'mongodb',
    },
    rollupOptions: {
      external: [
        '@emotion/react',
        '@emotion/styled',
        '@kobsio/core',
        '@mui/icons-material',
        '@mui/lab',
        '@mui/material',
        '@tanstack/react-query',
        'react',
        'react-dom',
        'react-router-dom',
      ],
    },
    sourcemap: false,
    // For the MongoDB plugin we have to set the target to esnext, because otherwise the build will fail because of the
    // top level await usage of the 'bson' package, see https://github.com/vitejs/vite/issues/6985
    target: 'esnext',
  },
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  test: {
    alias: [
      {
        find: /^@kobsio\/(.*)/,
        replacement: __dirname + '/../$1/src/index.ts',
      },
    ],
    coverage: {
      provider: 'v8',
    },
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: './src/setupTests.ts',
    testTimeout: 60000,
  },
});
