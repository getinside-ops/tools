/**
 * Theme management composable for light/dark mode support
 * Handles theme persistence, system preference detection, and DOM updates
 */

import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'gi-theme'

export function useTheme() {
  const theme = ref<Theme>('light')

  function applyTheme(newTheme: Theme) {
    if (newTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

  function initTheme() {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (stored) {
      theme.value = stored
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme.value = prefersDark ? 'dark' : 'light'
    }
    applyTheme(theme.value)
  }

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    applyTheme(theme.value)
    localStorage.setItem(STORAGE_KEY, theme.value)
  }

  watch(theme, (newTheme) => {
    localStorage.setItem(STORAGE_KEY, newTheme)
  })

  initTheme()

  return {
    theme,
    toggleTheme,
  }
}
