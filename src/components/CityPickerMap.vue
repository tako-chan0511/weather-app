<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as L from 'leaflet';

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

// ★修正1: マーカーを追加/更新するヘルパー関数
function updateMarker(lat: number, lon: number) {
  if (!mapInstance) return;

  // 既存のマーカーがあれば削除
  if (markerInstance) {
    mapInstance.removeLayer(markerInstance);
  }
  
  // 新しいマーカーを追加
  const latlng = L.latLng(lat, lon);
  markerInstance = L.marker(latlng).addTo(mapInstance);
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

  // 初期マーカーの表示 (初期中心にマーカーを置く場合)
  // mapInstance がセットアップされたら、最初の位置にマーカーを置く
  updateMarker(props.initialCenter[0], props.initialCenter[1]);


  mapInstance.on('click', e => {
    updateMarker(e.latlng.lat, e.latlng.lng); // ★修正: ヘルパー関数を呼び出す
    emit('select', e.latlng.lat, e.latlng.lng)
  })
})

// ★修正2: initialCenter または initialZoom が変更されたら地図の中心を更新し、マーカーも更新★
watch([() => props.initialCenter, () => props.initialZoom], ([newCenter, newZoom]) => {
  if (mapInstance) {
    mapInstance.setView(newCenter, newZoom || mapInstance.getZoom());
    updateMarker(newCenter[0], newCenter[1]); // ★修正: 新しい中心にマーカーを置く
  }
}, { deep: true });

</script>

<style scoped>
.map-container {
  width: 100%;
  height: 400px;
}
</style>