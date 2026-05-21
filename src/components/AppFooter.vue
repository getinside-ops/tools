<template>
  <footer class="gi-footer">
    <div class="gi-footer-inner">
      <!-- Left: Logo + contacts -->
      <div class="gi-footer-left">
        <a href="https://www.getinside.fr/" class="gi-footer-logo-link">
          <img :src="`${base}logo-getinside.svg`" alt="getinside" class="gi-footer-logo-img" />
          <span class="gi-footer-logo-badge">tools</span>
        </a>
        <div class="gi-footer-contacts">
          <span>
            <strong>Opérations</strong> ·
            <a href="mailto:benoit@getinside.fr">benoit@getinside.fr</a>
          </span>
          <span>
            <strong>Studio</strong> ·
            <a href="mailto:studio@getinside.fr">studio@getinside.fr</a>
          </span>
        </div>
      </div>

      <!-- Right: Toggles + copyright -->
      <div class="gi-footer-right">
        <div class="gi-footer-toggles">
          <button
            class="gi-footer-toggle"
            @click="toggleLocale"
            :aria-label="t('footer.toggleLanguage')"
            :aria-pressed="locale === 'fr'"
          >{{ locale === 'fr' ? 'EN' : 'FR' }}</button>
          <button
            class="gi-footer-toggle"
            @click="toggleTheme"
            :aria-label="t('footer.toggleTheme')"
            :aria-pressed="theme === 'dark'"
          >
            <SunIcon v-if="theme === 'light'" :size="16" />
            <MoonIcon v-else :size="16" />
          </button>
        </div>
        <p class="gi-footer-copyright">{{ t('footer.copyright') }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTheme } from '../composables/useTheme'
import { Sun as SunIcon, Moon as MoonIcon } from 'lucide-vue-next'

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
  background: #FFFFFF;
  border-top: 1px solid #DBDAD7;
  margin-top: 4rem;
  padding: 2.5rem 2rem;
}

.gi-footer-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 2rem;
}

/* Left */
.gi-footer-left {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.gi-footer-logo-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #0D0D0C;
}

.gi-footer-logo-img {
  height: 24px;
  width: auto;
  display: block;
}

.gi-footer-logo-badge {
  font-size: 0.7rem;
  font-weight: 700;
  background: #FCF758;
  color: #0D0D0C;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.gi-footer-contacts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 2rem;
  font-size: 0.875rem;
  color: #5E5D55;
  line-height: 1.6;
}

.gi-footer-contacts strong {
  color: #0D0D0C;
  font-weight: 600;
}

.gi-footer-contacts a {
  color: #0D0D0C;
  text-decoration: underline;
  text-decoration-color: #DBDAD7;
  text-underline-offset: 3px;
  font-weight: 500;
  transition: text-decoration-color 0.15s;
}

.gi-footer-contacts a:hover {
  text-decoration-color: #0D0D0C;
}

/* Right */
.gi-footer-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}

.gi-footer-toggles {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.gi-footer-toggle {
  min-width: 36px;
  height: 36px;
  padding: 0 0.5rem;
  border: 1px solid #DBDAD7;
  border-radius: 8px;
  background: transparent;
  color: #5E5D55;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: inherit;
  transition: border-color 0.15s, color 0.15s;
}

.gi-footer-toggle:hover {
  border-color: #5E5D55;
  color: #0D0D0C;
}

.gi-footer-copyright {
  font-size: 0.75rem;
  color: #5E5D55;
  line-height: 1.6;
  text-align: right;
}

@media (max-width: 720px) {
  .gi-footer-inner {
    grid-template-columns: 1fr;
  }
  .gi-footer-right {
    align-items: flex-start;
  }
  .gi-footer-copyright {
    text-align: left;
  }
}
</style>
