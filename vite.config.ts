import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Demo app build; the library build (vite.lib.config.ts) owns dist/
  build: { outDir: 'dist-demo' },
})
