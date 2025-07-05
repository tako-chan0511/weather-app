// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  base: '/weather-app/',

  plugins: [
    vue(),
  ],

  resolve: {
    alias: {
      // src 以下を @ で参照できるように設定
      '@': path.resolve(__dirname, 'src'),
    },
  },

  server: {
    port: 3000,
    open: true,
  },

  define: {
    // Vite の環境変数を .env から使うためのヒント
    'process.env': {},
  },
})
