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
  return path === '/' || path === '' || path === '#'
})
</script>
