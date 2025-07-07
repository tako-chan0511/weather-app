<!-- src/App.vue -->
<template>
  <div id="app-container">
    <!-- メインの検索＋地図フォーム -->
    <WeatherForm />
  </div>
</template>

<script setup lang="ts">
import WeatherForm from '@/components/WeatherForm.vue'
</script>

<style>
/* 画面全体を包むコンテナ */
#app-container {
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0;
  padding: 20px;
  min-height: 100vh;
  background-color: #f0f2f5;

  /* 検索フォームを縦方向に中央寄せしたい場合 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}
</style>
