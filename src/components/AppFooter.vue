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
    <div class="gi-footer-bottom">
      <span>Contact &mdash; Opérations&nbsp;: <a href="mailto:benoit@getinside.fr">benoit@getinside.fr</a> · Studio&nbsp;: <a href="mailto:studio@getinside.fr">studio@getinside.fr</a></span>
      <span>© 2026 getinside. Tous droits réservés.</span>
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
.gi-footer-bottom {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
  border-top: 1px solid var(--gi-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--gi-text-muted);
}
.gi-footer-bottom a {
  color: var(--gi-brand);
  text-decoration: none;
}
.gi-footer-bottom a:hover { text-decoration: underline; }
</style>
