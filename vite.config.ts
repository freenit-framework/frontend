import { defineConfig } from 'vitest/config'
import { loadEnv, type UserConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const config: UserConfig = {
    plugins: [sveltekit()],
    test: {
      include: ['src/**/*.{test,spec}.{js,ts}'],
    },
  }

  if (env.BACKEND_URL) {
    config.server = {
      proxy: {
        '/api': {
          target: env.BACKEND_URL,
          changeOrigin: true,
        },
      },
    }
  }

  return config
})
