<template>
  <ToolPageLayout :title="t('redirectChecker.title')" :description="t('redirectChecker.desc')" category="digital">
    <template #icon>
      <Link class="tool-page-icon" />
    </template>

    <!-- URL Input with action button -->
    <div class="rc-input-group">
      <label class="gi-label" for="rc-url-input">{{ t('redirectChecker.label') }}</label>
      <div class="rc-input-row">
        <input
          id="rc-url-input"
          v-model="inputUrl"
          type="url"
          :placeholder="t('redirectChecker.placeholder')"
          class="rc-input-field"
          @keydown.enter="check"
          :disabled="loading"
        />
        <button
          class="rc-action-btn"
          :disabled="loading || !inputUrl"
          @click="check"
          :aria-label="loading ? t('redirectChecker.checking') : t('redirectChecker.check')"
          :title="loading ? t('redirectChecker.checking') : t('redirectChecker.check')"
        >
          <Loader2 v-if="loading" :size="20" class="animate-spin" />
          <ArrowRight v-else :size="20" />
        </button>
      </div>
    </div>

    <!-- Result Summary -->
    <div v-if="result" class="rc-summary">
      <div class="rc-summary-header">
        <div class="rc-summary-title-row">
          <CheckCircle2 :size="20" class="rc-summary-icon" />
          <h3>{{ t('redirectChecker.summaryTitle') }}</h3>
        </div>
        <span class="rc-hops-badge" :class="{ 'rc-hops-badge--warning': hasLoop }">
          <GitBranch :size="14" />
          {{ t('redirectChecker.totalHops', { n: result.hops.length - 1 }) }}
        </span>
      </div>
      <div class="rc-final-url">
        <span class="rc-label">{{ t('redirectChecker.finalUrlLabel') }}</span>
        <a :href="result.finalUrl" target="_blank" rel="noopener noreferrer" class="rc-url-link">
          {{ result.finalUrl }}
          <ExternalLink :size="14" class="rc-external-icon" />
        </a>
      </div>
      <!-- Loop Warning -->
      <div v-if="hasLoop" class="rc-loop-warning">
        <AlertTriangle :size="16" />
        <span>{{ t('redirectChecker.loopWarning') }}</span>
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
        <!-- Grouped hops -->
        <template v-for="(group, gi) in groupedHops" :key="gi">
          <!-- Single hop (no grouping needed) -->
          <template v-if="group.type === 'single'">
            <div class="rc-chain-item">
              <div class="rc-chain-node" :class="getNodeClass(group.hopIndex)">
                <div class="rc-chain-badge">
                  <GiStatusBadge :variant="statusVariant(groupedHops[gi].hops[0].status)">
                    {{ groupedHops[gi].hops[0].status }}
                  </GiStatusBadge>
                </div>
                <div class="rc-chain-content">
                  <span class="rc-chain-url" :title="groupedHops[gi].hops[0].url">{{ groupedHops[gi].hops[0].url }}</span>
                </div>
                <div class="rc-chain-step-label">{{ getStepLabel(groupedHops[gi].hops[0]) }}</div>
              </div>
            </div>
            <div v-if="gi < groupedHops.length - 1" class="rc-chain-connector" aria-hidden="true">
              <ArrowDown :size="16" />
            </div>
          </template>

          <!-- Collapsed group (repeated pattern) -->
          <template v-else>
            <button
              class="rc-chain-group"
              :class="{ 'rc-chain-group--expanded': group.expanded }"
              @click="group.expanded = !group.expanded"
              :aria-expanded="group.expanded"
              :aria-label="t('redirectChecker.toggleGroup', { n: group.count })"
            >
              <div class="rc-chain-group-header">
                <ChevronDown :size="16" class="rc-group-chevron" :class="{ 'rc-group-chevron--expanded': group.expanded }" />
                <div class="rc-chain-badge rc-chain-badge--small">
                  <GiStatusBadge :variant="statusVariant(groupedHops[gi].hops[0].status)">
                    {{ groupedHops[gi].hops[0].status }}
                  </GiStatusBadge>
                </div>
                <span class="rc-chain-group-url" :title="groupedHops[gi].hops[0].url">{{ groupedHops[gi].hops[0].url }}</span>
                <span class="rc-chain-group-count">
                  ×{{ group.count }}
                  <span class="rc-chain-group-label">{{ t('redirectChecker.times', { n: group.count }) }}</span>
                </span>
              </div>
              <!-- Expanded detail -->
              <div v-if="group.expanded" class="rc-chain-group-detail">
                <div
                  v-for="(hop, hi) in group.hops"
                  :key="hi"
                  class="rc-chain-group-item"
                >
                  <div class="rc-chain-group-item-badge">
                    <GiStatusBadge :variant="statusVariant(hop.status)" size="xs">
                      {{ hop.status }}
                    </GiStatusBadge>
                  </div>
                  <span class="rc-chain-group-item-url" :title="hop.url">{{ hop.url }}</span>
                </div>
              </div>
            </button>
            <div v-if="gi < groupedHops.length - 1" class="rc-chain-connector" aria-hidden="true">
              <ArrowDown :size="16" />
            </div>
          </template>
        </template>
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
  ArrowDown,
  GitBranch,
  CheckCircle2,
  ExternalLink,
  AlertTriangle,
  ChevronDown,
  ArrowRight
} from 'lucide-vue-next'
import ToolPageLayout from '../components/ToolPageLayout.vue'
import GiResultCard from '../components/GiResultCard.vue'
import GiStatusBadge from '../components/GiStatusBadge.vue'
import { checkRedirect, RedirectCheckerError, type RedirectResult, type RedirectHop } from '../composables/useRedirectChecker'

