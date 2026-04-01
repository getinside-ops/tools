<template>
  <ToolPageLayout :title="t('redirectChecker.title')" :description="t('redirectChecker.desc')">
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

    <div v-if="result" class="gi-result" style="margin-top:1.5rem">
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
            <span class="gi-status-badge" :class="statusClass(hop.status)">{{ hop.status }}</span>
            <span class="gi-code gi-chain-url">{{ hop.url }}</span>
            <button class="gi-btn-ghost gi-copy-btn" @click="copyUrl(hop.url, i)">
              {{ copiedIndex === i ? t('redirectChecker.copied') : t('redirectChecker.copy') }}
            </button>
          </div>
          <div v-if="i < result.hops.length - 1" class="gi-arrow" aria-hidden="true">↓</div>
        </div>
      </div>
    </div>

    <div v-if="error" class="gi-result" style="border-color: var(--gi-tint-red-border); margin-top:1.5rem">
      <div class="gi-result-label" style="color:var(--gi-tint-red-text)">{{ t('redirectChecker.fallbackTitle') }}</div>
      <p style="margin-bottom:0.5rem; font-size:0.9rem; color:var(--gi-text-muted)">{{ t('redirectChecker.fallbackDesc') }}</p>
      <code class="gi-code">curl -IL {{ inputUrl }}</code>
    </div>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Link } from 'lucide-vue-next'
import ToolPageLayout from '../components/ToolPageLayout.vue'
import GiFormField from '../components/GiFormField.vue'
import { checkRedirect, type RedirectResult } from '../composables/useRedirectChecker'

const { t } = useI18n()
const inputUrl = ref('')
const loading = ref(false)
const result = ref<RedirectResult | null>(null)
const error = ref(false)
const copiedIndex = ref<number | null>(null)

async function check() {
  if (!inputUrl.value) return
  loading.value = true
  result.value = null
  error.value = false
  copiedIndex.value = null
  try {
    result.value = await checkRedirect(inputUrl.value)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

function statusClass(status: number): string {
  if (status >= 200 && status < 300) return 'gi-status-2xx'
  if (status === 301 || status === 308) return 'gi-status-3xx-perm'
  if (status >= 300 && status < 400) return 'gi-status-3xx-temp'
  if (status >= 400) return 'gi-status-err'
  return ''
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

/* Status badges */
.gi-status-badge {
  font-size: 0.75rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;
}
.gi-status-2xx   { background: var(--gi-tint-green-bg);  color: var(--gi-tint-green-text); }
.gi-status-3xx-perm { background: color-mix(in srgb, var(--gi-brand) 15%, transparent); color: var(--gi-brand); }
.gi-status-3xx-temp { background: var(--gi-tint-yellow-bg); color: var(--gi-tint-yellow-text); }
.gi-status-err   { background: var(--gi-tint-red-bg);    color: var(--gi-tint-red-text); }

/* Copy button */
.gi-copy-btn {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
