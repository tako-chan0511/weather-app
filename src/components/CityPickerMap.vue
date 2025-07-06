<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as L from 'leaflet'; // ★維持: Leafletをインポート

const props = defineProps<{
  initialCenter: [number, number]
  initialZoom?: number
}>()

const emit = defineEmits<{
  (e: 'select', lat: number, lon: number): void
}>()

const mapContainer = ref<HTMLDivElement|null>(null)
let mapInstance: L.Map | null = null;
let markerInstance: L.Marker | null = null;

// マーカーを追加/更新するヘルパー関数
function updateMarker(lat: number, lon: number) {
  if (!mapInstance) return;

  if (markerInstance) {
    mapInstance.removeLayer(markerInstance);
  }
  
  markerInstance = L.marker(L.latLng(lat, lon)).addTo(mapInstance);
  markerInstance.bindPopup(`<b>選択地点</b><br>緯度: ${lat.toFixed(4)}<br>経度: ${lon.toFixed(4)}`).openPopup();
}

onMounted(() => {
  if (!mapContainer.value) return

  mapInstance = L.map(mapContainer.value).setView(
    props.initialCenter,
    props.initialZoom || 13
  )

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(mapInstance)

  // 初期マーカーの表示
  updateMarker(props.initialCenter[0], props.initialCenter[1]);


  mapInstance.on('click', e => {
    updateMarker(e.latlng.lat, e.latlng.lng);
    emit('select', e.latlng.lat, e.latlng.lng)
  })
})

watch([() => props.initialCenter, () => props.initialZoom], ([newCenter, newZoom]) => {
  if (mapInstance) {
    mapInstance.setView(newCenter, newZoom || mapInstance.getZoom());
    updateMarker(newCenter[0], newCenter[1]);
  }
}, { deep: true });

</script>

<style scoped>
.map-container {
  width: 100%;
  height: 400px;
}
</style>