import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';
  const isProduction = mode === 'production';
  
  return {
    root: __dirname,
    plugins: [
      react({
        // React DevTools nur im Development
        jsxRuntime: 'automatic',
        babel: isDevelopment ? {
          plugins: [
            // React DevTools Support für Development
            ['@babel/plugin-transform-react-jsx-development', { runtime: 'automatic' }]
          ]
        } : {}
      })
    ],
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
    // Intelligente Minifizierung basierend auf Environment
    minify: isProduction ? 'terser' : false,
    // Terser-Optionen nur für Production
    terserOptions: isProduction ? {
      compress: {
        drop_console: true,        // Entferne console.log in Production
        drop_debugger: true,       // Entferne debugger in Production
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        safari10: true,           // Safari 10 Kompatibilität
      },
    } : {},
    rollupOptions: {
      input: {
        main: 'assets/src/js/main.jsx',
      },
      output: {
        assetFileNames: '[name]-[hash][extname]',
        chunkFileNames: '[name]-[hash].js',
        entryFileNames: '[name]-[hash].js',
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
  };
});


