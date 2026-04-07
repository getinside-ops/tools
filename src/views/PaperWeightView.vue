<template>
  <ToolPageLayout
    :title="t('paperWeight.title')"
    :subtitle="t('paperWeight.desc')"
    category="print"
  >
    <template #icon>
      <Weight />
    </template>

    <!-- Mode Toggle -->
    <div class="pw-mode-toggle" role="group" :aria-label="t('paperWeight.modeLabel')">
      <button
        class="pw-mode-btn"
        :class="{ 'pw-mode-active': mode === 'flyers' }"
        @click="mode = 'flyers'"
        :aria-pressed="mode === 'flyers'"
      >
        <Layers :size="16" aria-hidden="true" />
        {{ t('paperWeight.modeFlyers') }}
      </button>
      <button
        class="pw-mode-btn"
        :class="{ 'pw-mode-active': mode === 'booklet' }"
        @click="mode = 'booklet'"
        :aria-pressed="mode === 'booklet'"
      >
        <BookOpen :size="16" aria-hidden="true" />
        {{ t('paperWeight.modeBooklet') }}
      </button>
    </div>

    <!-- Result Banner -->
    <Transition name="result-fade">
      <div v-if="result" class="pw-result-banner" role="status" aria-live="polite">
        <div class="pw-result-content">
          <div class="pw-result-main">
            <span class="pw-result-value">{{ displayWeight.value }}</span>
            <span class="pw-result-unit">{{ displayWeight.unit }}</span>
          </div>
          <div class="pw-result-secondary">
            <span class="pw-result-detail">
              {{ formatNumber(result.grams) }} g
            </span>
            <span class="pw-result-divider" aria-hidden="true">•</span>
            <span v-if="mode === 'flyers'" class="pw-result-detail">
              {{ formatNumber(quantity) }} {{ t('paperWeight.sheets') }}
            </span>
            <span v-else class="pw-result-detail">
              {{ formatNumber(bookletCopies) }} {{ t('paperWeight.copies') }} × {{ formatNumber(bookletPages) }} {{ t('paperWeight.pages') }}
            </span>
          </div>
        </div>
        <button
          class="pw-reset-btn"
          @click="resetCalculator"
          :title="t('paperWeight.reset')"
          aria-label="Reset calculator"
        >
          <RotateCcw :size="16" aria-hidden="true" />
        </button>
      </div>
    </Transition>

    <!-- Input Section -->
    <div class="pw-inputs">

      <!-- ==================== FLYERS MODE ==================== -->
      <template v-if="mode === 'flyers'">
        <!-- Quantity with Slider -->
        <div class="pw-input-group">
          <div class="pw-slider-header">
            <GiFormField
              :label="t('paperWeight.quantity')"
              type="number"
              :model-value="quantity"
              @update:model-value="quantity = clampNumber(Number($event), 1, MAX_QUANTITY)"
            >
              <template #input>
                <div class="pw-quantity-row">
                  <input
                    v-model.number="quantity"
                    type="number"
                    class="gi-input pw-quantity-input"
                    :aria-label="t('paperWeight.quantity')"
                  />
                  <span class="pw-quantity-label">{{ t('paperWeight.sheets') }}</span>
                </div>
              </template>
            </GiFormField>
          </div>
          <input
            v-model.number="quantity"
            type="range"
            :min="1"
            :max="MAX_QUANTITY"
            step="1000"
            class="pw-slider"
            aria-label="Quantity slider"
          />
          <span v-if="quantityError" class="pw-error" role="alert">{{ quantityError }}</span>
        </div>

        <!-- Format -->
        <div class="pw-input-group">
          <GiFormField :label="t('paperWeight.format')">
            <template #input>
              <select v-model="selectedFormat" class="gi-select pw-format-select">
                <option v-for="(dims, key) in FORMATS" :key="key" :value="key">
                  {{ t(`paperWeight.formats.${key}`) }} - {{ dims.width }} × {{ dims.height }} mm
                </option>
                <option value="Custom">{{ t('paperWeight.formats.Custom') }}...</option>
              </select>
            </template>
          </GiFormField>

          <!-- Custom Format Inputs -->
          <Transition name="expand">
            <div v-if="selectedFormat === 'Custom'" class="pw-custom-format">
              <GiFormField :label="t('paperWeight.customDimensions')">
                <template #input>
                  <div class="pw-custom-row">
                    <input
                      v-model.number="customWidth"
                      type="text"
                      inputmode="numeric"
                      class="gi-input pw-custom-input"
                      :placeholder="t('paperWeight.customWidth')"
                      :aria-label="t('paperWeight.customWidth')"
                    />
                    <span class="pw-custom-sep" aria-hidden="true">×</span>
                    <input
                      v-model.number="customHeight"
                      type="text"
                      inputmode="numeric"
                      class="gi-input pw-custom-input"
                      :placeholder="t('paperWeight.customHeight')"
                      :aria-label="t('paperWeight.customHeight')"
                    />
                    <span class="pw-custom-unit">mm</span>
                  </div>
                </template>
              </GiFormField>
            </div>
          </Transition>
        </div>

        <!-- Grammage with Slider -->
        <div class="pw-input-group">
          <GiFormField
            :label="t('paperWeight.grammage')"
            type="number"
            :model-value="grammage"
            @update:model-value="grammage = clampNumber(Number($event), 30, 500)"
          >
            <template #input>
              <div class="pw-grammage-row">
                <input
                  v-model.number="grammage"
                  type="text"
                  inputmode="numeric"
                  class="gi-input pw-grammage-input"
                  :aria-label="t('paperWeight.grammage')"
                />
                <span class="pw-grammage-unit">g/m²</span>
              </div>
            </template>
          </GiFormField>
          <input
            v-model.number="grammage"
            type="range"
            min="30"
            max="500"
            step="5"
            class="pw-slider"
            aria-label="Grammage slider"
          />
          <p class="pw-helper-text">{{ grammageHelper }}</p>
          <span v-if="grammageError" class="pw-error" role="alert">{{ grammageError }}</span>
        </div>
      </template>

      <!-- ==================== BOOKLET MODE ==================== -->
      <template v-else>
        <!-- Number of copies with Slider -->
        <div class="pw-input-group">
          <GiFormField
            :label="t('paperWeight.bookletCopies')"
            type="number"
            :model-value="bookletCopies"
            @update:model-value="bookletCopies = clampNumber(Number($event), 1, MAX_QUANTITY)"
          >
            <template #input>
              <div class="pw-quantity-row">
                <input
                  v-model.number="bookletCopies"
                  type="text"
                  inputmode="numeric"
                  class="gi-input pw-quantity-input"
                  :aria-label="t('paperWeight.bookletCopies')"
                />
                <span class="pw-quantity-label">{{ t('paperWeight.copies') }}</span>
              </div>
            </template>
          </GiFormField>
          <input
            v-model.number="bookletCopies"
            type="range"
            :min="1"
            :max="MAX_QUANTITY"
            step="10"
            class="pw-slider"
            aria-label="Copies slider"
          />
        </div>

        <!-- Pages per booklet -->
        <div class="pw-input-group">
          <GiFormField
            :label="t('paperWeight.bookletPages')"
            type="number"
            :model-value="bookletPages"
            @update:model-value="bookletPages = clampNumber(Number($event), 4, 9999)"
          >
            <template #input>
              <div class="pw-quantity-row">
                <input
                  v-model.number="bookletPages"
                  type="text"
                  inputmode="numeric"
                  class="gi-input pw-quantity-input"
                  :aria-label="t('paperWeight.bookletPages')"
                />
                <span class="pw-quantity-label">{{ t('paperWeight.pages') }}</span>
              </div>
            </template>
          </GiFormField>
          <p class="pw-helper-text">{{ t('paperWeight.bookletPagesHint') }}</p>
        </div>

        <!-- Format -->
        <div class="pw-input-group">
          <GiFormField :label="t('paperWeight.format')">
            <template #input>
              <select v-model="selectedFormat" class="gi-select pw-format-select">
                <option v-for="(dims, key) in FORMATS" :key="key" :value="key">
                  {{ t(`paperWeight.formats.${key}`) }} - {{ dims.width }} × {{ dims.height }} mm
                </option>
                <option value="Custom">{{ t('paperWeight.formats.Custom') }}...</option>
              </select>
            </template>
          </GiFormField>

          <!-- Custom Format Inputs -->
          <Transition name="expand">
            <div v-if="selectedFormat === 'Custom'" class="pw-custom-format">
              <GiFormField :label="t('paperWeight.customDimensions')">
                <template #input>
                  <div class="pw-custom-row">
                    <input
                      v-model.number="customWidth"
                      type="text"
                      inputmode="numeric"
                      class="gi-input pw-custom-input"
                      :placeholder="t('paperWeight.customWidth')"
                      :aria-label="t('paperWeight.customWidth')"
                    />
                    <span class="pw-custom-sep" aria-hidden="true">×</span>
                    <input
                      v-model.number="customHeight"
                      type="text"
                      inputmode="numeric"
                      class="gi-input pw-custom-input"
                      :placeholder="t('paperWeight.customHeight')"
                      :aria-label="t('paperWeight.customHeight')"
                    />
                    <span class="pw-custom-unit">mm</span>
                  </div>
                </template>
              </GiFormField>
            </div>
          </Transition>
        </div>

        <!-- Cover Grammage -->
        <div class="pw-input-group">
          <GiFormField
            :label="t('paperWeight.bookletCoverGrammage')"
            type="number"
            :model-value="bookletCoverGrammage"
            @update:model-value="bookletCoverGrammage = clampNumber(Number($event), 30, 500)"
          >
            <template #input>
              <div class="pw-grammage-row">
                <input
                  v-model.number="bookletCoverGrammage"
                  type="text"
                  inputmode="numeric"
                  class="gi-input pw-grammage-input"
                  :aria-label="t('paperWeight.bookletCoverGrammage')"
                />
                <span class="pw-grammage-unit">g/m²</span>
              </div>
            </template>
          </GiFormField>
          <input
            v-model.number="bookletCoverGrammage"
            type="range"
            min="30"
            max="500"
            step="5"
            class="pw-slider"
            aria-label="Cover grammage slider"
          />
        </div>

        <!-- Inner Pages Grammage -->
        <div class="pw-input-group">
          <GiFormField
            :label="t('paperWeight.bookletInnerGrammage')"
            type="number"
            :model-value="bookletInnerGrammage"
            @update:model-value="bookletInnerGrammage = clampNumber(Number($event), 30, 500)"
          >
            <template #input>
              <div class="pw-grammage-row">
                <input
                  v-model.number="bookletInnerGrammage"
                  type="text"
                  inputmode="numeric"
                  class="gi-input pw-grammage-input"
                  :aria-label="t('paperWeight.bookletInnerGrammage')"
                />
                <span class="pw-grammage-unit">g/m²</span>
              </div>
            </template>
          </GiFormField>
          <input
            v-model.number="bookletInnerGrammage"
            type="range"
            min="30"
            max="500"
            step="5"
            class="pw-slider"
            aria-label="Inner pages grammage slider"
          />
          <p class="pw-helper-text">{{ grammageHelper }}</p>
        </div>
      </template>

      <!-- Reset Button (mobile only) -->
      <button class="gi-btn gi-btn-ghost pw-reset-btn-mobile" @click="resetCalculator">
        <RotateCcw :size="16" aria-hidden="true" style="margin-right: var(--gi-space-sm)" />
        {{ t('paperWeight.reset') }}
      </button>
    </div>

    <template #about>{{ t('paperWeight.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Weight, RotateCcw, Layers, BookOpen } from 'lucide-vue-next'
