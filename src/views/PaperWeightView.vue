<template>
  <div>
    <router-link to="/" class="gi-back-link">{{ t('nav.back') }}</router-link>

    <div class="gi-tool-header">
      <h1>{{ t('paperWeight.title') }}</h1>
      <p>{{ t('paperWeight.desc') }}</p>
    </div>

    <div class="pw-layout">
      <div class="pw-inputs">
        <!-- Quantity Section -->
        <div class="gi-field">
      <label class="gi-label">{{ t('paperWeight.quantity') }}</label>
      
      <!-- Slider -->
      <div class="gi-slider-container">
        <div class="gi-slider-header">
          <span class="gi-slider-value">{{ formatQuantity(quantity) }} ex.</span>
        </div>
        <input
          v-model.number="sliderValue"
          type="range"
          :min="sliderMin"
          :max="sliderMax"
          :step="sliderStep"
          class="gi-slider"
          @input="onSliderInput"
          aria-label="Quantity slider"
        />
        <div class="gi-slider-labels">
          <span>{{ sliderMin.toLocaleString() }}</span>
          <span>{{ sliderMax.toLocaleString() }}</span>
        </div>
      </div>

      <!-- Quantity Chips -->
      <div class="gi-chips">
        <button
          v-for="q in QUANTITY_PRESETS" :key="q"
          type="button" class="gi-chip" :class="{ active: quantity === q }"
          @click="setQuantity(q)"
          :aria-pressed="quantity === q"
        >
          {{ formatQuantity(q) }}
        </button>
        <div class="gi-chip-input-wrap">
          <input
            v-model.number="quantity"
            type="number"
            min="1"
            class="gi-input gi-chip-input"
            :placeholder="t('paperWeight.otherQuantity')"
            aria-label="Custom quantity"
          />
        </div>
      </div>
    </div>

    <!-- Format Comparison Bar -->
    <GiFormatComparison
      :selected-format="selectedFormat"
      @select="selectedFormat = $event"
    />

    <!-- Format Section -->
    <div class="gi-field">
      <label class="gi-label">{{ t('paperWeight.format') }}</label>
      <div class="gi-format-grid">
        <button
          v-for="fmt in ['A6', 'A5', 'DL', 'A4', 'Carte'] as const"
          :key="fmt"
          type="button"
          class="gi-format-card"
          :class="{ active: selectedFormat === fmt, primary: ['A5', 'A6'].includes(fmt) }"
          @click="selectedFormat = fmt"
          :aria-pressed="selectedFormat === fmt"
        >
          <div class="gi-format-top">
            <div class="gi-format-icon-box">
              <svg :viewBox="getFormatViewBox(fmt)" class="gi-format-icon-svg">
                <rect
                  :width="getFormatSvgWidth(fmt)"
                  :height="getFormatSvgHeight(fmt)"
                  class="gi-format-icon-rect"
                />
              </svg>
            </div>
          </div>
          <strong class="gi-format-title">{{ t(`paperWeight.formats.${fmt}`) }}</strong>
          <p class="gi-format-desc">{{ FORMATS[fmt].width }} × {{ FORMATS[fmt].height }} mm</p>
        </button>
        <button
          type="button"
          class="gi-format-card"
          :class="{ active: selectedFormat === 'Custom' }"
          @click="selectedFormat = 'Custom'"
          :aria-pressed="selectedFormat === 'Custom'"
        >
          <div class="gi-format-top">
            <div class="gi-format-icon-box gi-format-icon-box--custom">
              <svg viewBox="0 0 60 60" class="gi-format-icon-svg">
                <rect width="60" height="60" rx="8" class="gi-format-icon-rect" stroke-dasharray="4 2" fill="none" stroke="currentColor" stroke-width="2"/>
                <text x="30" y="38" text-anchor="middle" class="gi-format-plus">+</text>
              </svg>
            </div>
          </div>
          <strong class="gi-format-title">{{ t('paperWeight.formats.Custom') }}</strong>
          <p class="gi-format-desc">{{ t('paperWeight.customDimensions') }}</p>
        </button>
      </div>
    </div>

    <!-- Custom Format Inputs -->
    <transition name="slide">
      <template v-if="selectedFormat === 'Custom'">
        <div class="gi-custom-format">
          <div class="gi-row">
            <div class="gi-field">
              <label class="gi-label">{{ t('paperWeight.customWidth') }}</label>
              <div class="gi-input-with-unit">
                <input v-model.number="customWidth" type="number" min="1" class="gi-input" />
                <span class="gi-unit">mm</span>
              </div>
            </div>
            <div class="gi-field">
              <label class="gi-label">{{ t('paperWeight.customHeight') }}</label>
              <div class="gi-input-with-unit">
                <input v-model.number="customHeight" type="number" min="1" class="gi-input" />
                <span class="gi-unit">mm</span>
              </div>
            </div>
          </div>
          <div class="gi-custom-preview">
            <svg :viewBox="customViewBox" class="gi-custom-svg">
              <rect
                :width="customSvgWidth"
                :height="customSvgHeight"
                class="gi-format-rect"
                rx="4"
              />
            </svg>
            <span class="gi-custom-dims">{{ customWidth }} × {{ customHeight }} mm</span>
          </div>
        </div>
      </template>
    </transition>

    <!-- Paper Weight Section -->
    <div class="gi-field">
      <label class="gi-label">{{ t('paperWeight.grammage') }}</label>
      <div class="gi-chips">
        <button
          v-for="g in POPULAR_GRAMMAGES" :key="g"
          type="button" class="gi-chip" :class="{ active: grammage === g }"
          @click="grammage = g"
          :aria-pressed="grammage === g"
        >
          {{ g }}g
        </button>
        <div class="gi-chip-input-wrap">
          <input
            v-model.number="grammage"
            type="number"
            min="1"
            class="gi-input gi-chip-input"
            :placeholder="t('paperWeight.otherWeight')"
            aria-label="Custom grammage"
          />
        </div>
      </div>
      <div class="gi-grammage-hint">
        <span class="gi-hint-icon">💡</span>
        <span>{{ getGrammageHint() }}</span>
      </div>
    </div>
      </div>

      <!-- Results Column -->
      <div class="pw-results">
        <!-- Result Section -->
        <transition name="fade-up" mode="out-in">
          <div v-if="result" key="result" class="gi-result">
        <div class="gi-result-header">
          <span class="gi-result-label">{{ t('paperWeight.result') }}</span>
          <button class="gi-reset-btn" @click="resetCalculator" :title="t('paperWeight.reset')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" />
              <path d="M3 3v9h9" />
            </svg>
          </button>
        </div>
        <div class="gi-result-content">
          <div class="gi-result-main">
            <span class="gi-result-value">{{ displayWeight.value }}</span>
            <span class="gi-result-unit">{{ displayWeight.unit }}</span>
          </div>
          <div class="gi-result-secondary">
            {{ result.grams.toLocaleString() }} g
            <span class="gi-result-divider">•</span>
            {{ totalSheets.toLocaleString() }} {{ t('paperWeight.sheets') }}
          </div>
        </div>

        <!-- Weight per 1000 units -->
        <div class="gi-metric-grid">
          <div class="gi-metric-card">
            <div class="gi-metric-label">{{ t('paperWeight.weightPerThousand') }}</div>
            <div class="gi-metric-value">{{ weightPerThousand }}</div>
          </div>
          <div class="gi-metric-card">
            <div class="gi-metric-label">{{ t('paperWeight.totalSheets') }}</div>
            <div class="gi-metric-value">{{ totalSheets.toLocaleString() }}</div>
          </div>
        </div>

        <!-- Formula -->
        <div class="gi-formula">
          {{ t('paperWeight.formula') }} :
          <code>{{ activeDims.width }}mm × {{ activeDims.height }}mm × {{ grammage }} g/m² × {{ quantity }}</code>
        </div>
      </div>
      <div v-else key="no-result" class="gi-result gi-result-empty">
        <div class="gi-empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 3v18M3 12h18" />
          </svg>
          <p>{{ t('paperWeight.enterValues') }}</p>
        </div>
      </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  calculatePaperWeight,
  FORMATS,
  type FormatKey,
  DEFAULT_QUANTITY,
  QUANTITY_PRESETS,
} from '../composables/usePaperWeight'
import GiFormatComparison from '../components/GiFormatComparison.vue'

