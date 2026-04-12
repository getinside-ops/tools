<template>
  <ToolPageLayout
    :title="t('typeScale.title')"
    :description="t('typeScale.desc')"
    category="design"
  >
    <template #icon>
      <Type :size="24" />
    </template>

    <!-- Controls Section -->
    <div class="ts-controls">
      <div class="ts-control-row">
        <GiFormField :label="t('typeScale.baseSize')">
          <template #input>
            <div class="ts-field-with-slider">
              <input
                v-model.number="baseSize"
                type="number"
                class="gi-input"
                min="8"
                max="64"
                step="1"
                @blur="baseSize = clampNumber(baseSize, 8, 64)"
              />
              <input
                v-model.number="baseSize"
                type="range"
                class="ts-slider"
                min="8"
                max="64"
                step="1"
                :aria-label="t('typeScale.baseSize')"
              />
            </div>
          </template>
        </GiFormField>

        <GiFormField :label="t('typeScale.ratio')">
          <template #input>
            <select v-model.number="ratio" class="gi-select">
              <option v-for="(value, key) in TYPE_SCALE_RATIOS" :key="key" :value="value">
                {{ t(`typeScale.ratios.${key}`) }}
              </option>
            </select>
          </template>
        </GiFormField>
      </div>

      <div class="ts-control-row">
        <GiFormField :label="t('typeScale.stepsDown')">
          <template #input>
            <div class="ts-field-with-slider">
              <input
                v-model.number="stepsDown"
                type="number"
                class="gi-input"
                min="0"
                max="6"
                step="1"
                @blur="stepsDown = clampNumber(stepsDown, 0, 6)"
              />
              <input
                v-model.number="stepsDown"
                type="range"
                class="ts-slider"
                min="0"
                max="6"
                step="1"
                :aria-label="t('typeScale.stepsDown')"
              />
            </div>
          </template>
        </GiFormField>

        <GiFormField :label="t('typeScale.stepsUp')">
          <template #input>
            <div class="ts-field-with-slider">
              <input
                v-model.number="stepsUp"
                type="number"
                class="gi-input"
                min="2"
                max="12"
                step="1"
                @blur="stepsUp = clampNumber(stepsUp, 2, 12)"
              />
              <input
                v-model.number="stepsUp"
                type="range"
                class="ts-slider"
                min="2"
                max="12"
                step="1"
                :aria-label="t('typeScale.stepsUp')"
              />
            </div>
          </template>
        </GiFormField>
      </div>

      <div class="ts-control-row ts-control-row--fonts">
        <GiFormField :label="t('typeScale.fontFamily')">
          <template #input>
            <select v-model="fontFamily" class="gi-select">
              <option v-for="(value, key) in FONT_FAMILIES" :key="key" :value="value">
                {{ t(`typeScale.fonts.${key}`) }}
              </option>
            </select>
          </template>
        </GiFormField>

        <GiFormField :label="t('typeScale.fontWeight')">
          <template #input>
            <select v-model.number="fontWeight" class="gi-select">
              <option :value="300">{{ t('typeScale.weights.light') }}</option>
              <option :value="400">{{ t('typeScale.weights.regular') }}</option>
              <option :value="500">{{ t('typeScale.weights.medium') }}</option>
              <option :value="600">{{ t('typeScale.weights.semibold') }}</option>
              <option :value="700">{{ t('typeScale.weights.bold') }}</option>
            </select>
          </template>
        </GiFormField>

        <GiFormField :label="t('typeScale.lineHeight')">
          <template #input>
            <div class="ts-field-with-slider">
              <input
                v-model.number="lineHeight"
                type="number"
                class="gi-input"
                min="1.0"
                max="2.0"
                step="0.1"
                @blur="lineHeight = clampNumber(lineHeight, 1.0, 2.0)"
              />
              <input
                v-model.number="lineHeight"
                type="range"
                class="ts-slider"
                min="1.0"
                max="2.0"
                step="0.1"
                :aria-label="t('typeScale.lineHeight')"
              />
            </div>
          </template>
        </GiFormField>
      </div>
    </div>

    <!-- Visual Preview Section -->
    <GiResultCard :title="t('typeScale.preview')" :subtitle="t('typeScale.previewSubtitle')">
      <div class="ts-visual-preview" :style="previewFontStyle">
        <div
          v-for="entry in previewEntries"
          :key="entry.step"
          class="ts-preview-item"
          :style="{ fontSize: entry.px + 'px' }"
        >
          <span class="ts-preview-label">{{ entry.label }}</span>
          <span class="ts-preview-value">{{ t('typeScale.sampleText.sample') }}</span>
        </div>
      </div>
    </GiResultCard>

    <!-- Scale Visualization Section -->
    <GiResultCard :title="t('typeScale.visualization')" :subtitle="t('typeScale.visualizationSubtitle')">
      <div class="ts-scale-viz">
        <div
          v-for="entry in scaleVisualization"
          :key="entry.step"
          class="ts-scale-bar-row"
          :class="{ 'ts-scale-bar-row--base': entry.step === 0 }"
        >
          <div class="ts-scale-bar-label">
            <span class="ts-scale-bar-step" :class="{ 'ts-scale-bar-step--base': entry.step === 0 }">
              {{ entry.step }}
            </span>
            <span class="ts-scale-bar-name">{{ entry.label }}</span>
          </div>
          <div class="ts-scale-bar-container">
            <div
              class="ts-scale-bar"
              :class="{ 'ts-scale-bar--base': entry.step === 0 }"
              :style="{ width: entry.percentage + '%' }"
            >
              <span class="ts-scale-bar-value">{{ entry.px }}px</span>
            </div>
          </div>
        </div>
      </div>
    </GiResultCard>

    <!-- CSS Output Section -->
    <GiResultCard :title="t('typeScale.cssOutput')" :subtitle="t('typeScale.cssOutputSubtitle')">
      <div class="ts-css-output">
        <button
          class="ts-copy-btn"
          :class="{ 'ts-copy-btn--success': copiedFlash !== null }"
          @click="copyAllCSS"
          :aria-label="t('typeScale.copyAll')"
        >
          <Check v-if="copiedFlash !== null" :size="16" />
          <Copy v-else :size="16" />
          {{ copiedFlash !== null ? t('typeScale.copied') : t('typeScale.copyAll') }}
        </button>
        <pre class="ts-code"><code>{{ cssOutput }}</code></pre>
      </div>
    </GiResultCard>

    <!-- Detailed Table Section -->
    <GiResultCard :title="t('typeScale.table')" :subtitle="t('typeScale.tableSubtitle')">
      <div class="ts-table-wrapper">
        <table class="gi-table ts-table">
          <thead>
            <tr>
              <th>{{ t('typeScale.step') }}</th>
              <th>{{ t('typeScale.size') }} ({{ t('typeScale.px') }})</th>
              <th>{{ t('typeScale.size') }} ({{ t('typeScale.rem') }})</th>
              <th>{{ t('typeScale.previewLabel') }}</th>
              <th class="ts-table-actions">{{ t('typeScale.copy') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in scale" :key="s.step" :class="{ 'ts-table-row--base': s.step === 0 }">
              <td>
                <span class="ts-step" :class="{ 'ts-step--base': s.step === 0 }">
                  {{ s.step }}
                </span>
              </td>
              <td class="ts-table-value">{{ s.px }}<span class="ts-unit">{{ t('typeScale.px') }}</span></td>
              <td class="ts-table-value">{{ s.rem }}<span class="ts-unit">{{ t('typeScale.rem') }}</span></td>
              <td>
                <div class="ts-table-preview" :style="{ fontSize: Math.min(s.px, 24) + 'px' }">
                  {{ t('typeScale.sampleText.sampleShort') }}
                </div>
              </td>
              <td class="ts-table-actions">
                <button
                  class="ts-copy-icon-btn"
                  :class="{ 'ts-copy-icon-btn--success': copiedIndex === s.step }"
                  @click="copyValue(s)"
                  :aria-label="`${t('typeScale.copy')} ${s.px}${t('typeScale.px')}`"
                >
                  <Check v-if="copiedIndex === s.step" :size="16" />
                  <Copy v-else :size="16" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </GiResultCard>

    <template #about>{{ t('typeScale.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Type, Copy, Check } from 'lucide-vue-next'
import ToolPageLayout from '../components/ToolPageLayout.vue'
import GiFormField from '../components/GiFormField.vue'
import GiResultCard from '../components/GiResultCard.vue'
import { generateTypeScale, TYPE_SCALE_RATIOS } from '../composables/useTypeScale'

const { t } = useI18n()

const baseSize = ref(16)
const ratio = ref(TYPE_SCALE_RATIOS.majorThird)
const stepsUp = ref(6)
const stepsDown = ref(2)
const fontFamily = ref('system-ui, -apple-system, sans-serif')
const fontWeight = ref(400)
const lineHeight = ref(1.5)

// Font family options with CSS values
const FONT_FAMILIES = {
  systemUI: 'system-ui, -apple-system, sans-serif',
  inter: 'Inter, system-ui, sans-serif',
  georgia: 'Georgia, serif',
  arial: 'Arial, sans-serif',
  helvetica: 'Helvetica, sans-serif',
  verdana: 'Verdana, sans-serif',
  times: '"Times New Roman", serif',
  courier: '"Courier New", monospace',
} as const

const copiedIndex = ref<number | null>(null)
const copiedFlash = ref<number | null>(null)

const scale = computed(() => {
  return generateTypeScale(baseSize.value, ratio.value, stepsDown.value, stepsUp.value)
})

const previewFontStyle = computed(() => ({
  fontFamily: fontFamily.value,
  fontWeight: fontWeight.value,
  lineHeight: lineHeight.value,
}))

// Preview entries: map steps to semantic labels
const previewEntries = computed(() => {
  const entries = scale.value
  const baseIndex = stepsDown.value

  // Map to semantic labels based on position relative to base
  const labels = [
    { offset: -6, key: 'display' },
    { offset: -4, key: 'heading1' },
    { offset: -2, key: 'heading2' },
    { offset: -1, key: 'heading3' },
    { offset: 0, key: 'body' },
    { offset: 1, key: 'caption' },
  ]

  return labels
    .map(({ offset, key }) => {
      const index = baseIndex + offset
      if (index >= 0 && index < entries.length) {
        return {
          ...entries[index],
          label: t(`typeScale.sampleText.${key}`),
        }
      }
      return null
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
})

// Generate CSS custom properties output
const cssOutput = computed(() => {
  const lines = [':root {']
  lines.push(`  --font-family: ${fontFamily.value};`)
  lines.push(`  --font-weight: ${fontWeight.value};`)
  lines.push(`  --line-height: ${lineHeight.value};`)
  lines.push('')
  lines.push(`  --font-size-base: ${baseSize.value}px;`)
  lines.push(`  --font-scale-ratio: ${ratio.value};`)
  lines.push('')

  scale.value.forEach((s) => {
    const stepName = s.step === 0 ? 'base' : `step-${s.step}`
    lines.push(`  --font-size-${stepName}: ${s.px}px; /* ${s.rem}rem */`)
  })

  lines.push('}')
  return lines.join('\n')
})

// Scale visualization: bars proportional to font sizes
const scaleVisualization = computed(() => {
  const entries = scale.value
  const maxSize = Math.max(...entries.map(e => e.px))
  
  return entries.map(entry => ({
    ...entry,
    percentage: (entry.px / maxSize) * 100,
    label: getStepLabel(entry.step),
  }))
})

function getStepLabel(step: number): string {
  if (step === 0) return t('typeScale.sampleText.body')
  if (step === 1) return t('typeScale.sampleText.caption')
  if (step === -1) return t('typeScale.sampleText.heading3')
  if (step === -2) return t('typeScale.sampleText.heading2')
  if (step === -4) return t('typeScale.sampleText.heading1')
  if (step === -6) return t('typeScale.sampleText.display')
  return `Step ${step > 0 ? '+' : ''}${step}`
}

function clampNumber(value: number, min: number, max: number): number {
  if (isNaN(value)) return min
  return Math.max(min, Math.min(max, value))
}

async function copyValue(entry: { step: number; px: number; rem: number }) {
  const cssVar = `--font-size-${entry.step === 0 ? 'base' : `step-${entry.step}`}`
  const text = `${cssVar}: ${entry.px}px;`
  await navigator.clipboard.writeText(text)
  copiedIndex.value = entry.step
  setTimeout(() => { copiedIndex.value = null }, 2000)
}

async function copyAllCSS() {
  await navigator.clipboard.writeText(cssOutput.value)
  copiedFlash.value = Date.now()
  setTimeout(() => { copiedFlash.value = null }, 2000)
}
</script>

<style scoped>
/* Controls Section */
.ts-controls {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-lg);
  margin-bottom: var(--gi-space-xl);
}

.ts-control-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--gi-space-lg);
}

@media (max-width: 640px) {
  .ts-control-row {
    grid-template-columns: 1fr;
    gap: var(--gi-space-md);
  }
}

.ts-control-row--fonts {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr;
  gap: var(--gi-space-lg);
}

@media (max-width: 768px) {
  .ts-control-row--fonts {
    grid-template-columns: 1fr;
  }
}

.ts-field-with-slider {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-sm);
}

