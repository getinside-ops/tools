<template>
  <div>
    <router-link to="/" class="gi-back-link">{{ t('nav.back') }}</router-link>
    <div class="gi-tool-header">
      <h1>{{ t('qrDecoder.title') }}</h1>
      <p>{{ t('qrDecoder.desc') }}</p>
    </div>

    <!-- Paste Zone -->
    <div
      ref="pasteZone"
      class="gi-paste-zone"
      :class="{ 'gi-paste-zone-focus': isFocused }"
      tabindex="0"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @paste="onPaste"
      @click="focusPasteZone"
    >
      <div class="gi-paste-zone-content">
        <div class="gi-paste-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
          </svg>
        </div>
        <p class="gi-paste-title">{{ t('qrDecoder.pasteTitle') }}</p>
        <p class="gi-paste-hint">{{ t('qrDecoder.pasteHint') }}</p>
      </div>
    </div>

    <!-- Upload Zone -->
    <div class="gi-upload-zone" @click="fileInput?.click()" @dragover.prevent @drop.prevent="onDrop">
      <input ref="fileInput" type="file" hidden accept="image/*" @change="handleFile" />
      <span>{{ t('qrDecoder.upload') }}</span>
    </div>

    <!-- Loading State -->
    <div v-if="analyzing" class="gi-result gi-result-loading">
      <div class="gi-status gi-status-warning">{{ t('qrDecoder.decoding') }}</div>
    </div>

    <!-- Error State -->
    <div v-if="decodeError" class="gi-result gi-result-error">
      <div class="gi-status gi-status-error">{{ decodeError }}</div>
    </div>

    <!-- Result -->
    <div v-if="decodedResult !== null" class="gi-result">
      <div class="gi-result-label">{{ t('qrDecoder.resultTitle') }}</div>
      <div class="gi-qr-result">
        <div class="gi-qr-data">{{ decodedResult }}</div>
        <button class="gi-btn-ghost" @click="copyResult" :disabled="isCopying">
          {{ isCopying ? t('qrDecoder.copied') : t('qrDecoder.copy') }}
        </button>
      </div>
    </div>

    <!-- Preview Image -->
    <div v-if="imageUrl" class="gi-preview">
      <img :src="imageUrl" alt="QR Code preview" class="gi-preview-img" ref="previewImg" @load="performDecoding" />
    </div>

    <!-- Hidden Canvas for Pixel Data -->
    <canvas ref="hiddenCanvas" style="display: none;"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { decodeQrFromBlob, decodeQrFromImageData, decodeQrFromPasteEvent } from '../composables/useQrDecoder'

const { t } = useI18n()

const pasteZone = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const hiddenCanvas = ref<HTMLCanvasElement | null>(null)
const previewImg = ref<HTMLImageElement | null>(null)
const imageUrl = ref('')
const decodedResult = ref<string | null>(null)
const decodeError = ref<string | null>(null)
const analyzing = ref(false)
const isFocused = ref(false)
const isCopying = ref(false)

function focusPasteZone() {
  pasteZone.value?.focus()
}

async function onPaste(e: ClipboardEvent) {
  e.preventDefault()
  await processPasteEvent(e)
}

async function processPasteEvent(e: ClipboardEvent) {
  analyzing.value = true
  decodeError.value = null
  decodedResult.value = null
  imageUrl.value = ''
  
  const decodeResult = await decodeQrFromPasteEvent(e)
  analyzing.value = false
  
  if (decodeResult.success && decodeResult.data) {
    decodedResult.value = decodeResult.data
    // Create preview from first clipboard item
    const items = e.clipboardData?.items
    if (items) {
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const blob = item.getAsFile()
          if (blob) {
            imageUrl.value = URL.createObjectURL(blob)
          }
          break
        }
      }
    }
  } else {
    decodeError.value = decodeResult.error || t('qrDecoder.noQrFound')
  }
}

function onDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (file?.type.startsWith('image/')) {
    processBlob(file)
  }
}

function handleFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  processBlob(file)
}

async function processBlob(blob: Blob) {
  analyzing.value = true
  decodeError.value = null
  decodedResult.value = null
  
  // Create preview
  const url = URL.createObjectURL(blob)
  imageUrl.value = url
  
  const decodeResult = await decodeQrFromBlob(blob)
  
  if (!decodeResult.success) {
    decodeError.value = decodeResult.error || t('qrDecoder.noQrFound')
  }
  analyzing.value = false
}

