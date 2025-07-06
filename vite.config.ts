// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import commonjs from '@rollup/plugin-commonjs' // CommonJS プラグインをインポート

export default defineConfig({
  base: '/weather-app/', // GitHub Pagesのリポジトリ名に合わせてください (例: /weather-app/)
  
  plugins: [
    vue(),
    // Rollup の CommonJS プラグインを挿入 (node_modules内のCommonJSモジュールを変換)
    commonjs({
      include: /node_modules/,
      // transformMixedEsModules: true, // 必要に応じて有効化
    }),
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  
  // 依存プリバンドル時のCommonJSモジュール変換を最適化 (開発用)
  optimizeDeps: {
    include: [
      'leaflet', // Leafletを含める
      // Leafletが依存する可能性のあるCommonJSモジュールもリストアップ
      'object-assign', 
      'geojson-equality',
      'earcut',
      'rbush',
      'deep-equal',
    ],
  },
  
  build: {
    // Rollup の CommonJS プラグインの設定 (本番ビルド用)
    commonjsOptions: {
      include: /node_modules/,
      transformMixedEsModules: true, // ES Modulesと混在するCommonJSモジュールを変換
    },
    // LeafletをRollupが外部モジュールとして扱い、グローバルな 'L' を参照するように指示
    // これにより、UMDグローバルエラーを回避
    rollupOptions: {
      external: ['leaflet'], // Leafletを外部モジュールとして扱う
      output: {
        globals: {
          leaflet: 'L', // 'leaflet' モジュールがグローバルな 'L' を参照するようにする
        },
      },
    },
  },
  
  // ★重要追加: プロキシ設定 (ローカル開発用)★
  server: {
    port: 3000, // 開発サーバーのポート
    proxy: {
      '/locationiq-api': { // アプリからのリクエストパス (例: /locationiq-api/search)
        target: 'https://us1.locationiq.com', // LocationIQのAPIエンドポイント
        changeOrigin: true, // オリジンをターゲットのURLに変更 (CORS対策)
        rewrite: (path) => path.replace(/^\/locationiq-api/, ''), // /locationiq-api を削除して転送
        configure: (proxy, options) => {
          // User-Agentヘッダーを付与 (Nominatim/LocationIQの要件)
          options.headers = {
            'User-Agent': 'WeatherApp/1.0 (your_email@example.com)', // あなたのアプリ名と連絡先情報
          };
        },
      },
    },
  },
  
  // process.env の shim (Vue CLIからの移行でよく使われるが、Viteでは通常不要)
  // もしViteで'process is not defined'のようなエラーが出る場合のみ必要
  // define: {
  //   'process.env': {},
  // },
})