import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  base: '/wp-content/themes/moehser-portfolio/',
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    origin: 'http://localhost:5173',
    hmr: {
      host: 'localhost',
      protocol: 'ws',
      port: 5173,
    },
  },
  build: {
    manifest: true,
    outDir: 'assets/dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'assets/src/js/main.jsx',
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./assets/src', import.meta.url)),
    },
  },
});


