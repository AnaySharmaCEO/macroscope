/**
 * MACROSCOPE PERFORMANCE OS - ELECTRON VITE CONFIG
 * Vite configuration for the Electron renderer process.
 * Produces the frontend bundle that Electron loads via loadFile().
 */

import { defineConfig } from 'vite';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Use the electron-specific HTML entry
  root: './',
  build: {
    outDir: 'dist-electron-renderer',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'electron.html'),
      },
    },
  },

  // Dev server for Electron dev mode
  server: {
    port: 5173,
    strictPort: true,
  },

  // Electron uses file:// in production — make assets relative
  base: './',

  assetsInclude: ['**/*.svg', '**/*.csv'],
});
