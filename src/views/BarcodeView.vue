<template>
  <ToolPageLayout :title="t('barcode.title')" :description="t('barcode.desc')" category="print">
    <template #icon>
      <Barcode />
    </template>

    <div class="barcode-grid">
      <!-- Left Column: Input & Customization -->
      <div class="barcode-controls">
        <!-- Input Field -->
        <div class="gi-field">
          <label class="gi-label" for="barcode-input">
            {{ t('barcode.label') }} *
          </label>
          <input
            id="barcode-input"
            ref="inputRef"
            v-model="inputCode"
            type="text"
            :placeholder="t('barcode.placeholder')"
            class="gi-input"
            :class="{
              'gi-input-success': validationState.isValid,
              'gi-input-error': validationState.errorCode && !validationState.isValid,
            }"
            @input="handleInput"
            maxlength="13"
          />

          <!-- Validation Feedback -->
          <div v-if="errorMessage" class="gi-text-error gi-validation-message">
            {{ errorMessage }}
          </div>
          <div v-else-if="validationState.country" class="gi-hint gi-validation-message">
            {{ t('barcode.country', { country: validationState.country, code: validationState.countryCode }) }}
          </div>

          <!-- Checksum Display -->
          <div v-if="fullCode.length === 13 && validationState.checksum !== null" class="gi-hint">
            {{ t('barcode.checksum', { n: validationState.checksum }) }}
            <span v-if="validationState.checksumValid" class="gi-text-success"> ✓</span>
            <span v-else class="gi-text-error"> ✗</span>
          </div>

          <!-- Character Counter -->
          <div class="gi-hint barcode-char-counter">
            {{ inputCode.length }}/13
          </div>
        </div>

        <!-- Customization Panel (always visible) -->
        <div class="barcode-customization">
          <div class="barcode-customization-header">
            <h3 class="barcode-section-title">{{ t('barcode.customize') }}</h3>
            <button class="gi-btn-ghost gi-btn-sm barcode-reset-btn" @click="reset" :title="t('barcode.reset')">
              <RotateCcw :size="16" />
            </button>
          </div>

          <!-- Bar Color -->
          <div class="gi-field">
            <label class="gi-label">{{ t('barcode.barColor') }}</label>
            <div class="barcode-color-swatches">
              <button
                v-for="color in presetColors"
                :key="color.value"
                class="barcode-color-swatch"
                :style="{ backgroundColor: color.value }"
                :class="{ 'is-selected': settings.barColor === color.value }"
                @click="setBarColor(color.value)"
                :aria-label="t(`barcode.colors.${color.name}`)"
              />
              <input
                type="color"
                :value="settings.barColor"
                class="barcode-color-picker"
                @input="(e) => setBarColor((e.target as HTMLInputElement).value)"
                :aria-label="t('barcode.customColor')"
              />
            </div>
          </div>

          <!-- Width Slider -->
          <div class="gi-field">
            <label class="gi-label">{{ t('barcode.width') }}</label>
            <div class="barcode-slider-container">
              <input
                type="range"
                min="100"
                max="400"
                step="10"
                :value="settings.width"
                class="gi-slider"
                :style="{
                  background: `linear-gradient(to right, var(--gi-brand) ${((settings.width - 100) / 300) * 100}%, var(--gi-border) ${((settings.width - 100) / 300) * 100}%)`
                }"
                @input="(e) => setDimensions({ width: Number((e.target as HTMLInputElement).value), height: settings.height })"
              />
              <span class="barcode-slider-value">{{ settings.width }} px</span>
            </div>
            <div class="barcode-size-presets">
              <button
                class="gi-btn-ghost gi-btn-sm"
                :class="{ 'is-active': settings.width === 100 }"
                @click="setDimensions({ width: 100, height: settings.height })"
              >
                {{ t('barcode.size.small') }}
              </button>
              <button
                class="gi-btn-ghost gi-btn-sm"
                :class="{ 'is-active': settings.width === 200 }"
                @click="setDimensions({ width: 200, height: settings.height })"
              >
                {{ t('barcode.size.medium') }}
              </button>
              <button
                class="gi-btn-ghost gi-btn-sm"
                :class="{ 'is-active': settings.width === 400 }"
                @click="setDimensions({ width: 400, height: settings.height })"
              >
                {{ t('barcode.size.large') }}
              </button>
            </div>
          </div>

          <!-- Height Slider -->
          <div class="gi-field">
            <label class="gi-label">{{ t('barcode.height') }}</label>
            <div class="barcode-slider-container">
              <input
                type="range"
                min="30"
                max="80"
                step="5"
                :value="settings.height"
                class="gi-slider"
                :style="{
                  background: `linear-gradient(to right, var(--gi-brand) ${((settings.height - 30) / 50) * 100}%, var(--gi-border) ${((settings.height - 30) / 50) * 100}%)`
                }"
                @input="(e) => setDimensions({ width: settings.width, height: Number((e.target as HTMLInputElement).value) })"
              />
              <span class="barcode-slider-value">{{ settings.height }} px</span>
            </div>
          </div>

          <!-- Toggle Options -->
          <div class="gi-field">
            <label class="gi-label gi-checkbox-label">
              <input
                type="checkbox"
                :checked="settings.showText"
                @change="toggleShowText"
                class="gi-checkbox"
              />
              <span>{{ t('barcode.showText') }}</span>
            </label>
          </div>

          <div class="gi-field">
            <label class="gi-label gi-checkbox-label">
              <input
                type="checkbox"
                :checked="settings.transparentBackground"
                @change="toggleTransparentBackground"
                class="gi-checkbox"
              />
              <span>{{ t('barcode.transparentBg') }}</span>
            </label>
          </div>

          <!-- Export Format -->
          <div class="gi-field">
            <label class="gi-label">{{ t('barcode.exportFormat') }}</label>
            <div class="barcode-format-selector">
              <button
                class="gi-btn-ghost"
                :class="{ 'is-active': settings.exportFormat === 'svg' }"
                @click="setExportFormat('svg')"
              >
                <FileText :size="16" class="barcode-format-icon" />
                {{ t('barcode.formatShort.svg') }}
              </button>
              <button
                class="gi-btn-ghost"
                :class="{ 'is-active': settings.exportFormat === 'png' }"
                @click="setExportFormat('png')"
              >
                <FileText :size="16" class="barcode-format-icon" />
                {{ t('barcode.formatShort.png') }}
              </button>
              <button
                class="gi-btn-ghost"
                :class="{ 'is-active': settings.exportFormat === 'jpg' }"
                @click="setExportFormat('jpg')"
              >
                <FileText :size="16" class="barcode-format-icon" />
                {{ t('barcode.formatShort.jpg') }}
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- Right Column: Preview & Export -->
      <div class="barcode-preview-column">
        <GiResultCard :title="t('barcode.preview')">
          <div class="barcode-preview-area">
            <div
              v-if="fullCode.length === 13 && binary"
              ref="barcodeSvgContainer"
              class="barcode-preview"
              :style="{ background: settings.transparentBackground ? 'transparent' : 'white' }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                :width="settings.width"
                :height="settings.height + (settings.showText ? 20 : 0)"
                :viewBox="`0 0 95 ${60 + (settings.showText ? 20 : 0)}`"
                preserveAspectRatio="xMidYMid meet"
              >
                <!-- Background -->
                <rect
                  width="95"
                  :height="60 + (settings.showText ? 20 : 0)"
                  :fill="settings.transparentBackground ? 'transparent' : 'white'"
                />

                <!-- Bars -->
                <rect
                  v-for="(bit, idx) in binary.split('')"
                  :key="idx"
                  :x="idx * (settings.width / 95)"
                  y="0"
                  :width="settings.width / 95"
                  :height="isGuard(idx) ? settings.height * 0.9 : settings.height"
                  :fill="bit === '1' ? settings.barColor : 'transparent'"
                />

                <!-- Text -->
                <text
                  v-if="settings.showText"
                  x="0"
                  y="58"
                  font-size="6"
                  font-family="monospace"
                  :fill="settings.barColor"
                >
                  {{ fullCode[0] }}
                </text>
                <text
                  v-if="settings.showText"
                  x="25"
                  y="58"
                  font-size="6"
                  font-family="monospace"
                  text-anchor="middle"
                  :fill="settings.barColor"
                >
                  {{ fullCode.slice(1, 7) }}
                </text>
                <text
                  v-if="settings.showText"
                  x="70"
                  y="58"
                  font-size="6"
                  font-family="monospace"
                  text-anchor="middle"
                  :fill="settings.barColor"
                >
                  {{ fullCode.slice(7) }}
                </text>
              </svg>
            </div>
            <div v-else class="gi-text-muted barcode-placeholder">
              {{ t('barcode.invalid') }}
            </div>
          </div>

          <template #actions>
            <div class="barcode-export-actions">
              <button class="gi-btn-ghost" @click="copyCode">
                <Copy :size="16" />
                {{ copied ? t('barcode.copied') : t('barcode.copyNumber') }}
              </button>
              <button class="gi-btn" :disabled="isExporting" @click="downloadBarcode">
                <Loader2 v-if="isExporting" :size="16" class="animate-spin" />
                {{ isExporting ? t('barcode.exporting') : t('barcode.download', { format: settings.exportFormat.toUpperCase() }) }}
              </button>
            </div>
            <div v-if="exportError" class="gi-text-error gi-export-error" role="alert">
              {{ exportError }}
            </div>
          </template>
        </GiResultCard>
      </div>
    </div>

    <template #about>{{ t('barcode.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Barcode, Loader2, FileText, Copy, RotateCcw } from 'lucide-vue-next'
