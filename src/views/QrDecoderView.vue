<template>
  <div>
    <div class="gi-tool-header">
      <h1>{{ t('qrDecoder.title') }}</h1>
      <p>{{ t('qrDecoder.desc') }}</p>
    </div>

    <div class="gi-grid">
      <!-- Upload Area -->
      <div class="gi-field">
        <div v-if="!imageUrl" class="gi-result" style="border: 2px dashed var(--gi-border); cursor: pointer; text-align: center; padding: 4rem;" @click="fileInput?.click()">
          <p>📁 {{ t('qrDecoder.upload') }}</p>
          <input ref="fileInput" type="file" hidden accept="image/*" @change="handleFile" />
        </div>

        <div v-else>
          <button class="gi-btn-ghost" style="width: 100%; margin-bottom: 1.5rem" @click="reset">{{ t('imageCropper.reset') }}</button>
          
          <div v-if="decodedResult !== null" class="gi-field">
            <label class="gi-label">{{ t('qrDecoder.result') }}</label>
            <div class="gi-result" style="word-break: break-all; white-space: pre-wrap; font-family: monospace; background: var(--gi-surface-2);">
              {{ decodedResult }}
            </div>
            <button class="gi-btn" style="width: 100%; margin-top: 1rem" @click="copyResult">
              {{ t('qrDecoder.copy') }}
            </button>
          </div>
          <div v-else-if="analyzing" class="gi-text-muted" style="text-align: center; padding: 2rem;">
            Analyzing...
          </div>
          <div v-else class="gi-result" style="color: var(--gi-danger); text-align: center;">
            ⚠️ {{ t('qrDecoder.noQr') }}
          </div>
        </div>
      </div>

      <!-- Preview -->
      <div class="gi-result" style="margin-top: 0; display: flex; align-items: center; justify-content: center; background: #fafafa;">
        <img v-if="imageUrl" :src="imageUrl" class="preview-img" ref="previewImg" @load="performDecoding" />
        <p v-else class="gi-text-muted">{{ t('qrDecoder.upload') }}</p>
      </div>
    </div>

    <!-- Hidden Canvas for Pixel Data -->
    <canvas ref="hiddenCanvas" style="display: none;"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { decodeQrFromImageData } from '../composables/useQrDecoder'

const { t } = useI18n()

const fileInput = ref<HTMLInputElement | null>(null)
const hiddenCanvas = ref<HTMLCanvasElement | null>(null)
const previewImg = ref<HTMLImageElement | null>(null)
const imageUrl = ref('')
const decodedResult = ref<string | null>(null)
const analyzing = ref(false)

function handleFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  analyzing.value = true
  decodedResult.value = null
  const reader = new FileReader()
  reader.onload = (ev) => {
    imageUrl.value = ev.target?.result as string
  }
  reader.readAsDataURL(file)
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
  decodedResult.value = decodeQrFromImageData(imageData.data, canvas.width, canvas.height)
  analyzing.value = false
}

function copyResult() {
  if (!decodedResult.value) return
  navigator.clipboard.writeText(decodedResult.value)
  alert('Copied!')
}

function reset() {
  imageUrl.value = ''
  decodedResult.value = null
  analyzing.value = false
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<style scoped>
.preview-img {
  max-width: 100%;
  max-height: 50vh;
  border-radius: var(--gi-radius);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
</style>
