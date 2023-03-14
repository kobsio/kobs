/// <reference types="vitest" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

import { resolve as _resolve } from 'path';

export default defineConfig(({ command, mode, ssrBuild }) => {
  return {
    build: {
      lib: {
        entry: _resolve(__dirname, 'src/index.ts'),
        fileName: 'index',
        formats: ['es'],
        name: 'klogs',
      },
      rollupOptions: {
        external: [
          '@emotion/react',
          '@emotion/styled',
          '@mui/icons-material',
          '@mui/material',
          '@tanstack/react-query',
          'react',
          'react-dom',
          'react-router-dom',
        ],
      },
      sourcemap: true,
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
      setupFiles: './src/test/setup.ts',
    },
  };
});
