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
              {{ formatNumber(result.grams) }} g total
            </span>
            <template v-if="mode === 'flyers'">
              <span class="pw-result-divider" aria-hidden="true">•</span>
              <span class="pw-result-detail">
                {{ flyersWeightPerUnit }} / flyer
              </span>
            </template>
            <template v-if="mode === 'booklet'">
              <span class="pw-result-divider" aria-hidden="true">•</span>
              <span class="pw-result-detail">
                {{ formatNumber(bookletCopies) }} {{ t('paperWeight.copies') }}
              </span>
              <span class="pw-result-divider" aria-hidden="true">•</span>
              <span class="pw-result-detail">
                {{ bookletWeightPerUnit }} / {{ t('paperWeight.modeBooklet').toLowerCase() }}
              </span>
            </template>
          </div>
        </div>
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
                    @blur="quantity = clampNumber(quantity, 1, MAX_QUANTITY)"
                  />
                  <span class="pw-quantity-label">{{ t('paperWeight.sheets') }}</span>
                </div>
              </template>
            </GiFormField>
          </div>
        </div>

        <!-- Format -->
        <div class="pw-input-group">
          <GiFormField :label="t('paperWeight.format')">
            <template #input>
              <select v-model="selectedFormat" class="gi-select">
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

        <!-- Grammage -->
        <div class="pw-input-group">
          <GiFormField :label="t('paperWeight.grammage')">
            <template #input>
              <select
                :value="grammage"
                @change="handleGrammageChange($event)"
                class="gi-select"
              >
                <option v-for="preset in grammagePresets" :key="preset" :value="preset">
                  {{ preset }} g/m²
                </option>
                <option value="custom">{{ t('paperWeight.formats.Custom') }}...</option>
              </select>
            </template>
          </GiFormField>
          <Transition name="expand">
            <div v-if="grammage === 'custom'" class="pw-custom-grammage">
              <div class="pw-grammage-row">
                <input
                  v-model.number="customGrammage"
                  type="number"
                  class="gi-input pw-grammage-input"
                  :placeholder="t('paperWeight.grammage')"
                  :aria-label="t('paperWeight.grammage')"
                  min="1"
                  max="500"
                />
                <span class="pw-grammage-unit">g/m²</span>
              </div>
            </div>
          </Transition>
          <p class="pw-helper-text">{{ grammageHelper }}</p>
          <span v-if="grammageError" class="pw-error" role="alert">{{ grammageError }}</span>
        </div>
      </template>

      <!-- ==================== BOOKLET MODE ==================== -->
      <template v-else>
        <!-- Number of copies -->
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
                  @blur="bookletCopies = clampNumber(bookletCopies, 1, MAX_QUANTITY)"
                />
                <span class="pw-quantity-label">{{ t('paperWeight.copies') }}</span>
              </div>
            </template>
          </GiFormField>
        </div>

        <!-- Pages per booklet -->
        <div class="pw-input-group">
          <GiFormField :label="t('paperWeight.bookletPages')">
            <template #input>
              <select v-model.number="bookletPages" class="gi-select">
                <option v-for="pageCount in bookletPagesOptions" :key="pageCount" :value="pageCount">
                  {{ pageCount }} {{ t('paperWeight.pages') }}
                </option>
                <option value="custom">{{ t('paperWeight.formats.Custom') }}...</option>
              </select>
            </template>
          </GiFormField>
          <Transition name="expand">
            <div v-if="bookletPages === 'custom'" class="pw-custom-pages">
              <div class="pw-custom-pages-row">
                <input
                  v-model.number="customBookletPages"
                  type="text"
                  inputmode="numeric"
                  class="gi-input pw-custom-input"
                  :placeholder="t('paperWeight.customPagesPlaceholder')"
                  :aria-label="t('paperWeight.customPages')"
                />
                <span class="pw-custom-unit">{{ t('paperWeight.pages') }}</span>
              </div>
            </div>
          </Transition>
          <p class="pw-helper-text">{{ t('paperWeight.bookletPagesHint') }}</p>
        </div>

        <!-- Format -->
        <div class="pw-input-group">
          <GiFormField :label="t('paperWeight.format')">
            <template #input>
              <select v-model="selectedFormat" class="gi-select">
                <option v-for="(dims, key) in FORMATS" :key="key" :value="key">
                  {{ t(`paperWeight.formats.${key}`) }} - {{ dims.width }} × {{ dims.height }} mm
                </option>
                <option value="Custom">{{ t('paperWeight.formats.Custom') }}...</option>
              </select>
            </template>
          </GiFormField>
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
          <GiFormField :label="t('paperWeight.bookletCoverGrammage')">
            <template #input>
              <select
                :value="bookletCoverGrammage"
                @change="handleCoverGrammageChange($event)"
                class="gi-select"
              >
                <option v-for="preset in grammagePresets" :key="preset" :value="preset">
                  {{ preset }} g/m²
                </option>
                <option value="custom">{{ t('paperWeight.formats.Custom') }}...</option>
              </select>
            </template>
          </GiFormField>
          <Transition name="expand">
            <div v-if="bookletCoverGrammage === 'custom'" class="pw-custom-grammage">
              <div class="pw-grammage-row">
                <input
                  v-model.number="customCoverGrammage"
                  type="number"
                  class="gi-input pw-grammage-input"
                  min="1"
                  max="500"
                />
                <span class="pw-grammage-unit">g/m²</span>
              </div>
            </div>
          </Transition>
          <p class="pw-helper-text pw-cover-hint">{{ t('paperWeight.coverHint') }}</p>
        </div>

        <!-- Inner Grammage -->
        <div class="pw-input-group">
          <GiFormField :label="t('paperWeight.bookletInnerGrammage')">
            <template #input>
              <select
                :value="bookletInnerGrammage"
                @change="handleInnerGrammageChange($event)"
                class="gi-select"
              >
                <option v-for="preset in grammagePresets" :key="preset" :value="preset">
                  {{ preset }} g/m²
                </option>
                <option value="custom">{{ t('paperWeight.formats.Custom') }}...</option>
              </select>
            </template>
          </GiFormField>
          <Transition name="expand">
            <div v-if="bookletInnerGrammage === 'custom'" class="pw-custom-grammage">
              <div class="pw-grammage-row">
                <input
                  v-model.number="customInnerGrammage"
                  type="number"
                  class="gi-input pw-grammage-input"
                  min="1"
                  max="500"
                />
                <span class="pw-grammage-unit">g/m²</span>
              </div>
            </div>
          </Transition>
          <p class="pw-helper-text">{{ t('paperWeight.innerHint') }}</p>
        </div>
      </template>
    </div>

    <template #about>{{ t('paperWeight.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Weight, Layers, BookOpen } from 'lucide-vue-next'
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
const grammage = ref<number | 'custom'>(250)

