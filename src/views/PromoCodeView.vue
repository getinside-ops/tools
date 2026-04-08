<template>
  <ToolPageLayout :title="t('promoCode.title')" :description="t('promoCode.desc')" category="digital">
    <template #icon>
      <Tag :size="24" />
    </template>

    <div class="promo-input-section">
      <GiFormField
        :label="t('promoCode.label')"
        v-model="code"
        type="text"
        :placeholder="t('promoCode.placeholder')"
        class="gi-promo-code-field"
        autocomplete="off"
        spellcheck="false"
      />

      <div class="promo-helper-row">
        <span class="promo-helper-text">{{ t('promoCode.helperText') }}</span>
        <span v-if="code" class="promo-char-counter" :class="counterClass">
          {{ code.length }}/{{ MAX_LENGTH }} {{ t('promoCode.charCount') }}
        </span>
      </div>

      <div class="promo-actions" v-if="code">
        <button class="gi-btn gi-btn-sm" @click="copyCode" :disabled="!code">
          <Clipboard :size="14" />
          {{ copied ? t('promoCode.copied') : t('promoCode.copy') }}
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!code" class="promo-empty-state">
      <ClipboardCheck :size="48" class="promo-empty-icon" />
      <p class="promo-empty-text">{{ t('promoCode.emptyState') }}</p>
      <div class="promo-example-card">
        <span class="promo-example-label">{{ t('promoCode.exampleLabel') }}</span>
        <code class="promo-example-code">{{ t('promoCode.exampleCode') }}</code>
        <button class="gi-btn gi-btn-ghost gi-btn-sm" @click="tryExample">
          {{ t('promoCode.tryExample') }}
        </button>
      </div>
    </div>

    <!-- Results Section -->
    <template v-if="checks.length">
      <!-- Success Banner -->
      <div v-if="allPassed" class="promo-success-banner">
        <CheckCircle :size="24" class="promo-success-icon" />
        <div class="promo-success-text">
          <strong>{{ t('promoCode.success.title') }}</strong>
          <span>{{ t('promoCode.success.desc') }}</span>
        </div>
      </div>

      <!-- Score Progress Bar -->
      <div class="promo-score-section">
        <div class="promo-score-header">
          <span class="promo-score-label">{{ t('promoCode.score') }}</span>
          <span class="promo-score-value" :class="scoreClass">
            {{ passed }} / {{ checks.length }} {{ t('promoCode.checksPassed') }}
          </span>
        </div>
        <div class="promo-progress-bar" role="progressbar" :aria-valuenow="passed" :aria-valuemin="0" :aria-valuemax="checks.length">
          <div class="promo-progress-fill" :class="scoreClass" :style="{ width: `${progressPercent}%` }"></div>
        </div>
      </div>

      <!-- Checklist -->
      <ul class="promo-checklist" role="list">
        <li v-for="check in checks" :key="check.rule" :class="check.pass ? 'gi-check-pass' : 'gi-check-fail'" role="listitem">
          <span class="promo-check-icon" :class="check.pass ? 'promo-check-icon--pass' : 'promo-check-icon--fail'">
            <Check v-if="check.pass" :size="18" />
            <X v-else :size="18" />
          </span>
          <span class="promo-check-text">{{ t(`promoCode.checks.${camelRule(check.rule)}`) }}</span>
        </li>
      </ul>
    </template>

    <!-- Pedagogic Tips -->
    <div class="promo-tips">
      <button class="promo-tips-toggle" @click="showTips = !showTips" :aria-expanded="showTips">
        <Info :size="18" />
        {{ t('promoCode.pedagogic.title') }}
        <ChevronDown :size="16" :class="{ 'promo-tips-icon--open': showTips }" />
      </button>
      <div v-if="showTips" class="promo-tips-content">
        <p class="promo-tips-desc">{{ t('promoCode.pedagogic.description') }}</p>
        <ul class="promo-tips-list">
          <li v-for="(tip, i) in pedagogicTips" :key="i">{{ tip }}</li>
        </ul>
      </div>
    </div>

    <template #about>{{ t('promoCode.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Tag,
  Clipboard,
  Check,
  X,
  CheckCircle,
  ClipboardCheck,
  Info,
  ChevronDown,
} from 'lucide-vue-next'
import { validatePromoCode } from '../composables/usePromoCode'
import ToolPageLayout from '../components/ToolPageLayout.vue'
import GiFormField from '../components/GiFormField.vue'

