// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: {
    port: 3000,
    proxy: {
      '/api/geocode': {
        target: 'https://us1.locationiq.com',
        changeOrigin: true,
        rewrite: p => p.replace(/^\/api\/geocode/, '/v1/search.php'),
        configure: (_proxy, options) => {
          options.headers = {
            'User-Agent': 'WeatherApp/1.0 (you@example.com)',
          }
        },
      },
    },
  },
})
