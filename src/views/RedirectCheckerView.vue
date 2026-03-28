<template>
  <div>
    <div class="gi-tool-header">
      <h1>{{ t('redirectChecker.title') }}</h1>
      <p>{{ t('redirectChecker.desc') }}</p>
    </div>

    <div class="gi-field">
      <label class="gi-label">{{ t('redirectChecker.label') }}</label>
      <input
        v-model="inputUrl"
        type="text"
        placeholder="https://example.com/link"
        class="gi-input"
        @keydown.enter="check"
      />
    </div>
    <button class="gi-btn" :disabled="loading || !inputUrl" @click="check">
      {{ loading ? t('redirectChecker.checking') : t('redirectChecker.check') }}
    </button>

    <div v-if="result" class="gi-result" style="margin-top:1.5rem">
      <template v-if="result.redirected">
        <div class="gi-redirect-row">
          <span class="gi-redirect-label">{{ t('redirectChecker.from') }}</span>
          <span class="gi-code">{{ result.inputUrl }}</span>
        </div>
        <div class="gi-arrow">↓</div>
        <div class="gi-redirect-row">
          <span class="gi-redirect-label">{{ t('redirectChecker.to') }}</span>
          <a :href="result.finalUrl" target="_blank" class="gi-code gi-link">{{ result.finalUrl }}</a>
        </div>
      </template>
      <p v-else>{{ t('redirectChecker.noRedirect') }}</p>
    </div>

    <div v-if="error" class="gi-result" style="border-color: var(--gi-tint-red-border); margin-top:1.5rem">
      <div class="gi-result-label" style="color:var(--gi-tint-red-text)">{{ t('redirectChecker.fallbackTitle') }}</div>
      <p style="margin-bottom:0.5rem; font-size:0.9rem; color:var(--gi-text-muted)">{{ t('redirectChecker.fallbackDesc') }}</p>
      <code class="gi-code">curl -IL {{ inputUrl }}</code>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { checkRedirect, type RedirectResult } from '../composables/useRedirectChecker'

const { t } = useI18n()
const inputUrl = ref('')
const loading = ref(false)
const result = ref<RedirectResult | null>(null)
const error = ref(false)

async function check() {
  if (!inputUrl.value) return
  loading.value = true
  result.value = null
  error.value = false
  try {
    result.value = await checkRedirect(inputUrl.value)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.gi-redirect-row { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.5rem; }
.gi-redirect-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--gi-text-muted); }
.gi-arrow { font-size: 1.2rem; color: var(--gi-brand); margin: 0.25rem 0; }
.gi-link { color: var(--gi-brand); text-decoration: none; }
.gi-link:hover { text-decoration: underline; }
</style>
