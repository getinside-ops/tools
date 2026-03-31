<template>
  <div>
    <router-link to="/" class="gi-back-link">{{ t('nav.back') }}</router-link>

    <div class="gi-tool-header">
      <h1>{{ t('paperWeight.title') }}</h1>
      <p>{{ t('paperWeight.desc') }}</p>
    </div>

    <!-- Quantity Section -->
    <div class="gi-field">
      <label class="gi-label">{{ t('paperWeight.quantity') }}</label>
      
      <!-- Dual-Mode Slider -->
      <div class="gi-slider-container">
        <div class="gi-slider-header">
          <span class="gi-slider-value">{{ formatQuantity(quantity) }} ex.</span>
          <button
            type="button"
            class="gi-slider-mode-toggle"
            @click="toggleSliderMode"
            :aria-label="t('paperWeight.toggleSliderMode')"
            :aria-pressed="sliderMode === 'fast'"
          >
            <span class="gi-mode-indicator" :class="{ active: sliderMode === 'precise' }">{{ t('paperWeight.sliderModes.precise') }}</span>
            <span class="gi-mode-indicator" :class="{ active: sliderMode === 'fast' }">{{ t('paperWeight.sliderModes.fast') }}</span>
          </button>
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
          <div class="gi-format-preview">
            <svg :viewBox="getFormatViewBox(fmt)" class="gi-format-svg">
              <rect
                :width="getFormatSvgWidth(fmt)"
                :height="getFormatSvgHeight(fmt)"
                class="gi-format-rect"
              />
            </svg>
          </div>
          <div class="gi-card-title">{{ t(`paperWeight.formats.${fmt}`) }}</div>
          <div class="gi-card-desc">{{ FORMATS[fmt].width }} × {{ FORMATS[fmt].height }} mm</div>
        </button>
        <button
          type="button"
          class="gi-format-card"
          :class="{ active: selectedFormat === 'Custom' }"
          @click="selectedFormat = 'Custom'"
          :aria-pressed="selectedFormat === 'Custom'"
        >
          <div class="gi-format-preview">
            <svg viewBox="0 0 60 60" class="gi-format-svg">
              <rect width="60" height="60" rx="4" class="gi-format-rect" stroke-dasharray="4 2" fill="none" stroke="currentColor" stroke-width="2"/>
              <text x="30" y="35" text-anchor="middle" class="gi-format-text">+</text>
            </svg>
          </div>
          <div class="gi-card-title">{{ t('paperWeight.formats.Custom') }}</div>
          <div class="gi-card-desc">{{ t('paperWeight.customDimensions') }}</div>
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

const { t } = useI18n()

const POPULAR_GRAMMAGES = [80, 90, 115, 135, 170, 250, 300, 350, 400]

const quantity = ref(DEFAULT_QUANTITY)
const sliderMode = ref<'precise' | 'fast'>('precise')
const sliderValue = ref(DEFAULT_QUANTITY / 1000) // Store in thousands for slider

const selectedFormat = ref<FormatKey>('A6')
const customWidth = ref(100)
const customHeight = ref(100)
const grammage = ref(250)

// Slider mode configuration
const sliderMin = computed(() => sliderMode.value === 'precise' ? 5 : 50)
const sliderMax = computed(() => sliderMode.value === 'precise' ? 50 : 1000)
const sliderStep = computed(() => sliderMode.value === 'precise' ? 1 : 25)

// Sync slider with quantity
const onSliderInput = () => {
  quantity.value = sliderValue.value * 1000
}

