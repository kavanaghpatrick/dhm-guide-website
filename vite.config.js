import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
// Last updated: 2025-06-28 - Triggering deployment after subscription upgrade
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/',
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    // Enhanced minification and compression for SEO performance
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn'],
        passes: 2
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging (optional)
    sourcemap: false
  },
  // Performance optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'lucide-react',
      'clsx',
      'tailwind-merge'
    ]
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      '5173-i1fnroqrfai6g2ekq2bpx-3f25a3df.manusvm.computer',
      '5174-i1fnroqrfai6g2ekq2bpx-3f25a3df.manusvm.computer',
      '5173-imgkk9wseqbrgzudhc7ly-d28d70b7.manusvm.computer'
    ]
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      '5173-i1fnroqrfai6g2ekq2bpx-3f25a3df.manusvm.computer',
      '5174-i1fnroqrfai6g2ekq2bpx-3f25a3df.manusvm.computer',
      '5173-i92sdp1hpl7mgnt5z3oml-93e43c32.manusvm.computer'
    ]
  }
})

