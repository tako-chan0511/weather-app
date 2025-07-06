// src/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OWM_API_KEY: string
  // 他に必要な VITE_* があればここに追記
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