// Toggle slider mode
const toggleSliderMode = () => {
  sliderMode.value = sliderMode.value === 'precise' ? 'fast' : 'precise'
  // Adjust slider value to stay in range when switching modes
  const currentK = quantity.value / 1000
  if (sliderMode.value === 'precise' && currentK > 50) {
    sliderValue.value = 50
    quantity.value = 50000
  } else if (sliderMode.value === 'fast' && currentK < 50) {
    sliderValue.value = 50
    quantity.value = 50000
  }
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
  // Auto-switch mode based on quantity
  if (q <= 50000) {
    sliderMode.value = 'precise'
  } else {
    sliderMode.value = 'fast'
  }
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
  sliderMode.value = 'precise'
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
  gap: 0.4rem;
  margin-bottom: 1.5rem;
  padding: 0.4rem 0.8rem;
  border: 1.5px solid var(--gi-border);
  border-radius: var(--gi-radius);
  font-size: 0.85rem;
  color: var(--gi-text-muted);
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  background: var(--gi-surface);
}
.gi-back-link:hover {
  border-color: var(--gi-brand);
  color: var(--gi-brand);
  transform: translateY(-1px);
}

/* Tool Header */
.gi-tool-header {
  margin-bottom: 2.5rem;
}
.gi-tool-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}
.gi-tool-header p {
  color: var(--gi-text-muted);
  font-size: 1rem;
  max-width: 500px;
}

/* Fields */
.gi-field {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
}
.gi-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gi-text);
  letter-spacing: -0.01em;
}

/* Slider */
.gi-slider-container {
  padding: 1.25rem 1rem;
  background: var(--gi-bg-soft);
  border-radius: calc(var(--gi-radius) * 1.25);
  border: 1.5px solid var(--gi-border);
  margin-bottom: 0.75rem;
}
.gi-slider-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}
.gi-slider-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gi-text);
  font-variant-numeric: tabular-nums;
}
.gi-slider-mode-toggle {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem;
  background: var(--gi-surface);
  border: 1.5px solid var(--gi-border);
  border-radius: var(--gi-radius-pill);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.gi-slider-mode-toggle:hover {
  border-color: var(--gi-brand);
}
.gi-slider-mode-toggle:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}
.gi-mode-indicator {
  padding: 0.35rem 0.75rem;
  border-radius: var(--gi-radius-pill);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gi-text-muted);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.gi-mode-indicator.active {
  background: var(--gi-brand);
  color: white;
}
.gi-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--gi-border) 0%, var(--gi-border) 100%);
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
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--gi-brand);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(10, 170, 142, 0.4);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.gi-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(10, 170, 142, 0.5);
}
.gi-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--gi-brand);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(10, 170, 142, 0.4);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.gi-slider::-moz-range-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(10, 170, 142, 0.5);
}
.gi-slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--gi-text-muted);
  font-weight: 500;
}

/* Chips */
.gi-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.gi-chip {
  padding: 0.65rem 1rem;
  border: 1.5px solid var(--gi-border);
  border-radius: 2rem;
  background: var(--gi-surface);
  color: var(--gi-text);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
}
.gi-chip:hover {
  border-color: var(--gi-brand);
  background: rgba(10, 170, 142, 0.04);
  transform: translateY(-1px);
}
.gi-chip.active {
  background: var(--gi-brand);
  border-color: var(--gi-brand);
  color: white;
  box-shadow: 0 2px 8px rgba(10, 170, 142, 0.3);
}
.gi-chip-input-wrap {
  flex: 1;
  min-width: 100px;
  display: flex;
}
.gi-chip-input {
  border-radius: 2rem;
  padding: 0.5rem 0.85rem;
  height: auto;
}

