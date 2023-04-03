/// <reference types="vitest" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import topLevelAwait from 'vite-plugin-top-level-await';

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
  },
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
    // The topLevelAwait plugin is used to enable top level await. This is needed to avoid the following error caused
    // by the `bson` package:
    //
    // [vite:esbuild-transpile] Transform failed with 1 error:
    // index.js:1422:26: ERROR: Top-level await is not available in the configured target environment ("chrome87", "edge88", "es2020", "firefox78", "safari14" + 2 overrides)
    topLevelAwait({
      promiseExportName: '__tla',
      promiseImportName: (i) => `__tla_${i}`,
    }),
  ],
  test: {
    alias: [
      {
        find: /^@kobsio\/(.*)/,
        replacement: __dirname + '/../$1/src/index.ts',
      },
      {
        find: /^monaco-editor$/,
        replacement: __dirname + '../../../node_modules/monaco-editor/esm/vs/editor/editor.api',
      },
    ],
    coverage: {
      all: true,
    },
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: './src/setupTests.ts',
  },
});
