<template>
  <header class="gi-header">
    <div class="gi-header-inner">
      <!-- Left: Logo -->
      <div class="gi-header-left">
        <a href="https://www.getinside.fr/" target="_blank" class="gi-logo" aria-label="getinside">
          <img :src="`${base}logo-getinside.svg`" alt="getinside" class="gi-logo-img" />
          <span class="gi-logo-badge">tools</span>
        </a>
      </div>

      <!-- Center: Search -->
      <div class="gi-header-search">
        <Search :size="15" class="gi-header-search-icon" aria-hidden="true" />
        <input
          v-model="searchQuery"
          type="search"
          class="gi-header-search-input"
          :placeholder="t('nav.search')"
          @keydown.escape="searchQuery = ''"
          aria-label="Search tools"
        />
      </div>

      <!-- Right: Toggles -->
      <div class="gi-header-right">
        <button
          class="gi-header-toggle"
          @click="toggleTheme"
          :aria-label="t('footer.toggleTheme')"
          :title="t('footer.toggleTheme')"
        >
          <SunIcon v-if="theme === 'dark'" :size="16" />
          <MoonIcon v-else :size="16" />
        </button>
        <button class="gi-lang-toggle" @click="toggleLocale" :aria-pressed="locale === 'fr'">
          {{ locale === 'fr' ? 'EN' : 'FR' }}
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Search, Sun as SunIcon, Moon as MoonIcon } from 'lucide-vue-next'
import { useSearch } from '../composables/useSearch'
import { useTheme } from '../composables/useTheme'

const { t, locale } = useI18n()
const { searchQuery } = useSearch()
const { theme, toggleTheme } = useTheme()
const base = import.meta.env.BASE_URL

function toggleLocale() {
  locale.value = locale.value === 'fr' ? 'en' : 'fr'
  localStorage.setItem('gi-locale', locale.value)
  document.documentElement.lang = locale.value
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
  max-width: var(--gi-container-hero);
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 56px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1.5rem;
}

/* Left */
.gi-header-left {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.gi-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
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

/* Center: Search */
.gi-header-search {
  position: relative;
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
}

.gi-header-search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gi-text-muted);
  pointer-events: none;
}

.gi-header-search-input {
  width: 100%;
  height: 36px;
  padding: 0 1rem 0 2.25rem;
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-pill);
  background: var(--gi-bg);
  color: var(--gi-text);
  font-size: var(--gi-font-size-sm);
  font-family: inherit;
  appearance: none;
  transition: border-color var(--gi-transition-fast), box-shadow var(--gi-transition-fast);
}

.gi-header-search-input:focus {
  outline: none;
  border-color: var(--gi-brand);
  box-shadow: 0 0 0 3px var(--gi-brand-fade);
}

.gi-header-search-input::placeholder {
  color: var(--gi-text-muted);
}

/* Right: Toggles */
.gi-header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.gi-header-toggle,
.gi-lang-toggle {
  min-width: 36px;
  min-height: 36px;
  padding: 0 0.5rem;
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  background: transparent;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--gi-text-muted);
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  transition: border-color var(--gi-transition-fast), color var(--gi-transition-fast);
}

.gi-header-toggle:hover,
.gi-lang-toggle:hover {
  border-color: var(--gi-brand);
  color: var(--gi-brand);
}

@media (max-width: 640px) {
  .gi-header-inner {
    gap: 0.75rem;
  }
  .gi-header-search {
    max-width: none;
  }
}

@media (max-width: 420px) {
  .gi-logo-badge {
    display: none;
  }
}
</style>