function performDecoding() {
  if (!previewImg.value || !hiddenCanvas.value) return

  const canvas = hiddenCanvas.value
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return

  canvas.width = previewImg.value.naturalWidth
  canvas.height = previewImg.value.naturalHeight
  ctx.drawImage(previewImg.value, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = decodeQrFromImageData(imageData.data, canvas.width, canvas.height)
  
  if (data) {
    decodedResult.value = data
    decodeError.value = null
  } else {
    decodeError.value = t('qrDecoder.noQrFound')
  }
  analyzing.value = false
}

function copyResult() {
  if (!decodedResult.value) return
  isCopying.value = true
  navigator.clipboard.writeText(decodedResult.value)
  
  setTimeout(() => {
    isCopying.value = false
  }, 2000)
}
</script>

<style scoped>
.gi-back-link {
  display: inline-flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0.3rem 0.75rem;
  border: 1.5px solid var(--gi-border);
  border-radius: var(--gi-radius);
  font-size: 0.85rem;
  color: var(--gi-text-muted);
  text-decoration: none;
  transition: border-color 0.12s, color 0.12s;
}
.gi-back-link:hover { border-color: var(--gi-brand); color: var(--gi-brand); }

/* Paste Zone */
.gi-paste-zone {
  border: 2px dashed var(--gi-border);
  border-radius: var(--gi-radius-lg);
  padding: 2.5rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s, box-shadow 0.15s;
  margin-bottom: 1rem;
  outline: none;
}
.gi-paste-zone:hover {
  border-color: var(--gi-brand);
  background-color: var(--gi-tint-green-bg);
}
.gi-paste-zone-focus {
  border-color: var(--gi-brand);
  box-shadow: 0 0 0 3px rgba(10, 170, 142, 0.15);
}
.gi-paste-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}
.gi-paste-icon {
  color: var(--gi-brand);
  opacity: 0.8;
}
.gi-paste-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gi-text);
  margin: 0;
}
.gi-paste-hint {
  font-size: 0.85rem;
  color: var(--gi-text-muted);
  margin: 0;
}

/* Upload Zone */
.gi-upload-zone {
  border: 2px dashed var(--gi-border);
  border-radius: var(--gi-radius-lg);
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  color: var(--gi-text-muted);
  font-size: 0.9rem;
  transition: border-color 0.15s;
  margin-bottom: 1rem;
}
.gi-upload-zone:hover { border-color: var(--gi-brand); color: var(--gi-brand); }

/* Results */
.gi-result {
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  padding: 1.25rem;
  margin-bottom: 1rem;
}
.gi-result-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gi-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}
.gi-qr-result {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.gi-qr-data {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.9rem;
  background: var(--gi-tint-green-bg);
  padding: 1rem;
  border-radius: var(--gi-radius);
  border: 1px solid var(--gi-border);
  word-break: break-all;
  color: var(--gi-text);
}
.gi-btn-ghost {
  align-self: flex-start;
  padding: 0.5rem 1rem;
  border: 1.5px solid var(--gi-border);
  border-radius: var(--gi-radius);
  background: transparent;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  color: var(--gi-text-muted);
  font-family: inherit;
  transition: border-color 0.12s, color 0.12s, background-color 0.12s;
}
.gi-btn-ghost:hover:not(:disabled) {
  border-color: var(--gi-brand);
  color: var(--gi-brand);
  background: var(--gi-tint-green-bg);
}
.gi-btn-ghost:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Preview */
.gi-preview {
  margin-top: 1rem;
  text-align: center;
}
.gi-preview-img {
  max-width: 100%;
  max-height: 300px;
  border-radius: var(--gi-radius);
  border: 1px solid var(--gi-border);
}

/* Status messages */
.gi-status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--gi-radius);
  font-size: 0.85rem;
  font-weight: 500;
}
.gi-status-error {
  background: var(--gi-tint-red-bg);
  color: var(--gi-tint-red-text);
}
.gi-status-warning {
  background: var(--gi-tint-yellow-bg);
  color: var(--gi-tint-yellow-text);
}

.gi-grid {
  display: grid;
  gap: 1rem;
}
</style>
