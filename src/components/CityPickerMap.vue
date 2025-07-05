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

const emit = defineEmits<{
  (e: 'select', lat: number, lon: number): void // 'select' イベントを定義
}>()

const mapContainer = ref<HTMLDivElement|null>(null)
let mapInstance: L.Map | null = null; // Mapインスタンスを保持
let markerInstance: L.Marker | null = null; // マーカーインスタンスを保持

onMounted(() => {
  if (!mapContainer.value) return

  mapInstance = L.map(mapContainer.value).setView(
    props.initialCenter,
    props.initialZoom || 13
  )

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(mapInstance)

  mapInstance.on('click', e => {
    // 既存のマーカーがあれば削除
    if (markerInstance) {
      mapInstance?.removeLayer(markerInstance);
    }
    
    // 新しいマーカーを追加
    markerInstance = L.marker(e.latlng).addTo(mapInstance);
    markerInstance.bindPopup(`<b>選択地点</b><br>緯度: ${e.latlng.lat.toFixed(4)}<br>経度: ${e.latlng.lng.toFixed(4)}`).openPopup();

    emit('select', e.latlng.lat, e.latlng.lng) // emit で座標を親に送る
  })
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 400px;
}
</style>