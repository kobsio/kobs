/// <reference types="vitest" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig(({ command, mode, ssrBuild }) => {
  let resolve: unknown = {};

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
        {
          find: 'node-fetch',
          replacement: 'isomorphic-fetch',
        },
      ],
    };
  }

  return {
    // Source maps are disabled for now to avoid Javascript heap out of memory errors during the build process.
    //
    // See: https://github.com/vitejs/vite/issues/2433
    build: {
      sourcemap: false,
    },
    plugins: [
      react(),
      // The topLevelAwait plugin is used to enable top level await. This is needed to avoid the following error caused
      // by the `bson` package in the mongodb plugin:
      //
      // Error: Build failed with 1 error:
      // @kobsio/app: ../../node_modules/bson/lib/bson.mjs:95:26: ERROR: Top-level await is not available in the configured target environment ("chrome87", "edge88", "es2020", "firefox78", "safari14" + 2 overrides)
      topLevelAwait({
        promiseExportName: '__tla',
        promiseImportName: (i) => `__tla_${i}`,
      }),
    ],
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
