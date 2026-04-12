<template>
  <ToolPageLayout
    :title="t('pxToRem.title')"
    :description="t('pxToRem.desc')"
    category="design"
  >
    <template #icon>
      <Ruler :size="22" />
    </template>

    <!-- Base Size Setting -->
    <div class="px-base-row">
      <label for="px-base-input" class="px-base-label">{{ t('pxToRem.baseSize') }}</label>
      <div class="px-base-input-wrap">
        <input
          id="px-base-input"
          v-model.number="base"
          type="number"
          class="gi-input px-base-input"
          min="1"
          max="100"
          step="1"
          @blur="base = clampNumber(base, 1, 100)"
        />
        <span class="px-base-unit">px</span>
      </div>
      <span v-if="baseError" class="px-base-error" role="alert">{{ baseError }}</span>
    </div>

    <!-- Conversion Grid Header -->
    <div class="px-grid-header">
      <div>{{ t('pxToRem.pxLabel') }}</div>
      <div>{{ t('pxToRem.remLabel') }}</div>
      <div class="sr-only">Actions</div>
    </div>

    <!-- Dynamic Rows -->
    <div class="px-rows">
      <div
        v-for="(row, index) in rows"
        :key="row.id"
        class="gi-card px-row"
        :class="{ 'px-row--single': rows.length === 1 }"
      >
        <div class="px-row-inner">
          <input
            v-model.number="row.px"
            type="number"
            class="gi-input px-value-input"
            step="1"
            min="0"
            :aria-label="`${t('pxToRem.pxLabel')} ${index + 1}`"
            @input="onPxInput(index)"
          />
          <div class="px-rem-cell">
            <input
              v-model.number="row.rem"
              type="number"
              class="gi-input px-value-input px-value-input--rem"
              step="0.0001"
              min="0"
              :aria-label="`${t('pxToRem.remLabel')} ${index + 1}`"
              @input="onRemInput(index)"
            />
            <button
              class="px-copy-btn"
              :class="{ 'px-copy-btn--copied': copiedIndex === index }"
              :title="copiedIndex === index ? t('pxToRem.copied') : t('pxToRem.copyRem')"
              :aria-label="copiedIndex === index ? t('pxToRem.copied') : t('pxToRem.copyRem')"
              @click="copyRem(index)"
            >
              <Check v-if="copiedIndex === index" :size="18" />
              <Copy v-else :size="18" />
            </button>
          </div>
        </div>
        <button
          v-if="rows.length > 1"
          @click="removeRow(index)"
          class="gi-btn-ghost px-remove-btn"
          :aria-label="t('pxToRem.removeRow')"
          :title="t('pxToRem.removeRow')"
        >
          <Trash2 :size="18" />
        </button>
      </div>
    </div>

    <div class="px-actions">
      <button @click="addRow" class="gi-btn-ghost px-add-btn">
        <Plus :size="16" />
        {{ t('pxToRem.addRow') }}
      </button>
      <button
        v-if="rows.length > 3"
        @click="resetRows"
        class="gi-btn-ghost px-reset-btn"
        :aria-label="t('pxToRem.resetRows')"
        :title="t('pxToRem.resetRows')"
      >
        <RotateCcw :size="16" />
        {{ t('pxToRem.resetRows') }}
      </button>
    </div>

    <!-- CSS Output -->
    <div v-if="rows.some(r => r.px !== '' && r.px !== 0)" class="px-css-output">
      <div class="px-css-header">
        <span class="px-css-title">{{ t('pxToRem.cssOutput') }}</span>
        <button
          class="gi-btn-ghost px-css-copy-all"
          :class="{ 'px-css-copy-all--copied': cssCopied }"
          :aria-label="cssCopied ? t('pxToRem.copied') : t('pxToRem.copyAll')"
          @click="copyAllCss"
        >
          <Check v-if="cssCopied" :size="14" />
          <Copy v-else :size="14" />
          {{ cssCopied ? t('pxToRem.copied') : t('pxToRem.copyAll') }}
        </button>
      </div>
      <pre
        class="px-css-code"
        tabindex="0"
        :aria-label="t('pxToRem.cssOutput')"
      >{{ cssOutput }}</pre>
    </div>

    <!-- What is REM? Info Panel -->
    <div class="gi-card px-info-panel">
      <h3 class="px-info-title">{{ t('pxToRem.pedagogic.title') }}</h3>
      <p class="px-info-text">{{ t('pxToRem.pedagogic.description') }}</p>
      <ul class="px-info-tips">
        <li v-for="(tip, i) in pedagogicTips" :key="i" class="px-info-tip">{{ tip }}</li>
      </ul>
    </div>

    <template #about>{{ t('pxToRem.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Ruler, Trash2, Copy, Check, Plus, RotateCcw } from 'lucide-vue-next'