/* Format Grid */
.gi-format-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}
.gi-format-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.25rem 1rem;
  border: 2px solid var(--gi-border);
  border-radius: calc(var(--gi-radius) * 1.25);
  background: var(--gi-surface);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  text-align: center;
  gap: 0.5rem;
}
.gi-format-card:hover {
  border-color: var(--gi-brand);
  background: rgba(10, 170, 142, 0.02);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.gi-format-card.active {
  border-color: var(--gi-brand);
  background: rgba(10, 170, 142, 0.06);
  box-shadow: 0 0 0 2px var(--gi-brand), 0 4px 12px rgba(10, 170, 142, 0.15);
}
.gi-format-card.primary {
  border-width: 2.5px;
}
.gi-format-card.primary.active {
  box-shadow: 0 0 0 3px var(--gi-brand), 0 4px 12px rgba(10, 170, 142, 0.2);
}
.gi-format-preview {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.gi-format-svg {
  width: 100%;
  height: 100%;
}
.gi-format-rect {
  fill: rgba(10, 170, 142, 0.15);
  stroke: var(--gi-brand);
  stroke-width: 2;
  rx: 4;
}
.gi-format-text {
  font-size: 24px;
  fill: var(--gi-brand);
  font-weight: 300;
}
.gi-card-title {
  font-weight: 600;
  color: var(--gi-text);
  font-size: 0.9rem;
}
.gi-card-desc {
  font-size: 0.75rem;
  color: var(--gi-text-muted);
  font-variant-numeric: tabular-nums;
}

/* Custom Format */
.gi-custom-format {
  margin-top: 0.75rem;
  padding: 1rem;
  background: var(--gi-bg-soft);
  border-radius: calc(var(--gi-radius) * 1.25);
  border: 1.5px solid var(--gi-border);
}
.gi-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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
  right: 0.75rem;
  color: var(--gi-text-muted);
  font-size: 0.85rem;
  font-weight: 500;
  pointer-events: none;
}
.gi-custom-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--gi-border);
}
.gi-custom-svg {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
}
.gi-custom-dims {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--gi-text-muted);
  font-variant-numeric: tabular-nums;
}

/* Grammage Hint */
.gi-grammage-hint {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--gi-text-muted);
  padding: 0.5rem 0.75rem;
  background: var(--gi-bg-soft);
  border-radius: var(--gi-radius);
  margin-top: 0.25rem;
}
.gi-hint-icon {
  font-size: 1rem;
}

/* Result Panel */
.gi-result {
  margin-top: 2.5rem;
  padding: 2.5rem 2rem;
  background: linear-gradient(145deg, var(--gi-surface), var(--gi-bg-soft));
  border: 2px solid var(--gi-mint);
  border-radius: calc(var(--gi-radius) * 2);
  text-align: center;
  box-shadow: 0 8px 32px -8px rgba(10, 170, 142, 0.15);
  position: relative;
  overflow: hidden;
}
.gi-result::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--gi-brand), var(--gi-mint));
}
.gi-result-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}
.gi-result-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gi-brand);
}
.gi-reset-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem;
  border: none;
  background: transparent;
  color: var(--gi-text-muted);
  cursor: pointer;
  border-radius: var(--gi-radius);
  transition: all 0.2s;
}
.gi-reset-btn:hover {
  background: var(--gi-bg-soft);
  color: var(--gi-brand);
}
.gi-result-content {
  margin-bottom: 1.5rem;
}
.gi-result-main {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.5rem;
}
.gi-result-value {
  font-size: 5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--gi-text);
  line-height: 1;
}
.gi-result-unit {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--gi-text-muted);
}
.gi-result-secondary {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--gi-text-muted);
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.gi-result-divider {
  color: var(--gi-border-strong);
}

/* Metric Grid */
.gi-metric-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.gi-metric-card {
  padding: 1rem 1.25rem;
  background: var(--gi-surface);
  border: 1.5px solid var(--gi-border);
  border-radius: calc(var(--gi-radius) * 1.25);
  text-align: center;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.gi-metric-card:hover {
  border-color: var(--gi-brand);
  background: rgba(10, 170, 142, 0.02);
}
.gi-metric-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gi-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}
.gi-metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gi-text);
  font-variant-numeric: tabular-nums;
}

/* Formula */
.gi-formula {
  font-size: 0.8rem;
  color: var(--gi-text-muted);
  font-family: 'Menlo', 'Monaco', monospace;
  padding: 0.75rem 1rem;
  background: var(--gi-bg);
  border-radius: var(--gi-radius);
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
  gap: 0.75rem;
  color: var(--gi-text-muted);
}
.gi-empty-state svg {
  color: var(--gi-border-strong, #c9c6c2);
}
.gi-empty-state p {
  font-size: 0.9rem;
}

/* Animations */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
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
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
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
    font-size: 1.5rem;
  }
  .gi-result-value {
    font-size: 3.5rem;
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
</style>
