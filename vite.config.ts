// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import commonjs from '@rollup/plugin-commonjs'

export default defineConfig({
  base: '/', 
  
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
      // ★最終修正: LocationIQのプロキシ設定★
      // クライアントからのリクエストパス: /api/geocode (例: http://localhost:3000/api/geocode?q=福岡...)
      // target: LocationIQのホスト全体
      // rewrite: /api/geocode を LocationIQ の API パス (/v1/search.php) に置き換える
      '/api/geocode': { 
        target: 'https://us1.locationiq.com', // LocationIQのベースURL
        changeOrigin: true,
        // rewrite は、'/api/geocode' の部分を '/v1/search.php' に正確に書き換える
        // クエリパラメータ '?key=...' などはそのまま引き継がれる
        rewrite: (path) => path.replace(/^\/api\/geocode/, '/v1/search.php'), 
        configure: (proxy, options) => {
          options.headers = {
            'User-Agent': 'WeatherApp/1.0 (harakeisuke7@gmail.com)', // あなたのメールアドレス
          };
        },
      },
    },
  },
})