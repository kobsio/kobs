/// <reference types="vitest" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { configDefaults } from 'vitest/config';

import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: 'index',
      formats: ['es'],
      name: 'sql',
    },
    rollupOptions: {
      external: [
        '@codemirror/state',
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
      all: true,
      exclude: [...configDefaults.coverage.exclude, 'src/components/utils/clickhouse.ts'],
    },
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: './src/setupTests.ts',
  },
});
