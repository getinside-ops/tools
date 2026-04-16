<template>
  <SkipToContent />
  <AppHeader v-if="isHomePage" />
  <main id="main-content" :class="isHomePage ? 'gi-main-home' : 'gi-main'">
    <router-view />
  </main>
  <AppFooter />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SkipToContent from './components/SkipToContent.vue'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'

const route = useRoute()

// In hash-history mode, route.path is the segment after "#" — "/" means home
const isHomePage = computed(() => route.path === '/')
</script>
