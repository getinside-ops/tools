<template>
  <ToolPageLayout
    :title="t('paperWeight.title')"
    :subtitle="t('paperWeight.desc')"
    category="print"
  >
    <template #icon>
      <Weight />
    </template>

    <!-- Result Banner (improved with animation and comparisons) -->
    <Transition name="result-fade">
      <div v-if="result" class="pw-result-banner" role="status" aria-live="polite">
        <div class="pw-result-content">
          <div class="pw-result-main">
            <span class="pw-result-value">{{ displayWeight.value }}</span>
            <span class="pw-result-unit">{{ displayWeight.unit }}</span>
          </div>
          <div class="pw-result-secondary">
            <span class="pw-result-detail">
              {{ result.grams.toLocaleString() }} g
            </span>
            <span class="pw-result-divider" aria-hidden="true">•</span>
            <span class="pw-result-detail">
              {{ totalSheets.toLocaleString() }} {{ t('paperWeight.sheets') }}
            </span>
          </div>
          <!-- Real-world comparison for context -->
          <div v-if="comparison" class="pw-result-comparison">
            <Package :size="16" aria-hidden="true" />
            <span>≈ {{ comparison }}</span>
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

    <!-- Input Section (improved layout with presets) -->
    <div class="pw-inputs">
      <!-- Quantity Section with presets -->
      <div class="pw-input-group">
        <GiFormField
          :label="t('paperWeight.quantity')"
          type="number"
          :model-value="quantity"
          @update:model-value="quantity = Number($event)"
        >
          <template #input>
            <div class="pw-quantity-row">
              <input
                v-model.number="quantity"
                type="number"
                min="1"
                max="999999"
                step="1"
                class="gi-input pw-quantity-input"
                aria-label="Quantity"
              />
              <span class="pw-quantity-label">{{ t('paperWeight.sheets') }}</span>
            </div>
          </template>
        </GiFormField>
        
        <!-- Quick quantity presets -->
        <div class="pw-presets" role="group" aria-label="Quick quantity selection">
          <button
            v-for="preset in quantityPresets"
            :key="preset"
            class="pw-preset-btn"
            :class="{ 'pw-preset-active': quantity === preset }"
            @click="quantity = preset"
            :aria-pressed="quantity === preset"
          >
            {{ formatNumber(preset) }}
          </button>
        </div>
        <span v-if="quantityError" class="pw-error" role="alert">{{ quantityError }}</span>
      </div>

      <!-- Format Section -->
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
            <GiFormField
              :label="t('paperWeight.customDimensions')"
            >
              <template #input>
                <div class="pw-custom-row">
                  <input 
                    v-model.number="customWidth" 
                    type="number" 
                    min="1" 
                    max="1000"
                    step="1" 
                    class="gi-input pw-custom-input" 
                    placeholder="Width"
                    aria-label="Custom width in millimeters"
                  />
                  <span class="pw-custom-sep" aria-hidden="true">×</span>
                  <input 
                    v-model.number="customHeight" 
                    type="number" 
                    min="1" 
                    max="1000"
                    step="1" 
                    class="gi-input pw-custom-input" 
                    placeholder="Height"
                    aria-label="Custom height in millimeters"
                  />
                  <span class="pw-custom-unit">mm</span>
                </div>
              </template>
            </GiFormField>
          </div>
        </Transition>
      </div>

      <!-- Grammage Section with presets and info -->
      <div class="pw-input-group">
        <GiFormField
          :label="t('paperWeight.grammage')"
          type="number"
          :model-value="grammage"
          @update:model-value="grammage = Number($event)"
        >
          <template #input>
            <div class="pw-grammage-row">
              <input 
                v-model.number="grammage" 
                type="number" 
                min="30" 
                max="500"
                step="5" 
                class="gi-input pw-grammage-input"
                aria-label="Paper weight in grams per square meter"
              />
              <span class="pw-grammage-unit">g/m²</span>
            </div>
          </template>
        </GiFormField>
        
        <!-- Grammage helper text -->
        <p class="pw-helper-text">
          {{ grammageHelper }}
        </p>

        <!-- Quick grammage presets -->
        <div class="pw-presets" role="group" aria-label="Quick paper weight selection">
          <button
            v-for="preset in grammagePresets"
            :key="preset"
            class="pw-preset-btn"
            :class="{ 'pw-preset-active': grammage === preset }"
            @click="grammage = preset"
            :aria-pressed="grammage === preset"
          >
            {{ preset }} g/m²
          </button>
        </div>
        <span v-if="grammageError" class="pw-error" role="alert">{{ grammageError }}</span>
      </div>

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
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Weight, RotateCcw, Package } from 'lucide-vue-next'
import ToolPageLayout from '../components/ToolPageLayout.vue'
import GiFormField from '../components/GiFormField.vue'
import {
  calculatePaperWeight,
  FORMATS,
  type FormatKey,
  DEFAULT_QUANTITY,
  QUANTITY_PRESETS,
} from '../composables/usePaperWeight'

