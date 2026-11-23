import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// En desarrollo el frontend llama a la API por su mismo origen y Vite la reenvía al backend,
// evitando las solicitudes CORS de verificación previa.
const apiTarget = process.env.VITE_PROXY_TARGET || 'http://localhost:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // En Docker sobre Windows los cambios del volumen no generan eventos; se revisan por sondeo.
    watch: process.env.VITE_USE_POLLING === 'true' ? { usePolling: true, interval: 300 } : undefined,
    proxy: {
      '/api': apiTarget,
      '/sanctum': apiTarget,
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
    include: ['src/**/*.test.{js,jsx}'],
  },
})