const { t } = useI18n()
const inputUrl = ref('')
const loading = ref(false)
const result = ref<RedirectResult | null>(null)
const errorCode = ref<string | null>(null)

// Group state for collapsible repeated patterns
const groupExpandedState = ref<Record<number, boolean>>({})

interface HopGroup {
  type: 'single' | 'grouped'
  hops: RedirectHop[]
  hopIndex: number
  count: number
  expanded: boolean
}

const groupedHops = computed<HopGroup[]>(() => {
  if (!result.value || !result.value.redirected) return []
  
  const hops = result.value.hops
  const groups: HopGroup[] = []
  let i = 0
  
  while (i < hops.length) {
    // Check for repeating pattern (A→B→A→B...)
    if (i + 3 < hops.length) {
      const patternA = hops[i].url
      const patternB = hops[i + 1]?.url
      
      if (patternA && patternB && patternA !== patternB) {
        // Count how many times this A→B pattern repeats
        let repeatCount = 0
        let j = i
        while (j < hops.length - 1) {
          if (hops[j].url === patternA && hops[j + 1].url === patternB) {
            repeatCount++
            j += 2
          } else {
            break
          }
        }
        
        if (repeatCount >= 2) {
          // Group the repeating pattern
          const patternHops = hops.slice(i, i + repeatCount * 2)
          // Handle odd hop at end
          if (j < hops.length && hops[j].url === patternA) {
            patternHops.push(hops[j])
            j++
          }
          groups.push({
            type: 'grouped',
            hops: patternHops,
            hopIndex: i,
            count: repeatCount,
            expanded: groupExpandedState.value[groups.length] || false,
          })
          i = j
          continue
        }
      }
    }
    
    // Single hop (no grouping)
    groups.push({
      type: 'single',
      hops: [hops[i]],
      hopIndex: i,
      count: 1,
      expanded: false,
    })
    i++
  }
  
  return groups
})

const hasLoop = computed(() => {
  if (!result.value) return false
  const urls = result.value.hops.map(h => h.url)
  const seen = new Set<string>()
  for (const url of urls) {
    if (seen.has(url)) return true
    seen.add(url)
  }
  return false
})

function getNodeClass(hopIndex: number): string {
  if (!result.value) return ''
  const isLast = hopIndex === result.value.hops.length - 1
  return isLast ? 'rc-chain-node--final' : ''
}

function getStepLabel(hop: RedirectHop): string {
  if (!result.value) return ''
  const idx = result.value.hops.indexOf(hop)
  if (idx === 0) return t('redirectChecker.stepStart')
  if (idx === result.value.hops.length - 1) return t('redirectChecker.stepFinal')
  return t('redirectChecker.stepIntermediate', { n: idx })
}

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
  groupExpandedState.value = {}
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
</script>

<style scoped>
/* Input group */
.rc-input-group {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-xs);
}

.rc-input-row {
  display: flex;
  align-items: stretch;
}

/* Input field — left half of unified border */
.rc-input-field {
  flex: 1;
  padding: 0.6rem 1rem;
  border: 1px solid var(--gi-border) !important;
  border-right: none !important;
  border-radius: var(--gi-radius-lg) 0 0 var(--gi-radius-lg);
  box-shadow: none !important;
  outline: none !important;
  background: var(--gi-surface);
  font-family: inherit;
  font-size: var(--gi-font-size-md);
  color: var(--gi-text);
  min-height: 44px;
  transition: border-color var(--gi-transition-fast) var(--gi-ease-out),
              box-shadow var(--gi-transition-fast) var(--gi-ease-out);
}

.rc-input-field:focus,
.rc-input-field:focus-visible {
  border: 1px solid var(--gi-border) !important;
  border-right: none !important;
  box-shadow: none !important;
  outline: none !important;
}

.rc-input-field::placeholder {
  color: var(--gi-text-muted);
}

.rc-input-field:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Action button — right half of unified border */
.rc-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  min-width: 44px;
  margin-left: -1px; /* Overlap the shared border edge */
  padding: 0;
  border: 1px solid var(--gi-border) !important;
  border-left: none !important;
  border-radius: 0 var(--gi-radius-lg) var(--gi-radius-lg) 0;
  background: var(--gi-brand);
  color: var(--gi-text-inverse);
  cursor: pointer;
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
}

