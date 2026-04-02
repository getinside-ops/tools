<template>
  <ToolPageLayout :title="t('redirectChecker.title')" :description="t('redirectChecker.desc')" category="digital">
    <template #icon>
      <Link class="tool-page-icon" />
    </template>

    <GiFormField
      v-model="inputUrl"
      type="url"
      :label="t('redirectChecker.label')"
      placeholder="https://example.com/link"
      @keydown.enter="check"
    />
    <button class="gi-btn" :disabled="loading || !inputUrl" @click="check">
      {{ loading ? t('redirectChecker.checking') : t('redirectChecker.check') }}
    </button>

    <GiResultCard
      v-if="result"
      :title="t('redirectChecker.resultTitle')"
      variant="success"
      style="margin-top: 1.5rem"
    >
      <p v-if="!result.redirected" class="gi-no-redirect">{{ t('redirectChecker.noRedirect') }}</p>
      <div v-else class="gi-hops-meta">
        {{ t('redirectChecker.hopsCount', { n: result.hops.length - 1 }) }}
        <span v-if="result.hops.length >= 15" class="gi-too-many">
          {{ t('redirectChecker.tooManyRedirects') }}
        </span>
      </div>
      <div class="gi-chain">
        <div v-for="(hop, i) in result.hops" :key="i" class="gi-chain-item">
          <div class="gi-chain-row">
            <GiStatusBadge :variant="statusVariant(hop.status)">{{ hop.status }}</GiStatusBadge>
            <span class="gi-code gi-chain-url">{{ hop.url }}</span>
            <button class="gi-btn-ghost gi-copy-btn" @click="copyUrl(hop.url, i)">
              {{ copiedIndex === i ? t('redirectChecker.copied') : t('redirectChecker.copy') }}
            </button>
          </div>
          <div v-if="i < result.hops.length - 1" class="gi-arrow" aria-hidden="true">↓</div>
        </div>
      </div>
    </GiResultCard>

    <GiResultCard
      v-if="errorMessage"
      :title="errorTitle"
      variant="error"
      class="gi-error-card"
    >
      <p class="gi-error-message">{{ errorMessage }}</p>
      <p v-if="errorCode === 'MISSING_API_URL'" class="gi-error-missing-api-desc">
        {{ t('redirectChecker.error.missingApiDesc') }}
      </p>
      <p v-else class="gi-error-fallback-desc">
        {{ t('redirectChecker.fallbackDesc') }}
      </p>
      <code class="gi-code">curl -IL {{ inputUrl }}</code>
    </GiResultCard>

    <template #about>{{ t('redirectChecker.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Link } from 'lucide-vue-next'
import ToolPageLayout from '../components/ToolPageLayout.vue'
import GiFormField from '../components/GiFormField.vue'
import GiResultCard from '../components/GiResultCard.vue'
import GiStatusBadge from '../components/GiStatusBadge.vue'
import { checkRedirect, RedirectCheckerError, type RedirectResult } from '../composables/useRedirectChecker'

const { t } = useI18n()
const inputUrl = ref('')
const loading = ref(false)
const result = ref<RedirectResult | null>(null)
const errorCode = ref<string | null>(null)

const errorMessage = computed(() => {
  if (!errorCode.value) return ''
  switch (errorCode.value) {
    case 'MISSING_API_URL':
      return t('redirectChecker.error.missingApi')
    case 'API_ERROR':
      return t('redirectChecker.error.apiError')
    case 'INVALID_RESPONSE':
      return t('redirectChecker.error.invalidResponse')
    case 'NETWORK_ERROR':
      return t('redirectChecker.error.networkError')
    default:
      return t('redirectChecker.error.defaultError')
  }
})

const errorTitle = computed(() => {
  if (!errorCode.value) return ''
  switch (errorCode.value) {
    case 'MISSING_API_URL':
      return t('redirectChecker.error.missingApi')
    case 'API_ERROR':
      return t('redirectChecker.error.apiError')
    case 'INVALID_RESPONSE':
      return t('redirectChecker.error.invalidResponse')
    case 'NETWORK_ERROR':
      return t('redirectChecker.error.networkError')
    default:
      return t('redirectChecker.error.defaultError')
  }
})

const copiedIndex = ref<number | null>(null)

async function check() {
  if (!inputUrl.value) return
  loading.value = true
  result.value = null
  errorCode.value = null
  copiedIndex.value = null
  try {
    result.value = await checkRedirect(inputUrl.value)
  } catch (error) {
    if (error instanceof RedirectCheckerError) {
      errorCode.value = error.code
    } else {
      errorCode.value = 'NETWORK_ERROR'
    }
  } finally {
    loading.value = false
  }
}

function statusVariant(status: number): 'ok' | 'error' | 'warning' | 'info' {
  if (status >= 200 && status < 300) return 'ok'
  if (status === 301 || status === 308) return 'info'
  if (status >= 300 && status < 400) return 'warning'
  if (status >= 400) return 'error'
  return 'info'
}

async function copyUrl(url: string, index: number) {
  try {
    await navigator.clipboard.writeText(url)
    copiedIndex.value = index
    setTimeout(() => { copiedIndex.value = null }, 1500)
  } catch {
    // clipboard access denied — fail silently
  }
}
</script>

<style scoped>
.gi-hops-meta {
  font-size: 0.85rem;
  color: var(--gi-text-muted);
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.gi-too-many {
  color: var(--gi-tint-yellow-text);
  font-weight: 600;
}
.gi-no-redirect {
  color: var(--gi-text-muted);
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
}

.gi-chain { display: flex; flex-direction: column; }
.gi-chain-item { display: flex; flex-direction: column; }
.gi-chain-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  flex-wrap: wrap;
}
.gi-chain-url {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.875rem;
}
.gi-arrow { font-size: 1.1rem; color: var(--gi-brand); padding: 0.1rem 0; }

/* Copy button */
.gi-copy-btn {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Error card */
.gi-error-card {
  margin-top: 1.5rem;
}

.gi-error-message {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--gi-text-muted);
}

.gi-error-missing-api-desc {
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
}

.gi-error-fallback-desc {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}
</style>
