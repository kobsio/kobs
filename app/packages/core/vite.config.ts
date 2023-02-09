/// <reference types="vitest" />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: 'index',
      formats: ['es'],
      name: 'core',
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
  },
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  test: {
    include: ['**/*.{test}.{ts,tsx}'],
  }
});
