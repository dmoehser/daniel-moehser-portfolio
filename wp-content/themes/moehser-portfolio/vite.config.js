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
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    rollupOptions: {
      input: {
        main: 'assets/src/js/main.jsx',
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./assets/src', import.meta.url)),
    },
  },
});


