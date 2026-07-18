import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // @imgly/background-removal ships WASM + worker code that esbuild's
    // dependency pre-bundling can mangle — exclude it so Vite serves it
    // as native ESM instead.
    exclude: ['@imgly/background-removal'],
  },
  worker: {
    format: 'es',
  },
})
