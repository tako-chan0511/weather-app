// vite.config.ts
import { fileURLToPath, URL } from 'node:url' //★
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa' //★

export default defineConfig({
  plugins: [
    vue(),
   VitePWA({
      registerType: 'autoUpdate', // 更新があった場合に自動でリロードする
      devOptions: {
        enabled: true // 開発モードでもPWAの動作確認を可能にする
      },
      manifest: {
        id: '/weather-app/',
        name: '天気予報アプリ', // アプリのフルネーム
        short_name: '天気アプリ', // ホーム画面に表示される短い名前
        description: '住所、都市名、地図の位置の該当する天気を表示する。', // アプリの説明
        start_url: '/weather-app/', // アプリ起動時のURL
        display: 'standalone', // アドレスバーなどを表示しないネイティブアプリのような表示
        background_color: '#ffffff', // スプラッシュ画面の背景色
        theme_color: '#007acc',      // ツールバーの色
        icons: [
          {
            src: 'icon-192x192.png', // publicディレクトリからの相対パス
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png', // publicディレクトリからの相対パス
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
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
