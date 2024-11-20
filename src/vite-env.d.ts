/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEATHERSTACK_API_KEY: string
  readonly VITE_WEATHERSTACK_BASE_URL: string

  readonly VITE_UNIVERSAL_API_KEY: string
  readonly VITE_UNIVERSAL_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
