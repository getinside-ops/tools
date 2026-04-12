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
              :title="copiedIndex === index ? t('pxToRem.copied') : t('pxToRem.copyRem')"
              :aria-label="copiedIndex === index ? t('pxToRem.copied') : t('pxToRem.copyRem')"
              @click="copyRem(index)"
            >
              <Check v-if="copiedIndex === index" :size="14" />
              <Copy v-else :size="14" />
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
        <div v-else class="px-remove-placeholder"></div>
      </div>
    </div>

    <button @click="addRow" class="gi-btn-ghost px-add-btn">
      <Plus :size="16" />
      {{ t('pxToRem.addRow') }}
    </button>

    <!-- CSS Output -->
    <div v-if="rows.some(r => r.px !== '' && r.px !== 0)" class="px-css-output">
      <div class="px-css-header">
        <span class="px-css-title">{{ t('pxToRem.cssOutput') }}</span>
        <button
          class="gi-btn-ghost px-css-copy-all"
          :aria-label="cssCopied ? t('pxToRem.copied') : t('pxToRem.copyAll')"
          @click="copyAllCss"
        >
          <Check v-if="cssCopied" :size="14" />
          <Copy v-else :size="14" />
          {{ cssCopied ? t('pxToRem.copied') : t('pxToRem.copyAll') }}
        </button>
      </div>
      <pre class="px-css-code">{{ cssOutput }}</pre>
    </div>

    <template #about>{{ t('pxToRem.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Ruler, Trash2, Copy, Check, Plus } from 'lucide-vue-next'
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

const base = ref(16)
const baseError = ref('')
const copiedIndex = ref<number | null>(null)
const cssCopied = ref(false)

const rows = ref<RowData[]>([
  { id: crypto.randomUUID(), px: 16, rem: 1 },
  { id: crypto.randomUUID(), px: 24, rem: 1.5 },
  { id: crypto.randomUUID(), px: 32, rem: 2 },
])

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

async function copyRem(index: number) {
  const row = rows.value[index]
  if (row.rem === '' || row.rem === 0) return
  await navigator.clipboard.writeText(`${row.rem}rem`)
  copiedIndex.value = index
  setTimeout(() => { copiedIndex.value = null }, 1500)
}

const cssOutput = computed(() => {
  return rows.value
    .filter(r => r.px !== '' && r.px !== 0)
    .map(r => `/* ${r.px}px */\nfont-size: ${r.rem}rem;`)
    .join('\n\n')
})

async function copyAllCss() {
  if (!cssOutput.value) return
  await navigator.clipboard.writeText(cssOutput.value)
  cssCopied.value = true
  setTimeout(() => { cssCopied.value = false }, 1500)
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
  grid-template-columns: 1fr 1fr 50px;
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
  background: var(--gi-tint-green-surface);
  border-radius: var(--gi-radius-sm);
  padding: var(--gi-space-xs);
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
  background: transparent;
  border: none;
  box-shadow: none;
  padding: var(--gi-space-xs);
}

.px-value-input--rem:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 1px;
}

.px-copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  min-height: 32px;
  padding: 4px;
  border: none;
  background: transparent;
  color: var(--gi-text-muted);
  border-radius: var(--gi-radius-sm);
  cursor: pointer;
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
}

.px-copy-btn:hover {
  background: var(--gi-tint-green-border);
  color: var(--gi-brand);
}

.px-copy-btn:active {
  transform: scale(0.95);
}

.px-copy-btn:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 1px;
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

.px-remove-placeholder {
  width: 44px;
  height: 44px;
}

.px-add-btn {
  width: 100%;
  justify-content: center;
  border-style: dashed;
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: var(--gi-space-xs);
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
}

.px-add-btn:active {
  transform: scale(0.98);
}

.px-add-btn:focus-visible {
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
  min-height: 32px;
  padding: 4px var(--gi-space-sm);
}

.px-css-copy-all:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 1px;
}

.px-css-code {
  padding: var(--gi-space-md);
  margin: 0;
  font-family: 'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace;
  font-size: var(--gi-font-size-sm);
  line-height: 1.6;
  color: var(--gi-text);
  background: var(--gi-bg);
  overflow-x: auto;
  white-space: pre;
}

/* Responsive */
@media (max-width: 640px) {
  .px-grid-header {
    display: none;
  }

  .px-row {
    grid-template-columns: 1fr;
    gap: var(--gi-space-xs);
  }

  .px-row-inner {
    grid-template-columns: 1fr;
    gap: var(--gi-space-xs);
  }

  .px-remove-placeholder {
    display: none;
  }

  .px-remove-btn {
    justify-self: end;
  }

  .px-value-input {
    min-height: 48px;
  }
}
</style>
