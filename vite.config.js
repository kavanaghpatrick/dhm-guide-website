import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import viteImagemin from 'vite-plugin-imagemin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Image optimization plugin
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      mozjpeg: {
        quality: 80,
      },
      pngquant: {
        quality: [0.65, 0.8],
        speed: 4,
      },
      webp: {
        quality: 80,
      },
    }),
  ],
  base: '/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Code splitting for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor libraries
          vendor: ['react', 'react-dom'],
          // UI components
          ui: [
            '@radix-ui/react-accordion',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip'
          ],
          // Utilities
          utils: ['date-fns', 'clsx', 'tailwind-merge', 'class-variance-authority'],
          // Icons and animations
          icons: ['lucide-react', 'framer-motion'],
          // Markdown and content
          content: ['react-markdown', 'remark-gfm', 'gray-matter']
        }
      }
    },
    // Minification and compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: false,
        pure_funcs: []
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

