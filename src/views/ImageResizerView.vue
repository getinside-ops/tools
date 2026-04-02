<template>
  <ToolPageLayout
    :title="t('imageResizer.title')"
    :description="t('imageResizer.desc')"
    category="design"
  >
    <template #icon>
      <Maximize2 :size="24" />
    </template>

    <GiImageUpload
      v-if="!originalUrl"
      @upload="handleImageUpload"
      @error="handleError"
    />

    <div v-else class="gi-grid">
      <!-- Controls -->
      <div class="gi-field">
        <label class="gi-label">{{ t('imageResizer.preserveRatio') }}</label>
        <div class="resizer-ratio-toggle">
          <input id="ratio-toggle" v-model="preserveAspectRatio" type="checkbox" />
          <label for="ratio-toggle" style="cursor: pointer">Auto</label>
        </div>

        <div class="resizer-dimensions">
          <GiFormField
            :label="t('imageResizer.width')"
            type="number"
            :model-value="width"
            @update:model-value="width = Number($event); onWidthInput()"
          />
          <GiFormField
            :label="t('imageResizer.height')"
            type="number"
            :model-value="height"
            @update:model-value="height = Number($event); onHeightInput()"
          />
        </div>

        <div class="gi-field">
          <label class="gi-label">{{ t('imageResizer.percentage') }}: {{ percentage }}%</label>
          <input v-model.number="percentage" type="range" min="1" max="200" class="gi-input" @input="onPercentageInput" />
        </div>

        <button class="gi-btn-primary resizer-btn-full" @click="handleResize">{{ t('imageResizer.resize') }}</button>
      </div>

      <!-- Preview -->
      <GiResultCard title="Preview">
        <div class="resizer-preview-area">
          <img :src="originalUrl" class="resizer-preview-img" />
          <div class="resizer-preview-dims">
            {{ originalWidth }} x {{ originalHeight }}
          </div>
        </div>
      </GiResultCard>
    </div>

    <!-- Result -->
    <GiResultCard v-if="resizedUrl" :title="`Result (${width} x ${height})`">
      <img :src="resizedUrl" class="resizer-result-img" />
      <template #actions>
        <button class="gi-btn-primary" @click="downloadResized">⬇️ {{ t('imageResizer.download') }}</button>
      </template>
    </GiResultCard>

    <template #about>{{ t('imageResizer.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Maximize2 } from 'lucide-vue-next'
import { resizeImage } from '../composables/useImageResizer'
import GiImageUpload from '../components/GiImageUpload.vue'
import GiFormField from '../components/GiFormField.vue'
import GiResultCard from '../components/GiResultCard.vue'
import ToolPageLayout from '../components/ToolPageLayout.vue'

const { t } = useI18n()

const originalUrl = ref('')
const resizedUrl = ref('')
const originalWidth = ref(0)
const originalHeight = ref(0)

const width = ref(0)
const height = ref(0)
const percentage = ref(100)
const preserveAspectRatio = ref(true)

function handleImageUpload(file: File) {
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

function handleError(error: string) {
  console.error(error)
  alert(error)
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

<style scoped>
.resizer-ratio-toggle {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.resizer-dimensions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.resizer-btn-full {
  width: 100%;
  margin-top: 1rem;
}

.resizer-preview-area {
  background: var(--gi-bg);
  border-radius: var(--gi-radius-md);
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  position: relative;
}

.resizer-preview-img {
  max-width: 100%;
  opacity: 0.5;
}

.resizer-preview-dims {
  position: absolute;
  color: var(--gi-text-inverse);
  background: rgba(0, 0, 0, 0.7);
  padding: 0.5rem;
  border-radius: 4px;
  pointer-events: none;
  font-size: 0.875rem;
}

.resizer-result-img {
  max-width: 100%;
  border-radius: var(--gi-radius-md);
  margin-bottom: 1rem;
}
</style>
