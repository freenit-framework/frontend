import { defineConfig } from 'vitest/config'
import { sveltekit } from '@sveltejs/kit/vite'

const config = defineConfig({
  plugins: [sveltekit()],

  optimizeDeps: {
    include: ['events'],
  },

  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
})

if (process.env.BACKEND_URL) {
  config.server = {
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL,
        changeOrigin: true,
        ws: true,
      },
    },
  }
}

export default config
