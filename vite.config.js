import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  base: './',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      '5173-i1fnroqrfai6g2ekq2bpx-3f25a3df.manusvm.computer',
      '5174-i1fnroqrfai6g2ekq2bpx-3f25a3df.manusvm.computer'
    ]
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      '5173-i1fnroqrfai6g2ekq2bpx-3f25a3df.manusvm.computer',
      '5174-i1fnroqrfai6g2ekq2bpx-3f25a3df.manusvm.computer'
    ]
  }
})

