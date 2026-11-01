import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { seoPlugin } from './build/seo-plugin'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    seoPlugin(loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    watch: {
      // Un ancien .pnpm-store dans le projet contient un lien vers la racine : le surveiller fait
      // boucler le watcher (ELOOP). Ignoré même si le dossier existe encore localement.
      ignored: ['**/.pnpm-store/**'],
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
}))
