<template>
  <ToolPageLayout :title="t('redirectChecker.title')" :description="t('redirectChecker.desc')" category="digital">
    <template #icon>
      <Link class="tool-page-icon" />
    </template>

    <div class="rc-form">
      <GiFormField
        v-model="inputUrl"
        type="url"
        :label="t('redirectChecker.label')"
        :placeholder="t('redirectChecker.placeholder')"
        @keydown.enter="check"
      />
      <button
        class="gi-btn rc-check-btn"
        :disabled="loading || !inputUrl"
        @click="check"
      >
        <Loader2 v-if="loading" :size="18" class="animate-spin" />
        {{ loading ? t('redirectChecker.checking') : t('redirectChecker.check') }}
      </button>
    </div>

    <!-- Result Summary -->
    <div v-if="result" class="rc-summary">
      <div class="rc-summary-header">
        <h3>{{ t('redirectChecker.summaryTitle') }}</h3>
        <span class="rc-hops-badge">
          <GitBranch :size="16" />
          {{ t('redirectChecker.totalHops', { n: result.hops.length - 1 }) }}
        </span>
      </div>
      <div class="rc-final-url">
        <span class="rc-label">{{ t('redirectChecker.finalUrlLabel') }}</span>
        <span class="rc-url">{{ result.finalUrl }}</span>
      </div>
    </div>

    <!-- Redirect Chain -->
    <GiResultCard
      v-if="result"
      :title="t('redirectChecker.chainTitle')"
      variant="success"
      style="margin-top: 1rem"
    >
      <p v-if="!result.redirected" class="rc-no-redirect">{{ t('redirectChecker.noRedirect') }}</p>
      <div v-else class="rc-chain">
        <div
          v-for="(hop, i) in result.hops"
          :key="i"
          class="rc-chain-item"
          :class="{ 'rc-chain-item--last': i === result.hops.length - 1 }"
        >
          <div class="rc-chain-node">
            <div class="rc-chain-badge">
              <GiStatusBadge :variant="statusVariant(hop.status)">{{ hop.status }}</GiStatusBadge>
            </div>
            <div class="rc-chain-content">
              <span class="rc-chain-url">{{ hop.url }}</span>
              <button
                class="gi-btn-ghost rc-copy-btn"
                :class="{ 'rc-copy-btn--copied': copiedIndex === i }"
                @click="copyUrl(hop.url, i)"
              >
                <Copy :size="14" v-if="copiedIndex !== i" />
                <Check :size="14" v-else />
                {{ copiedIndex === i ? t('redirectChecker.copied') : t('redirectChecker.copy') }}
              </button>
            </div>
          </div>
          <div v-if="i < result.hops.length - 1" class="rc-chain-connector" aria-hidden="true">
            <ArrowDown :size="20" />
          </div>
        </div>
      </div>
    </GiResultCard>

    <!-- Error Card -->
    <GiResultCard
      v-if="errorMessage"
      :title="errorTitle"
      variant="error"
      class="rc-error-card"
    >
      <p class="rc-error-message">{{ errorMessage }}</p>
      <p v-if="errorCode === 'MISSING_API_URL'" class="rc-error-missing-api-desc">
        {{ t('redirectChecker.error.missingApiDesc') }}
      </p>
      <p v-else class="rc-error-fallback-desc">
        {{ t('redirectChecker.fallbackDesc') }}
      </p>
      <code class="rc-code">curl -IL {{ inputUrl }}</code>
    </GiResultCard>

    <template #about>{{ t('redirectChecker.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Link,
  Loader2,
  Copy,
  Check,
  ArrowDown,
  GitBranch
} from 'lucide-vue-next'
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
const copiedIndex = ref<number | null>(null)

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
/* Form layout */
.rc-form {
  display: flex;
  gap: var(--gi-space-md);
  align-items: flex-end;
}

@media (max-width: 640px) {
  .rc-form {
    flex-direction: column;
  }
  .rc-check-btn {
    width: 100%;
  }
}

/* Summary card */
.rc-summary {
  margin-top: 1.5rem;
  padding: 1rem 1.25rem;
  background: var(--gi-tint-green-bg);
  border: 1px solid var(--gi-tint-green-border);
  border-radius: var(--gi-radius-lg);
}

.rc-summary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.rc-summary-header h3 {
  font-size: var(--gi-font-size-sm);
  font-weight: 600;
  color: var(--gi-tint-green-text);
  margin: 0;
}

.rc-hops-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.6rem;
  background: var(--gi-surface);
  border-radius: var(--gi-radius-pill);
  font-size: var(--gi-font-size-xs);
  font-weight: 600;
  color: var(--gi-text-muted);
}

.rc-final-url {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.rc-label {
  font-size: var(--gi-font-size-xs);
  font-weight: 500;
  color: var(--gi-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.rc-url {
  font-family: ui-monospace, 'SF Mono', 'Menlo', 'Monaco', monospace;
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text);
  word-break: break-all;
}

/* Chain visualization */
.rc-chain {
  display: flex;
  flex-direction: column;
}

.rc-chain-item {
  display: flex;
  flex-direction: column;
}

.rc-chain-item--last .rc-chain-connector {
  display: none;
}

.rc-chain-node {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0;
}

.rc-chain-badge {
  flex-shrink: 0;
}

.rc-chain-content {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rc-chain-url {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: ui-monospace, 'SF Mono', 'Menlo', 'Monaco', monospace;
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text);
}

@media (max-width: 640px) {
  .rc-chain-url {
    font-size: var(--gi-font-size-xs);
  }
}

.rc-chain-connector {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0;
  color: var(--gi-brand);
  margin-left: calc(2rem + 0.35rem); /* Badge width + gap */
}

/* No redirect state */
.rc-no-redirect {
  color: var(--gi-text-muted);
  font-size: 0.95rem;
  margin: 0;
}

/* Copy button */
.rc-copy-btn {
  font-size: var(--gi-font-size-xs);
  padding: 0.35rem 0.6rem;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
}

.rc-copy-btn--copied {
  color: var(--gi-brand);
  background: var(--gi-tint-green-bg);
}

/* Error card */
.rc-error-card {
  margin-top: 1.5rem;
}

.rc-error-message {
  margin-bottom: 0.5rem;
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-muted);
}

.rc-error-missing-api-desc {
  margin-bottom: 0.75rem;
  font-size: var(--gi-font-size-xs);
}

.rc-error-fallback-desc {
  margin-bottom: 0.5rem;
  font-size: var(--gi-font-size-sm);
}

.rc-code {
  font-family: ui-monospace, 'SF Mono', 'Menlo', 'Monaco', 'Cascadia Code', 'Consolas', monospace;
  font-size: var(--gi-font-size-xs);
  background: var(--gi-bg-soft);
  padding: 0.6rem 0.75rem;
  border-radius: var(--gi-radius-md);
  color: var(--gi-text);
  word-break: break-all;
  display: block;
}
</style>
