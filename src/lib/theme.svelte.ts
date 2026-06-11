import { browser } from '$app/environment'

export type ThemeMode = 'light' | 'dark' | 'auto'

const STORAGE_KEY = 'freenit-theme-mode'

function getStoredMode(): ThemeMode {
  if (!browser) return 'auto'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored
  return 'auto'
}

function getSystemTheme(): 'light' | 'dark' {
  if (!browser) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(mode: ThemeMode): void {
  if (!browser) return
  const effective = mode === 'auto' ? getSystemTheme() : mode
  document.documentElement.setAttribute('data-theme', effective)
}

const state = $state<{ mode: ThemeMode }>({ mode: getStoredMode() })
let systemDark = $state(browser && window.matchMedia('(prefers-color-scheme: dark)').matches)

export function getThemeMode(): ThemeMode {
  return state.mode
}

export function getEffectiveTheme(): 'light' | 'dark' {
  return state.mode === 'auto' ? (systemDark ? 'dark' : 'light') : state.mode
}

export function setThemeMode(mode: ThemeMode): void {
  state.mode = mode
  if (browser) {
    localStorage.setItem(STORAGE_KEY, mode)
    applyTheme(mode)
  }
}

export function toggleTheme(): void {
  const modes: ThemeMode[] = ['light', 'dark', 'auto']
  const next = modes[(modes.indexOf(state.mode) + 1) % modes.length]
  setThemeMode(next)
}

if (browser) {
  applyTheme(state.mode)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    systemDark = event.matches
    applyTheme(state.mode)
  })
}
