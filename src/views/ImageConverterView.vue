<template>
  <div>
    <div class="gi-tool-header">
      <h1>{{ t('imageConverter.title') }}</h1>
      <p>{{ t('imageConverter.desc') }}</p>
    </div>

    <div class="gi-grid">
      <!-- Upload / Params -->
      <div class="gi-field">
        <div v-if="!sourceUrl">
          <GiImageUpload
            @upload="handleImageUpload"
            :accept="['image/png', 'image/jpeg', 'image/webp', 'image/gif']"
          />
        </div>

        <div v-else>
          <button class="gi-btn-ghost" style="width: 100%; margin-bottom: 1.5rem" @click="reset">{{ t('imageCropper.reset') }}</button>
          
          <div class="gi-hint" style="margin-bottom: 1rem">
            {{ t('imageConverter.inputFormat', { f: sourceMime.split('/')[1].toUpperCase() }) }}
          </div>

          <div class="gi-field">
            <label class="gi-label">{{ t('imageConverter.outputFormat') }}</label>
            <div class="format-selector">
              <button 
                v-for="fmt in availableFormats" 
                :key="fmt"
                class="gi-btn-ghost"
                :class="{ active: targetMime === fmt }"
                @click="targetMime = fmt"
              >
                {{ fmt.split('/')[1].toUpperCase() }}
              </button>
            </div>
          </div>

          <div class="gi-field">
            <label class="gi-label">{{ t('imageConverter.quality') }} ({{ Math.round(quality * 100) }}%)</label>
            <input v-model.number="quality" type="range" min="0.1" max="1" step="0.05" class="gi-input" />
          </div>

          <div class="gi-field">
            <label class="gi-label">{{ t('imageConverter.scale') }} (x{{ scale }})</label>
            <input v-model.number="scale" type="number" min="0.1" max="10" step="0.5" class="gi-input" />
          </div>

          <button class="gi-btn" style="width: 100%; margin-top: 1rem" :disabled="!targetMime" @click="performConversion">
            {{ t('imageConverter.convert') }}
          </button>
        </div>
      </div>

      <!-- Preview Area -->
      <div class="gi-result" style="margin-top: 0">
        <div v-if="sourceUrl" class="preview-wrapper">
          <div class="gi-result-label">Preview</div>
          <img :src="sourceUrl" class="preview-img" />
        </div>
        <div v-else class="gi-text-muted" style="text-align: center; padding: 2rem;">
          {{ t('imageConverter.upload') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getAvailableFormats, convertImage } from '../composables/useImageConverter'
import GiImageUpload from '../components/GiImageUpload.vue'

const { t } = useI18n()

const sourceUrl = ref('')
const sourceMime = ref('')
const targetMime = ref('')
const quality = ref(0.9)
const scale = ref(1)

const availableFormats = computed(() => getAvailableFormats(sourceMime.value))

function handleImageUpload(file: File) {
  sourceMime.value = file.type
  const reader = new FileReader()
  reader.onload = (ev) => {
    sourceUrl.value = ev.target?.result as string
    // Default to first available output
    const formats = getAvailableFormats(file.type)
    if (formats.length > 0) targetMime.value = formats[0]
  }
  reader.readAsDataURL(file)
}

function reset() {
  sourceUrl.value = ''
  sourceMime.value = ''
  targetMime.value = ''
}

async function performConversion() {
  if (!sourceUrl.value || !targetMime.value) return
  
  try {
    const resultUrl = await convertImage(sourceUrl.value, targetMime.value, {
      quality: quality.value,
      scale: scale.value
    })
    
    // Download automatically
    const link = document.createElement('a')
    const ext = targetMime.value.split('/')[1]
    link.download = `converted-image.${ext}`
    link.href = resultUrl
    link.click()
  } catch (err) {
    alert('Conversion failed: ' + err)
  }
}
</script>

<style scoped>
.format-selector {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}
.format-selector button {
  flex: 1;
  min-width: 80px;
}
.format-selector button.active {
  background: var(--gi-brand);
  color: white;
  border-color: var(--gi-brand);
}

.preview-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.preview-img {
  max-width: 100%;
  border-radius: var(--gi-radius);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  background: var(--gi-bg-soft);
}
</style>