import ToolPageLayout from '../components/ToolPageLayout.vue'
import GiFormField from '../components/GiFormField.vue'
import {
  calculatePaperWeight,
  FORMATS,
  type FormatKey,
} from '../composables/usePaperWeight'

defineOptions({
  name: 'PaperWeightView'
})

const { t } = useI18n()

// Maximum values
const MAX_QUANTITY = 99999999

// Calculator mode
const mode = ref<'flyers' | 'booklet'>('flyers')

// Flyers mode state
const quantity = ref(50000)
const selectedFormat = ref<FormatKey>('A6')
const customWidth = ref(100)
const customHeight = ref(100)
const grammage = ref(250)

// Booklet mode state
const bookletCopies = ref(1000)
const bookletPages = ref(16)
const bookletCoverGrammage = ref(250)
const bookletInnerGrammage = ref(135)

// Helper text for grammage
const grammageHelper = computed(() => {
  const g = mode.value === 'booklet' ? bookletInnerGrammage.value : grammage.value
  if (g <= 80) return t('paperWeight.helpers.light')
  if (g <= 135) return t('paperWeight.helpers.medium')
  if (g <= 200) return t('paperWeight.helpers.heavy')
  return t('paperWeight.helpers.veryHeavy')
})

// Validation errors
const quantityError = computed(() => {
  const val = mode.value === 'flyers' ? quantity.value : bookletCopies.value
  if (val <= 0) return t('paperWeight.error.minQuantity')
  if (val > MAX_QUANTITY) return t('paperWeight.error.maxQuantity')
  return null
})

