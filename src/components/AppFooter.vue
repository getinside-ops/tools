<template>
  <footer class="gi-footer">
    <div class="gi-footer-inner">
      <!-- Left: Logo -->
      <div class="gi-footer-left">
        <a href="https://www.getinside.fr/" class="gi-footer-logo">
          <img :src="`${base}logo-getinside.svg`" alt="getinside">
          <span class="gi-footer-logo-badge">tools</span>
        </a>
      </div>
      
      <!-- Center: Tagline -->
      <div class="gi-footer-center">
        <p class="gi-footer-tagline">{{ t('footer.tagline') }}</p>
      </div>
      
      <!-- Right: Toggles -->
      <div class="gi-footer-right">
        <button
          class="gi-footer-toggle"
          @click="toggleLocale"
          :aria-label="t('footer.toggleLanguage')"
          :aria-pressed="locale === 'fr'"
          :title="t('footer.toggleLanguage')"
        >
          {{ locale === 'fr' ? 'EN' : 'FR' }}
        </button>
        <button
          class="gi-footer-toggle"
          @click="toggleTheme"
          :aria-label="t('footer.toggleTheme')"
          :aria-pressed="theme === 'dark'"
          :title="t('footer.toggleTheme')"
        >
          <SunIcon v-if="theme === 'light'" :size="18" />
          <MoonIcon v-else :size="18" />
        </button>
      </div>
    </div>
    
    <div class="gi-footer-quick-access">
      <span class="gi-footer-quick-label">{{ t('footer.quickAccess') }}</span>
      <div class="gi-footer-quick-links">
        <router-link to="/paper-weight" class="gi-footer-quick-link">
          <Scale :size="14" />
          {{ t('nav.paperWeight') }}
        </router-link>
        <router-link to="/utm-builder" class="gi-footer-quick-link">
          <Link2 :size="14" />
          {{ t('nav.utmBuilder') }}
        </router-link>
        <router-link to="/dpi-checker" class="gi-footer-quick-link">
          <Printer :size="14" />
          {{ t('nav.dpiChecker') }}
        </router-link>
      </div>
    </div>

    <div class="gi-footer-bottom">
      <span>Contact &mdash; Opérations&nbsp;: <a href="mailto:benoit@getinside.fr">benoit@getinside.fr</a> · Studio&nbsp;: <a href="mailto:studio@getinside.fr">studio@getinside.fr</a></span>
      <span>{{ t('footer.copyright') }}</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTheme } from '../composables/useTheme'
import { Sun as SunIcon, Moon as MoonIcon, Scale, Link2, Printer } from 'lucide-vue-next'

const { t, locale } = useI18n()
const { theme, toggleTheme } = useTheme()
const base = import.meta.env.BASE_URL

function toggleLocale() {
  locale.value = locale.value === 'fr' ? 'en' : 'fr'
  localStorage.setItem('gi-locale', locale.value)
  document.documentElement.lang = locale.value
}
</script>

<style scoped>
.gi-footer {
  background: var(--gi-surface);
  border-top: 1px solid var(--gi-border);
  margin-top: 4rem;
}
.gi-footer-inner {
  max-width: var(--gi-container-hero);
  margin: 0 auto;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

/* Left: Logo */
.gi-footer-left {
  display: flex;
  align-items: center;
}
.gi-footer-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--gi-text);
}
.gi-footer-logo img {
  height: 28px;
  width: auto;
}
.gi-footer-logo-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gi-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Center: Tagline */
.gi-footer-center {
  flex: 1;
  text-align: center;
}
.gi-footer-tagline {
  font-size: 0.85rem;
  color: var(--gi-text-muted);
  margin: 0;
}

/* Right: Toggles */
.gi-footer-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.gi-footer-toggle {
  min-width: 44px;
  min-height: 44px;
  width: 44px;
  height: 44px;
  border: 1px solid var(--gi-border);
  border-radius: 6px;
  background: var(--gi-surface);
  color: var(--gi-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  transition: background-color 0.2s, border-color 0.2s;
}
.gi-footer-toggle:hover {
  background: var(--gi-brand);
  border-color: var(--gi-brand);
  color: white;
}

/* Quick Access */
.gi-footer-quick-access {
  max-width: var(--gi-container-hero);
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.gi-footer-quick-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gi-text-muted);
  white-space: nowrap;
}
.gi-footer-quick-links {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.gi-footer-quick-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  background: var(--gi-brand-fade);
  color: var(--gi-brand);
  font-size: 0.8rem;
  font-weight: 500;
  text-decoration: none;
  border-radius: var(--gi-radius-pill);
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
}
.gi-footer-quick-link:hover {
  background: var(--gi-brand);
  color: var(--gi-text-inverse);
  transform: translateY(-1px);
}
.gi-footer-quick-link:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

/* Bottom bar */
.gi-footer-bottom {
  max-width: var(--gi-container-hero);
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

/* Responsive: stack on mobile */
@media (max-width: 768px) {
  .gi-footer-inner {
    flex-direction: column;
    text-align: center;
  }
  .gi-footer-left {
    justify-content: center;
  }
  .gi-footer-right {
    justify-content: center;
  }
  .gi-footer-bottom {
    flex-direction: column;
    text-align: center;
  }
}
</style>