// Booklet mode state
const bookletCopies = ref(1000)
const bookletPages = ref<number | 'custom'>(16)
const customBookletPages = ref(20)
const bookletCoverGrammage = ref<number | 'custom'>(250)
const bookletInnerGrammage = ref<number | 'custom'>(135)
const customCoverGrammage = ref(250)
const customInnerGrammage = ref(135)

// Booklet pages options (common multiples of 4)
const bookletPagesOptions = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96, 112, 128]

// Grammage presets
const grammagePresets = [80, 115, 135, 170, 200, 250, 350]

// Custom grammage (when user selects "Custom" option)
const customGrammage = ref(200)

// Helper text for grammage
const grammageHelper = computed(() => {
  const g = mode.value === 'booklet' ? actualInnerGrammage.value : actualGrammage.value
  if (g <= 80) return t('paperWeight.helpers.light')
  if (g <= 135) return t('paperWeight.helpers.medium')
  if (g <= 200) return t('paperWeight.helpers.heavy')
  return t('paperWeight.helpers.veryHeavy')
})

// Validation errors
const grammageError = computed(() => {
  const g = mode.value === 'booklet' ? actualInnerGrammage.value : actualGrammage.value
  if (g < 1) return t('paperWeight.error.minGrammage')
  if (g > 500) return t('paperWeight.error.maxGrammage')
  return null
})