const grammageError = computed(() => {
  const g = mode.value === 'booklet' ? bookletInnerGrammage.value : grammage.value
  if (g < 30) return t('paperWeight.error.minGrammage')
  if (g > 500) return t('paperWeight.error.maxGrammage')
  return null
})

// Active dimensions
const activeDims = computed(() => {
  if (selectedFormat.value === 'Custom') return { width: customWidth.value, height: customHeight.value }
  return FORMATS[selectedFormat.value as keyof typeof FORMATS]
})

// Flyers result
const flyersResult = computed(() => {
  if (mode.value !== 'flyers') return null
  if (quantity.value <= 0 || activeDims.value.width <= 0 || activeDims.value.height <= 0 || grammage.value <= 0) return null
  return calculatePaperWeight(quantity.value, activeDims.value.width, activeDims.value.height, grammage.value)
})

// Booklet result
// Formula: cover (2 pages) + inner (pages - 2) pages per booklet
// Cover weight = surface × coverGrammage × 2 (front+back of cover sheet)
// Inner weight = surface × innerGrammage × (pages - 2)
// Total = (coverWeight + innerWeight) × copies
const bookletResult = computed(() => {
  if (mode.value !== 'booklet') return null
  const { width, height } = activeDims.value
  if (bookletCopies.value <= 0 || width <= 0 || height <= 0) return null
  if (bookletPages.value < 4) return null
  if (bookletCoverGrammage.value <= 0 || bookletInnerGrammage.value <= 0) return null

  const surfaceM2 = (width / 1000) * (height / 1000)
  const coverGramsPerBooklet = surfaceM2 * bookletCoverGrammage.value * 2
  const innerPagesCount = Math.max(bookletPages.value - 2, 0)
  const innerGramsPerBooklet = surfaceM2 * bookletInnerGrammage.value * innerPagesCount
  const gramsPerBooklet = coverGramsPerBooklet + innerGramsPerBooklet
  const totalGrams = Math.round(gramsPerBooklet * bookletCopies.value)
  const kg = Math.round(totalGrams / 1000 * 100) / 100

  return { grams: totalGrams, kg }
})

