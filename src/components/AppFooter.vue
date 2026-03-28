<template>
  <footer class="gi-footer">
    <div class="gi-footer-inner">
      <p class="gi-footer-tag">{{ t('footer.tagline') }}</p>
      <div class="gi-footer-ctas">
        <a href="https://www.getinside.fr/" target="_blank" class="gi-btn">
          {{ t('footer.discover') }}
        </a>
        <a href="https://app.getinside.media/" target="_blank" class="gi-btn gi-btn-ghost">
          {{ t('footer.platform') }}
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<style scoped>
.gi-footer {
  background: var(--gi-surface);
  border-top: 1px solid var(--gi-border);
  margin-top: 4rem;
}
.gi-footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}
.gi-footer-tag { font-size: 0.85rem; color: var(--gi-text-muted); }
.gi-footer-ctas { display: flex; gap: 0.75rem; flex-wrap: wrap; }
</style>