const { t, tm } = useI18n()
const code = ref('')
const copied = ref(false)
const showTips = ref(false)
const MAX_LENGTH = 12

const pedagogicTips = computed(() => {
  const tips = tm('promoCode.pedagogic.tips') as unknown
  return Array.isArray(tips) ? (tips as string[]) : []
})

const checks = computed(() => validatePromoCode(code.value))
const passed = computed(() => checks.value.filter(c => c.pass).length)
const allPassed = computed(() => passed.value === checks.value.length && checks.value.length > 0)
const progressPercent = computed(() => (passed.value / (checks.value.length || 1)) * 100)

const scoreClass = computed(() => {
  const ratio = passed.value / (checks.value.length || 1)
  if (ratio === 1) return 'gi-score-ok'
  if (ratio >= 0.6) return 'gi-score-warn'
  return 'gi-score-bad'
})

const counterClass = computed(() => {
  if (code.value.length <= MAX_LENGTH) return 'counter-ok'
  if (code.value.length <= 15) return 'counter-warn'
  return 'counter-bad'
})

const ruleMap: Record<string, string> = {
  'length': 'length',
  'no-special-chars': 'noSpecialChars',
  'no-spaces': 'noSpaces',
  'no-ambiguous': 'noAmbiguous',
  'uppercase': 'uppercase',
}
function camelRule(rule: string) { return ruleMap[rule] ?? rule }

async function copyCode() {
  if (!code.value) return
  await navigator.clipboard.writeText(code.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

function tryExample() {
  code.value = t('promoCode.exampleCode')
}
</script>

<style scoped>
/* Input Section */
.promo-input-section {
  margin-bottom: var(--gi-space-lg);
}

.gi-promo-code-field :deep(.gi-input) {
  font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
  font-size: var(--gi-font-size-lg);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  min-height: 48px;
}

.promo-helper-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--gi-space-xs);
  gap: var(--gi-space-sm);
}

.promo-helper-text {
  font-size: var(--gi-font-size-xs);
  color: var(--gi-text-secondary);
  flex: 1;
}

.promo-char-counter {
  font-size: var(--gi-font-size-xs);
  font-weight: 600;
  font-family: 'Menlo', 'Monaco', monospace;
}

.counter-ok { color: var(--gi-tint-green-text); }
.counter-warn { color: var(--gi-tint-yellow-text); }
.counter-bad { color: var(--gi-tint-red-text); }

.promo-actions {
  margin-top: var(--gi-space-sm);
}

/* Empty State */
.promo-empty-state {
  text-align: center;
  padding: var(--gi-space-xl) var(--gi-space-lg);
  background: var(--gi-surface);
  border: 1px dashed var(--gi-border);
  border-radius: var(--gi-radius-lg);
  margin-bottom: var(--gi-space-lg);
}

.promo-empty-icon {
  color: var(--gi-text-muted);
  opacity: 0.4;
  margin-bottom: var(--gi-space-md);
}

.promo-empty-text {
  font-size: var(--gi-font-size-md);
  color: var(--gi-text-secondary);
  margin: 0 0 var(--gi-space-md);
}

.promo-example-card {
  display: inline-flex;
  align-items: center;
  gap: var(--gi-space-sm);
  padding: var(--gi-space-sm) var(--gi-space-md);
  background: var(--gi-tint-green-bg);
  border-radius: var(--gi-radius);
  flex-wrap: wrap;
  justify-content: center;
}

.promo-example-label {
  font-size: var(--gi-font-size-xs);
  color: var(--gi-text-secondary);
}

.promo-example-code {
  font-family: 'Menlo', 'Monaco', monospace;
  font-weight: 700;
  font-size: var(--gi-font-size-md);
  color: var(--gi-tint-green-text);
  letter-spacing: 0.08em;
}

/* Success Banner */
.promo-success-banner {
  display: flex;
  align-items: center;
  gap: var(--gi-space-md);
  padding: var(--gi-space-md) var(--gi-space-lg);
  background: var(--gi-tint-green-bg);
  border: 1px solid var(--gi-tint-green-border);
  border-radius: var(--gi-radius-lg);
  margin-bottom: var(--gi-space-lg);
  animation: promo-slide-in 0.3s var(--gi-ease-out);
}

