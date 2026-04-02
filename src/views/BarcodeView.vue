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
              'gi-input-error': validationState.error && !validationState.isValid,
            }"
            @input="handleInput"
            maxlength="13"
          />

          <!-- Validation Feedback -->
          <div v-if="validationState.error" class="gi-text-error gi-validation-message">
            {{ validationState.error }}
          </div>
          <div v-else-if="validationState.country" class="gi-hint gi-validation-message">
            {{ t('barcode.country', { country: validationState.country, code: validationState.countryCode }) }}
          </div>

          <!-- Checksum Display -->
          <div v-if="validationState.checksum !== null" class="gi-hint">
            {{ t('barcode.checksum', { n: validationState.checksum }) }}
            <span v-if="validationState.checksumValid" class="gi-text-success"> ✓</span>
          </div>
        </div>

        <!-- Customization Accordion -->
        <div class="gi-accordion">
          <button
            class="gi-accordion-header"
            @click="showCustomization = !showCustomization"
            :aria-expanded="showCustomization"
          >
            <span>{{ t('barcode.customize') }}</span>
            <span class="gi-accordion-icon" :class="{ 'is-open': showCustomization }">▼</span>
          </button>

          <div v-show="showCustomization" class="gi-accordion-content">
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
                  @input="(e) => setDimensions({ width: settings.width, height: Number((e.target as HTMLInputElement).value) })"
                />
                <span class="barcode-slider-value">{{ settings.height }} px</span>
              </div>
            </div>

            <!-- Toggle Options -->
            <div class="gi-field">
              <label class="gi-checkbox">
                <input
                  type="checkbox"
                  :checked="settings.showText"
                  @change="toggleShowText"
                />
                <span>{{ t('barcode.showText') }}</span>
              </label>
            </div>

            <div class="gi-field">
              <label class="gi-checkbox">
                <input
                  type="checkbox"
                  :checked="settings.transparentBackground"
                  @change="toggleTransparentBackground"
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
                  SVG {{ t('barcode.format.vector') }}
                </button>
                <button
                  class="gi-btn-ghost"
                  :class="{ 'is-active': settings.exportFormat === 'png' }"
                  @click="setExportFormat('png')"
                >
                  PNG {{ t('barcode.format.raster') }}
                </button>
                <button
                  class="gi-btn-ghost"
                  :class="{ 'is-active': settings.exportFormat === 'jpg' }"
                  @click="setExportFormat('jpg')"
                >
                  JPG {{ t('barcode.format.photo') }}
                </button>
              </div>
            </div>

            <!-- Reset Button -->
            <button class="gi-btn-ghost gi-btn-sm barcode-reset-btn" @click="reset">
              {{ t('barcode.reset') }}
            </button>
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
                {{ copied ? t('barcode.copied') : t('barcode.copy') }}
              </button>
              <button class="gi-btn" @click="downloadBarcode">
                {{ t('barcode.download', { format: settings.exportFormat.toUpperCase() }) }}
              </button>
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
import { Barcode } from 'lucide-vue-next'
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
const showCustomization = ref(false)
const barcodeSvgContainer = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

// Preset colors
const presetColors = [
  { value: '#000000', name: 'black' },
  { value: '#666666', name: 'gray' },
  { value: '#0aaa8e', name: 'brand' },
  { value: '#1a1a1a', name: 'dark' },
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
  if (!barcodeSvgContainer.value || fullCode.value.length !== 13) return

  const svgElement = barcodeSvgContainer.value.querySelector('svg')
  if (!svgElement) return

  const svgString = svgElement.outerHTML
  const filename = `barcode-${fullCode.value}`

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
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

/* Input States */
.gi-input-success {
  border-color: var(--gi-success);
}

.gi-input-success:focus {
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

.gi-input-error {
  border-color: var(--gi-error);
}

.gi-input-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

/* Accordion */
.gi-accordion {
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  overflow: hidden;
}

.gi-accordion-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--gi-space-md);
  background: var(--gi-surface);
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background var(--gi-transition-fast) var(--gi-ease-out);
}

.gi-accordion-header:hover {
  background: var(--gi-surface-hover);
}

.gi-accordion-icon {
  transition: transform var(--gi-transition-base) var(--gi-ease-out);
}

.gi-accordion-icon.is-open {
  transform: rotate(180deg);
}

.gi-accordion-content {
  padding: var(--gi-space-md);
  border-top: 1px solid var(--gi-border);
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-md);
}

/* Color Swatches */
.barcode-color-swatches {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.barcode-color-swatch {
  width: 2rem;
  height: 2rem;
  border-radius: var(--gi-radius-sm);
  border: 2px solid var(--gi-border);
  cursor: pointer;
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
}

.barcode-color-swatch:hover {
  transform: scale(1.1);
}

.barcode-color-swatch.is-selected {
  border-color: var(--gi-brand);
  box-shadow: 0 0 0 2px var(--gi-brand-fade);
}

.barcode-color-picker {
  width: 2rem;
  height: 2rem;
  border-radius: var(--gi-radius-sm);
  border: 2px solid var(--gi-border);
  cursor: pointer;
  padding: 0;
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
  width: 1rem;
  height: 1rem;
  background: var(--gi-brand);
  border-radius: var(--gi-radius-pill);
  cursor: pointer;
  transition: transform var(--gi-transition-fast) var(--gi-ease-out);
}

.gi-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.barcode-slider-value {
  min-width: 4rem;
  text-align: right;
  font-weight: 500;
  color: var(--gi-text);
}

/* Size Presets */
.barcode-size-presets {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

/* Format Selector */
.barcode-format-selector {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Reset Button */
.barcode-reset-btn {
  margin-top: var(--gi-space-sm);
  align-self: flex-start;
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
}

.barcode-placeholder {
  text-align: center;
  color: var(--gi-text-muted);
}

/* Export Actions */
.barcode-export-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.barcode-export-actions .gi-btn {
  flex: 1;
  min-width: 120px;
}

/* Dark Mode Adjustments */
[data-theme='dark'] .barcode-preview {
  background: var(--gi-surface-elevated);
}

/* Focus States */
.barcode-color-swatch:focus-visible,
.barcode-color-picker:focus-visible,
.gi-slider:focus-visible,
.gi-accordion-header:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}
</style>
