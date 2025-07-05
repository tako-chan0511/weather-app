<template>
  <div class="weather-form">
    <input
      v-model="input"
      @keyup.enter="onSearch"
      placeholder="都市名を入力"
    />
    <button @click="onSearch">取得</button>

    <p v-if="error" class="error">{{ error }}</p>

    <div v-else-if="weather" class="weather-result">
      <h2>{{ weather.cityName }} の天気</h2>
      <p>{{ weather.description }}</p>
      <p>
        気温: {{ weather.temp.toFixed(1) }}°C
        (体感: {{ weather.feels_like.toFixed(1) }}°C)
      </p>
      <p>湿度: {{ weather.humidity }}%</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWeather } from '@/composables/useWeather'

const input = ref('')
const { weather, error, fetchWeather } = useWeather()

async function onSearch() {
  const city = input.value.trim()
  if (!city) return
  await fetchWeather(city)
}
</script>

<style scoped>
.weather-form {
  max-width: 400px;
  margin: 40px auto;
  text-align: center;
}
.weather-form input {
  padding: 8px;
  width: 70%;
  margin-right: 8px;
}
.weather-form button {
  padding: 8px 12px;
}
.error {
  color: red;
  margin-top: 12px;
}
.weather-result {
  margin-top: 20px;
}
</style>
