import { ref } from 'vue'

const STORAGE_KEY = 'gi-recent-tools'
const MAX_ITEMS = 8

function load(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((r): r is string => typeof r === 'string') : []
  } catch {
    return []
  }
}

const recentRoutes = ref<string[]>(load())

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentRoutes.value))
  } catch {
    // ignore quota / privacy-mode failures
  }
}

export function recordToolVisit(route: string) {
  if (!route || route === '/') return
  const next = [route, ...recentRoutes.value.filter(r => r !== route)].slice(0, MAX_ITEMS)
  recentRoutes.value = next
  persist()
}

export function useRecentTools() {
  return { recentRoutes }
}
