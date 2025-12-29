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
        // Don't use Node.js modules in renderer
        'electron-store': { type: 'cjs' },
        'electron-updater': { type: 'cjs' },
        'sudo-prompt': { type: 'cjs' },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@shared': resolve(__dirname, './src/shared'),
      '@renderer': resolve(__dirname, './src/renderer'),
      '@main': resolve(__dirname, './src/main'),
    },
  },
  optimizeDeps: {
    include: ['@emotion/is-prop-valid', 'framer-motion'],
    esbuildOptions: {
      // Ensure proper handling of commonjs modules
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        // Ensure framer-motion's dynamic require is handled
        manualChunks: {
          'framer-motion': ['framer-motion'],
        },
      },
    },
  },
  server: {
    port: 5173,
  },
});
