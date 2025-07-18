# アプリケーションアーキテクチャ & 技術的特徴・Tips



## 1. 概要

- **名称**: Weather App  
- **目的**: 都市名または住所検索、地図クリックから OpenWeatherMap API を呼び出し、リアルタイムの天気情報を取得・表示するシングルページアプリケーション



## 2. 全体アーキテクチャ

```

\[User Browser]
|
\|-- Vue 3 + Vite (フロントエンド)
\|     ├─ App.vue
\|     ├─ components/
\|     |    ├─ WeatherForm.vue      // 入力フォーム & 検索結果表示
\|     |    └─ CityPickerMap.vue    // Leaflet 地図 & クリック取得
\|     └─ composables/useWeather.ts // 天気・ジオコーディング共通ロジック
|
\|-- Vite DevServer
\|     └─ Proxy (/api/geocode → LocationIQ)
|
└─ Build → 静的ファイル + Vercel Functions (geocode.ts)
├─ /dist (静的ホスティング)
└─ /api/geocode (サーバーレス関数)

```

---

## 3. 主な技術スタック

- **フレームワーク**:  
  - Vue 3 (Composition API + `<script setup>`)  
  - Vite (高速ビルド／開発サーバ)

- **地図表示**:  
  - Leaflet + `<CityPickerMap>` カスタムコンポーネント  
  - タイル: OpenStreetMap 標準タイル

- **天気取得 & ジオコーディング**:  
  - OpenWeatherMap API  
  - LocationIQ API（住所→緯度経度変換）
  - 環境変数: `import.meta.env.VITE_OWM_API_KEY` / `process.env.LOCATIONIQ_KEY`

- **デプロイ & サーバーレス**:  
  - Vercel Functions (`/api/geocode`) を利用した CORS 回避  
  - GitHub ↔ Vercel 自動デプロイ

- **型定義**:  
  - TypeScript + `vue-tsc`  
  - `@types/leaflet` で Leaflet 型補完

---

## 4. 主な機能・特徴

1. **都市名検索**  
   - ジオコーディング API → 複数候補リスト表示  
   - 1件のみ：即天気取得 & マーカー更新

2. **住所検索**  
   - LocationIQ で住所文字列を変換 → 複数候補リスト表示  
   - ワンアクションでマーカー移動 & 天気取得

3. **地図クリック取得**  
   - Leaflet 地図クリック → マーカー移動 & `@select` イベント発火  
   - クリックした座標から天気取得

4. **天気結果表示**  
   - `WeatherData` 型に整形 (`cityName`, `description`, `temp`, `feels_like`, `humidity`, ほか追加可)  
   - アイコン表示、日の出／日の入り時刻、風速・気圧・雲量など詳細

5. **レスポンシブデザイン**  
   - コンポーネントのスタイルは `scoped` + CSS Flex/Grid でシンプル構築

---

## 5. 実装で苦労した点 & Tips

### 5.1 Leaflet × Vite × TypeScript の組み合わせ

- **アイコン画像読み込み**  
  - `L.Icon.Default.mergeOptions({...})` で `public/images` 下の絶対パスを指定  
  - `import L from 'leaflet'` すると型エラー → `import * as L from 'leaflet'` に変更  

- **モジュール解決エラー**  
  - `Cannot read properties of undefined (reading 'Default')` → Leaflet の UMD/ESM 混在を CommonJS → ESM 変換で対処  
  - Vite の `optimizeDeps.include` や `build.commonjsOptions.transformMixedEsModules` を調整

### 5.2 CORS／プロキシ

- **LocationIQ の CORS**  
  - クライアント直叩き不可 → Vite DevServer の proxy、Vercel Functions で中継  
  - 必ず `User-Agent` ヘッダを付与（LocationIQ 利用規約）

- **Deployment 時の注意**  
  - Vercel Functions の型宣言（`@vercel/node`）が無い場合は `any` で受けるか `import type` を省略

### 5.3 環境変数とビルド設定

- **`import.meta.env`**  
  - TypeScript の `tsconfig.json` で `module: "esnext"` に設定  
  - `vite-env.d.ts` に `VITE_OWM_API_KEY` の型定義を追加

- **VSCode + Prettier**  
  - `<script setup lang="ts">` 内のインデントや改行を自動フォーマット

---

## 6. 今後の改善案

- **キャッシュ**  
  - 天気・ジオコーディング API レスポンスのブラウザキャッシュ  
- **リファクタリング**  
  - `useWeather` をさらに分割（fetchWeather と geocode を別ファイルへ）  
- **ユニットテスト**  
  - Vue Test Utils + Vitest でコンポーネント／composable を網羅  
- **エラーハンドリング強化**  
  - API エラー時のリトライ、タイムアウト対応  
- **多言語対応**  
  - i18n を導入して日本語／英語切り替え

---

_End of Document_  
```
