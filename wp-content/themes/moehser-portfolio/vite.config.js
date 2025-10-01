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
        // React DevTools only in development
        jsxRuntime: 'automatic',
        babel: isDevelopment ? {
          plugins: [
            // React DevTools support for development
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
    // Smart minification based on environment
    minify: isProduction ? 'terser' : false,
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Terser options only for production
    terserOptions: isProduction ? {
      compress: {
        drop_console: true,        // Remove console.log in production
        drop_debugger: true,       // Remove debugger in production
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        safari10: true,           // Safari 10 compatibility
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
        manualChunks: (id) => {
          // React and React-DOM in separate chunk for better caching
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }
          
          // Framer Motion in separate chunk (large animation library)
          if (id.includes('node_modules/framer-motion/')) {
            return 'framer-motion';
          }
          
          // XTerm in separate chunk (terminal library)
          if (id.includes('node_modules/xterm/') || id.includes('node_modules/xterm-addon')) {
            return 'xterm';
          }
          
          // Vite and build tools in separate chunk
          if (id.includes('node_modules/vite/') || id.includes('node_modules/@vitejs/')) {
            return 'vite-tools';
          }
          
          // Sass and CSS tools in separate chunk
          if (id.includes('node_modules/sass/') || id.includes('node_modules/terser/')) {
            return 'build-tools';
          }
          
          // All other node_modules in vendor chunk
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
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


