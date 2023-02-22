/// <reference types="vitest" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ command, mode, ssrBuild }) => {
  let resolve = undefined;

  // For development we have to set an alias for all packages, to get hot reloading working.
  if (command === 'serve') {
    resolve = {
      alias: [
        {
          find: /^@kobsio\/(.*)/,
          replacement: './../../$1/src/index.ts',
        },
      ],
    };
  }

  return {
    build: {
      sourcemap: true,
    },
    plugins: [react()],
    resolve: resolve,
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:15220',
        },
      },
      strictPort: true,
    },
    test: {
      coverage: {
        all: true,
      },
      environment: 'jsdom',
      globals: true,
      include: ['src/**/*.test.{ts,tsx}'],
      setupFiles: './src/setupTests.ts',
    },
  };
});