// Active dimensions
const activeDims = computed(() => {
  if (selectedFormat.value === 'Custom') return { width: customWidth.value, height: customHeight.value }
  return FORMATS[selectedFormat.value as keyof typeof FORMATS]
})

// Actual booklet pages (handles 'custom' case)
const actualPages = computed(() => {
  if (mode.value !== 'booklet') return 0
  return bookletPages.value === 'custom' ? customBookletPages.value : bookletPages.value
})

// Flyers result
const flyersResult = computed(() => {
  if (mode.value !== 'flyers') return null
  if (quantity.value <= 0 || activeDims.value.width <= 0 || activeDims.value.height <= 0 || actualGrammage.value <= 0) return null
  return calculatePaperWeight(quantity.value, activeDims.value.width, activeDims.value.height, actualGrammage.value)
})

// Booklet result
// Booklet: cover is 2 pages (front+back = 1 sheet), inner pages = (pages - 2) pages
// Cover weight per booklet = surface × coverGrammage × 2 (both sides of cover sheet)
// Inner weight per booklet = surface × innerGrammage × (pages - 2)
// Total = (coverWeight + innerWeight) × copies
const bookletResult = computed(() => {
  if (mode.value !== 'booklet') return null
  const { width, height } = activeDims.value
  const pages = actualPages.value
  if (bookletCopies.value <= 0 || width <= 0 || height <= 0) return null
  if (pages < 4) return null
  if (actualCoverGrammage.value <= 0 || actualInnerGrammage.value <= 0) return null

  const surfaceM2 = (width / 1000) * (height / 1000)
  const coverGramsPerBooklet = surfaceM2 * actualCoverGrammage.value * 2
  const innerPagesCount = Math.max(pages - 2, 0)
  const innerGramsPerBooklet = surfaceM2 * actualInnerGrammage.value * innerPagesCount
  const gramsPerBooklet = coverGramsPerBooklet + innerGramsPerBooklet
  const totalGrams = Math.round(gramsPerBooklet * bookletCopies.value)
  const kg = Math.round(totalGrams / 1000 * 100) / 100
  const bookletKg = Math.round(gramsPerBooklet / 1000 * 100) / 100

  return { grams: totalGrams, kg, gramsPerBooklet: Math.round(gramsPerBooklet), kgPerBooklet: bookletKg }
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

// Booklet per-unit weight display
const bookletWeightPerUnit = computed(() => {
  if (mode.value !== 'booklet' || !result.value) return null
  const g = (result.value as any).gramsPerBooklet
  if (g < 1000) return `${g} g`
  return `${(g / 1000).toFixed(2)} kg`
})

// Flyers per-unit weight display
const flyersWeightPerUnit = computed(() => {
  if (mode.value !== 'flyers' || !result.value) return null
  // Weight per single flyer
  const gramsPerFlyer = result.value.grams / quantity.value
  if (gramsPerFlyer < 1) return `${(gramsPerFlyer * 1000).toFixed(1)} mg`
  if (gramsPerFlyer < 1000) return `${gramsPerFlyer.toFixed(1)} g`
  return `${(gramsPerFlyer / 1000).toFixed(2)} kg`
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

// Handle grammage dropdown change (supports both preset values and "custom" option)
const handleGrammageChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const value = target.value
  if (value === 'custom') {
    grammage.value = 'custom' as any
  } else {
    grammage.value = Number(value)
  }
}

// Get actual grammage value (handles custom option)
const actualGrammage = computed(() => {
  if (grammage.value === 'custom') return customGrammage.value
  return grammage.value
})

// Handle booklet cover grammage change
const handleCoverGrammageChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const value = target.value
  if (value === 'custom') {
    bookletCoverGrammage.value = 'custom'
  } else {
    bookletCoverGrammage.value = Number(value)
  }
}

// Handle booklet inner grammage change
const handleInnerGrammageChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const value = target.value
  if (value === 'custom') {
    bookletInnerGrammage.value = 'custom'
  } else {
    bookletInnerGrammage.value = Number(value)
  }
}

// Get actual booklet cover grammage value
const actualCoverGrammage = computed(() => {
  if (bookletCoverGrammage.value === 'custom') return customCoverGrammage.value
  return bookletCoverGrammage.value
})

// Get actual booklet inner grammage value
const actualInnerGrammage = computed(() => {
  if (bookletInnerGrammage.value === 'custom') return customInnerGrammage.value
  return bookletInnerGrammage.value
})

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
  gap: var(--gi-space-xs);
  margin-bottom: var(--gi-space-md);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.pw-mode-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--gi-space-xs);
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
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--gi-space-sm);
  padding: var(--gi-space-md) var(--gi-space-lg);
  margin-bottom: var(--gi-space-md);
  background: linear-gradient(135deg, var(--gi-brand) 0%, var(--gi-brand-dark, var(--gi-brand)) 100%);
  color: white;
  border-radius: var(--gi-radius-lg);
  box-shadow: var(--gi-shadow-md);
  transition: all var(--gi-transition-base) var(--gi-ease-out);
}