.ts-field-with-slider .gi-input {
  width: 100%;
  min-height: 44px;
}

.ts-slider {
  width: 100%;
  height: 6px;
  border-radius: var(--gi-radius-pill);
  background: var(--gi-border-soft);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.ts-slider::-webkit-slider-runnable-track {
  height: 6px;
  border-radius: var(--gi-radius-pill);
  background: var(--gi-border-soft);
}

.ts-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--gi-brand);
  cursor: pointer;
  border: 2px solid var(--gi-surface);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  transition: transform var(--gi-transition-fast) var(--gi-ease-out);
  margin-top: -7px; /* Center thumb on track (20px thumb - 6px track) / 2 */
}

.ts-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.ts-slider::-moz-range-track {
  height: 6px;
  border-radius: var(--gi-radius-pill);
  background: var(--gi-border-soft);
  border: none;
}

.ts-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--gi-brand);
  cursor: pointer;
  border: 2px solid var(--gi-surface);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.ts-slider::-moz-range-progress {
  height: 6px;
  border-radius: var(--gi-radius-pill);
  background: var(--gi-brand);
}

.ts-slider:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

/* Visual Preview Section */
.ts-visual-preview {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-md);
  padding: var(--gi-space-md) 0;
}

.ts-preview-item {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-xs);
  padding: var(--gi-space-sm) 0;
  border-bottom: 1px solid var(--gi-border-soft);
}

