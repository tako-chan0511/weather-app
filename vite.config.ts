// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import commonjs from '@rollup/plugin-commonjs'

export default defineConfig({
  base: '/weather-app/', // GitHub Pagesのリポジトリ名に合わせてください
  
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
    // 依存プリバンドル時に CommonJS モジュールを先回りして変換
    // 'leaflet' はここで含めたままでOK (開発用)
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
    // ★重要修正: Leaflet に関する rollupOptions を削除★
    // RollupがLeafletを外部モジュールとして扱わないようにする
    // これにより、Leafletは通常の依存関係としてバンドルに含まれる
    // rollupOptions: { // このブロック全体を削除
    //   external: ['leaflet'], 
    //   output: {
    //     globals: {
    //       leaflet: 'L',
    //     },
    //   },
    // },
  },
  
  server: {
    port: 3000,
    proxy: {
      '/locationiq-api': {
        target: 'https://us1.locationiq.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/locationiq-api/, ''),
        configure: (proxy, options) => {
          options.headers = {
            'User-Agent': 'WeatherApp/1.0 (your_email@example.com)',
          };
        },
      },
    },
  },
})