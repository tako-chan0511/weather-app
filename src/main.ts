// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'

// vue3-leaflet コンポーネントと Leaflet の CSS
import { LMap, LTileLayer, LMarker } from 'vue3-leaflet'
import 'leaflet/dist/leaflet.css'

const app = createApp(App)
// グローバル登録
app.component('LMap', LMap)
app.component('LTileLayer', LTileLayer)
app.component('LMarker', LMarker)

app.mount('#app')