// Combined result
const result = computed(() => mode.value === 'flyers' ? flyersResult.value : bookletResult.value)

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

// Format number with thousand separators
const formatNumber = (num: number): string => {
  return Math.round(num).toLocaleString()
}

// Clamp number within range
const clampNumber = (val: number, min: number, max: number): number => {
  if (isNaN(val) || val < min) return min
  if (val > max) return max
  return val
}

// Reset calculator
const resetCalculator = () => {
  mode.value = 'flyers'
  quantity.value = 50000
  selectedFormat.value = 'A6'
  customWidth.value = 100
  customHeight.value = 100
  grammage.value = 250
  bookletCopies.value = 1000
  bookletPages.value = 16
  bookletCoverGrammage.value = 250
  bookletInnerGrammage.value = 135
}

// Reset custom dimensions when format changes
watch(selectedFormat, (newFormat) => {
  if (newFormat !== 'Custom') {
    const dims = FORMATS[newFormat as keyof typeof FORMATS]
    if (dims) {
      customWidth.value = dims.width
      customHeight.value = dims.height
    }
  }
})
</script>

<style scoped>
/* Mode Toggle */
.pw-mode-toggle {
  display: flex;
  gap: var(--gi-space-sm);
  margin-bottom: var(--gi-space-lg);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.pw-mode-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--gi-space-sm);
  padding: var(--gi-space-md) var(--gi-space-lg);
  min-height: 48px;
  border: 1px solid var(--gi-border);
  background: var(--gi-surface);
  color: var(--gi-text);
  font-size: var(--gi-font-size-sm);
  font-weight: 500;
  border-radius: var(--gi-radius-md);
  cursor: pointer;
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
}

