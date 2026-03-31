<template>
  <AppHeader v-if="isHomePage" />
  <main class="gi-main">
    <router-view />
  </main>
  <AppFooter />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'

const route = useRoute()

const isHomePage = computed(() => {
  const path = route.path
  const hash = route.hash
  // Check for: /, /#/, /#, or empty (handles hash routes like /#/qr-decoder)
  return path === '/' || path === '' || hash === '/' || hash === '' || hash === '#/'
})
</script>
