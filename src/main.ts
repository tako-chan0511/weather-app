// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'

// Leaflet の CSS は index.html に置いたので不要
// import 'leaflet/dist/leaflet.css'

// Leaflet 本体も CDN から読み込むので import せず、グローバル変数 L を使う
// TS チェックで怒られる場合は下記コメントで抑制できます。
// @ts-ignore
;(window as any).L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl:       '/images/marker-icon.png',
  shadowUrl:     '/images/marker-shadow.png',
})

createApp(App).mount('#app')