import { generateEanBinary } from '../composables/useBarcode'
import { useBarcodeValidator } from '../composables/useBarcodeValidator'
import { useBarcodeExporter } from '../composables/useBarcodeExporter'
import { useBarcodeCustomization } from '../composables/useBarcodeCustomization'
import ToolPageLayout from '../components/ToolPageLayout.vue'
import GiResultCard from '../components/GiResultCard.vue'

const { t } = useI18n()

// Initialize composables
const { state: validationState, validate } = useBarcodeValidator()
const { exportSvg, exportPng, exportJpeg, downloadBlob } = useBarcodeExporter()
const {
  settings,
  setBarColor,
  setDimensions,
  toggleShowText,
  toggleTransparentBackground,
  setExportFormat,
  reset,
} = useBarcodeCustomization()

// Local state
const inputCode = ref('400638133393')
const copied = ref(false)
const isExporting = ref(false)
const exportError = ref<string | null>(null)
const barcodeSvgContainer = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

// Preset colors (standard barcode colors, not brand-specific)
const presetColors = [
  { value: '#000000', name: 'black' },
  { value: '#1e3a5f', name: 'navy' },
  { value: '#8b0000', name: 'darkred' },
  { value: '#2f4f4f', name: 'darkslate' },
  { value: '#4a4a4a', name: 'darkgray' },
]