const { t } = useI18n()

const POPULAR_GRAMMAGES = [80, 90, 115, 135, 170, 250, 300, 350, 400]

const quantity = ref(DEFAULT_QUANTITY)
const sliderValue = ref(DEFAULT_QUANTITY / 1000) // Store in thousands for slider

const selectedFormat = ref<FormatKey>('A6')
const customWidth = ref(100)
const customHeight = ref(100)
const grammage = ref(250)

// Slider configuration
const sliderMin = 5
const sliderMax = 50
const sliderStep = 1

// Sync slider with quantity
const onSliderInput = () => {
  quantity.value = sliderValue.value * 1000
}

// Format quantity with k/M notation
const formatQuantity = (q: number): string => {
  if (q >= 1000000) return `${q / 1000000}M`
  if (q >= 1000) return `${q / 1000}k`
  return q.toString()
}

// Set quantity and update slider
const setQuantity = (q: number) => {
  quantity.value = q
  sliderValue.value = q / 1000
}

const activeDims = computed(() => {
  if (selectedFormat.value === 'Custom') return { width: customWidth.value, height: customHeight.value }
  return FORMATS[selectedFormat.value as keyof typeof FORMATS]
})

const result = computed(() => {
  if (quantity.value <= 0 || activeDims.value.width <= 0 || activeDims.value.height <= 0 || grammage.value <= 0) return null
  return calculatePaperWeight(quantity.value, activeDims.value.width, activeDims.value.height, grammage.value)
})

