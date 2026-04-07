<template>
  <ToolPageLayout
    :title="t('paperWeight.title')"
    :subtitle="t('paperWeight.desc')"
    category="print"
  >
    <template #icon>
      <Weight />
    </template>

    <!-- Result Banner (sticky, full-width) -->
    <div v-if="result" class="pw-result-banner">
      <div class="pw-result-content">
        <div class="pw-result-main">
          <span class="pw-result-value">{{ displayWeight.value }}</span>
          <span class="pw-result-unit">{{ displayWeight.unit }}</span>
        </div>
        <div class="pw-result-secondary">
          {{ result.grams.toLocaleString() }} g
          <span class="pw-result-divider">•</span>
          {{ totalSheets.toLocaleString() }} {{ t('paperWeight.sheets') }}
        </div>
      </div>
      <button class="pw-reset-btn" @click="resetCalculator" :title="t('paperWeight.reset')">
        <RotateCcw :size="16" aria-hidden="true" />
      </button>
    </div>

    <!-- Input Section (centered, single column) -->
    <div class="pw-inputs">
      <!-- Quantity Section -->
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
              step="1"
              class="gi-input pw-quantity-input"
              aria-label="Quantity"
            />
            <span class="pw-quantity-label">{{ t('paperWeight.sheets') }}</span>
          </div>
        </template>
      </GiFormField>
      <span v-if="quantityError" class="pw-error" role="alert">{{ quantityError }}</span>

      <!-- Format Section -->
      <GiFormField :label="t('paperWeight.format')">
        <template #input>
          <select v-model="selectedFormat" class="gi-select pw-format-select">
            <option value="A5">A5 - {{ FORMATS.A5.width }} × {{ FORMATS.A5.height }} mm</option>
            <option value="A6">A6 - {{ FORMATS.A6.width }} × {{ FORMATS.A6.height }} mm</option>
            <option value="A4">A4 - {{ FORMATS.A4.width }} × {{ FORMATS.A4.height }} mm</option>
            <option value="Custom">{{ t('paperWeight.formats.Custom') }}...</option>
          </select>
        </template>
      </GiFormField>

      <!-- Custom Format Inputs -->
      <GiFormField
        v-if="selectedFormat === 'Custom'"
        :label="t('paperWeight.customDimensions')"
      >
        <template #input>
          <div class="pw-custom-row">
            <input v-model.number="customWidth" type="number" min="1" step="1" class="gi-input pw-custom-input" />
            <span class="pw-custom-sep">×</span>
            <input v-model.number="customHeight" type="number" min="1" step="1" class="gi-input pw-custom-input" />
            <span class="pw-custom-unit">mm</span>
          </div>
        </template>
      </GiFormField>

      <!-- Grammage Section -->
      <GiFormField
        :label="t('paperWeight.grammage')"
        type="number"
        :model-value="grammage"
        @update:model-value="grammage = Number($event)"
      >
        <template #input>
          <div class="pw-grammage-row">
            <input v-model.number="grammage" type="number" min="1" step="1" class="gi-input pw-grammage-input" />
            <span class="pw-grammage-unit">g/m²</span>
          </div>
        </template>
      </GiFormField>
      <span v-if="grammageError" class="pw-error" role="alert">{{ grammageError }}</span>

      <!-- Reset Button (mobile only) -->
      <button class="gi-btn gi-btn-ghost pw-reset-btn-mobile" @click="resetCalculator">
        {{ t('paperWeight.reset') }}
      </button>
    </div>

    <template #about>{{ t('paperWeight.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Weight, RotateCcw } from 'lucide-vue-next'
import ToolPageLayout from '../components/ToolPageLayout.vue'
import GiFormField from '../components/GiFormField.vue'
import {
  calculatePaperWeight,
  FORMATS,
  type FormatKey,
  DEFAULT_QUANTITY,
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

const quantityError = computed(() => {
  if (quantity.value <= 0) return t('paperWeight.error.minQuantity')
  if (quantity.value > 99999) return t('paperWeight.error.maxQuantity')
  return null
})

const grammageError = computed(() => {
  if (grammage.value <= 0) return t('paperWeight.error.minGrammage')
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

const resetCalculator = () => {
  quantity.value = DEFAULT_QUANTITY
  selectedFormat.value = 'A6'
  customWidth.value = 100
  customHeight.value = 100
  grammage.value = 250
}
</script>

<style scoped>
/* Result Banner (sticky, full-width) */
.pw-result-banner {
  position: sticky;
  top: var(--gi-space-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--gi-space-md);
  padding: var(--gi-space-md) var(--gi-space-lg);
  margin-bottom: var(--gi-space-lg);
  background: var(--gi-brand);
  color: white;
  border-radius: var(--gi-radius-xl);
  box-shadow: var(--gi-shadow-lg);
  z-index: 10;
}

.pw-result-content {
  display: flex;
  align-items: baseline;
  gap: var(--gi-space-md);
  flex: 1;
}

.pw-result-main {
  display: flex;
  align-items: baseline;
  gap: var(--gi-space-sm);
}

.pw-result-value {
  font-size: 2.5rem;
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
  font-size: var(--gi-font-size-sm);
  font-weight: 500;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: var(--gi-space-sm);
}

.pw-result-divider {
  opacity: 0.5;
}

.pw-reset-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--gi-space-sm);
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  border-radius: var(--gi-radius-md);
  transition: all var(--gi-transition-fast);
  flex-shrink: 0;
}

.pw-reset-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.pw-reset-btn:focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
}

/* Dark mode override for result banner */
[data-theme="dark"] .pw-result-banner {
  background: rgba(10, 170, 142, 0.15);
  border: 1px solid rgba(10, 170, 142, 0.4);
}

[data-theme="dark"] .pw-result-value,
[data-theme="dark"] .pw-result-unit,
[data-theme="dark"] .pw-result-secondary {
  color: var(--gi-brand);
}

/* Input Section (centered, single column) */
.pw-inputs {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-md);
  max-width: 600px;
  margin: 0 auto;
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

/* Custom Format Row */
.pw-custom-row {
  display: flex;
  align-items: center;
  gap: var(--gi-space-sm);
}

.pw-custom-input {
  width: 100px;
  padding: var(--gi-space-md);
  font-size: var(--gi-font-size-md);
}

.pw-custom-input:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 1px;
}

.pw-custom-sep {
  font-size: var(--gi-font-size-lg);
  color: var(--gi-text-muted);
}

.pw-custom-unit {
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-muted);
  white-space: nowrap;
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
}

.pw-grammage-input:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 1px;
}

.pw-grammage-unit {
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-muted);
  white-space: nowrap;
}

/* Reset Button Mobile */
.pw-reset-btn-mobile {
  display: none;
  margin-top: var(--gi-space-sm);
}

/* Error Messages */
.pw-error {
  font-size: var(--gi-font-size-xs);
  color: var(--gi-error);
  margin-top: var(--gi-space-xs);
}

/* Responsive */
@media (max-width: 768px) {
  .pw-result-banner {
    flex-direction: column;
    text-align: center;
    padding: var(--gi-space-md);
  }

  .pw-result-content {
    flex-direction: column;
    gap: var(--gi-space-xs);
  }

  .pw-result-main {
    justify-content: center;
  }

  .pw-result-secondary {
    justify-content: center;
  }

  .pw-reset-btn {
    align-self: center;
  }

  .pw-reset-btn-mobile {
    display: inline-flex;
  }

  .pw-result-value {
    font-size: 2rem;
  }
}
</style>
