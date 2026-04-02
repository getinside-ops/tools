<template>
  <ToolPageLayout
    :title="t('qrDecoder.title')"
    :description="t('qrDecoder.desc')"
    category="digital"
  >
    <template #icon>
      <QrCode :size="24" />
    </template>

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
    <GiImageUpload
      :paste-zone="false"
      :upload-text="t('qrDecoder.upload')"
      @upload="handleUpload"
      @error="handleUploadError"
    />

    <!-- Preview Image -->
    <div v-if="imageUrl" class="gi-preview-section">
      <div class="gi-preview-header">
        <span class="gi-preview-label">{{ t('qrDecoder.preview') }}</span>
        <button class="gi-btn-ghost gi-btn-sm" @click="reset">Clear</button>
      </div>
      <div class="gi-preview-container">
        <img :src="imageUrl" alt="QR Code preview" class="gi-preview-img" ref="previewImg" @load="performDecoding" />
      </div>
    </div>

    <!-- Loading State -->
    <GiResultCard v-if="analyzing" variant="warning" :title="t('qrDecoder.decoding')">
      <p>{{ t('qrDecoder.decoding') }}</p>
    </GiResultCard>

    <!-- Error State -->
    <GiResultCard v-if="decodeError" variant="error" :title="t('qrDecoder.noQrFound')">
      <p>{{ decodeError }}</p>
    </GiResultCard>

    <!-- Result -->
    <GiResultCard v-if="decodedResult !== null" :title="t('qrDecoder.resultTitle')">
      <div class="gi-qr-data">{{ decodedResult }}</div>
      <div class="gi-qr-actions">
        <button class="gi-btn-ghost" @click="copyResult" :disabled="isCopying">
          {{ isCopying ? t('qrDecoder.copied') : t('qrDecoder.copy') }}
        </button>
      </div>
    </GiResultCard>

    <!-- Hidden Canvas for Pixel Data -->
    <canvas ref="hiddenCanvas" style="display: none;"></canvas>

    <template #about>{{ t('qrDecoder.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { QrCode } from 'lucide-vue-next'
import ToolPageLayout from '../components/ToolPageLayout.vue'
import GiImageUpload from '../components/GiImageUpload.vue'
import GiResultCard from '../components/GiResultCard.vue'
import { decodeQrFromBlob, decodeQrFromImageData, decodeQrFromPasteEvent } from '../composables/useQrDecoder'

const { t } = useI18n()

const pasteZone = ref<HTMLElement | null>(null)
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
            // Decode from the loaded image for better accuracy
            performDecodingFromBlob(blob)
          }
          break
        }
      }
    }
  } else {
    decodeError.value = decodeResult.error || t('qrDecoder.noQrFound')
  }
}

function handleUpload(file: File) {
  processBlob(file)
}

function handleUploadError(error: string) {
  decodeError.value = error
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

async function performDecodingFromBlob(blob: Blob) {
  const decodeResult = await decodeQrFromBlob(blob)
  if (decodeResult.success && decodeResult.data) {
    decodedResult.value = decodeResult.data
    decodeError.value = null
  } else {
    decodeError.value = decodeResult.error || t('qrDecoder.noQrFound')
  }
}

function reset() {
  imageUrl.value = ''
  decodedResult.value = null
  decodeError.value = null
  analyzing.value = false
}
</script>

<style scoped>
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

/* QR Result */
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
.gi-qr-actions {
  display: flex;
  gap: var(--gi-space-sm);
  margin-top: var(--gi-space-md);
  padding-top: var(--gi-space-sm);
  border-top: 1px solid var(--gi-border);
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
.gi-preview-section {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}
.gi-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.gi-preview-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gi-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.gi-btn-sm {
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
}
.gi-preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  padding: 1rem;
}
.gi-preview-img {
  max-width: 100%;
  max-height: 400px;
  border-radius: var(--gi-radius);
  display: block;
}

.gi-grid {
  display: grid;
  gap: 1rem;
}
</style>