// Display weight with auto-scaling
const displayWeight = computed(() => {
  if (!result.value) return { value: '0', unit: 'kg' }
  const kg = result.value.kg
  if (kg >= 1000) {
    const tonnes = (kg / 1000).toFixed(2)
    return { value: tonnes, unit: 't' }
  }
  return { value: Math.round(kg).toLocaleString(), unit: 'kg' }
})

// Weight per 1000 units
const weightPerThousand = computed(() => {
  if (!result.value || quantity.value === 0) return '0 g'
  const gramsPerUnit = result.value.grams / quantity.value
  const gramsPerThousand = Math.round(gramsPerUnit * 1000)
  if (gramsPerThousand >= 1000) {
    return `${(gramsPerThousand / 1000).toFixed(2)} kg`
  }
  return `${gramsPerThousand.toLocaleString()} g`
})

// Total sheets (same as quantity, but explicit)
const totalSheets = computed(() => quantity.value)

// SVG helpers for format previews
const getFormatViewBox = (format: FormatKey) => {
  const dims = FORMATS[format as keyof typeof FORMATS]
  const scale = 60 / Math.max(dims.width, dims.height)
  const w = dims.width * scale
  const h = dims.height * scale
  return `0 0 ${w + 8} ${h + 8}`
}

const getFormatSvgWidth = (format: FormatKey) => {
  const dims = FORMATS[format as keyof typeof FORMATS]
  const scale = 60 / Math.max(dims.width, dims.height)
  return dims.width * scale
}

const getFormatSvgHeight = (format: FormatKey) => {
  const dims = FORMATS[format as keyof typeof FORMATS]
  const scale = 60 / Math.max(dims.width, dims.height)
  return dims.height * scale
}

const customViewBox = computed(() => {
  const max = Math.max(customWidth.value, customHeight.value) || 1
  const scale = 60 / max
  const w = customWidth.value * scale
  const h = customHeight.value * scale
  return `0 0 ${w + 8} ${h + 8}`
})

const customSvgWidth = computed(() => {
  const max = Math.max(customWidth.value, customHeight.value) || 1
  const scale = 60 / max
  return customWidth.value * scale
})

const customSvgHeight = computed(() => {
  const max = Math.max(customWidth.value, customHeight.value) || 1
  const scale = 60 / max
  return customHeight.value * scale
})

// Grammage hint
const getGrammageHint = () => {
  if (grammage.value <= 90) return t('paperWeight.hints.light')
  if (grammage.value <= 135) return t('paperWeight.hints.medium')
  if (grammage.value <= 200) return t('paperWeight.hints.flyer')
  if (grammage.value <= 300) return t('paperWeight.hints.card')
  return t('paperWeight.hints.thick')
}

