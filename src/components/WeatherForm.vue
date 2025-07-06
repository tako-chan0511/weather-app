<template>
  <div class="weather-form">
    <div class="search-container">
      <input
        v-model="input"
        @keyup.enter="performSearch" :placeholder="searchType === 'city' ? '都市名を入力' : '住所を入力'" />
      <button @click="performSearch">取得</button>
    </div>

    <div class="search-type-selector">
      <label>
        <input type="radio" v-model="searchType" value="city" /> 都市名で検索
      </label>
      <label>
        <input type="radio" v-model="searchType" value="address" /> 住所で検索
      </label>
    </div>

    <ul v-if="suggestions.length > 0" class="suggestions-list-absolute">
      <li
        v-for="s in suggestions"
        :key="`${s.name}-${s.lat}-${s.lon}`"
        @click="selectCity(s)"
      >
        {{ s.name }}
        <span v-if="s.state"> ({{ s.state }})</span>
        <span v-else-if="s.country === 'JP'"> (日本)</span>
        <span v-else-if="s.country"> ({{ s.country }})</span>
        <span class="suggestion-coords"> [{{ s.lat.toFixed(4)}}, {{ s.lon.toFixed(4)}}]</span>
      </li>
    </ul>

    <ul v-if="addressSuggestions.length > 0" class="suggestions-list-absolute">
      <li
        v-for="(addr, index) in addressSuggestions"
        :key="index"
        @click="selectAddress(addr)"
      >
        {{ addr.display_name }}
      </li>
    </ul>

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

      <div class="weather-forecast" v-if="weather.forecast && weather.forecast.length > 0">
        <h3>5日間 / 3時間ごとの予報</h3>
        <div class="forecast-list">
          <div v-for="(item, index) in weather.forecast" :key="index" class="forecast-item">
            <p class="forecast-time">{{ item.time }}</p>
            <img :src="`https://openweathermap.org/img/wn/${item.iconCode}.png`" :alt="item.description" class="forecast-icon" />
            <p class="forecast-temp">{{ item.temp.toFixed(1) }}°C</p>
            <p class="forecast-desc">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import CityPickerMap from '@/components/CityPickerMap.vue'
import {
  searchCities,
  fetchWeatherByCoord,
  geocodeAddress, // ★追加: geocodeAddress もインポート
  CitySuggestion,
  WeatherData,
  GeocodedAddress, // ★追加: GeocodedAddress もインポート
} from '@/composables/useWeather'

const input = ref('')
const suggestions = ref<CitySuggestion[]>([])
const weather = ref<WeatherData | null>(null)

// ★追加: 検索タイプを管理するref (デフォルトは都市名)★
const searchType = ref<'city' | 'address'>('city');
// ★追加: 住所検索結果の候補を管理するref★
const addressSuggestions = ref<GeocodedAddress[]>([]);

const mapCenter = ref<[number, number]>([33.5903, 130.4017]); // 初期値は福岡
const mapZoom = ref(12);

const weatherIconUrl = computed(() => {
  if (weather.value?.iconCode) {
    return `https://openweathermap.org/img/wn/${weather.value.iconCode}@2x.png`;
  }
  return null;
});

