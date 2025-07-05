// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'

// 1) CSS を読み込む
import 'leaflet/dist/leaflet.css'

// 2) アイコンのパスを手動で上書き
import { Icon } from 'leaflet'
delete (Icon.Default.prototype as any)._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl:       new URL('leaflet/dist/images/marker-icon.png',     import.meta.url).href,
  shadowUrl:     new URL('leaflet/dist/images/marker-shadow.png',   import.meta.url).href,
})

createApp(App).mount('#app')
