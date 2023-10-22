// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vitest" />
import { resolve } from 'node:path'

// Configure Vitest (https://vitest.dev/config/)
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts({ rollupTypes: true })],

  build: {
    target: 'esnext',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: 'index',
      formats: ['es']
    }
  },

  test: {
    /* for example, use global to avoid globals imports (describe, test, expect): */
    // globals: true,
  }
})