const formattedSunrise = computed(() => {
  if (weather.value?.sunrise) {
    return new Date(weather.value.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return 'N/A';
});

const formattedSunset = computed(() => {
  if (weather.value?.sunset) {
    return new Date(weather.value.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return 'N/A';
});

// ★修正: 検索実行関数 (都市名検索と住所検索を切り替える)★
async function performSearch() {
  weather.value = null;
  suggestions.value = []; // 都市名サジェストをクリア
  addressSuggestions.value = []; // 住所サジェストをクリア

  const trimmedInput = input.value.trim();
  if (!trimmedInput) {
    alert('検索キーワードを入力してください。');
    return;
  }

  if (searchType.value === 'city') {
    // 都市名で検索 (OpenWeatherMap)
    suggestions.value = await searchCities(trimmedInput);
    if (suggestions.value.length === 0) {
      alert('都市が見つかりませんでした。');
    } else if (suggestions.value.length === 1) {
      await selectCity(suggestions.value[0]); // 候補が1つなら自動選択
    }
  } else {
    // 住所で検索 (Nominatim)
    addressSuggestions.value = await geocodeAddress(trimmedInput);
    if (addressSuggestions.value.length === 0) {
      alert('住所が見つかりませんでした。');
    } else if (addressSuggestions.value.length === 1) {
      await selectAddress(addressSuggestions.value[0]); // 候補が1つなら自動選択
    }
  }
}

// ★修正: 都市名候補選択時の処理 (CitySuggestion用)★
async function selectCity(s: CitySuggestion) {
  suggestions.value = []; // サジェストリストを非表示
  input.value = s.state
    ? `${s.name}／${s.state}`
    : s.name;
  
  mapCenter.value = [s.lat, s.lon];
  mapZoom.value = 12;

  const fetchedWeather = await fetchWeatherByCoord(s.lat, s.lon);
  if (fetchedWeather) {
    weather.value = fetchedWeather;
  }
}

// ★追加: 住所候補選択時の処理 (GeocodedAddress用)★
async function selectAddress(addr: GeocodedAddress) {
  addressSuggestions.value = []; // サジェストリストを非表示
  input.value = addr.display_name; // 入力欄に詳細住所を表示

  const lat = parseFloat(addr.lat);
  const lon = parseFloat(addr.lon);

  if (isNaN(lat) || isNaN(lon)) {
    alert('選択された住所の緯度経度が不正です。');
    return;
  }
  
  mapCenter.value = [lat, lon];
  mapZoom.value = 15; // 住所検索時はより深くズーム

  const fetchedWeather = await fetchWeatherByCoord(lat, lon);
  if (fetchedWeather) {
    weather.value = fetchedWeather;
  }
}

async function onMapSelect(lat: number, lon: number) {
  console.log(`Selected coordinates from map: ${lat}, ${lon}`)
  suggestions.value = []; // 地図クリック時もサジェストをクリア
  addressSuggestions.value = []; // 地図クリック時も住所サジェストをクリア
  // input.value = `緯度: ${lat.toFixed(4)}, 経度: ${lon.toFixed(4)}`; // 都市名/住所入力との兼ね合いでコメントアウト
  
  mapCenter.value = [lat, lon];

  const fetchedWeather = await fetchWeatherByCoord(lat, lon);
  if (fetchedWeather) {
    weather.value = fetchedWeather;
  }
}

// 入力欄が変更されたらサジェストをクリア (既存のまま)
watch(input, (newValue) => {
  if (newValue.trim() === '') {
    suggestions.value = [];
    addressSuggestions.value = []; // 住所サジェストもクリア
  }
});

// 検索タイプが変更されたら入力欄とサジェストをクリア
watch(searchType, () => {
  input.value = '';
  suggestions.value = [];
  addressSuggestions.value = [];
  weather.value = null; // 天気情報もクリア
});
</script>

<style scoped>
.weather-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  position: relative; /* suggestions-list-absolute の基準にする */
}
.search-container { position: relative; margin-bottom: 8px; /* ★修正: マージンを調整 */ display: flex; gap: 8px; }
.search-container input { flex-grow: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
.search-container button { padding: 10px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; }
.search-container button:hover { background-color: #0056b3; }

.search-type-selector {
  margin-bottom: 16px;
  text-align: left;
}
.search-type-selector label {
  margin-right: 15px;
  font-size: 0.9em;
  color: #555;
}

.suggestions-list-absolute {
  position: absolute;
  top: 95px; /* ★修正: 入力欄+ボタン+ラジオボタンの高さに合わせる */
  left: 20px;
  right: 20px;
  background-color: white;
  border: 1px solid #eee;
  list-style: none;
  padding: 0;
  margin: 0;
  z-index: 1001;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
.suggestions-list-absolute li {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #f5f5f5;
  text-align: left;
}
.suggestions-list-absolute li:hover {
  background-color: #f0f0f0;
}
.suggestions-list-absolute li:last-child {
  border-bottom: none;
}
.suggestions-list-absolute li span {
  color: #888;
}
.suggestions-list-absolute li .suggestion-coords {
  font-size: 0.8em;
  color: #a0a0a0;
  margin-left: 5px;
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

/* 天気アイコンと説明の配置 */
.weather-summary {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 10px 0;
}
.weather-icon {
    width: 60px;
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

/* 予報リストの表示 */
.weather-forecast { margin-top: 20px; padding-top: 20px; border-top: 1px dashed #eee; text-align: center; }
.weather-forecast h3 { margin-bottom: 15px; color: #333; }
.forecast-list {
    display: flex;
    overflow-x: auto; /* 横スクロール可能に */
    gap: 15px;
    padding-bottom: 10px; /* スクロールバーのための余白 */
}
.forecast-item {
    flex-shrink: 0; /* 縮まない */
    width: 80px; /* 項目ごとの幅 */
    text-align: center;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 10px 5px;
    background-color: #fcfcfc;
}
.forecast-item:hover {
    background-color: #f0f0f0;
}
.forecast-time {
    font-size: 0.9em;
    font-weight: bold;
    margin-bottom: 5px;
    color: #555;
}
.forecast-icon {
    width: 40px;
    height: 40px;
    margin: 0 auto;
}
.forecast-temp {
    font-size: 1.1em;
    font-weight: bold;
    color: #333;
    white-space: nowrap; /* テキストを折り返さない */
    overflow: hidden;
    text-overflow: ellipsis; /* はみ出したテキストを...で表示 */
}
</style>