// Handle input changes
function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  const cleanValue = target.value.replace(/\D/g, '')
  inputCode.value = cleanValue.slice(0, 13)
  validate(inputCode.value)
}

// Watch for initial validation
watch(
  inputCode,
  () => {
    validate(inputCode.value)
  },
  { immediate: true }
)

const fullCode = computed(() => {
  if (inputCode.value.length === 12 && validationState.value.checksum !== null) {
    return inputCode.value + validationState.value.checksum
  }
  return inputCode.value
})

const errorMessage = computed(() => {
  if (!validationState.value.errorCode) return null
  return t(`barcode.validation.${validationState.value.errorCode}`)
})

const binary = computed(() => {
  try {
    if (fullCode.value.length === 13) {
      return generateEanBinary(fullCode.value)
    }
  } catch (e) {
    return ''
  }
  return ''
})

function isGuard(idx: number): boolean {
  // Start: 0,1,2 | Middle: 45,46,47,48,49 | End: 92,93,94
  if (idx < 3) return true
  if (idx >= 45 && idx <= 49) return true
  if (idx >= 92) return true
  return false
}

async function copyCode() {
  if (fullCode.value.length !== 13) return
  await navigator.clipboard.writeText(fullCode.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

async function downloadBarcode() {
  if (!barcodeSvgContainer.value || fullCode.value.length !== 13 || isExporting.value) return

  exportError.value = null

  const svgElement = barcodeSvgContainer.value.querySelector('svg')
  if (!svgElement) return

  const svgString = svgElement.outerHTML
  const filename = `barcode-${fullCode.value}`

  isExporting.value = true
  try {
    let blob: Blob
    let exportFilename: string

    switch (settings.value.exportFormat) {
      case 'svg':
        blob = await exportSvg(svgString)
        exportFilename = `${filename}.svg`
        break
      case 'png':
        blob = await exportPng(svgString, {
          scale: 2,
          transparent: settings.value.transparentBackground,
        })
        exportFilename = `${filename}.png`
        break
      case 'jpg':
        blob = await exportJpeg(svgString, { scale: 2, quality: 0.9 })
        exportFilename = `${filename}.jpg`
        break
      default:
        throw new Error('Unknown format')
    }

    downloadBlob(blob, exportFilename)
  } catch (error) {
    console.error('Export failed:', error)
    exportError.value = t('barcode.exportError')
  } finally {
    isExporting.value = false
  }
}
</script>

<style scoped>
.barcode-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--gi-space-lg);
}

