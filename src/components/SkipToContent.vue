<template>
  <a href="#main-content" class="skip-link">
    {{ t('nav.skipToContent') }}
  </a>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'SkipToContent'
})

const { t } = useI18n()
</script>

<style scoped>
.skip-link {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.75rem 1.5rem;
  background: var(--gi-brand);
  color: var(--gi-text-inverse);
  border-radius: var(--gi-radius-md);
  font-weight: 600;
  z-index: 1000;
  transition: top var(--gi-transition-fast) var(--gi-ease-out);
  text-decoration: none;
}

.skip-link:focus {
  top: 0.5rem;
}

.skip-link:focus-visible {
  outline: 2px solid var(--gi-brand-dark);
  outline-offset: 2px;
}
</style>
