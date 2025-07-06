// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'

// 1) CSS を読み込む
import 'leaflet/dist/leaflet.css'

// 2) アイコンのパスを手動で上書き
// ★修正: Leaflet 全体を L としてインポートし、L.Icon を使用
import * as L from 'leaflet'

// ★重要修正: アイコンのパスを 'public' ディレクトリからの絶対パスとして指定★
// これがビルド後のパス解決で最も安定します。
// ただし、対応する画像を public/images/leaflet/ のように配置する必要があります。
// または、Leaflet の CSS で指定されているパスを上書きする、より一般的な方法を取ります。

// 最も安定しているとされているLeafletアイコンのパス解決方法
// Leaflet の CSS が参照するアイコンパスを直接上書きする
// これには、Leaflet の画像を public ディレクトリにコピーする必要があります。
delete (L.Icon.Default.prototype as any)._getIconUrl; // デフォルトのアイコンURL取得ロジックを削除
L.Icon.Default.mergeOptions({ // ★修正: L.Icon.Default を使用
  iconRetinaUrl: new URL('./leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl:       new URL('./leaflet/dist/images/marker-icon.png',     import.meta.url).href,
  shadowUrl:     new URL('leaflet/dist/images/marker-shadow.png',   import.meta.url).href,
})
// ★重要: これらの画像を public ディレクトリにコピーしてください★
// プロジェクトルート/public/leaflet/
//   ├── marker-icon-2x.png
//   ├── marker-icon.png
//   └── marker-shadow.png
// これらは node_modules/leaflet/dist/images/ にあります。
// 手動で public/leaflet/ にコピーしてください。
createApp(App).mount('#app')