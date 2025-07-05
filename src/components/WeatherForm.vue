<template>
  <div class="weather-form">
    <div class="search-container">
      <input
        v-model="input"
        @keyup.enter="onSearch"
        placeholder="都市名を入力"
      />
      <button @click="onSearch">取得</button>

      <ul v-if="suggestions.length > 0" class="suggestions">
        <li
          v-for="s in suggestions"
          :key="`${s.name}-${s.lat}-${s.lon}`"
          @click="selectCity(s)"
        >
          {{ s.name }}<span v-if="s.state">／{{ s.state }}</span> ({{ s.country }})
        </li>
      </ul>
    </div>

    <CityPickerMap
      :initialCenter="mapCenter"
      :initialZoom="mapZoom"
      @select="onMapSelect"
    />

    <div v-if="weather" class="weather-result">
      <h2>{{ weather.cityName }} の天気</h2>
      <p>緯度: {{ weather.lat.toFixed(4) }}, 経度: {{ weather.lon.toFixed(4) }}</p>
      
      <div class="weather-summary">
        <img :src="weatherIconUrl" :alt="weather.description" v-if="weatherIconUrl" class="weather-icon" />
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
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, watch, computed } from 'vue' // computed もインポート
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

const mapCenter = ref<[number, number]>([33.5903, 130.4017]); // 初期値は福岡
const mapZoom = ref(12);

// ★追加: 天気アイコンURLを生成するcomputedプロパティ★
const weatherIconUrl = computed(() => {
  if (weather.value?.iconCode) {
    return `https://openweathermap.org/img/wn/${weather.value.iconCode}@2x.png`;
  }
  return null;
});

// ★追加: 日の出時刻をフォーマットするcomputedプロパティ★
const formattedSunrise = computed(() => {
  if (weather.value?.sunrise) {
    // Unixタイムスタンプは秒単位なので、ミリ秒に変換
    return new Date(weather.value.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return 'N/A';
});

// ★追加: 日の入り時刻をフォーマットするcomputedプロパティ★
const formattedSunset = computed(() => {
  if (weather.value?.sunset) {
    return new Date(weather.value.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return 'N/A';
});


async function onSearch() {
  weather.value = null
  suggestions.value = await searchCities(input.value.trim())
  
  if (suggestions.value.length > 0) {
    if (suggestions.value.length === 1) {
      await selectCity(suggestions.value[0]);
    }
  } else {
    alert('都市が見つかりませんでした。');
  }
}

async function selectCity(s: CitySuggestion) {
  suggestions.value = [];
  input.value = s.state
    ? `${s.name}／${s.state}`
    : s.name;
  
  mapCenter.value = [s.lat, s.lon];
  mapZoom.value = 12;

  const fetchedWeather = await fetchWeatherByCoord(s.lat, s.lon);
  if (fetchedWeather) {
    weather.value = { ...fetchedWeather, lat: s.lat, lon: s.lon };
  }
}

async function onMapSelect(lat: number, lon: number) {
  console.log(`Selected coordinates from map: ${lat}, ${lon}`)
  suggestions.value = [];
  input.value = `緯度: ${lat.toFixed(4)}, 経度: ${lon.toFixed(4)}`;
  
  mapCenter.value = [lat, lon];

  const fetchedWeather = await fetchWeatherByCoord(lat, lon);
  if (fetchedWeather) {
    weather.value = { ...fetchedWeather, lat, lon };
  }
}

watch(input, (newValue) => {
  if (newValue.trim() === '') {
    suggestions.value = [];
  }
});
</script>

<style scoped>
.weather-form { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.search-container { position: relative; margin-bottom: 16px; display: flex; gap: 8px; }
.search-container input { flex-grow: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
.search-container button { padding: 10px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; }
.search-container button:hover { background-color: #0056b3; }

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #eee;
  border-top: none;
  list-style: none;
  padding: 0;
  margin: 0;
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
.suggestions li {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #f5f5f5;
  text-align: left;
}
.suggestions li:hover {
  background-color: #f0f0f0;
}
.suggestions li:last-child {
  border-bottom: none;
}
.suggestions li span {
  color: #888;
}

.map-container {
  margin-top: 16px;
  height: 300px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.weather-result { margin-top: 20px; padding-top: 20px; border-top: 1px dashed #eee; text-align: left; }
.weather-result h2 { text-align: center; margin-bottom: 10px; color: #333; }
.weather-result p { margin-bottom: 5px; }

/* ★追加スタイル: 天気アイコンと説明の配置★ */
.weather-summary {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 10px 0;
}
.weather-icon {
    width: 60px; /* アイコンサイズ */
    height: 60px;
    margin-right: 10px;
}
.weather-description {
    font-size: 1.2em;
    font-weight: bold;
}
.weather-details {
    margin-top: 15px;
    padding-top: 10px;
    border-top: 1px dashed #f0f0f0;
    font-size: 0.9em;
    color: #555;
}
</style>