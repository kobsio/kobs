/// <reference types="vitest" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
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
      VitePWA({
        manifest: {
          background_color: '#233044',
          description: 'Kubernetes Observability Platform',
          dir: 'ltr',
          display: 'standalone',
          icons: [
            {
              purpose: 'any maskable',
              sizes: '36x36',
              src: '/android-chrome-36x36.png',
              type: 'image/png',
            },
            {
              purpose: 'any maskable',
              sizes: '48x48',
              src: '/android-chrome-48x48.png',
              type: 'image/png',
            },
            {
              purpose: 'any maskable',
              sizes: '72x72',
              src: '/android-chrome-72x72.png',
              type: 'image/png',
            },
            {
              purpose: 'any maskable',
              sizes: '96x96',
              src: '/android-chrome-96x96.png',
              type: 'image/png',
            },
            {
              purpose: 'any maskable',
              sizes: '144x144',
              src: '/android-chrome-144x144.png',
              type: 'image/png',
            },
            {
              purpose: 'any maskable',
              sizes: '192x192',
              src: '/android-chrome-192x192.png',
              type: 'image/png',
            },
            {
              purpose: 'any maskable',
              sizes: '256x256',
              src: '/android-chrome-256x256.png',
              type: 'image/png',
            },
            {
              purpose: 'any maskable',
              sizes: '384x384',
              src: '/android-chrome-384x384.png',
              type: 'image/png',
            },
            {
              purpose: 'any maskable',
              sizes: '512x512',
              src: '/android-chrome-512x512.png',
              type: 'image/png',
            },
          ],
          lang: 'en-US',
          name: 'kobs',
          orientation: 'any',
          scope: '.',
          short_name: 'kobs',
          start_url: '/',
          theme_color: '#233044',
        },
        registerType: 'autoUpdate',
        useCredentials: true,
        workbox: {
          maximumFileSizeToCacheInBytes: 100000000,
        },
      }),
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
          target: 'http://localhost:3003',
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
      testTimeout: 60000,
    },
  };
});
