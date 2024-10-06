import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import type { UserConfig } from 'vite'

const config: UserConfig = defineConfig({
  plugins: [sveltekit()],
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
      },
    },
  }
}

export default config
