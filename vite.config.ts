import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: './',
  base: '/', // Changed to absolute path for production
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false, // Disable sourcemaps in production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-helmet-async'],
          'supabase': ['@supabase/supabase-js'],
          'ui-libs': ['lucide-react'],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
})