.pw-mode-btn:hover {
  border-color: var(--gi-brand);
  background: var(--gi-tint-green-50, rgba(10, 170, 142, 0.05));
}

.pw-mode-btn:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

.pw-mode-active {
  background: var(--gi-brand);
  border-color: var(--gi-brand);
  color: white;
  box-shadow: var(--gi-shadow-sm);
}

.pw-mode-active:hover {
  background: var(--gi-brand);
  border-color: var(--gi-brand);
}

/* Result Banner */
.pw-result-banner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--gi-space-md);
  padding: var(--gi-space-lg) var(--gi-space-xl);
  margin-bottom: var(--gi-space-xl);
  background: linear-gradient(135deg, var(--gi-brand) 0%, var(--gi-brand-dark, var(--gi-brand)) 100%);
  color: white;
  border-radius: var(--gi-radius-lg);
  box-shadow: var(--gi-shadow-md);
  transition: all var(--gi-transition-base) var(--gi-ease-out);
}

.pw-result-banner:hover {
  box-shadow: var(--gi-shadow-lg);
}

.pw-result-content {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-sm);
  flex: 1;
}

.pw-result-main {
  display: flex;
  align-items: baseline;
  gap: var(--gi-space-sm);
}

.pw-result-value {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1;
}

.pw-result-unit {
  font-size: var(--gi-font-size-lg);
  font-weight: 600;
  opacity: 0.9;
}

.pw-result-secondary {
  display: flex;
  align-items: center;
  gap: var(--gi-space-sm);
  font-size: var(--gi-font-size-sm);
  font-weight: 500;
  opacity: 0.9;
}

.pw-result-detail {
  white-space: nowrap;
}

.pw-result-divider {
  opacity: 0.5;
}

.pw-reset-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--gi-space-sm);
  min-width: 44px;
  min-height: 44px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  border-radius: var(--gi-radius-md);
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
  flex-shrink: 0;
}

.pw-reset-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.pw-reset-btn:active {
  transform: scale(0.95);
}

.pw-reset-btn:focus-visible {
  outline: 3px solid white;
  outline-offset: 2px;
}

/* Animations */
.result-fade-enter-active,
.result-fade-leave-active {
  transition: all var(--gi-transition-base) var(--gi-ease-out);
}

.result-fade-enter-from,
.result-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.expand-enter-active,
.expand-leave-active {
  transition: all var(--gi-transition-base) var(--gi-ease-out);
  max-height: 300px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Dark mode */
[data-theme="dark"] .pw-result-banner {
  background: rgba(10, 170, 142, 0.15);
  border: 1px solid rgba(10, 170, 142, 0.3);
}

[data-theme="dark"] .pw-result-value,
[data-theme="dark"] .pw-result-unit,
[data-theme="dark"] .pw-result-detail {
  color: var(--gi-brand);
}

/* Inputs */
.pw-inputs {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-lg);
  max-width: 600px;
  margin: 0 auto;
}

.pw-input-group {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-sm);
}

/* Slider */
.pw-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: var(--gi-border);
  outline: none;
  cursor: pointer;
  margin-top: var(--gi-space-xs);
}

.pw-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--gi-brand);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: transform var(--gi-transition-fast) var(--gi-ease-out), box-shadow var(--gi-transition-fast) var(--gi-ease-out);
}

.pw-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

.pw-slider::-webkit-slider-thumb:active {
  transform: scale(1.05);
}

.pw-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--gi-brand);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.pw-slider:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

