<template>
  <div class="weather-form">
    <!-- 検索入力 + ボタン -->
    <div class="search-container">
      <input
        v-model="input"
        @keyup.enter="performSearch"
        :placeholder="searchType === 'city'
          ? '都市名を入力'
          : '住所を入力 (番地を省くと見つかりやすい場合があります)'"
      />
      <button @click="performSearch" :disabled="isLoading">
        取得
      </button>
    </div>

    <!-- 検索タイプ切替 -->
    <div class="search-type-selector">
      <label>
        <input type="radio" v-model="searchType" value="city" />
        都市名で検索
      </label>
      <label>
        <input type="radio" v-model="searchType" value="address" />
        住所で検索
      </label>
    </div>

    <!-- 都市候補 -->
    <ul v-if="searchType==='city' && suggestions.length" class="suggestions-list-absolute">
      <li
        v-for="s in suggestions"
        :key="`${s.name}-${s.lat}-${s.lon}`"
        @click="selectCity(s)"
      >
        {{ s.name }}
        <span v-if="s.state"> ({{ s.state }})</span>
        <span v-else-if="s.country==='JP'"> (日本)</span>
        <span v-else-if="s.country"> ({{ s.country }})</span>
        <span class="suggestion-coords">
          [{{ s.lat.toFixed(4) }}, {{ s.lon.toFixed(4) }}]
        </span>
      </li>
    </ul>

    <!-- 住所候補 -->
    <ul v-if="searchType==='address' && addressSuggestions.length" class="suggestions-list-absolute">
      <li
        v-for="(addr, i) in addressSuggestions"
        :key="i"
        @click="selectAddress(addr)"
      >
        {{ addr.display_name }}
      </li>
    </ul>

    <!-- ステータスメッセージ -->
    <p v-if="isLoading" class="status-message loading-message">
      天気情報を取得中...
    </p>
    <p v-if="errorMessage" class="status-message error-message">
      {{ errorMessage }}
    </p>

    <!-- 地図コンポーネント -->
    <CityPickerMap
      :initialCenter="mapCenter"
      :initialZoom="mapZoom"
      @select="onMapSelect"
    />

    <!-- 天気表示 -->
    <div v-if="weather" class="weather-result">
      <h2>{{ weather.cityName }} の天気</h2>
      <p>緯度: {{ mapCenter[0].toFixed(4) }}, 経度: {{ mapCenter[1].toFixed(4) }}</p>

      <div class="weather-summary">
        <img
          v-if="weatherIconUrl"
          :src="weatherIconUrl"
          :alt="weather.description"
          class="weather-icon"
        />
        <p class="weather-description">{{ weather.description }}</p>
      </div>

      <p>
        気温: {{ weather.temp.toFixed(1) }}°C
        (体感: {{ weather.feels_like.toFixed(1) }}°C)
      </p>
      <p>湿度: {{ weather.humidity }}%</p>

      <div class="weather-details">
        <p>風速: {{ weather.windSpeed.toFixed(1) }} m/s (風向: {{ weather.windDeg }}°)</p>
        <p>気圧: {{ weather.pressure }} hPa</p>
        <p>雲量: {{ weather.clouds }}%</p>
        <p>日の出: {{ formattedSunrise }}</p>
        <p>日の入り: {{ formattedSunset }}</p>
      </div>

      <div v-if="weather.forecast?.length" class="weather-forecast">
        <h3>5日間 / 3時間ごとの予報</h3>
        <div class="forecast-list">
          <div
            v-for="(item, idx) in weather.forecast"
            :key="idx"
            class="forecast-item"
          >
            <p class="forecast-time">{{ item.time }}</p>
            <img
              :src="`https://openweathermap.org/img/wn/${item.iconCode}.png`"
              :alt="item.description"
              class="forecast-icon"
            />
            <p class="forecast-temp">{{ item.temp.toFixed(1) }}°C</p>
            <p class="forecast-desc">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import CityPickerMap from '@/components/CityPickerMap.vue'
import {
  searchCities,
  geocodeAddress,
  fetchWeatherByCoord,
  type CitySuggestion,
  type GeocodedAddress,
  type WeatherData,
} from '@/composables/useWeather'

const input = ref('')
const suggestions = ref<CitySuggestion[]>([])
const addressSuggestions = ref<GeocodedAddress[]>([])
const weather = ref<WeatherData | null>(null)

const searchType = ref<'city' | 'address'>('city')
const isLoading = ref(false)
const errorMessage = ref('')

const mapCenter = ref<[number, number]>([33.5903, 130.4017])
const mapZoom = ref(12)

const weatherIconUrl = computed(() =>
  weather.value?.iconCode
    ? `https://openweathermap.org/img/wn/${weather.value.iconCode}@2x.png`
    : null
)

