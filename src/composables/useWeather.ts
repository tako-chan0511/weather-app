// src/composables/useWeather.ts
import { ref } from 'vue'
import type { WeatherApiResponse } from '@/types/openweathermap'

export interface CitySuggestion {
  name: string
  lat: number
  lon: number
  country: string
  state?: string
}
export interface WeatherData {
  cityName: string
  description: string
  temp: number
  feels_like: number
  humidity: number
  lat: number
  lon: number
  // ★追加項目★
  windSpeed: number // 風速
  windDeg: number // 風向（度）
  pressure: number // 気圧
  clouds: number // 雲量
  sunrise: number // 日の出時刻 (Unix UTC)
  sunset: number // 日の入り時刻 (Unix UTC)
  iconCode: string // 天気アイコンコード
}

// OpenWeatherMap のジオコーディングAPI（都市名→緯度経度）
export async function searchCities(name: string): Promise<CitySuggestion[]> {
  const key = import.meta.env.VITE_OWM_API_KEY
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
    name
  )}&limit=5&appid=${key}`
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
  return {
    cityName: data.name,
    description: data.weather[0].description,
    temp: data.main.temp,
    feels_like: data.main.feels_like,
    humidity: data.main.humidity,
    lat: data.coord.lat,
    lon: data.coord.lon,
    // ★追加項目のデータ抽出★
    windSpeed: data.wind.speed,
    windDeg: data.wind.deg,
    pressure: data.main.pressure,
    clouds: data.clouds.all,
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset,
    iconCode: data.weather[0].icon,
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
  return {
    cityName: data.name,
    description: data.weather[0].description,
    temp: data.main.temp,
    feels_like: data.main.feels_like,
    humidity: data.main.humidity,
    lat: data.coord.lat,
    lon: data.coord.lon,
    // ★追加項目のデータ抽出★
    windSpeed: data.wind.speed,
    windDeg: data.wind.deg,
    pressure: data.main.pressure,
    clouds: data.clouds.all,
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset,
    iconCode: data.weather[0].icon,
  }
}