.pw-result-banner:hover {
  box-shadow: var(--gi-shadow-md);
}

.pw-result-content {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-xs);
  flex: 1;
}

.pw-result-main {
  display: flex;
  align-items: baseline;
  gap: var(--gi-space-sm);
}

.pw-result-value {
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1;
}

.pw-result-unit {
  font-size: var(--gi-font-size-md);
  font-weight: 600;
  opacity: 0.9;
}

.pw-result-secondary {
  display: flex;
  align-items: center;
  gap: var(--gi-space-xs);
  font-size: var(--gi-font-size-xs);
  font-weight: 500;
  opacity: 0.9;
  flex-wrap: wrap;
}

.pw-result-detail {
  white-space: nowrap;
}

.pw-result-divider {
  opacity: 0.5;
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
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--gi-space-md);
  padding-top: var(--gi-space-md);
  max-width: 900px;
  margin: 0 auto;
}

.pw-input-group {
  flex: 1;
  min-width: 150px;
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-xs);
}

/* Booklet sections */
.pw-booklet-section {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-sm);
  padding: var(--gi-space-md);
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
}

[data-theme="dark"] .pw-booklet-section {
  background: rgba(255, 255, 255, 0.03);
}

.pw-section-title {
  font-size: var(--gi-font-size-xs);
  font-weight: 600;
  color: var(--gi-text);
  margin: 0 0 var(--gi-space-xs) 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
}

.pw-paper-section {
  border-color: var(--gi-brand);
  background: var(--gi-tint-green-50, rgba(10, 170, 142, 0.03));
}

[data-theme="dark"] .pw-paper-section {
  background: rgba(10, 170, 142, 0.05);
}

.pw-subsection-header {
  display: flex;
  align-items: center;
  gap: var(--gi-space-sm);
}

.pw-subsection-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.pw-cover-hint {
  font-style: italic;
  opacity: 0.8;
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
  font-size: var(--gi-font-size-md);
  padding: var(--gi-space-sm) var(--gi-space-md);
  min-height: 44px;
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

/* Format Cards */
.pw-format-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: var(--gi-space-sm);
}

.pw-format-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gi-space-xs);
  padding: var(--gi-space-sm) var(--gi-space-xs);
  min-height: 44px;
  border: 2px solid var(--gi-border);
  background: var(--gi-surface);
  color: var(--gi-text);
  border-radius: var(--gi-radius-md);
  cursor: pointer;
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
  font-size: var(--gi-font-size-xs);
  font-weight: 500;
}

.pw-format-card:hover {
  border-color: var(--gi-brand);
  background: var(--gi-tint-green-50, rgba(10, 170, 142, 0.05));
}

.pw-format-card:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

.pw-format-active {
  border-color: var(--gi-brand);
  background: var(--gi-tint-green-100, rgba(10, 170, 142, 0.1));
  color: var(--gi-brand);
  box-shadow: 0 0 0 1px var(--gi-brand);
}

.pw-format-active:hover {
  background: var(--gi-tint-green-100, rgba(10, 170, 142, 0.1));
  color: var(--gi-brand);
}

.pw-format-illustration {
  width: 72px;
  height: 72px;
  color: var(--gi-brand);
  flex-shrink: 0;
}

