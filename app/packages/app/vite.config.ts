/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '/api': {
        target: 'http://localhost:15220',
      },
    },
    strictPort: true,
  },
  test: {
    include: ['**/*.{test}.{ts,tsx}'],
  }
});
