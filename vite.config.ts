// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import commonjs from '@rollup/plugin-commonjs'

export default defineConfig({
  base: '/weather-app/',
  plugins: [
    vue(),
    // Rollup の CommonJS プラグインを挿入
    commonjs({
      // node_modules 以下の CommonJS モジュールを変換対象にする
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
    include: [
      'object-assign',
      'geojson-equality',
      'earcut',
      'rbush',
      'deep-equal',
      'leaflet',
    ],
  },
  build: {
    commonjsOptions: {
      // ビルド時にも CommonJS を変換する対象を node_modules 全体に拡大
      include: [/node_modules/],
      // 必要に応じて transformMixedEsModules も true に
      transformMixedEsModules: true,
    },
  },
  server: {
    port: 3000,
  },
  define: {
    'process.env': {},
  },
})
