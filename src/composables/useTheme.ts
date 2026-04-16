import { ref } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'gi-theme'

// Module-level singleton — shared between AppHeader and AppFooter
const theme = ref<Theme>('light')
let initialized = false

function applyTheme(newTheme: Theme) {
  if (newTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
}

export function useTheme() {
  if (!initialized) {
    initialized = true
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (stored === 'dark' || stored === 'light') {
      theme.value = stored
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme.value = 'dark'
    }
    applyTheme(theme.value)
  }

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    applyTheme(theme.value)
    localStorage.setItem(STORAGE_KEY, theme.value)
  }

  return { theme, toggleTheme }
}
