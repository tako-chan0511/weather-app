import { ref } from 'vue'

export interface WeatherData {
  cityName: string
  description: string
  temp: number
  feels_like: number
  humidity: number
}

export function useWeather() {
  const weather = ref<WeatherData | null>(null)
  const error   = ref<string | null>(null)

  async function fetchWeather(city: string) {
    weather.value = null
    error.value   = null

    try {
      const key = import.meta.env.VITE_OWM_API_KEY
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather` +
        `?q=${encodeURIComponent(city)}` +
        `&units=metric&lang=ja&appid=${key}`
      )
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || '取得に失敗しました')
      }
      weather.value = {
        cityName:    data.name,
        description: data.weather[0].description,
        temp:        data.main.temp,
        feels_like:  data.main.feels_like,
        humidity:    data.main.humidity,
      }
    } catch (e: any) {
      error.value = e.message
    }
  }

  return { weather, error, fetchWeather }
}
