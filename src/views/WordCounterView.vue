<template>
  <div>
    <router-link to="/" class="gi-back-link">{{ t('nav.back') }}</router-link>

    <div class="gi-tool-header">
      <h1>{{ t('wordCounter.title') }}</h1>
      <p>{{ t('wordCounter.desc') }}</p>
    </div>

    <div class="gi-field">
      <textarea
        v-model="text"
        class="gi-input gi-textarea"
        :placeholder="t('wordCounter.placeholder')"
        rows="8"
        spellcheck="false"
      />
    </div>

    <div v-if="text.length > 0" class="gi-stats-grid">
      <div class="gi-stat-card">
        <div class="gi-stat-value">{{ stats.words.toLocaleString() }}</div>
        <div class="gi-stat-label">{{ t('wordCounter.stats.words') }}</div>
      </div>
      <div class="gi-stat-card">
        <div class="gi-stat-value">{{ stats.charsWithSpaces.toLocaleString() }}</div>
        <div class="gi-stat-label">{{ t('wordCounter.stats.charsWithSpaces') }}</div>
      </div>
      <div class="gi-stat-card">
        <div class="gi-stat-value">{{ stats.charsWithoutSpaces.toLocaleString() }}</div>
        <div class="gi-stat-label">{{ t('wordCounter.stats.charsWithoutSpaces') }}</div>
      </div>
      <div class="gi-stat-card">
        <div class="gi-stat-value">{{ stats.sentences.toLocaleString() }}</div>
        <div class="gi-stat-label">{{ t('wordCounter.stats.sentences') }}</div>
      </div>
      <div class="gi-stat-card">
        <div class="gi-stat-value">{{ stats.paragraphs.toLocaleString() }}</div>
        <div class="gi-stat-label">{{ t('wordCounter.stats.paragraphs') }}</div>
      </div>
      <div class="gi-stat-card gi-stat-card--wide">
        <div class="gi-stat-value">{{ stats.readingTimeMin }} {{ t('wordCounter.minutes') }}</div>
        <div class="gi-stat-label">{{ t('wordCounter.stats.readingTime') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { analyzeText } from '../composables/useWordCounter'

const { t } = useI18n()
const text = ref('')
const stats = computed(() => analyzeText(text.value))
</script>

<style scoped>
.gi-back-link {
  display: inline-flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0.3rem 0.75rem;
  border: 1.5px solid var(--gi-border);
  border-radius: var(--gi-radius);
  font-size: 0.85rem;
  color: var(--gi-text-muted);
  text-decoration: none;
  transition: border-color 0.12s, color 0.12s;
}
.gi-back-link:hover { border-color: var(--gi-brand); color: var(--gi-brand); }
.gi-textarea { resize: vertical; font-family: inherit; line-height: 1.6; }
.gi-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.75rem;
  margin-top: 1.25rem;
}
.gi-stat-card {
  background: var(--gi-surface);
  border: 1.5px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  padding: 1rem;
  text-align: center;
}
.gi-stat-card--wide { grid-column: span 2; }
.gi-stat-value { font-size: 1.6rem; font-weight: 700; color: var(--gi-text); }
.gi-stat-label { font-size: 0.8rem; color: var(--gi-text-muted); margin-top: 0.25rem; }
</style>
