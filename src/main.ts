// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'

// 1) CSS を読み込む
import 'leaflet/dist/leaflet.css'

// 2) アイコンのパスを手動で上書き
// ★修正: Leaflet 全体を L としてインポートし、L.Icon を使用
import * as L from 'leaflet'

// Leaflet のデフォルトアイコンのパスを修正 (Vite 環境での問題回避)
L.Icon.Default.mergeOptions({ // ★修正: L.Icon.Default を使用
  iconRetinaUrl: new URL('./leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl:       new URL('./leaflet/dist/images/marker-icon.png',     import.meta.url).href,
  shadowUrl:     new URL('leaflet/dist/images/marker-shadow.png',   import.meta.url).href,
})

createApp(App).mount('#app')