@media (min-width: 768px) {
  .barcode-grid {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }

  .barcode-preview-column {
    position: sticky;
    top: var(--gi-space-lg);
  }
}

.barcode-controls {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-md);
}

/* Validation Messages */
.gi-validation-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--gi-font-size-xs);
  margin-top: var(--gi-space-xs);
}

/* Input States */
.gi-input-success {
  border-color: var(--gi-brand);
}

.gi-input-success:focus {
  border-color: var(--gi-brand);
  box-shadow: none;
}

.gi-input-error {
  border-color: var(--gi-error);
}

.gi-input-error:focus {
  border-color: var(--gi-error);
  box-shadow: none;
}

/* Customization Panel */
.barcode-customization {
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  padding: var(--gi-space-md);
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-md);
  background: var(--gi-surface);
}

.barcode-customization-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--gi-space-sm);
  border-bottom: 1px solid var(--gi-border);
}

.barcode-reset-btn {
  min-width: 44px;
  min-height: 44px;
  cursor: pointer;
}

.barcode-section-title {
  font-size: var(--gi-font-size-sm);
  font-weight: 600;
  color: var(--gi-text);
  margin: 0;
  padding-bottom: var(--gi-space-sm);
  border-bottom: 1px solid var(--gi-border);
}

/* Color Swatches */
.barcode-color-swatches {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.barcode-color-swatch {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--gi-radius-sm);
  border: 2px solid var(--gi-border);
  cursor: pointer;
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
}

.barcode-color-swatch:hover {
  transform: scale(1.1);
}

.barcode-color-swatch:active {
  transform: scale(0.95);
}

.barcode-color-swatch:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

.barcode-color-swatch.is-selected {
  border-color: var(--gi-brand);
  box-shadow: 0 0 0 2px var(--gi-brand-fade);
}

.barcode-color-picker {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--gi-radius-sm);
  border: 2px solid var(--gi-border);
  cursor: pointer;
  padding: 0;
  transition: transform var(--gi-transition-fast) var(--gi-ease-out);
}

.barcode-color-picker:hover {
  transform: scale(1.05);
}

.barcode-color-picker:active {
  transform: scale(0.95);
}

.barcode-color-picker:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

/* Sliders */
.barcode-slider-container {
  display: flex;
  align-items: center;
  gap: var(--gi-space-md);
}

.gi-slider {
  flex: 1;
  height: 4px;
  appearance: none;
  background: var(--gi-border);
  border-radius: var(--gi-radius-pill);
  cursor: pointer;
}

.gi-slider::-webkit-slider-thumb {
  appearance: none;
  width: 1.25rem;
  height: 1.25rem;
  background: var(--gi-brand);
  border-radius: var(--gi-radius-pill);
  cursor: pointer;
  transition: transform var(--gi-transition-fast) var(--gi-ease-out);
}

.gi-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.gi-slider::-webkit-slider-thumb:active {
  transform: scale(1.1);
}

.gi-slider:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

.gi-slider::-moz-range-thumb {
  width: 1.25rem;
  height: 1.25rem;
  background: var(--gi-brand);
  border: none;
  border-radius: var(--gi-radius-pill);
  cursor: pointer;
  transition: transform var(--gi-transition-fast) var(--gi-ease-out);
}

.gi-slider::-moz-range-thumb:hover {
  transform: scale(1.2);
}

.barcode-slider-value {
  min-width: 4rem;
  text-align: right;
  font-weight: 500;
  color: var(--gi-text);
  font-size: var(--gi-font-size-sm);
}

/* Size Presets */
.barcode-size-presets {
  display: flex;
  gap: 0.5rem;
  margin-top: var(--gi-space-xs);
}

