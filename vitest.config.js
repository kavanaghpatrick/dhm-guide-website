import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

// Unit/component tests only. Kept SEPARATE from vite.config.js so the imagemin /
// terser / prerender concerns never load under tests. The Playwright `tests/` dir
// is excluded so Vitest never tries to execute Playwright `.spec.js` files.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    exclude: ['tests/**', 'node_modules/**', 'dist/**'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lib/experimentOverride.js', 'src/hooks/useVariant.js', 'src/components/modern/**', 'src/pages/*Route.jsx'],
    },
  },
})
