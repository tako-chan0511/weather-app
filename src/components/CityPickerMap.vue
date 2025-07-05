<!-- src/components/CityPickerMap.vue -->
<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  initialCenter: [number, number]
  initialZoom?: number
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
    // クリック座標を親に通知したい場合は emit などで渡す
    console.log('選択された座標:', e.latlng.lat, e.latlng.lng)
  })
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 400px;
}
</style>
