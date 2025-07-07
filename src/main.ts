// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'

// 1) Leaflet の CSS を読み込む
import 'leaflet/dist/leaflet.css'

// ★2) アイコンのパス設定のJavaScriptコードは、以前の推奨（CSS+public画像コピー）を採用
// Leaflet のデフォルトアイコンパスを修正するJavaScriptは削除します。
// 代わりに、Leaflet の CSS が参照する 'images/' ディレクトリに画像を配置することで解決します。
// このファイルからは L.Icon.Default へのアクセスは行いません。

// import * as L from 'leaflet' // ★削除: Leafletのモジュールインポートは削除 (L.Icon.Default.mergeOptions も削除)

createApp(App).mount('#app')