<!-- src/App.vue -->
<template>
  <div>
    <!-- 福岡市中央区あたりを初期表示 -->
    <CityPickerMap :initialCenter="[33.5902, 130.4017]" :initialZoom="13" />
    <!-- クリック座標を受け取るロジックは後ほど -->
  </div>
</template>

<script setup lang="ts">
import CityPickerMap from '@/components/CityPickerMap.vue'
</script>
