/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TOMORROWIO_API_KEY: string
  readonly VITE_TOMORROWIO_BASE_URL: string

  readonly VITE_CSC_API_KEY: string
  readonly VITE_CSC_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
