<template>
  <div>
    <div class="gi-tool-header">
      <h1>{{ t('imageResizer.title') }}</h1>
      <p>{{ t('imageResizer.desc') }}</p>
    </div>

    <!-- Upload Area -->
    <div v-if="!originalUrl" class="gi-result" style="border: 2px dashed var(--gi-border); cursor: pointer; text-align: center; padding: 3rem;" @click="fileInput?.click()">
      <p>📁 {{ t('imageCropper.select') }}</p>
      <input ref="fileInput" type="file" hidden accept="image/*" @change="handleFileChange" />
    </div>

    <div v-else class="gi-grid">
      <!-- Controls -->
      <div class="gi-field">
        <label class="gi-label">{{ t('imageResizer.preserveRatio') }}</label>
        <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 1.5rem">
          <input id="ratio-toggle" v-model="preserveAspectRatio" type="checkbox" />
          <label for="ratio-toggle" style="cursor: pointer">Auto</label>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div class="gi-field">
            <label class="gi-label">{{ t('imageResizer.width') }}</label>
            <input v-model.number="width" type="number" class="gi-input" @input="onWidthInput" />
          </div>
          <div class="gi-field">
            <label class="gi-label">{{ t('imageResizer.height') }}</label>
            <input v-model.number="height" type="number" class="gi-input" @input="onHeightInput" />
          </div>
        </div>

        <div class="gi-field">
          <label class="gi-label">{{ t('imageResizer.percentage') }}: {{ percentage }}%</label>
          <input v-model.number="percentage" type="range" min="1" max="200" class="gi-input" @input="onPercentageInput" />
        </div>

        <button class="gi-btn-primary" style="width: 100%; margin-top: 1rem" @click="handleResize">{{ t('imageResizer.resize') }}</button>
      </div>

      <!-- Preview -->
      <div class="gi-result" style="margin-top: 0">
        <div class="gi-result-label">Preview</div>
        <div style="background: var(--gi-bg); border-radius: var(--gi-radius); overflow: auto; display: flex; justify-content: center; align-items: center; min-height: 200px;">
          <img :src="originalUrl" style="max-width: 100%; opacity: 0.5" />
          <div style="position: absolute; color: var(--gi-text); background: rgba(0,0,0,0.7); padding: 0.5rem; border-radius: 4px; pointer-events: none;">
            {{ originalWidth }} x {{ originalHeight }}
          </div>
        </div>
      </div>
    </div>

    <!-- Result Result -->
    <div v-if="resizedUrl" class="gi-result" style="margin-top: 2rem;">
      <div class="gi-result-label">Result ({{ width }} x {{ height }})</div>
      <img :src="resizedUrl" style="max-width: 100%; border-radius: var(--gi-radius); margin-bottom: 1rem;" />
      <button class="gi-btn-primary" @click="downloadResized">⬇️ {{ t('imageResizer.download') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { resizeImage } from '../composables/useImageResizer'

const { t } = useI18n()

const fileInput = ref<HTMLInputElement | null>(null)
const originalUrl = ref('')
const resizedUrl = ref('')
const originalWidth = ref(0)
const originalHeight = ref(0)

const width = ref(0)
const height = ref(0)
const percentage = ref(100)
const preserveAspectRatio = ref(true)

function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    originalUrl.value = ev.target?.result as string
    const img = new Image()
    img.onload = () => {
      originalWidth.value = img.width
      originalHeight.value = img.height
      width.value = img.width
      height.value = img.height
      percentage.value = 100
      resizedUrl.value = ''
    }
    img.src = originalUrl.value
  }
  reader.readAsDataURL(file)
}

function onWidthInput() {
  if (preserveAspectRatio.value && originalWidth.value) {
    const ratio = originalWidth.value / originalHeight.value
    height.value = Math.round(width.value / ratio)
  }
}

function onHeightInput() {
  if (preserveAspectRatio.value && originalHeight.value) {
    const ratio = originalWidth.value / originalHeight.value
    width.value = Math.round(height.value * ratio)
  }
}

function onPercentageInput() {
  width.value = Math.round(originalWidth.value * (percentage.value / 100))
  height.value = Math.round(originalHeight.value * (percentage.value / 100))
}

async function handleResize() {
  if (!originalUrl.value) return
  try {
    const result = await resizeImage(originalUrl.value, {
      width: width.value,
      height: height.value,
      preserveAspectRatio: preserveAspectRatio.value
    })
    resizedUrl.value = result
  } catch (err) {
    alert(err)
  }
}

function downloadResized() {
  const link = document.createElement('a')
  link.download = 'resized-image.png'
  link.href = resizedUrl.value
  link.click()
}
</script>
