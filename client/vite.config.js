import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // --- CAMBIO AQUÍ: Cambiamos localhost por tu URL real de Render ---
        target: 'https://proyecto-final-2-1kya.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
})