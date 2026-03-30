<template>
  <div>
    <div class="gi-tool-header">
      <h1>{{ t('barcode.title') }}</h1>
      <p>{{ t('barcode.desc') }}</p>
    </div>

    <div class="gi-grid">
      <!-- Controls -->
      <div class="gi-field">
        <label class="gi-label">{{ t('barcode.label') }}</label>
        <input 
          v-model="inputCode" 
          type="text" 
          class="gi-input" 
          maxlength="13"
          :placeholder="'4006381333931'"
          @input="validateInput"
        />
        
        <div v-if="checksum !== null && inputCode.length === 12" class="gi-hint" style="margin-top: 0.5rem">
          {{ t('barcode.checksum', { n: checksum }) }}
        </div>

        <div v-if="error" class="gi-text-error" style="margin-top: 0.5rem; font-size: 0.8rem">
          {{ error }}
        </div>

        <div style="margin-top: 1.5rem; display: flex; gap: 0.5rem;">
          <button class="gi-btn-ghost" style="flex: 1" @click="copyCode">
            {{ copied ? t('utmBuilder.copied') : t('barcode.copy') }}
          </button>
          <button class="gi-btn" style="flex: 1" @click="downloadSvg">
            {{ t('barcode.download') }}
          </button>
        </div>
      </div>

      <!-- Result Area -->
      <div class="gi-result" style="margin-top: 0; display: flex; align-items: center; justify-content: center; min-height: 200px; background: white;">
        <div v-if="binary" ref="barcodeSvgContainer" class="barcode-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="200"
            height="120"
            viewBox="0 0 95 60"
            preserveAspectRatio="xMidYMid meet"
          >
            <!-- Background -->
            <rect width="95" height="60" fill="white" />
            
            <!-- Bars -->
            <rect
              v-for="(bit, idx) in binary.split('')"
              :key="idx"
              :x="idx"
              y="0"
              width="1"
              :height="isGuard(idx) ? 55 : 50"
              :fill="bit === '1' ? 'black' : 'transparent'"
            />

            <!-- Text -->
            <text x="0" y="58" font-size="6" font-family="monospace">{{ fullCode[0] }}</text>
            <text x="25" y="58" font-size="6" font-family="monospace" text-anchor="middle">{{ fullCode.slice(1, 7) }}</text>
            <text x="70" y="58" font-size="6" font-family="monospace" text-anchor="middle">{{ fullCode.slice(7) }}</text>
          </svg>
        </div>
        <div v-else class="gi-text-muted">{{ t('barcode.invalid') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { calculateEanChecksum, generateEanBinary } from '../composables/useBarcode'

const { t } = useI18n()

const inputCode = ref('400638133393')
const error = ref('')
const copied = ref(false)
const barcodeSvgContainer = ref<HTMLElement | null>(null)

const checksum = computed(() => {
  if (inputCode.value.length === 12 && /^\d+$/.test(inputCode.value)) {
    return calculateEanChecksum(inputCode.value)
  }
  return null
})

const fullCode = computed(() => {
  if (inputCode.value.length === 12 && checksum.value !== null) {
    return inputCode.value + checksum.value
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

function validateInput() {
  inputCode.value = inputCode.value.replace(/\D/g, '')
  if (inputCode.value.length > 13) {
    inputCode.value = inputCode.value.slice(0, 13)
  }
}

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

function downloadSvg() {
  if (!barcodeSvgContainer.value) return
  const svgData = barcodeSvgContainer.value.querySelector('svg')?.outerHTML
  if (!svgData) return
  
  const blob = new Blob([svgData], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `barcode-${fullCode.value}.svg`
  link.click()
  URL.revokeObjectURL(url)
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
