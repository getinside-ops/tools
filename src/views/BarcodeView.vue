<template>
  <ToolPageLayout :title="t('barcode.title')" :description="t('barcode.desc')">
    <template #icon>
      <Barcode />
    </template>

    <div class="gi-grid">
      <!-- Controls -->
      <div class="gi-field">
        <label class="gi-label" for="barcode-input">
          {{ t('barcode.label') }}
        </label>
        <input
          id="barcode-input"
          v-model="inputCode"
          type="text"
          :placeholder="t('barcode.placeholder')"
          class="gi-input"
          :class="{
            'gi-input-success': validationState.isValid,
            'gi-input-error': validationState.error && !validationState.isValid,
          }"
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

      <!-- Result Area -->
      <GiResultCard :title="t('barcode.preview')">
        <div style="display: flex; align-items: center; justify-content: center; min-height: 200px;">
          <div v-if="binary" ref="barcodeSvgContainer" class="barcode-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              :width="settings.width"
              :height="settings.height + 20"
              :viewBox="`0 0 95 ${60 + 20}`"
              preserveAspectRatio="xMidYMid meet"
            >
              <!-- Background -->
              <rect width="95" :height="60 + 20" fill="white" />

              <!-- Bars -->
              <rect
                v-for="(bit, idx) in binary.split('')"
                :key="idx"
                :x="idx"
                y="0"
                width="1"
                :height="isGuard(idx) ? 55 : 50"
                :fill="bit === '1' ? settings.barColor : 'transparent'"
              />

              <!-- Text -->
              <text v-if="settings.showText" x="0" y="58" font-size="6" font-family="monospace" :fill="settings.barColor">{{ fullCode[0] }}</text>
              <text v-if="settings.showText" x="25" y="58" font-size="6" font-family="monospace" text-anchor="middle" :fill="settings.barColor">{{ fullCode.slice(1, 7) }}</text>
              <text v-if="settings.showText" x="70" y="58" font-size="6" font-family="monospace" text-anchor="middle" :fill="settings.barColor">{{ fullCode.slice(7) }}</text>
            </svg>
          </div>
          <div v-else class="gi-text-muted">{{ t('barcode.invalid') }}</div>
        </div>
        <template #actions>
          <button class="gi-btn-ghost" style="flex: 1" @click="copyCode">
            {{ copied ? t('utmBuilder.copied') : t('barcode.copy') }}
          </button>
          <button class="gi-btn" style="flex: 1" @click="downloadBarcode">
            {{ t('barcode.download') }}
          </button>
        </template>
      </GiResultCard>
    </div>
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
const { settings } = useBarcodeCustomization()

// Local state
const inputCode = ref('400638133393')
const copied = ref(false)
const barcodeSvgContainer = ref<HTMLElement | null>(null)

// Watch for input changes and validate
watch(inputCode, () => {
  inputCode.value = inputCode.value.replace(/\D/g, '')
  if (inputCode.value.length > 13) {
    inputCode.value = inputCode.value.slice(0, 13)
  }
  validate(inputCode.value)
})

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
  await navigator.clipboard.writeText(fullCode.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

async function downloadBarcode() {
  if (!barcodeSvgContainer.value) return
  const svgElement = barcodeSvgContainer.value.querySelector('svg')
  if (!svgElement) return

  const svgData = svgElement.outerHTML
  const filename = `barcode-${fullCode.value}`

  try {
    if (settings.value.exportFormat === 'svg') {
      const blob = await exportSvg(svgData)
      downloadBlob(blob, `${filename}.svg`)
    } else if (settings.value.exportFormat === 'png') {
      const blob = await exportPng(svgData, {
        scale: 2,
        transparent: settings.value.transparentBackground,
      })
      downloadBlob(blob, `${filename}.png`)
    } else if (settings.value.exportFormat === 'jpg') {
      const blob = await exportJpeg(svgData, { scale: 2, quality: 0.9 })
      downloadBlob(blob, `${filename}.jpg`)
    }
  } catch (error) {
    console.error('Export failed:', error)
  }
}
</script>

<style scoped>
.barcode-container {
  padding: 1rem;
  background: white;
  border-radius: var(--gi-radius);
  border: 1px solid var(--gi-border);
}
.barcode-container svg {
  display: block;
}
</style>