const formattedSunrise = computed(() =>
  weather.value?.sunrise
    ? new Date(weather.value.sunrise * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A'
)

const formattedSunset = computed(() =>
  weather.value?.sunset
    ? new Date(weather.value.sunset * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A'
)

async function performSearch() {
  // 初期化
  weather.value = null
  suggestions.value = []
  addressSuggestions.value = []
  errorMessage.value = ''
  isLoading.value = true

  const q = input.value.trim()
  if (!q) {
    alert('検索キーワードを入力してください。')
    isLoading.value = false
    return
  }

  try {
    if (searchType.value === 'city') {
      // 都市検索
      const res = await searchCities(q)
      suggestions.value = res
      if (res.length === 0) {
        errorMessage.value = '都市が見つかりませんでした。'
      } else if (res.length === 1) {
        await selectCity(res[0])
      }
    } else {
      // 住所検索
      const res = await geocodeAddress(q)
      addressSuggestions.value = res
      if (res.length === 0) {
        errorMessage.value = '住所が見つかりませんでした。'
      } else if (res.length === 1) {
        await selectAddress(res[0])
      }
    }
  } catch (err: any) {
    console.error('検索エラー:', err)
    errorMessage.value = err.message || '不明なエラーが発生しました'
  } finally {
    isLoading.value = false
  }
}

async function selectCity(s: CitySuggestion) {
  suggestions.value = []
  input.value = s.state ? `${s.name}／${s.state}` : s.name
  mapCenter.value = [s.lat, s.lon]
  mapZoom.value = 12
  weather.value = await fetchWeatherByCoord(s.lat, s.lon)
}

async function selectAddress(a: GeocodedAddress) {
  addressSuggestions.value = []
  input.value = a.display_name
  const lat = parseFloat(a.lat)
  const lon = parseFloat(a.lon)
  if (isNaN(lat) || isNaN(lon)) {
    alert('緯度経度が不正です。')
    return
  }
  mapCenter.value = [lat, lon]
  mapZoom.value = 15
  weather.value = await fetchWeatherByCoord(lat, lon)
}

async function onMapSelect(lat: number, lon: number) {
  // 地図クリックでの天気取得
  mapCenter.value = [lat, lon]
  weather.value = await fetchWeatherByCoord(lat, lon)
}

// 入力クリア時に候補リスト・エラーをリセット
watch(input, (v) => {
  if (!v.trim()) {
    suggestions.value = []
    addressSuggestions.value = []
    errorMessage.value = ''
  }
})

// 検索タイプ変更時にすべてリセット
watch(searchType, () => {
  input.value = ''
  suggestions.value = []
  addressSuggestions.value = []
  weather.value = null
  errorMessage.value = ''
})
</script>

<style scoped>
.weather-form {
  max-width: 600px;
  margin: 20px auto;
  padding: 16px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  position: relative;
}

.search-container {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.search-container input {
  flex: 1;
  padding: 8px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.search-container button {
  padding: 8px 16px;
  font-size: 1rem;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.search-container button:disabled {
  background: #999;
  cursor: not-allowed;
}

.search-type-selector {
  margin-bottom: 12px;
}

.suggestions-list-absolute {
  position: absolute;
  top: 80px; /* 入力欄の下あたり */
  left: 16px;
  right: 16px;
  background: #fff;
  border: 1px solid #eee;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  list-style: none;
  padding: 0;
  margin: 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.suggestions-list-absolute li {
  padding: 8px;
  cursor: pointer;
  border-bottom: 1px solid #f5f5f5;
  font-size: 0.9rem;
}

.suggestions-list-absolute li:hover {
  background: #f0f8ff;
}

.suggestion-coords {
  font-size: 0.8rem;
  color: #888;
  margin-left: 6px;
}

.status-message {
  margin: 10px 0;
  font-weight: bold;
  text-align: center;
}

.loading-message {
  color: #007bff;
}

.error-message {
  color: #d9534f;
}

.map-container {
  margin: 16px 0;
}

.weather-result {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px dashed #eee;
}

.weather-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 12px 0;
}

.weather-icon {
  width: 50px;
  height: 50px;
  margin-right: 8px;
}

.weather-description {
  font-size: 1.1rem;
  font-weight: bold;
}

.weather-details p {
  margin: 4px 0;
  font-size: 0.9rem;
  color: #555;
}

.weather-forecast {
  margin-top: 20px;
}

.forecast-list {
  display: flex;
  overflow-x: auto;
  gap: 12px;
  padding-bottom: 8px;
}

.forecast-item {
  flex-shrink: 0;
  width: 80px;
  text-align: center;
  background: #fcfcfc;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 8px 4px;
}

.forecast-time {
  font-size: 0.8rem;
  margin-bottom: 4px;
}

.forecast-icon {
  width: 36px;
  height: 36px;
}

.forecast-temp {
  font-size: 0.9rem;
  font-weight: bold;
  margin: 4px 0;
}

.forecast-desc {
  font-size: 0.8rem;
  color: #666;
}
</style>
