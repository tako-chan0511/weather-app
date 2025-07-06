// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import commonjs from '@rollup/plugin-commonjs'

export default defineConfig({
  // ★重要修正: ローカル開発時の base パス設定★
  // ローカル開発サーバーでは '/' を使用し、ビルド時のみ '/weather-app/' を適用
  base: process.env.NODE_ENV === 'production' ? '/weather-app/' : '/', 
  // ↑ Vercel のデフォルトデプロイ (.vercel.app ドメイン) は通常ルートパス '/' なので
  // 本番も '/' にすべきですが、GitHub Pages にデプロイする可能性があるため、一旦 '/weather-app/' を維持します。
  // Vercel にデプロイするなら、本番も '/' が適切です。

  plugins: [
    vue(),
    commonjs({
      include: /node_modules/,
    }),
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  
  optimizeDeps: {
    include: [
      'leaflet',
      'object-assign', 
      'geojson-equality',
      'earcut',
      'rbush',
      'deep-equal',
    ],
  },
  
  build: {
    commonjsOptions: {
      include: /node_modules/,
      transformMixedEsModules: true,
    },
  },
  
  server: {
    port: 3000,
    proxy: {
      // ローカル開発サーバーは常に /api からのプロキシを受け付ける
      '/api': { 
        target: 'https://us1.locationiq.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          options.headers = {
            'User-Agent': 'WeatherApp/1.0 (your_email@example.com)', 
          };
        },
      },
    },
  },
})