/* Quantity/ Grammage input rows */
.pw-quantity-row,
.pw-grammage-row {
  display: flex;
  align-items: center;
  gap: var(--gi-space-sm);
}

.pw-quantity-input,
.pw-grammage-input {
  flex: 1;
  font-size: var(--gi-font-size-lg);
  padding: var(--gi-space-md);
  min-height: 48px;
}

.pw-quantity-input:focus-visible,
.pw-grammage-input:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 1px;
}

.pw-quantity-label {
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-muted);
  white-space: nowrap;
}

.pw-grammage-unit {
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-muted);
  white-space: nowrap;
  min-width: 40px;
}

/* Format Select */
.pw-format-select {
  width: 100%;
  padding: var(--gi-space-md);
  min-height: 48px;
  font-size: var(--gi-font-size-md);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  background: var(--gi-surface);
  color: var(--gi-text);
  cursor: pointer;
  transition: all var(--gi-transition-base) var(--gi-ease-out);
}

.pw-format-select:hover {
  border-color: var(--gi-brand);
}

.pw-format-select:focus {
  outline: 2px solid var(--gi-brand);
  outline-offset: 1px;
}

/* Custom Format */
.pw-custom-format {
  margin-top: var(--gi-space-sm);
}

.pw-custom-row {
  display: flex;
  align-items: center;
  gap: var(--gi-space-sm);
}

.pw-custom-input {
  flex: 1;
  padding: var(--gi-space-md);
  min-height: 48px;
  font-size: var(--gi-font-size-md);
}

.pw-custom-input:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 1px;
}

.pw-custom-input::placeholder {
  color: var(--gi-text-muted);
  opacity: 0.6;
}

.pw-custom-sep {
  font-size: var(--gi-font-size-lg);
  color: var(--gi-text-muted);
  padding: 0 var(--gi-space-xs);
}

.pw-custom-unit {
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-muted);
  white-space: nowrap;
  min-width: 30px;
}

/* Helper Text */
.pw-helper-text {
  font-size: var(--gi-font-size-xs);
  color: var(--gi-text-muted);
  margin: var(--gi-space-xs) 0 0 0;
  line-height: 1.5;
  font-style: italic;
}

/* Reset Button Mobile */
.pw-reset-btn-mobile {
  display: none;
  margin-top: var(--gi-space-md);
  min-height: 48px;
}

/* Error Messages */
.pw-error {
  font-size: var(--gi-font-size-xs);
  color: var(--gi-error-text, #dc2626);
  margin-top: var(--gi-space-xs);
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .pw-result-banner {
    flex-direction: column;
    align-items: stretch;
    padding: var(--gi-space-md);
    gap: var(--gi-space-md);
  }

  .pw-result-content {
    gap: var(--gi-space-sm);
  }

  .pw-result-main {
    justify-content: center;
  }

  .pw-result-secondary {
    justify-content: center;
    flex-wrap: wrap;
  }

  .pw-reset-btn {
    align-self: center;
    width: 100%;
    max-width: 200px;
  }

  .pw-reset-btn-mobile {
    display: inline-flex;
  }

  .pw-result-value {
    font-size: 2rem;
  }

  .pw-custom-row {
    flex-wrap: wrap;
  }

  .pw-custom-input {
    flex: 1 1 100px;
  }

  .pw-mode-toggle {
    flex-direction: column;
    gap: var(--gi-space-xs);
  }
}

@media (max-width: 480px) {
  .pw-result-value {
    font-size: 1.75rem;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .result-fade-enter-active,
  .result-fade-leave-active,
  .expand-enter-active,
  .expand-leave-active {
    transition: none;
  }

  .pw-slider::-webkit-slider-thumb {
    transition: none;
  }

  .pw-reset-btn:hover,
  .pw-mode-btn:hover {
    transform: none;
  }
}

/* High Contrast */
@media (prefers-contrast: more) {
  .pw-mode-btn,
  .pw-format-select {
    border-width: 2px;
  }

  .pw-mode-active {
    border-width: 2px;
  }

  .pw-result-banner {
    border: 2px solid white;
  }

  .pw-slider {
    height: 10px;
  }
}
</style>
