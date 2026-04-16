import { ref } from 'vue'

// Module-level singleton — shared between AppHeader and HomeView
const searchQuery = ref('')

export function useSearch() {
  return { searchQuery }
}
