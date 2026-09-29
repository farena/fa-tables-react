import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// Library build: bundles src/lib.ts into dist/ for consumption from other projects.
// Type declarations are emitted separately by `tsc -p tsconfig.lib.json`.
export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: resolve(import.meta.dirname, 'src/lib.ts'),
      formats: ['es', 'cjs'],
      fileName: 'fa-tables-react',
      cssFileName: 'style',
    },
    rolldownOptions: {
      // React must come from the host app, never be bundled
      external: [/^react(-dom)?(\/.*)?$/],
      output: { exports: 'named' },
    },
  },
})