const resetCalculator = () => {
  quantity.value = DEFAULT_QUANTITY
  sliderValue.value = DEFAULT_QUANTITY / 1000
  selectedFormat.value = 'A6'
  customWidth.value = 100
  customHeight.value = 100
  grammage.value = 250
}
</script>

<style scoped>
/* Back Link */
.gi-back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--gi-space-xs);
  margin-bottom: var(--gi-space-lg);
  padding: var(--gi-space-xs) var(--gi-space-sm);
  border: 1.5px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-muted);
  text-decoration: none;
  transition: all var(--gi-transition-base) var(--gi-ease-out);
  background: var(--gi-surface);
}

.gi-back-link:hover {
  border-color: var(--gi-brand);
  color: var(--gi-brand);
  transform: translateY(-1px);
}

/* Tool Header */
.gi-tool-header {
  margin-bottom: var(--gi-space-lg);
}

.gi-tool-header h1 {
  font-family: 'Garnett', 'Inter', system-ui, sans-serif;
  font-size: var(--gi-font-size-lg);
  font-weight: 700;
  margin-bottom: var(--gi-space-xs);
  letter-spacing: -0.02em;
  color: var(--gi-text);
}

.gi-tool-header p {
  color: var(--gi-text-muted);
  font-size: var(--gi-font-size-sm);
  max-width: 500px;
  line-height: var(--gi-line-height-base);
}

/* Fields */
.gi-field {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-xs);
  margin-bottom: var(--gi-space-sm);
}

.gi-label {
  font-size: var(--gi-font-size-sm);
  font-weight: 600;
  color: var(--gi-text);
  letter-spacing: -0.01em;
}

/* Slider */
.gi-slider-container {
  padding: var(--gi-space-md) var(--gi-space-sm);
  background: var(--gi-bg-soft);
  border-radius: var(--gi-radius-lg);
  border: 1px solid var(--gi-border);
  margin-bottom: var(--gi-space-sm);
}

.gi-slider-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--gi-space-sm);
}

.gi-slider-value {
  font-size: var(--gi-font-size-xl);
  font-weight: 700;
  color: var(--gi-text);
  font-variant-numeric: tabular-nums;
}

/* Slider Track */
.gi-slider {
  width: 100%;
  height: 6px;
  border-radius: var(--gi-radius-pill);
  background: var(--gi-border);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.gi-slider:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

.gi-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--gi-brand);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(10, 170, 142, 0.4);
  transition: all var(--gi-transition-base) var(--gi-ease-out);
}

.gi-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(10, 170, 142, 0.5);
}

.gi-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--gi-brand);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(10, 170, 142, 0.4);
  transition: all var(--gi-transition-base) var(--gi-ease-out);
}

.gi-slider::-moz-range-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(10, 170, 142, 0.5);
}

.gi-slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: var(--gi-space-xs);
  font-size: var(--gi-font-size-xs);
  color: var(--gi-text-muted);
  font-weight: 500;
}

/* Chips */
.gi-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gi-space-sm);
}

.gi-chip {
  padding: var(--gi-space-sm) var(--gi-space-md);
  border: 1.5px solid var(--gi-border);
  border-radius: var(--gi-radius-pill);
  background: var(--gi-surface);
  color: var(--gi-text);
  cursor: pointer;
  font-size: var(--gi-font-size-sm);
  font-weight: 600;
  transition: all var(--gi-transition-base) var(--gi-ease-out);
  white-space: nowrap;
}

.gi-chip:hover {
  border-color: var(--gi-brand);
  background: rgba(10, 170, 142, 0.04);
  transform: translateY(-1px);
}

.gi-chip:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

.gi-chip.active {
  background: var(--gi-brand);
  border-color: var(--gi-brand);
  color: white;
  box-shadow: 0 2px 8px rgba(10, 170, 142, 0.3);
}

.gi-chip-input-wrap {
  flex: 1;
  min-width: 120px;
  display: flex;
}

.gi-chip-input {
  border-radius: var(--gi-radius-pill);
  padding: var(--gi-space-sm) var(--gi-space-md);
  height: auto;
}

