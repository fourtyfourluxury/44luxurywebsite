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
  // Not enabling Cross-Origin-Embedder-Policy/COOP here: it would make
  // @imgly/background-removal's WASM multi-threaded (faster), but
  // require-corp blocks any cross-origin resource that doesn't opt in —
  // which would break the Google Maps embed and the Unsplash category
  // images. Single-threaded WASM is slower but doesn't risk breaking
  // those. The image is downscaled before processing instead, which is
  // the bigger factor in how long it takes.
})