import ToolPageLayout from '../components/ToolPageLayout.vue'
import { pxToRem, remToPx } from '../composables/usePxToRem'

const { t } = useI18n()

interface RowData {
  id: string
  px: number | ''
  rem: number | ''
}

function clampNumber(value: number, min: number, max: number): number {
  if (isNaN(value)) return min
  return Math.max(min, Math.min(max, value))
}

const DEFAULT_ROWS: RowData[] = [
  { id: crypto.randomUUID(), px: 16, rem: 1 },
  { id: crypto.randomUUID(), px: 24, rem: 1.5 },
  { id: crypto.randomUUID(), px: 32, rem: 2 },
]

const base = ref(16)
const baseError = ref('')
const copiedIndex = ref<number | null>(null)
const cssCopied = ref(false)

const rows = ref<RowData[]>(DEFAULT_ROWS.map(r => ({ ...r, id: crypto.randomUUID() })))

const pedagogicTips = computed(() => {
  const tips = t('pxToRem.pedagogic.tips', { returnObjects: true })
  return Array.isArray(tips) ? tips : []
})

watch(base, (newBase, oldBase) => {
  if (newBase < 1 || newBase > 100) {
    baseError.value = t('pxToRem.error.invalidBase')
    base.value = oldBase ?? 16
    return
  }
  baseError.value = ''
  rows.value.forEach((_, i) => onPxInput(i))
})

function onPxInput(index: number) {
  const row = rows.value[index]
  if (row.px === '' || row.px === 0) { row.rem = ''; return }
  row.rem = Number(pxToRem(Number(row.px), base.value).toFixed(4))
}

function onRemInput(index: number) {
  const row = rows.value[index]
  if (row.rem === '' || row.rem === 0) { row.px = ''; return }
  row.px = Number(remToPx(Number(row.rem), base.value).toFixed(2))
}

function addRow() {
  rows.value.push({ id: crypto.randomUUID(), px: '', rem: '' })
}

function removeRow(index: number) {
  rows.value.splice(index, 1)
}

function resetRows() {
  rows.value = DEFAULT_ROWS.map(r => ({ ...r, id: crypto.randomUUID() }))
}

async function copyRem(index: number) {
  const row = rows.value[index]
  if (row.rem === '' || row.rem === 0) return
  await navigator.clipboard.writeText(`${row.rem}rem`)
  copiedIndex.value = index
  setTimeout(() => { copiedIndex.value = null }, 2000)
}

const cssOutput = computed(() => {
  const lines: string[] = []
  lines.push(`:root { font-size: ${base.value}px; }`)
  lines.push('')
  rows.value
    .filter(r => r.px !== '' && r.px !== 0)
    .forEach(r => {
      lines.push(`/* ${r.px}px */`)
      lines.push(`font-size: ${r.rem}rem;`)
      lines.push('')
    })
  return lines.join('\n').trimEnd()
})

async function copyAllCss() {
  if (!cssOutput.value) return
  await navigator.clipboard.writeText(cssOutput.value)
  cssCopied.value = true
  setTimeout(() => { cssCopied.value = false }, 2000)
}
</script>

<style scoped>
.px-base-row {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-xs);
  padding: var(--gi-space-md) var(--gi-space-lg);
  margin-bottom: var(--gi-space-lg);
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
}

.px-base-label {
  font-weight: 500;
  color: var(--gi-text);
}

.px-base-input-wrap {
  display: flex;
  align-items: center;
  gap: var(--gi-space-xs);
}

.px-base-input {
  width: 80px;
  text-align: center;
}

.px-base-unit {
  color: var(--gi-text-muted);
  font-size: var(--gi-font-size-sm);
}

.px-base-error {
  font-size: var(--gi-font-size-xs);
  color: var(--gi-error);
}

.px-grid-header {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: var(--gi-space-md);
  margin-bottom: var(--gi-space-xs);
  padding: 0 var(--gi-space-md);
  color: var(--gi-text-muted);
  font-size: var(--gi-font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.px-rows {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-sm);
  margin-bottom: var(--gi-space-md);
}

.px-row {
  padding: var(--gi-space-sm) var(--gi-space-md);
  display: grid;
  grid-template-columns: 1fr 50px;
  gap: var(--gi-space-md);
  align-items: center;
}

.px-row--single {
  grid-template-columns: 1fr;
}

.px-row-inner {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--gi-space-sm);
  align-items: center;
}

.px-rem-cell {
  display: flex;
  align-items: center;
  gap: var(--gi-space-xs);
  border-radius: var(--gi-radius-sm);
}

.px-value-input {
  font-size: var(--gi-font-size-md);
  text-align: center;
  min-height: 44px;
}

.px-value-input:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 1px;
}

