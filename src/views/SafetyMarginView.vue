<template>
  <ToolPageLayout :title="t('safetyMargin.title')" :description="t('safetyMargin.desc')">
    <template #icon>
      <Ruler />
    </template>

    <div class="gi-grid">
      <!-- Controls -->
      <div class="gi-field">
        <!-- Upload -->
        <GiImageUpload
          v-if="!imageUrl"
          @upload="handleImageUpload"
          @error="handleError"
        />

        <div v-else class="gi-field">
          <button class="gi-btn-ghost" style="width: 100%; margin-bottom: 1.5rem" @click="reset">{{ t('imageCropper.reset') }}</button>

          <GiFormField
            :label="t('safetyMargin.dpi')"
            type="number"
            :model-value="dpi"
            @update:model-value="dpi = Number($event)"
            placeholder="300"
            min="72"
            max="1200"
          />

          <GiFormField
            :label="`${t('safetyMargin.bleed')} (mm)`"
            type="number"
            :model-value="bleedMm"
            @update:model-value="bleedMm = Number($event)"
            step="0.1"
          />

          <GiFormField
            :label="`${t('safetyMargin.safety')} (mm)`"
            type="number"
            :model-value="safetyMm"
            @update:model-value="safetyMm = Number($event)"
            step="0.1"
          />

          <div class="margin-legend">
            <div class="legend-item">
              <span class="dot bleed"></span>
              <span>{{ t('safetyMargin.legend.bleed') }} ({{ bleedMm }}mm)</span>
            </div>
            <div class="legend-item">
              <span class="dot safety"></span>
              <span>{{ t('safetyMargin.legend.safety') }} ({{ safetyMm }}mm)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview Area -->
      <div v-if="imageUrl" class="gi-result" style="margin-top: 0; display: flex; justify-content: center; align-items: flex-start; overflow: auto; background: var(--gi-bg-soft); padding: 2rem;">
        <div class="preview-container" :style="containerStyle">
          <img :src="imageUrl" class="preview-img" ref="previewImg" @load="updateImageSize" />

          <!-- Bleed Overlay -->
          <div class="overlay-bleed" :style="bleedStyle"></div>
          <!-- Safety Overlay -->
          <div class="overlay-safety" :style="safetyStyle"></div>
        </div>
      </div>
      <div v-else class="gi-result" style="margin-top: 0; display: flex; align-items: center; justify-content: center; color: var(--gi-text-muted);">
        {{ t('safetyMargin.upload') }}
      </div>
    </div>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { Ruler } from 'lucide-vue-next'
import { mmToPx, DEFAULT_BLEED_MM, DEFAULT_SAFETY_MM } from '../composables/useSafetyMargin'
import GiImageUpload from '../components/GiImageUpload.vue'
import GiFormField from '../components/GiFormField.vue'
import ToolPageLayout from '../components/ToolPageLayout.vue'

const { t } = useI18n()

const imageUrl = ref('')
const dpi = ref(300)
const bleedMm = ref(DEFAULT_BLEED_MM)
const safetyMm = ref(DEFAULT_SAFETY_MM)
const imgSize = reactive({ width: 0, height: 0 })
const previewImg = ref<HTMLImageElement | null>(null)
const uploadError = ref('')

function handleImageUpload(file: File) {
  uploadError.value = ''
  const reader = new FileReader()
  reader.onload = (ev) => {
    imageUrl.value = ev.target?.result as string
  }
  reader.readAsDataURL(file)
}

function handleError(error: string) {
  uploadError.value = error
}

function updateImageSize() {
  if (previewImg.value) {
    imgSize.width = previewImg.value.naturalWidth
    imgSize.height = previewImg.value.naturalHeight
  }
}

function reset() {
  imageUrl.value = ''
  uploadError.value = ''
}

const bleedPx = computed(() => mmToPx(bleedMm.value, dpi.value))
const safetyPx = computed(() => mmToPx(safetyMm.value, dpi.value))

const containerStyle = computed(() => ({
  width: 'max-content',
  height: 'max-content',
  position: 'relative' as const
}))

const bleedStyle = computed(() => ({
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  border: `${bleedPx.value}px solid rgba(255, 0, 0, 0.3)`,
  pointerEvents: 'none' as const,
  boxSizing: 'border-box' as const
}))

const safetyStyle = computed(() => {
  const offsetValue = bleedPx.value + safetyPx.value
  return {
    position: 'absolute' as const,
    top: `${offsetValue}px`,
    left: `${offsetValue}px`,
    right: `${offsetValue}px`,
    bottom: `${offsetValue}px`,
    border: `1.5px dashed rgba(0, 120, 255, 0.6)`,
    pointerEvents: 'none' as const,
    boxSizing: 'border-box' as const
  }
})
</script>

<style scoped>
.preview-container {
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  background: white;
}
.preview-img {
  display: block;
  max-width: 100%;
  height: auto;
}

.margin-legend {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--gi-surface-2);
  border-radius: var(--gi-radius);
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.dot.bleed { background: rgba(255, 0, 0, 0.5); }
.dot.safety { border: 1.5px dashed rgba(0, 120, 255, 0.8); background: transparent; }
</style>