.rc-action-btn:hover:not(:disabled) {
  background: var(--gi-brand-dark);
}

.rc-action-btn:active:not(:disabled) {
  transform: scale(0.97);
}

.rc-action-btn:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

.rc-action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: var(--gi-border);
  color: var(--gi-text-muted);
}

/* Unified focus: both input and button get highlighted */
.rc-input-row:focus-within .rc-input-field {
  border-color: var(--gi-brand);
}

.rc-input-row:focus-within .rc-action-btn {
  border-color: var(--gi-brand);
}

.rc-input-row:focus-within {
  box-shadow: 0 0 0 3px rgba(10, 170, 142, 0.15);
  border-radius: var(--gi-radius-lg);
}

/* Summary card */
.rc-summary {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: var(--gi-tint-green-bg);
  border: 1px solid var(--gi-tint-green-border);
  border-radius: var(--gi-radius-lg);
}

.rc-summary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.rc-summary-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rc-summary-icon {
  color: var(--gi-brand);
  flex-shrink: 0;
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

.rc-hops-badge--warning {
  background: var(--gi-tint-yellow-bg);
  color: var(--gi-tint-yellow-text);
}

.rc-final-url {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.rc-label {
  font-size: var(--gi-font-size-xs);
  font-weight: 500;
  color: var(--gi-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.rc-url-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: ui-monospace, 'SF Mono', 'Menlo', 'Monaco', monospace;
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text);
  word-break: break-all;
  text-decoration: none;
  transition: color var(--gi-transition-fast) var(--gi-ease-out);
}

.rc-url-link:hover {
  color: var(--gi-brand);
}

.rc-url-link:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
  border-radius: var(--gi-radius-sm);
}

.rc-external-icon {
  flex-shrink: 0;
  opacity: 0.5;
}

/* Loop warning */
.rc-loop-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.6rem 0.75rem;
  background: var(--gi-tint-yellow-bg);
  border: 1px solid var(--gi-tint-yellow-border);
  border-radius: var(--gi-radius-md);
  font-size: var(--gi-font-size-xs);
  color: var(--gi-tint-yellow-text);
}

.rc-loop-warning svg {
  flex-shrink: 0;
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

.rc-chain-node {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.rc-chain-node--final {
  background: var(--gi-tint-green-bg);
  border-radius: var(--gi-radius-md);
  padding: 0.5rem 0.75rem;
  margin: 0 -0.75rem;
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

.rc-chain-step-label {
  flex-shrink: 0;
  font-size: var(--gi-font-size-xs);
  color: var(--gi-text-muted);
  white-space: nowrap;
}

@media (max-width: 640px) {
  .rc-chain-step-label {
    display: none;
  }
}

.rc-chain-connector {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.15rem 0;
  color: var(--gi-brand);
  margin-left: calc(2rem + 0.35rem);
  opacity: 0.6;
}

/* Collapsible group for repeated patterns */
.rc-chain-group {
  width: 100%;
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  padding: 0;
  text-align: left;
  cursor: pointer;
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
}

.rc-chain-group:hover {
  border-color: var(--gi-brand);
  background: var(--gi-bg-soft);
}

.rc-chain-group:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

.rc-chain-group--expanded {
  border-color: var(--gi-brand);
  background: var(--gi-tint-green-bg);
}

.rc-chain-group-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
}

.rc-group-chevron {
  flex-shrink: 0;
  transition: transform var(--gi-transition-base) var(--gi-ease-out);
  color: var(--gi-text-muted);
}

.rc-group-chevron--expanded {
  transform: rotate(180deg);
}

.rc-chain-badge--small :deep(.gi-status-badge) {
  font-size: var(--gi-font-size-xs);
  padding: 0.1rem 0.35rem;
}

.rc-chain-group-url {
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
  .rc-chain-group-url {
    font-size: var(--gi-font-size-xs);
  }
}

.rc-chain-group-count {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--gi-font-size-xs);
  font-weight: 600;
  color: var(--gi-text-muted);
}

.rc-chain-group-label {
  font-weight: 400;
}

.rc-chain-group-detail {
  padding: 0 0.75rem 0.75rem;
  border-top: 1px solid var(--gi-border);
  margin: 0 0.75rem;
}

.rc-chain-group-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0;
}

.rc-chain-group-item-badge {
  flex-shrink: 0;
}

.rc-chain-group-item-url {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: ui-monospace, 'SF Mono', 'Menlo', 'Monaco', monospace;
  font-size: var(--gi-font-size-xs);
  color: var(--gi-text-muted);
}

/* No redirect state */
.rc-no-redirect {
  color: var(--gi-text-muted);
  font-size: var(--gi-font-size-sm);
  margin: 0;
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
