<template>
  <div class="weather-form">
    <div class="search-container">
      <input
        v-model="input"
        @keyup.enter="onSearch"
        placeholder="都市名を入力"
      />
      <button @click="onSearch">取得</button>

      <ul v-if="suggestions.length" class="suggestions">
        <li
          v-for="s in suggestions"
          :key="`${s.name}-${s.lat}-${s.lon}`"
          @click="selectCity(s)"
        >
          {{ s.name }}<span v-if="s.state">／{{ s.state }}</span> ({{ s.country }})
        </li>
      </ul>
    </div>

    <!-- 地図コンポーネント -->
    <CityPickerMap
      :initialCenter="[33.5903, 130.4017]"
      :initialZoom="12"
      @select="onMapSelect"
    />

    <!-- 天気表示 -->
    <div v-if="weather" class="weather-result">
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
import CityPickerMap from '@/components/CityPickerMap.vue'
import {
  searchCities,
  fetchWeatherByCoord,
  CitySuggestion,
  WeatherData,
} from '@/composables/useWeather'

const input = ref('')
const suggestions = ref<CitySuggestion[]>([])
const weather = ref<WeatherData | null>(null)

async function onSearch() {
  weather.value = null
  suggestions.value = await searchCities(input.value.trim())
  if (suggestions.value.length === 1) {
    await selectCity(suggestions.value[0])
  }
}

async function selectCity(s: CitySuggestion) {
  suggestions.value = []
  input.value = s.state
    ? `${s.name}／${s.state}`
    : s.name
  weather.value = await fetchWeatherByCoord(s.lat, s.lon)
}

// ★地図から座標を受け取る★
async function onMapSelect(lat: number, lon: number) {
  console.log(`Selected coordinates: ${lat}, ${lon}`)
  weather.value = null
  // テキスト入力欄に座標も残しておきたい場合
  input.value = `${lat.toFixed(4)}, ${lon.toFixed(4)}`
  weather.value = await fetchWeatherByCoord(lat, lon)
}
</script>

<style scoped>
.weather-form { max-width: 600px; margin: 0 auto; }
.map-container {
  margin-top: 16px;
  height: 300px;
  border: 1px solid #ccc;
}
</style>
