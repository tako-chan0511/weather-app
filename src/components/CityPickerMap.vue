<!-- src/components/CityPickerMap.vue -->
<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as L from 'leaflet'; // Leafletをインポート

const props = defineProps<{
  initialCenter: [number, number]
  initialZoom?: number
}>()

// ★追加: 親にイベントを通知するための defineEmits
const emit = defineEmits<{
  (e: 'select', lat: number, lon: number): void // 'select' イベントを定義
}>()

const mapContainer = ref<HTMLDivElement|null>(null)

onMounted(() => {
  if (!mapContainer.value) return

  // グローバルに読み込まれた L を使う
  const map = L.map(mapContainer.value).setView(
    props.initialCenter,
    props.initialZoom || 13
  )

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)

  map.on('click', e => {
    // クリック座標を親に通知
    console.log('選択された座標:', e.latlng.lat, e.latlng.lng)
    emit('select', e.latlng.lat, e.latlng.lng) // ★修正: emit で座標を親に送る
  })
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 400px; /* App.vue で上書きされる可能性あり */
}
</style>