/// <reference types="vitest" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ command, mode, ssrBuild }) => {
  let resolve = undefined;

  // For development we have to set an alias for all packages, to get hot reloading working. Since we also have to
  // import .css files in the app packages main.tsx file we only allow alphanumberic characters and hyphens as a valid
  // package name.
  //
  // See: https://vitejs.dev/config/shared-options.html#resolve-alias
  if (command === 'serve') {
    resolve = {
      alias: [
        {
          find: /^@kobsio\/([a-zA-Z0-9-]*)$/,
          replacement: __dirname + '/../$1/src/index.ts',
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
