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
    // Enhanced image optimization plugin for dramatic size reduction
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      mozjpeg: {
        quality: 75,
        progressive: true,
      },
      pngquant: {
        quality: [0.5, 0.7],
        speed: 1,
        floyd: 0.5,
      },
      webp: {
        quality: 75,
        method: 6,
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

