// src/types/openweathermap.ts

// 既存の WeatherApiResponse はそのまま

export interface WeatherApiResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level: number;
    grnd_level: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

// ★追加: 予報APIのレスポンス型定義★
export interface ForecastApiResponse {
  cod: string;
  message: number;
  cnt: number;
  list: Array<{ // 3時間ごとの予報データ
    dt: number; // 予報時刻 (Unix UTC)
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      sea_level: number;
      grnd_level: number;
      humidity: number;
      temp_kf: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    clouds: {
      all: number;
    };
    wind: {
      speed: number;
      deg: number;
      gust: number;
    };
    visibility: number;
    pop: number; // Precipitation probability
    sys: {
      pod: string;
    };
    dt_txt: string; // 予報時刻 (YYYY-MM-DD HH:mm:ss形式)
  }>;
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

// ★追加: 予報データの簡易型 (ForecastData は WeatherData の配列)
export interface ForecastData {
  time: string; // 予報時刻 (例: HH:mm)
  description: string;
  temp: number;
  iconCode: string;
}