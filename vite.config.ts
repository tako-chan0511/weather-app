// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import commonjs from '@rollup/plugin-commonjs'

export default defineConfig({
  base: '/',             // GitHub Pages や Vercel のサブパスが不要なら `/` のまま
  plugins: [
    vue(),
    // node_modules の UMD モジュールを CommonJS → ESModule に変換する
    commonjs({
      include: /node_modules/
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // 開発中に vite が事前バンドルしてほしいライブラリ群
  optimizeDeps: {
    include: [
      'vue3-leaflet',
      'leaflet',
      'object-assign',
      'geojson-equality',
      'earcut',
      'rbush',
      'deep-equal',
    ]
  },
  build: {
    // 本番ビルド時にも同じ CommonJS 変換が必要な場合
    commonjsOptions: {
      include: /node_modules/,
      transformMixedEsModules: true,
    }
  },
  server: {
    port: 3000,
    // ローカルで /api/geocode → LocationIQ にプロキシ
    proxy: {
      '/api/geocode': {
        target: 'https://us1.locationiq.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/geocode/, '/v1/search.php'),
        // LocationIQ の利用規約として User-Agent を付ける
        configure: (proxy, options) => {
          options.headers = {
            'User-Agent': 'WeatherApp/1.0 (your-email@example.com)',
          }
        }
      }
    }
  }
})