defineOptions({
  name: 'PaperWeightView'
})

const { t } = useI18n()

const quantity = ref(DEFAULT_QUANTITY)
const selectedFormat = ref<FormatKey>('A6')
const customWidth = ref(100)
const customHeight = ref(100)
const grammage = ref(250)

// Preset values for quick selection
const quantityPresets = QUANTITY_PRESETS
const grammagePresets = [80, 115, 135, 170, 250, 350]

// Helper text for grammage
const grammageHelper = computed(() => {
  if (grammage.value <= 80) return t('paperWeight.helpers.light')
  if (grammage.value <= 135) return t('paperWeight.helpers.medium')
  if (grammage.value <= 200) return t('paperWeight.helpers.heavy')
  return t('paperWeight.helpers.veryHeavy')
})

// Real-world comparison for context
const comparison = computed(() => {
  if (!result.value) return null
  const kg = result.value.kg
  if (kg < 1) return t('paperWeight.comparisons.lightPackage')
  if (kg < 5) return t('paperWeight.comparisons.mediumPackage')
  if (kg < 15) return t('paperWeight.comparisons.heavyPackage')
  if (kg < 50) return t('paperWeight.comparisons.bowlingBall')
  return t('paperWeight.comparisons.veryHeavy')
})

const quantityError = computed(() => {
  if (quantity.value <= 0) return t('paperWeight.error.minQuantity')
  if (quantity.value > 999999) return t('paperWeight.error.maxQuantity')
  return null
})

const grammageError = computed(() => {
  if (grammage.value < 30) return t('paperWeight.error.minGrammage')
  if (grammage.value > 500) return t('paperWeight.error.maxGrammage')
  return null
})

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

// Total sheets (same as quantity, but explicit)
const totalSheets = computed(() => quantity.value)