.ts-preview-item:last-child {
  border-bottom: none;
}

.ts-preview-label {
  font-size: var(--gi-font-size-xs);
  font-weight: 600;
  color: var(--gi-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ts-preview-value {
  color: var(--gi-text);
  line-height: 1.3;
  font-weight: 400;
}

/* Scale Visualization */
.ts-scale-viz {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-sm);
  padding: var(--gi-space-md) 0;
}

.ts-scale-bar-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: var(--gi-space-md);
  align-items: center;
  padding: var(--gi-space-xs) 0;
}

.ts-scale-bar-row--base {
  padding: var(--gi-space-sm) 0;
}

.ts-scale-bar-label {
  display: flex;
  align-items: center;
  gap: var(--gi-space-xs);
}

.ts-scale-bar-step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: var(--gi-radius-pill);
  font-size: var(--gi-font-size-xs);
  font-weight: 600;
  color: var(--gi-text-muted);
  background: var(--gi-bg-soft);
}

.ts-scale-bar-step--base {
  color: var(--gi-surface);
  background: var(--gi-brand);
}

.ts-scale-bar-name {
  font-size: var(--gi-font-size-xs);
  color: var(--gi-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ts-scale-bar-container {
  height: 28px;
  background: var(--gi-bg-soft);
  border-radius: var(--gi-radius-md);
  overflow: hidden;
  display: flex;
  align-items: center;
}

.ts-scale-bar {
  height: 100%;
  background: var(--gi-border-soft);
  border-radius: var(--gi-radius-md);
  display: flex;
  align-items: center;
  padding-left: var(--gi-space-sm);
  transition: width var(--gi-transition-base) var(--gi-ease-out);
  min-width: 40px;
}

.ts-scale-bar--base {
  background: var(--gi-brand);
}

.ts-scale-bar-value {
  font-size: var(--gi-font-size-xs);
  font-weight: 600;
  color: var(--gi-text);
  white-space: nowrap;
}

.ts-scale-bar--base .ts-scale-bar-value {
  color: var(--gi-surface);
}

@media (max-width: 640px) {
  .ts-scale-bar-row {
    grid-template-columns: 1fr;
    gap: var(--gi-space-xs);
  }
  .ts-scale-bar-label {
    justify-content: flex-start;
  }
}

/* CSS Output Section */
.ts-css-output {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-md);
}

.ts-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--gi-space-xs);
  padding: 0.5rem 1rem;
  min-height: 44px;
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  color: var(--gi-text);
  font-size: var(--gi-font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
  align-self: flex-end;
}

