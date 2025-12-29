import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'src/main/index.ts',
        onstart(options) {
          options.startup();
        },
        vite: {
          build: {
            outDir: 'dist/main',
            rollupOptions: {
              external: ['electron', 'electron-store', 'electron-updater', 'sudo-prompt'],
            },
          },
        },
      },
      {
        entry: 'src/preload/index.ts',
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            outDir: 'dist/preload',
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
    ]),
    renderer({
      resolve: {
        // Don't externalize @vanilla-dns/shared - bundle it instead
        '@vanilla-dns/shared': { type: 'esm' },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@shared': resolve(__dirname, './src/shared'),
      '@renderer': resolve(__dirname, './src/renderer'),
      '@main': resolve(__dirname, './src/main'),
      // Force ESM version of shared package
      '@vanilla-dns/shared': resolve(__dirname, '../../packages/shared/dist/index.js'),
    },
  },
  optimizeDeps: {
    include: ['@vanilla-dns/shared'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
    target: 'esnext',
    rollupOptions: {
      output: {
        format: 'es',
      },
    },
  },
  server: {
    port: 5173,
  },
});
