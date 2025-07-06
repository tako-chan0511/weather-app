<!-- src/App.vue -->
<template>
  <div id="app-container">
    <!-- WeatherForm をメインコンポーネントとして表示 -->
    <WeatherForm />
  </div>
</template>

<script setup lang="ts">
import WeatherForm from '@/components/WeatherForm.vue' // ★追加: WeatherForm をインポート
// CityPickerMap は WeatherForm の中で使われるため、ここからは削除
</script>

<style>
/* グローバルなスタイル */
#app-container {
  font-family: 'Inter', sans-serif; /* Inter フォントを使用 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh; /* 画面全体を使う */
  background-color: #f0f2f5; /* 背景色 */
}
</style>