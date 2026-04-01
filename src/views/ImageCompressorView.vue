<template>
  <div>
    <div class="gi-tool-header">
      <h1>{{ t('imageCompressor.title') }}</h1>
      <p>{{ t('imageCompressor.desc') }}</p>
    </div>

    <!-- Upload Area -->
    <GiImageUpload
      @upload="handleImageUpload"
      @error="handleError"
    />

    <div v-if="originalUrl" style="margin-top: 2rem; display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
      <!-- Controls -->
      <div class="gi-field">
        <label class="gi-label">{{ t('imageCompressor.quality') }}: {{ (quality * 100).toFixed(0) }}%</label>
        <input v-model.number="quality" type="range" min="0.1" max="1" step="0.05" class="gi-input" @change="processImage" />

        <label class="gi-label" style="margin-top: 1rem">{{ t('imageCompressor.format') }}</label>
        <select v-model="format" class="gi-select" @change="processImage">
          <option value="image/jpeg">JPEG</option>
          <option value="image/webp">WebP</option>
          <option value="image/png">PNG (Lossless)</option>
        </select>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
          <div class="gi-field">
            <label class="gi-label">{{ t('imageCompressor.maxWidth') }}</label>
            <input v-model.number="maxWidth" type="number" class="gi-input" @change="processImage" />
          </div>
          <div class="gi-field">
            <label class="gi-label">{{ t('imageCompressor.maxHeight') }}</label>
            <input v-model.number="maxHeight" type="number" class="gi-input" @change="processImage" />
          </div>
        </div>
      </div>

      <!-- Stats & Download -->
      <div class="gi-result" style="margin-top: 0">
        <div class="gi-result-label">Stats</div>
        <div style="display: flex; flex-direction: column; gap: 0.5rem">
          <div style="display: flex; justify-content: space-between">
            <span>{{ t('imageCompressor.originalSize') }}:</span>
            <span style="font-weight: 700">{{ formatSize(originalSize) }}</span>
          </div>
          <div style="display: flex; justify-content: space-between">
            <span>{{ t('imageCompressor.compressedSize') }}:</span>
            <span style="font-weight: 700; color: var(--gi-text-brand)">{{ formatSize(compressedSize) }}</span>
          </div>
          <div style="display: flex; justify-content: space-between">
            <span>{{ t('imageCompressor.reduction') }}:</span>
            <span class="gi-status gi-status-ok">{{ reduction }}%</span>
          </div>
        </div>

        <button 
          class="gi-btn-primary" 
          style="width: 100%; margin-top: 1.5rem" 
          @click="downloadImage"
        >
          ⬇️ {{ t('imageCompressor.download') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import GiImageUpload from '../components/GiImageUpload.vue'
import { compressImage } from '../composables/useImageCompressor'

const { t } = useI18n()

const originalUrl = ref('')
const compressedUrl = ref('')
const originalSize = ref(0)
const compressedSize = ref(0)
const uploadError = ref('')

const quality = ref(0.8)
const format = ref('image/jpeg')
const maxWidth = ref<number | undefined>(undefined)
const maxHeight = ref<number | undefined>(undefined)

const reduction = computed(() => {
  if (!originalSize.value || !compressedSize.value) return 0
  const diff = originalSize.value - compressedSize.value
  return Math.max(0, Math.round((diff / originalSize.value) * 100))
})

function formatSize(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function handleImageUpload(file: File) {
  originalSize.value = file.size
  uploadError.value = ''
  const reader = new FileReader()
  reader.onload = (ev) => {
    originalUrl.value = ev.target?.result as string
    processImage()
  }
  reader.readAsDataURL(file)
}

function handleError(error: string) {
  uploadError.value = error
}

async function processImage() {
  if (!originalUrl.value) return
  
  try {
    const result = await compressImage(originalUrl.value, {
      quality: quality.value,
      format: format.value,
      maxWidth: maxWidth.value,
      maxHeight: maxHeight.value
    })
    
    compressedUrl.value = result
    // Estimate size from data URL (base64 is ~4/3 larger)
    const base64String = result.split(',')[1]
    compressedSize.value = Math.floor((base64String.length * 3) / 4)
  } catch (err) {
    console.error(err)
  }
}

function downloadImage() {
  const link = document.createElement('a')
  const ext = format.value.split('/')[1]
  link.download = `compressed-image.${ext}`
  link.href = compressedUrl.value
  link.click()
}
</script>