@keyframes promo-slide-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.promo-success-icon {
  color: var(--gi-tint-green-text);
  flex-shrink: 0;
}

.promo-success-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: var(--gi-font-size-sm);
  color: var(--gi-tint-green-text);
}

.promo-success-text strong {
  font-size: var(--gi-font-size-md);
}

/* Score Section */
.promo-score-section {
  margin-bottom: var(--gi-space-lg);
}

.promo-score-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--gi-space-xs);
}

.promo-score-label {
  font-weight: 600;
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-secondary);
}

.promo-score-value {
  font-size: var(--gi-font-size-md);
  font-weight: 700;
  font-family: 'Menlo', 'Monaco', monospace;
}

.gi-score-ok { color: var(--gi-tint-green-text); }
.gi-score-warn { color: var(--gi-tint-yellow-text); }
.gi-score-bad { color: var(--gi-tint-red-text); }

.promo-progress-bar {
  height: 8px;
  background: var(--gi-bg);
  border-radius: var(--gi-radius-pill);
  overflow: hidden;
}

.promo-progress-fill {
  height: 100%;
  transition: width var(--gi-transition-base) var(--gi-ease-out);
  border-radius: var(--gi-radius-pill);
}

.promo-progress-fill.gi-score-ok { background: var(--gi-tint-green-text); }
.promo-progress-fill.gi-score-warn { background: var(--gi-tint-yellow-text); }
.promo-progress-fill.gi-score-bad { background: var(--gi-tint-red-text); }

/* Checklist */
.promo-checklist {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-xs);
  margin-bottom: var(--gi-space-lg);
}

.promo-checklist li {
  display: flex;
  align-items: center;
  gap: var(--gi-space-sm);
  font-size: var(--gi-font-size-sm);
  padding: var(--gi-space-sm) var(--gi-space-md);
  border-radius: var(--gi-radius);
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
}

.gi-check-pass {
  background: var(--gi-tint-green-bg);
  color: var(--gi-tint-green-text);
}

.gi-check-fail {
  background: var(--gi-tint-red-bg);
  color: var(--gi-tint-red-text);
}

.promo-check-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.promo-check-icon--pass {
  color: var(--gi-tint-green-text);
}

.promo-check-icon--fail {
  color: var(--gi-tint-red-text);
}

.promo-check-text {
  flex: 1;
}

/* Pedagogic Tips */
.promo-tips {
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  margin-bottom: var(--gi-space-lg);
  overflow: hidden;
}

.promo-tips-toggle {
  display: flex;
  align-items: center;
  gap: var(--gi-space-sm);
  width: 100%;
  padding: var(--gi-space-md) var(--gi-space-lg);
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--gi-font-size-sm);
  font-weight: 600;
  color: var(--gi-text);
  text-align: left;
  min-height: 44px;
  transition: background var(--gi-transition-fast) var(--gi-ease-out);
}

.promo-tips-toggle:hover {
  background: var(--gi-bg);
}

.promo-tips-toggle:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: -2px;
}

.promo-tips-icon--open {
  transform: rotate(180deg);
}

.promo-tips-icon {
  transition: transform var(--gi-transition-fast) var(--gi-ease-out);
}

.promo-tips-content {
  padding: 0 var(--gi-space-lg) var(--gi-space-md);
  animation: promo-expand 0.2s var(--gi-ease-out);
}

@keyframes promo-expand {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 300px;
  }
}

.promo-tips-desc {
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-secondary);
  margin-bottom: var(--gi-space-sm);
  line-height: 1.5;
}

.promo-tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-xs);
}

.promo-tips-list li {
  position: relative;
  padding-left: var(--gi-space-md);
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-secondary);
  line-height: 1.5;
}

.promo-tips-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.5em;
  width: 6px;
  height: 6px;
  background: var(--gi-brand);
  border-radius: 50%;
}

/* Responsive */
@media (max-width: 640px) {
  .promo-example-card {
    flex-direction: column;
    gap: var(--gi-space-xs);
  }

  .promo-helper-row {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--gi-space-xs);
  }

  .promo-success-banner {
    flex-direction: column;
    text-align: center;
    gap: var(--gi-space-sm);
  }
}

/* Dark mode adjustments */
[data-theme="dark"] .promo-empty-icon {
  opacity: 0.3;
}

[data-theme="dark"] .promo-tips-toggle:hover {
  background: rgba(255, 255, 255, 0.05);
}
</style>
