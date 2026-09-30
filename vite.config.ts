import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base so the playground works from GitHub Pages' /fa-tables-react/ subpath
  base: './',
  // Demo app build; the library build (vite.lib.config.ts) owns dist/
  build: { outDir: 'dist-demo' },
})
