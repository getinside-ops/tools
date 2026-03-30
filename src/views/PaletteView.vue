<template>
  <div>
    <div class="gi-tool-header">
      <h1>{{ t('palette.title') }}</h1>
      <p>{{ t('palette.desc') }}</p>
    </div>

    <div class="gi-grid">
      <!-- Upload Area -->
      <div class="gi-field">
        <div v-if="!imageUrl" class="gi-result" style="border: 2px dashed var(--gi-border); cursor: pointer; text-align: center; padding: 4rem;" @click="fileInput?.click()">
          <p>📁 {{ t('palette.upload') }}</p>
          <input ref="fileInput" type="file" hidden accept="image/*" @change="handleFile" />
        </div>

        <div v-else>
          <button class="gi-btn-ghost" style="width: 100%; margin-bottom: 2rem" @click="reset">{{ t('imageCropper.reset') }}</button>
          
          <div v-if="extractedColors.length > 0">
            <h3 class="gi-label" style="margin-bottom: 1rem">{{ t('palette.colors') }}</h3>
            <div class="palette-grid">
              <div 
                v-for="color in extractedColors" 
                :key="color"
                class="color-card"
                @click="copyColor(color)"
              >
                <div class="color-swatch" :style="{ backgroundColor: color }"></div>
                <div class="color-info">
                  <span class="color-hex">{{ color }}</span>
                  <span v-if="copiedColor === color" class="copied-badge">{{ t('palette.copy') }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="gi-text-muted" style="text-align: center; padding: 2rem;">
            Extracting colors...
          </div>
        </div>
      </div>

      <!-- Preview Image -->
      <div class="gi-result" style="margin-top: 0; display: flex; align-items: center; justify-content: center; background: #fafafa;">
        <img v-if="imageUrl" :src="imageUrl" class="preview-img" ref="previewImg" @load="performExtraction" />
        <p v-else class="gi-text-muted">{{ t('palette.upload') }}</p>
      </div>
    </div>

    <!-- Hidden Canvas -->
    <canvas ref="hiddenCanvas" style="display: none;"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { extractDominantColors } from '../composables/usePalette'

const { t } = useI18n()

const fileInput = ref<HTMLInputElement | null>(null)
const hiddenCanvas = ref<HTMLCanvasElement | null>(null)
const previewImg = ref<HTMLImageElement | null>(null)
const imageUrl = ref('')
const extractedColors = ref<string[]>([])
const copiedColor = ref('')

function handleFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  extractedColors.value = []
  const reader = new FileReader()
  reader.onload = (ev) => {
    imageUrl.value = ev.target?.result as string
  }
  reader.readAsDataURL(file)
}

function performExtraction() {
  if (!previewImg.value || !hiddenCanvas.value) return

  const canvas = hiddenCanvas.value
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return

  // Resize canvas to a small manageable size for extraction if needed, 
  // but here we just draw the natural size
  canvas.width = previewImg.value.naturalWidth
  canvas.height = previewImg.value.naturalHeight
  ctx.drawImage(previewImg.value, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  extractedColors.value = extractDominantColors(imageData.data, canvas.width, canvas.height, 8)
}

function copyColor(color: string) {
  navigator.clipboard.writeText(color)
  copiedColor.value = color
  setTimeout(() => {
    if (copiedColor.value === color) copiedColor.value = ''
  }, 2000)
}

function reset() {
  imageUrl.value = ''
  extractedColors.value = []
  copiedColor.value = ''
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<style scoped>
.palette-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}
.color-card {
  background: var(--gi-surface-2);
  border-radius: var(--gi-radius);
  border: 1px solid var(--gi-border);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}
.color-card:hover {
  transform: translateY(-4px);
  border-color: var(--gi-brand);
}
.color-swatch {
  height: 80px;
  width: 100%;
}
.color-info {
  padding: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.color-hex {
  font-family: monospace;
  font-weight: 600;
  font-size: 0.9rem;
}
.copied-badge {
  font-size: 0.7rem;
  background: var(--gi-brand);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
}
.preview-img {
  max-width: 100%;
  max-height: 50vh;
  border-radius: var(--gi-radius);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
</style>