/* Format Grid */
.gi-format-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: var(--gi-space-sm);
}

/* Format Card - Homepage-style */
.gi-format-card {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-xs);
  padding: var(--gi-space-sm);
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  cursor: pointer;
  transition: all var(--gi-transition-base) var(--gi-ease-out);
  text-align: left;
  position: relative;
  box-shadow: var(--gi-shadow-sm);
}

.gi-format-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--gi-shadow-lg);
  border-color: rgba(10, 170, 142, 0.4);
}

.gi-format-card:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

.gi-format-card.active {
  border-color: var(--gi-brand);
  box-shadow: 0 0 0 2px var(--gi-brand), var(--gi-shadow-lg);
  background: rgba(10, 170, 142, 0.02);
}

.gi-format-card.primary {
  border-width: 1.5px;
}

.gi-format-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

/* Icon Box - Homepage style */
.gi-format-icon-box {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  background: var(--gi-brand-fade);
  color: var(--gi-brand);
  border-radius: var(--gi-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--gi-transition-base) var(--gi-ease-bounce);
}

.gi-format-card:hover .gi-format-icon-box {
  background: var(--gi-brand);
  color: white;
  transform: scale(1.05);
}

.gi-format-card.active .gi-format-icon-box {
  background: var(--gi-brand);
  color: white;
}

.gi-format-icon-box--custom {
  background: var(--gi-tint-blue-bg);
  color: var(--gi-tint-blue-text);
}

.gi-format-icon-svg {
  width: 28px;
  height: 28px;
}

.gi-format-icon-rect {
  fill: currentColor;
  opacity: 0.2;
}

.gi-format-plus {
  font-size: 28px;
  font-weight: 300;
  fill: currentColor;
}

/* Format Title & Description */
.gi-format-title {
  font-size: var(--gi-font-size-md);
  font-weight: 600;
  line-height: 1.3;
  color: var(--gi-text);
}

.gi-format-desc {
  font-size: var(--gi-font-size-xs);
  color: var(--gi-text-muted);
  line-height: 1.5;
}

[data-theme="dark"] .gi-format-card:hover {
  box-shadow: var(--gi-shadow-glow);
  border-color: rgba(10, 170, 142, 0.6);
}

/* Custom Format */
.gi-custom-format {
  margin-top: var(--gi-space-sm);
  padding: var(--gi-space-lg);
  background: var(--gi-bg-soft);
  border-radius: var(--gi-radius-lg);
  border: 1px solid var(--gi-border);
}

.gi-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--gi-space-md);
}

.gi-input-with-unit {
  position: relative;
  display: flex;
  align-items: center;
}

.gi-input-with-unit .gi-input {
  padding-right: 2.5rem;
}

.gi-unit {
  position: absolute;
  right: var(--gi-space-sm);
  color: var(--gi-text-muted);
  font-size: var(--gi-font-size-sm);
  font-weight: 500;
  pointer-events: none;
}

.gi-custom-preview {
  display: flex;
  align-items: center;
  gap: var(--gi-space-sm);
  margin-top: var(--gi-space-md);
  padding-top: var(--gi-space-md);
  border-top: 1px dashed var(--gi-border);
}

.gi-custom-svg {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
}

.gi-custom-dims {
  font-size: var(--gi-font-size-sm);
  font-weight: 500;
  color: var(--gi-text-muted);
  font-variant-numeric: tabular-nums;
}

/* Grammage Hint */
.gi-grammage-hint {
  display: flex;
  align-items: center;
  gap: var(--gi-space-xs);
  font-size: var(--gi-font-size-xs);
  color: var(--gi-text-muted);
  padding: var(--gi-space-xs) var(--gi-space-sm);
  background: var(--gi-bg-soft);
  border-radius: var(--gi-radius-md);
  margin-top: var(--gi-space-xs);
}

.gi-hint-icon {
  font-size: var(--gi-font-size-md);
}

/* Result Panel - Clean modern design */
.gi-result {
  margin-top: var(--gi-space-lg);
  padding: var(--gi-space-lg) var(--gi-space-md);
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-xl);
  text-align: center;
  box-shadow: var(--gi-shadow-lg);
  position: relative;
  overflow: hidden;
}

