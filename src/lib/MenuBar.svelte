<script lang="ts">
  import { mdiMenu, mdiWeatherSunny, mdiWeatherNight, mdiBrightnessAuto } from '@mdi/js'
  import { getThemeMode, getEffectiveTheme, toggleTheme } from '$lib/theme.svelte'

  let { title, toggle } = $props()

  const ICONS = {
    light: mdiWeatherSunny,
    dark: mdiWeatherNight,
    auto: mdiBrightnessAuto,
  }

  const TITLES: Record<string, string> = {
    light: 'Light mode',
    dark: 'Dark mode',
    auto: 'Auto mode',
  }

  const effectiveTheme = $derived(getEffectiveTheme())
  const themeMode = $derived(getThemeMode())
</script>

<div class="menu">
  <svg class="icon menu-icon" onclick={toggle} onkeyup={toggle} onkeydown={toggle} role="button" tabindex={0}>
    <path d={mdiMenu} />
  </svg>
  <a href="/" class="title">{title}</a>
  <button
    type="button"
    class="theme-toggle"
    title={TITLES[themeMode]}
    onclick={toggleTheme}
  >
    <svg class="icon" viewBox="0 0 24 24">
      <path d={ICONS[effectiveTheme]} />
    </svg>
  </button>
</div>

<style>
  .menu {
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    background-color: var(--color-primary);
    color: white;
  }

  .icon {
    width: 26px;
    height: 26px;
    fill: white;
  }

  .menu-icon {
    cursor: pointer;
  }

  .title {
    padding: 0;
    margin: 0;
    color: white;
    font-size: 3rem;
    flex: 1;
  }

  .theme-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    margin-left: 10px;
    background: rgba(255, 255, 255, 0.15);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .theme-toggle:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  .theme-toggle .icon {
    width: 22px;
    height: 22px;
  }
</style>