.ts-copy-btn:hover {
  background: var(--gi-surface-hover);
  border-color: var(--gi-brand);
}

.ts-copy-btn:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

.ts-copy-btn:active {
  transform: scale(0.98);
}

.ts-copy-btn--success {
  background: rgba(10, 170, 142, 0.1);
  border-color: var(--gi-brand);
  color: var(--gi-brand);
}

.ts-code {
  background: var(--gi-bg-soft);
  border: 1px solid var(--gi-border-soft);
  border-radius: var(--gi-radius-md);
  padding: var(--gi-space-md);
  overflow-x: auto;
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
  font-size: var(--gi-font-size-sm);
  line-height: 1.6;
  color: var(--gi-text);
  margin: 0;
}

[data-theme="dark"] .ts-code {
  background: rgba(0, 0, 0, 0.2);
}

/* Table Section */
.ts-table-wrapper {
  overflow-x: auto;
  margin-top: var(--gi-space-md);
  border-radius: var(--gi-radius);
  border: 1px solid var(--gi-border);
}

.ts-table {
  width: 100%;
  border-collapse: collapse;
}

.ts-table th,
.ts-table td {
  padding: var(--gi-space-sm) var(--gi-space-md);
  text-align: left;
  border-bottom: 1px solid var(--gi-border-soft);
  vertical-align: middle;
}

