<template>
  <div id="app">
    <WeatherForm />
    <!-- 将来的に地図から選択もしたい場合に備え、雛形を配置 -->
    <CityPickerMap />
  </div>
</template>

<script setup lang="ts">
import WeatherForm from './components/WeatherForm.vue'
import CityPickerMap from './components/CityPickerMap.vue'
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  padding: 20px;
}
</style>