.pw-format-active .pw-format-illustration {
  color: var(--gi-brand);
}

.pw-format-name {
  font-weight: 700;
  font-size: var(--gi-font-size-xs);
  line-height: 1.2;
  text-align: center;
}

.pw-format-dims {
  font-size: 10px;
  color: var(--gi-text-muted);
  opacity: 0.8;
  text-align: center;
  line-height: 1.3;
}

/* Pages Select */
.pw-pages-select {
  width: 100%;
  padding: var(--gi-space-sm) var(--gi-space-md);
  min-height: 44px;
  font-size: var(--gi-font-size-md);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  background: var(--gi-surface);
  color: var(--gi-text);
  cursor: pointer;
  transition: all var(--gi-transition-base) var(--gi-ease-out);
}

.pw-pages-select:hover {
  border-color: var(--gi-brand);
}

/* Custom Pages */
.pw-custom-pages {
  margin-top: var(--gi-space-sm);
}

.pw-custom-pages-row {
  display: flex;
  align-items: center;
  gap: var(--gi-space-sm);
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
  padding: var(--gi-space-sm) var(--gi-space-md);
  min-height: 44px;
  font-size: var(--gi-font-size-md);
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
  font-size: 11px;
  color: var(--gi-text-muted);
  margin: var(--gi-space-xs) 0 0 0;
  line-height: 1.4;
  font-style: italic;
}

/* Preset Buttons */
.pw-presets {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gi-space-xs);
  margin-top: var(--gi-space-xs);
}

.pw-preset-btn {
  padding: 4px 12px;
  min-height: 32px;
  border: 1px solid var(--gi-border);
  background: var(--gi-surface);
  color: var(--gi-text-muted);
  font-size: var(--gi-font-size-xs);
  font-weight: 500;
  border-radius: var(--gi-radius-pill);
  cursor: pointer;
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
  white-space: nowrap;
}

.pw-preset-btn:hover {
  border-color: var(--gi-brand);
  color: var(--gi-brand);
  background: var(--gi-tint-green-50, rgba(10, 170, 142, 0.05));
}

.pw-preset-btn:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

.pw-preset-active {
  border-color: var(--gi-brand);
  background: var(--gi-brand);
  color: white;
}

.pw-preset-active:hover {
  background: var(--gi-brand);
  color: white;
}

/* Grammage presets inside booklet section */
.pw-presets--grammage {
  margin-top: var(--gi-space-sm);
}

.pw-presets--grammage .pw-preset-btn {
  padding: 3px 10px;
  font-size: 11px;
  min-height: 28px;
}

/* Reset Button Mobile */
.pw-reset-btn-mobile {
  display: none;
  margin-top: var(--gi-space-sm);
  min-height: 44px;
}

/* Error Messages */
.pw-error {
  font-size: 11px;
  color: var(--gi-error-text, #dc2626);
  margin-top: var(--gi-space-xs);
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .pw-result-banner {
    flex-direction: column;
    align-items: stretch;
    padding: var(--gi-space-sm);
    gap: var(--gi-space-sm);
  }

  .pw-result-content {
    gap: var(--gi-space-xs);
  }

  .pw-result-main {
    justify-content: center;
  }

  .pw-result-secondary {
    justify-content: center;
    flex-wrap: wrap;
  }

  .pw-result-value {
    font-size: 1.75rem;
  }

  .pw-custom-row,
  .pw-custom-pages-row {
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
    font-size: 1.5rem;
  }

  .pw-format-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .pw-format-illustration {
    width: 56px;
    height: 56px;
  }

  .pw-presets {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: var(--gi-space-xs);
  }

  .pw-preset-btn {
    flex-shrink: 0;
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

  .pw-mode-btn:hover {
    transform: none;
  }
}

/* High Contrast */
@media (prefers-contrast: more) {
  .pw-mode-btn,
  .pw-format-card {
    border-width: 2px;
  }

  .pw-mode-active {
    border-width: 2px;
  }

  .pw-format-active {
    border-width: 3px;
  }

  .pw-result-banner {
    border: 2px solid white;
  }

  .pw-slider {
    height: 10px;
  }
}
</style>
