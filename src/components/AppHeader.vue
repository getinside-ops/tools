<template>
  <header class="gi-header">
    <div class="gi-header-inner">
      <a href="https://www.getinside.fr/" target="_blank" class="gi-logo" aria-label="getinside">
        <img :src="`${base}logo-getinside.svg`" alt="getinside" class="gi-logo-img" />
        <span class="gi-logo-badge">tools</span>
      </a>
      <button class="gi-lang-toggle" @click="toggleLocale">
        {{ locale === 'fr' ? 'EN' : 'FR' }}
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const base = import.meta.env.BASE_URL

function toggleLocale() {
  locale.value = locale.value === 'fr' ? 'en' : 'fr'
  localStorage.setItem('gi-locale', locale.value)
}
</script>

<style scoped>
.gi-header {
  background: var(--gi-surface);
  border-bottom: 1px solid var(--gi-border);
  position: sticky;
  top: 0;
  z-index: 100;
}
.gi-header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.gi-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  flex-shrink: 0;
}
.gi-logo-img {
  height: 22px;
  width: auto;
  display: block;
}
.gi-logo-badge {
  font-size: 0.7rem;
  font-weight: 600;
  background: var(--gi-mint);
  color: #1a1a1a;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.gi-lang-toggle {
  padding: 0.3rem 0.65rem;
  border: 1.5px solid var(--gi-border);
  border-radius: 6px;
  background: transparent;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--gi-text-muted);
  font-family: inherit;
  transition: border-color 0.12s, color 0.12s;
}
.gi-lang-toggle:hover { border-color: var(--gi-brand); color: var(--gi-brand); }
</style>