.barcode-size-presets .gi-btn-ghost {
  cursor: pointer;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.barcode-size-presets .gi-btn-ghost:active {
  transform: scale(0.98);
}

/* Format Selector */
.barcode-format-selector {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.barcode-format-selector .gi-btn-ghost {
  cursor: pointer;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--gi-space-xs);
  font-weight: 500;
  font-size: var(--gi-font-size-sm);
  padding: var(--gi-space-xs) var(--gi-space-md);
}

.barcode-format-selector .gi-btn-ghost:active {
  transform: scale(0.98);
}

.barcode-format-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}

/* Checkbox Styling */
.gi-checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: var(--gi-space-sm);
  cursor: pointer;
  font-size: var(--gi-font-size-sm);
  min-height: 44px;
  padding: var(--gi-space-xs) 0;
}

.gi-checkbox-label input[type="checkbox"] {
  width: 1.125rem;
  height: 1.125rem;
  cursor: pointer;
  accent-color: var(--gi-brand);
}

.gi-checkbox-label input[type="checkbox"]:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

/* Reset Button */
.barcode-reset-btn {
  margin-top: var(--gi-space-sm);
  align-self: flex-start;
  cursor: pointer;
  min-height: 44px;
}

.barcode-reset-btn:active {
  transform: scale(0.98);
}

/* Preview Area */
.barcode-preview-area {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: var(--gi-space-lg);
}

.barcode-preview {
  padding: var(--gi-space-md);
  border-radius: var(--gi-radius-md);
  border: 1px solid var(--gi-border);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.barcode-preview svg {
  max-width: 100%;
  height: auto;
  display: block;
}

.barcode-placeholder {
  text-align: center;
  color: var(--gi-text-muted);
  padding: var(--gi-space-xl);
}

/* Export Actions */
.barcode-export-actions {
  display: flex;
  gap: var(--gi-space-sm);
  flex-wrap: wrap;
}

.barcode-export-actions .gi-btn {
  flex: 1;
  min-width: 120px;
  cursor: pointer;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--gi-space-xs);
}

.barcode-export-actions .gi-btn:active {
  transform: scale(0.98);
}

.barcode-export-actions .gi-btn-ghost {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.barcode-export-actions .gi-btn-ghost:active {
  transform: scale(0.98);
}

/* Disabled State */
.barcode-export-actions .gi-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Export Error */
.gi-export-error {
  margin-top: var(--gi-space-sm);
  font-size: var(--gi-font-size-xs);
}

/* Character Counter */
.barcode-char-counter {
  text-align: right;
  font-weight: 500;
  color: var(--gi-text-muted);
  font-size: var(--gi-font-size-xs);
}

/* Dark Mode Adjustments */
[data-theme='dark'] .barcode-preview {
  background: var(--gi-surface-elevated);
}

/* Responsive Improvements */
@media (max-width: 640px) {
  .barcode-grid {
    gap: var(--gi-space-md);
  }

  .barcode-preview-area {
    min-height: 150px;
    padding: var(--gi-space-md);
  }

  .barcode-export-actions {
    flex-direction: column;
  }

  .barcode-export-actions .gi-btn {
    min-width: 100%;
  }

  .barcode-color-swatches {
    gap: var(--gi-space-sm);
  }

  .barcode-size-presets {
    flex-wrap: wrap;
  }

  .barcode-format-selector {
    flex-wrap: wrap;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .barcode-color-swatch,
  .barcode-color-picker,
  .gi-slider::-webkit-slider-thumb,
  .barcode-size-presets .gi-btn-ghost,
  .barcode-format-selector .gi-btn-ghost,
  .barcode-export-actions .gi-btn,
  .barcode-export-actions .gi-btn-ghost,
  .barcode-reset-btn {
    transition: none !important;
    animation: none !important;
  }

  .gi-slider::-webkit-slider-thumb:hover,
  .gi-slider::-webkit-slider-thumb:active,
  .barcode-color-swatch:hover,
  .barcode-color-swatch:active,
  .barcode-color-picker:hover,
  .barcode-color-picker:active {
    transform: none !important;
  }

  .barcode-size-presets .gi-btn-ghost:active,
  .barcode-format-selector .gi-btn-ghost:active,
  .barcode-export-actions .gi-btn:active,
  .barcode-export-actions .gi-btn-ghost:active,
  .barcode-reset-btn:active {
    transform: none !important;
  }
}

/* Spinning Animation for Loader */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