.gi-result-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--gi-space-md);
  margin-bottom: var(--gi-space-lg);
}

.gi-result-label {
  font-size: var(--gi-font-size-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gi-brand);
}

.gi-reset-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--gi-space-xs);
  border: none;
  background: transparent;
  color: var(--gi-text-muted);
  cursor: pointer;
  border-radius: var(--gi-radius-md);
  transition: all var(--gi-transition-fast);
}

.gi-reset-btn:hover {
  background: var(--gi-bg-soft);
  color: var(--gi-brand);
}

.gi-result-content {
  margin-bottom: var(--gi-space-lg);
}

.gi-result-main {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: var(--gi-space-sm);
}

.gi-result-value {
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--gi-text);
  line-height: 1;
}

.gi-result-unit {
  font-size: var(--gi-font-size-lg);
  font-weight: 600;
  color: var(--gi-text-muted);
}

.gi-result-secondary {
  font-size: var(--gi-font-size-md);
  font-weight: 500;
  color: var(--gi-text-muted);
  margin-top: var(--gi-space-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--gi-space-sm);
}

.gi-result-divider {
  color: var(--gi-border-strong);
}

/* Metric Grid */
.gi-metric-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--gi-space-sm);
  margin-bottom: var(--gi-space-lg);
}

.gi-metric-card {
  padding: var(--gi-space-sm) var(--gi-space-md);
  background: var(--gi-bg-soft);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  text-align: center;
  transition: all var(--gi-transition-base) var(--gi-ease-out);
}

.gi-metric-card:hover {
  border-color: var(--gi-brand);
  background: rgba(10, 170, 142, 0.02);
}

.gi-metric-label {
  font-size: var(--gi-font-size-xs);
  font-weight: 600;
  color: var(--gi-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--gi-space-xs);
}

.gi-metric-value {
  font-size: var(--gi-font-size-xl);
  font-weight: 700;
  color: var(--gi-text);
  font-variant-numeric: tabular-nums;
}

/* Formula */
.gi-formula {
  font-size: var(--gi-font-size-xs);
  color: var(--gi-text-muted);
  font-family: 'Menlo', 'Monaco', monospace;
  padding: var(--gi-space-sm) var(--gi-space-md);
  background: var(--gi-bg);
  border-radius: var(--gi-radius-md);
  border: 1px dashed var(--gi-border);
  display: inline-block;
}

.gi-formula code {
  color: var(--gi-brand-dark);
  font-weight: 500;
}

/* Empty State */
.gi-result-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  border-style: dashed;
}

.gi-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gi-space-md);
  color: var(--gi-text-muted);
}

.gi-empty-state svg {
  color: var(--gi-border-strong);
}

.gi-empty-state p {
  font-size: var(--gi-font-size-sm);
}

/* Animations */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all var(--gi-transition-slow) var(--gi-ease-out);
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-enter-active,
.slide-leave-active {
  transition: all var(--gi-transition-base) var(--gi-ease-out);
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
  margin: 0;
  padding: 0;
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 200px;
}

/* Responsive */
@media (max-width: 600px) {
  .gi-tool-header h1 {
    font-size: var(--gi-font-size-xl);
  }

  .gi-result-value {
    font-size: 3rem;
  }

  .gi-format-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .gi-row {
    grid-template-columns: 1fr;
  }

  .gi-metric-grid {
    grid-template-columns: 1fr;
  }
}

/* Two-column layout with sticky results */
.pw-layout {
  display: grid;
  grid-template-columns: 1fr 380px; /* Optimized for result panel content + comfortable padding */
  gap: var(--gi-space-2xl);
  align-items: start;
}

.pw-inputs {
  min-width: 0;
}

.pw-results {
  position: sticky;
  top: var(--gi-space-lg);
  min-width: 0; /* Prevents overflow from fixed-width content */
}

/* Remove margin-top in two-column context */
.pw-results .gi-result {
  margin-top: 0;
}

@media (max-width: 1024px) {
  .pw-layout {
    grid-template-columns: 1fr;
  }

  .pw-results {
    position: static;
  }

  /* Keep margin for single-column mobile layout */
  .pw-results .gi-result {
    margin-top: var(--gi-space-2xl);
  }
}
</style>
