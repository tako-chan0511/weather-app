// src/composables/useWeather.ts
import { ref } from 'vue'
import type { WeatherApiResponse, ForecastApiResponse, ForecastData } from '@/types/openweathermap' // ★修正: ForecastApiResponse と ForecastData もインポート

export interface CitySuggestion {
  name: string
  lat: number
  lon: number
  country: string
  state?: string
}
// ★追加: 住所検索結果の型定義★
export interface GeocodedAddress {
  display_name: string; // "福岡市中央区天神、福岡市、福岡県、日本" のような詳細な住所
  lat: string; // 緯度 (文字列なので後で数値に変換)
  lon: string; // 経度 (文字列なので後で数値に変換)
}
export interface WeatherData {
  cityName: string
  description: string
  temp: number
  feels_like: number
  humidity: number
  lat: number
  lon: number
  windSpeed: number
  windDeg: number
  pressure: number
  clouds: number
  sunrise: number
  sunset: number
  iconCode: string
  // ★追加: 予報データ★
  forecast: ForecastData[] | null;
}

// OpenWeatherMap のジオコーディングAPI（都市名→緯度経度）
export async function searchCities(name: string): Promise<CitySuggestion[]> {
  const key = import.meta.env.VITE_OWM_API_KEY
  // ★修正: ",jp" を追加して日本国内に限定する★
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
    name
  )},jp&limit=5&appid=${key}` // ★変更点: ,jp を追加
  const res = await fetch(url)
  return (await res.json()) as CitySuggestion[]
}

// 都市名から直接天気取得
export async function fetchWeatherByName(city: string): Promise<WeatherData> {
  const key = import.meta.env.VITE_OWM_API_KEY
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&units=metric&lang=ja&appid=${key}`
  const res = await fetch(url)
  const data = (await res.json()) as WeatherApiResponse

  // ★追加: 予報データも同時に取得する★
  const forecastData = await fetchForecastByCoord(data.coord.lat, data.coord.lon);

  return {
    cityName: data.name,
    description: data.weather[0].description,
    temp: data.main.temp,
    feels_like: data.main.feels_like,
    humidity: data.main.humidity,
    lat: data.coord.lat,
    lon: data.coord.lon,
    windSpeed: data.wind.speed,
    windDeg: data.wind.deg,
    pressure: data.main.pressure,
    clouds: data.clouds.all,
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset,
    iconCode: data.weather[0].icon,
    forecast: forecastData, // ★予報データを追加★
  }
}

// 緯度経度から天気取得
export async function fetchWeatherByCoord(
  lat: number,
  lon: number
): Promise<WeatherData> {
  const key = import.meta.env.VITE_OWM_API_KEY
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${
    lon
  }&units=metric&lang=ja&appid=${key}`
  const res = await fetch(url)
  const data = (await res.json()) as WeatherApiResponse

  // ★追加: 予報データも同時に取得する★
  const forecastData = await fetchForecastByCoord(data.coord.lat, data.coord.lon);

  return {
    cityName: data.name,
    description: data.weather[0].description,
    temp: data.main.temp,
    feels_like: data.main.feels_like,
    humidity: data.main.humidity,
    lat: data.coord.lat,
    lon: data.coord.lon,
    windSpeed: data.wind.speed,
    windDeg: data.wind.deg,
    pressure: data.main.pressure,
    clouds: data.clouds.all,
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset,
    iconCode: data.weather[0].icon,
    forecast: forecastData, // ★予報データを追加★
  }
}

// ★追加: 緯度経度から予報データを取得する関数★
export async function fetchForecastByCoord(
  lat: number,
  lon: number
): Promise<ForecastData[]> {
  const key = import.meta.env.VITE_OWM_API_KEY
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${
    lon
  }&units=metric&lang=ja&appid=${key}`
  const res = await fetch(url)
  const data = (await res.json()) as ForecastApiResponse

  // 予報リストから必要な情報を抽出
  const forecastList: ForecastData[] = [];
  data.list.forEach(item => {
    forecastList.push({
      time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      description: item.weather[0].description,
      temp: item.main.temp,
      iconCode: item.weather[0].icon,
    });
  });

  return forecastList;
}

export async function geocodeAddress(address: string): Promise<GeocodedAddress[]> {
  const key = import.meta.env.VITE_LOCATIONIQ_API_KEY;

  // URLは常にルートからの相対パス /api/geocode を使用
  const url = `/api/geocode?q=${encodeURIComponent(address)}&key=${key}&format=json&limit=5&countrycodes=jp`; 
  
  try {
    console.log("Calling Geocoding API via proxy:", url);
    const res = await fetch(url);

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Geocoding API proxy error response:", res.status, errorData);
      throw new Error(`住所検索APIエラー (Status: ${res.status}): ${errorData.error || res.statusText || '不明なエラー'}`);
    }
    const data = await res.json();
    
    if (!data || data.length === 0) {
        throw new Error('指定された住所の候補が見つかりませんでした。');
    }

    return data as GeocodedAddress[];
  } catch (error: any) {
    console.error("Error in geocodeAddress (client-side):", error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('ネットワーク接続、またはサーバーレス関数のデプロイに問題があるようです。');
    } else if (error instanceof SyntaxError && error.message.includes('JSON')) {
        throw new Error('サーバーからの応答が不正です。APIキーまたはサーバーレス関数の設定を確認してください。');
    }
    throw error;
  }
}