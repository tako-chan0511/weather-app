// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'

// 1) CSS を読み込む
import 'leaflet/dist/leaflet.css'

// 2) アイコンのパスを手動で上書き
// Leaflet の L オブジェクトがグローバルに利用可能であることを確認
import { Icon } from 'leaflet'
// Leaflet のデフォルトアイコンのパスを修正 (Vite 環境での問題回避)
// L.Icon.Default.mergeOptions を L.Icon.mergeOptions に変更
Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl:       new URL('leaflet/dist/images/marker-icon.png',     import.meta.url).href,
  shadowUrl:     new URL('leaflet/dist/images/marker-shadow.png',   import.meta.url).href,
})

createApp(App).mount('#app')