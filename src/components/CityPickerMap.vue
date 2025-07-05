<template>
  <div class="map-placeholder">
    <!-- ここに Leaflet 等を導入して座標→fetchWeatherByCoord 連携を実装 -->
    <p>地図から都市を選択する機能は、後ほどこちらに実装します。</p>
  </div>
</template>

<script setup lang="ts">
// 何も import しなくても最初に動くことを優先
</script>

<style scoped>
.map-placeholder {
  width: 100%;
  height: 300px;
  margin-top: 40px;
  background-color: #f0f0f0;
  border: 2px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-style: italic;
}
</style>