.px-value-input--rem {
  color: var(--gi-brand);
  font-weight: 600;
  background: var(--gi-tint-green-surface);
  border: none;
  box-shadow: none;
  padding: var(--gi-space-xs) var(--gi-space-sm);
  border-radius: var(--gi-radius-sm);
  flex: 1;
}

.px-value-input--rem:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 1px;
}

.px-copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  padding: 4px;
  border: none;
  background: transparent;
  color: var(--gi-text-muted);
  border-radius: var(--gi-radius-sm);
  cursor: pointer;
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
}

.px-copy-btn:hover {
  background: var(--gi-tint-green-surface);
  color: var(--gi-brand);
}

.px-copy-btn:active {
  transform: scale(0.95);
}

.px-copy-btn:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 1px;
}

.px-copy-btn--copied {
  color: var(--gi-brand);
}

.px-remove-btn {
  padding: var(--gi-space-xs);
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  color: var(--gi-tint-red-text);
  cursor: pointer;
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
}

.px-remove-btn:hover {
  background: var(--gi-tint-red-surface);
}

.px-remove-btn:active {
  transform: scale(0.95);
}

.px-remove-btn:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 1px;
}

.px-actions {
  display: flex;
  gap: var(--gi-space-sm);
  margin-bottom: var(--gi-space-md);
}

.px-add-btn {
  flex: 1;
  justify-content: center;
  border-style: dashed;
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: var(--gi-space-xs);
  cursor: pointer;
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
}

.px-add-btn:active {
  transform: scale(0.98);
}

.px-add-btn:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 1px;
}

.px-reset-btn {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: var(--gi-space-xs);
  cursor: pointer;
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
}

.px-reset-btn:active {
  transform: scale(0.98);
}

.px-reset-btn:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 1px;
}

.px-css-output {
  margin-top: var(--gi-space-lg);
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  overflow: hidden;
}

.px-css-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--gi-space-sm) var(--gi-space-md);
  background: var(--gi-tint-purple-surface);
  border-bottom: 1px solid var(--gi-border);
}

.px-css-title {
  font-weight: 600;
  font-size: var(--gi-font-size-sm);
  color: var(--gi-tint-purple-text);
}

.px-css-copy-all {
  display: flex;
  align-items: center;
  gap: var(--gi-space-xs);
  font-size: var(--gi-font-size-xs);
  min-height: 44px;
  min-width: 44px;
  padding: 4px var(--gi-space-sm);
  cursor: pointer;
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
}

.px-css-copy-all:active {
  transform: scale(0.95);
}

.px-css-copy-all:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 1px;
}

.px-css-copy-all--copied {
  color: var(--gi-brand);
}

.px-css-code {
  padding: var(--gi-space-md);
  margin: 0;
  font-family: 'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace;
  font-size: clamp(var(--gi-font-size-xs), 3vw, var(--gi-font-size-sm));
  line-height: 1.6;
  color: var(--gi-text);
  background: var(--gi-bg);
  overflow-x: auto;
  white-space: pre;
  cursor: text;
}

.px-css-code:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: -2px;
}

/* Info Panel */
.px-info-panel {
  margin-top: var(--gi-space-lg);
}

.px-info-title {
  font-size: var(--gi-font-size-md);
  font-weight: 600;
  color: var(--gi-text);
  margin-bottom: var(--gi-space-sm);
}

.px-info-text {
  color: var(--gi-text-muted);
  font-size: var(--gi-font-size-sm);
  line-height: 1.6;
  margin-bottom: var(--gi-space-sm);
}

.px-info-tips {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-xs);
}

.px-info-tip {
  position: relative;
  padding-left: var(--gi-space-lg);
  color: var(--gi-text-muted);
  font-size: var(--gi-font-size-sm);
  line-height: 1.5;
}

.px-info-tip::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.5em;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--gi-brand);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .px-copy-btn,
  .px-remove-btn,
  .px-add-btn,
  .px-reset-btn,
  .px-css-copy-all {
    transition: none;
  }

  .px-copy-btn:active,
  .px-remove-btn:active,
  .px-add-btn:active,
  .px-reset-btn:active,
  .px-css-copy-all:active {
    transform: none;
  }
}

/* Responsive */
@media (max-width: 640px) {
  .px-grid-header {
    display: none;
  }

  .px-row {
    grid-template-columns: 1fr;
    gap: var(--gi-space-xs);
    border-bottom: 1px solid var(--gi-border);
  }

  .px-row:last-child {
    border-bottom: none;
  }

  .px-row--single {
    border-bottom: none;
  }

  .px-row-inner {
    grid-template-columns: 1fr;
    gap: var(--gi-space-xs);
  }

  .px-value-input {
    min-height: 48px;
  }

  .px-actions {
    flex-direction: column;
  }

  .px-reset-btn {
    justify-content: center;
  }
}
</style>
