// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'

// 1) Leaflet の CSS を読み込む
import 'leaflet/dist/leaflet.css'

// 2) アイコンのパス設定のJavaScriptコードは完全に削除
//    これはCSSで対応するため、このファイルからはL.Icon.Defaultへのアクセスは不要になる

createApp(App).mount('#app')