.ts-table thead th {
  font-weight: 600;
  font-size: var(--gi-font-size-xs);
  color: var(--gi-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--gi-bg-soft);
}

.ts-table tbody tr:last-child td {
  border-bottom: none;
}

.ts-table-row--base {
  background: rgba(10, 170, 142, 0.05);
}

.ts-table-value {
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  white-space: nowrap;
}

.ts-unit {
  font-size: var(--gi-font-size-xs);
  color: var(--gi-text-muted);
  margin-left: 2px;
}

.ts-step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--gi-radius-pill);
  font-weight: 600;
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-muted);
  background: var(--gi-bg-soft);
}

.ts-step--base {
  color: var(--gi-surface);
  background: var(--gi-brand);
}

.ts-table-preview {
  color: var(--gi-text);
  line-height: 1.3;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ts-table-actions {
  width: 60px;
  text-align: center;
}

.ts-copy-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--gi-text-muted);
  border-radius: var(--gi-radius-md);
  cursor: pointer;
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
}

.ts-copy-icon-btn:hover {
  background: var(--gi-bg-soft);
  color: var(--gi-text);
}

.ts-copy-icon-btn:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

.ts-copy-icon-btn--success {
  color: var(--gi-brand);
  background: rgba(10, 170, 142, 0.1);
}

@media (max-width: 768px) {
  .ts-table-preview {
    max-width: 120px;
  }
}
</style>
