<template>
  <ToolPageLayout
    :title="t('colorblind.title')"
    :description="t('colorblind.desc')"
  >
    <template #icon>
      <Eye :size="24" />
    </template>

    <div class="gi-grid">
      <!-- Controls -->
      <div class="gi-field">
        <GiImageUpload
          v-if="!imageUrl"
          @upload="handleImageUpload"
          @error="handleError"
        />

        <div v-else>
          <button class="gi-btn-ghost" style="width: 100%; margin-bottom: 1.5rem" @click="reset">{{ t('imageCropper.reset') }}</button>

          <div class="gi-field">
            <label class="gi-label">{{ t('colorblind.types.normal') }}</label>
            <div class="type-selector">
              <button
                v-for="type in types"
                :key="type"
                class="gi-btn-ghost"
                :class="{ active: selectedType === type }"
                @click="selectedType = type"
              >
                {{ t(`colorblind.types.${type}`) }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Simulation Preview -->
      <GiResultCard :title="t('colorblind.types.normal')">
        <div v-if="imageUrl" class="preview-container">
          <img :src="imageUrl" class="preview-img" :style="{ filter: `url(#colorblind-filter)` }" />
        </div>
        <div v-else class="gi-text-muted">{{ t('colorblind.upload') }}</div>
      </GiResultCard>
    </div>

    <!-- Hidden SVG Filter -->
    <svg style="position: absolute; width: 0; height: 0; pointer-events: none;">
      <filter id="colorblind-filter" color-interpolation-filters="sRGB">
        <feColorMatrix type="matrix" :values="currentMatrix" />
      </filter>
    </svg>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Eye } from 'lucide-vue-next'
import { getColorMatrix, type ColorBlindType } from '../composables/useColorblind'
import GiImageUpload from '../components/GiImageUpload.vue'
import GiResultCard from '../components/GiResultCard.vue'
import ToolPageLayout from '../components/ToolPageLayout.vue'

const { t } = useI18n()

const imageUrl = ref('')
const selectedType = ref<ColorBlindType>('normal')
const types: ColorBlindType[] = ['normal', 'protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia']

const currentMatrix = computed(() => getColorMatrix(selectedType.value))

function handleImageUpload(file: File) {
  const reader = new FileReader()
  reader.onload = (ev) => {
    imageUrl.value = ev.target?.result as string
  }
  reader.readAsDataURL(file)
}

function handleError(error: string) {
  console.error(error)
  alert(error)
}

function reset() {
  imageUrl.value = ''
  selectedType.value = 'normal'
}
</script>

<style scoped>
.type-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.type-selector button {
  text-align: left;
  justify-content: flex-start;
}
.type-selector button.active {
  background: var(--gi-brand);
  color: white;
  border-color: var(--gi-brand);
}

.preview-container {
  display: flex;
  justify-content: center;
  width: 100%;
}
.preview-img {
  max-width: 100%;
  max-height: 70vh;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  background: white;
}
</style>
