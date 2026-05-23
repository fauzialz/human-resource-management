/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(() => ({
  root: import.meta.dirname,
  envDir: '../../',
  cacheDir: '../../node_modules/.vite/apps/admin-app',
  resolve: {
    alias: {
      '@human-resource-management/shared-types': resolve(
        import.meta.dirname,
        '../../libs/shared-types/src/index.ts',
      ),
      '@human-resource-management/ui-components': resolve(
        import.meta.dirname,
        '../../libs/ui-components/src/index.ts',
      ),
      '@nestjs/common': resolve(
        import.meta.dirname,
        'src/stubs/nestjs-common.ts',
      ),
    },
  },
  server: {
    port: 4001,
    host: 'localhost',
  },
  preview: {
    port: 4001,
    host: 'localhost',
  },
  plugins: [react()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
