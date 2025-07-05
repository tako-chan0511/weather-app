// src/types/openweathermap.d.ts
export interface GeoCodingResponse {
  name: string;        // 解決された都市名（英語表記）
  local_names?: { [lang: string]: string };
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface WeatherApiResponse {
  name: string; // 都市名（英語）
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    // …ほかにも必要に応じて追加
  };
  // …必要に応じて他フィールドも
}
