import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      onLog(level, log, handler) {
        // Annotations `#__PURE__` mal positionnées dans des deps (ex. @vueuse/core) — bruit inoffensif
        if (log.code === 'INVALID_ANNOTATION' && log.id?.includes('node_modules')) {
          return
        }
        handler(level, log)
      },
    },
  },
})