// Format large numbers for display
const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}k`
  return num.toString()
}

const resetCalculator = () => {
  quantity.value = DEFAULT_QUANTITY
  selectedFormat.value = 'A6'
  customWidth.value = 100
  customHeight.value = 100
  grammage.value = 250
}
</script>

<style scoped>
/* Result Banner with animation */
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

.pw-result-comparison {
  display: flex;
  align-items: center;
  gap: var(--gi-space-xs);
  padding: var(--gi-space-xs) var(--gi-space-sm);
  background: rgba(255, 255, 255, 0.15);
  border-radius: var(--gi-radius-sm);
  font-size: var(--gi-font-size-xs);
  font-weight: 500;
  width: fit-content;
  margin-top: var(--gi-space-xs);
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

/* Animation for result appearance */
.result-fade-enter-active,
.result-fade-leave-active {
  transition: all var(--gi-transition-base) var(--gi-ease-out);
}

.result-fade-enter-from,
.result-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Dark mode override for result banner */
[data-theme="dark"] .pw-result-banner {
  background: rgba(10, 170, 142, 0.15);
  border: 1px solid rgba(10, 170, 142, 0.3);
}

[data-theme="dark"] .pw-result-value,
[data-theme="dark"] .pw-result-unit,
[data-theme="dark"] .pw-result-detail {
  color: var(--gi-brand);
}

[data-theme="dark"] .pw-result-comparison {
  background: rgba(10, 170, 142, 0.1);
  color: var(--gi-text-secondary);
}

/* Input Section with better grouping */
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

/* Preset Buttons */
.pw-presets {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gi-space-xs);
  margin-top: var(--gi-space-xs);
}

.pw-preset-btn {
  padding: var(--gi-space-sm) var(--gi-space-md);
  min-height: 44px;
  border: 1px solid var(--gi-border);
  background: var(--gi-surface);
  color: var(--gi-text);
  font-size: var(--gi-font-size-sm);
  font-weight: 500;
  border-radius: var(--gi-radius-md);
  cursor: pointer;
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
}

.pw-preset-btn:hover {
  border-color: var(--gi-brand);
  background: var(--gi-tint-green-50, rgba(10, 170, 142, 0.05));
  transform: translateY(-1px);
}

.pw-preset-btn:active {
  transform: translateY(0);
}

.pw-preset-btn:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

.pw-preset-active {
  background: var(--gi-brand);
  border-color: var(--gi-brand);
  color: white;
  box-shadow: var(--gi-shadow-sm);
}

.pw-preset-active:hover {
  background: var(--gi-brand-dark, var(--gi-brand));
  border-color: var(--gi-brand-dark, var(--gi-brand));
}

/* Quantity Row */
.pw-quantity-row {
  display: flex;
  align-items: center;
  gap: var(--gi-space-sm);
}

.pw-quantity-input {
  flex: 1;
  font-size: var(--gi-font-size-lg);
  padding: var(--gi-space-md);
  min-height: 48px;
}

.pw-quantity-input:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 1px;
}

.pw-quantity-label {
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-muted);
  white-space: nowrap;
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

/* Custom Format Animation */
.expand-enter-active,
.expand-leave-active {
  transition: all var(--gi-transition-base) var(--gi-ease-out);
  max-height: 200px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.pw-custom-format {
  margin-top: var(--gi-space-sm);
}

/* Custom Format Row */
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

/* Grammage Row */
.pw-grammage-row {
  display: flex;
  align-items: center;
  gap: var(--gi-space-sm);
}

.pw-grammage-input {
  flex: 1;
  font-size: var(--gi-font-size-lg);
  padding: var(--gi-space-md);
  min-height: 48px;
}

.pw-grammage-input:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 1px;
}

.pw-grammage-unit {
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-muted);
  white-space: nowrap;
  min-width: 40px;
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

/* Responsive Design */
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

  .pw-result-comparison {
    align-self: center;
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

  .pw-presets {
    gap: var(--gi-space-xs);
  }

  .pw-preset-btn {
    flex: 1 1 calc(50% - var(--gi-space-xs));
    min-width: 100px;
  }

  .pw-custom-row {
    flex-wrap: wrap;
  }

  .pw-custom-input {
    flex: 1 1 100px;
  }
}

@media (max-width: 480px) {
  .pw-result-value {
    font-size: 1.75rem;
  }

  .pw-preset-btn {
    flex: 1 1 100%;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .result-fade-enter-active,
  .result-fade-leave-active,
  .expand-enter-active,
  .expand-leave-active {
    transition: none;
  }

  .pw-preset-btn,
  .pw-reset-btn,
  .pw-format-select,
  .pw-quantity-input,
  .pw-grammage-input,
  .pw-custom-input {
    transition: none;
  }

  .pw-preset-btn:hover,
  .pw-reset-btn:hover {
    transform: none;
  }
}

/* High Contrast Mode Support */
@media (prefers-contrast: more) {
  .pw-preset-btn {
    border-width: 2px;
  }

  .pw-preset-active {
    border-width: 2px;
  }

  .pw-result-banner {
    border: 2px solid white;
  }
}
</style>
