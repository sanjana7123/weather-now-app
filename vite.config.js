import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/geocoding': {
        target: 'https://geocoding-api.open-meteo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/geocoding/, '')
      },
      '/api/forecast': {
        target: 'https://api.open-meteo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/forecast/, '')
      }
    },
    allowedHosts: ['fdcwt2-5174.csb.app'], // 👈 add your sandbox host here
    host: true, // allow external access (important if running outside localhost)
    port: 5174  // optional
  }
})
