<template>
  <div>
    <div class="gi-tool-header">
      <h1>{{ t('imageFilters.title') }}</h1>
      <p>{{ t('imageFilters.desc') }}</p>
    </div>

    <!-- Upload Area -->
    <div v-if="!originalUrl" class="gi-result" style="border: 2px dashed var(--gi-border); cursor: pointer; text-align: center; padding: 3rem;" @click="fileInput?.click()">
      <p>📁 {{ t('imageCropper.select') }}</p>
      <input ref="fileInput" type="file" hidden accept="image/*" @change="handleFileChange" />
    </div>

    <div v-else class="gi-grid">
      <!-- Controls -->
      <div class="gi-field">
        <label class="gi-label">{{ t('imageFilters.brightness') }}: {{ filters.brightness }}%</label>
        <input v-model.number="filters.brightness" type="range" min="0" max="200" class="gi-input" />

        <label class="gi-label">{{ t('imageFilters.contrast') }}: {{ filters.contrast }}%</label>
        <input v-model.number="filters.contrast" type="range" min="0" max="200" class="gi-input" />

        <label class="gi-label">{{ t('imageFilters.grayscale') }}: {{ filters.grayscale }}%</label>
        <input v-model.number="filters.grayscale" type="range" min="0" max="100" class="gi-input" />

        <label class="gi-label">{{ t('imageFilters.sepia') }}: {{ filters.sepia }}%</label>
        <input v-model.number="filters.sepia" type="range" min="0" max="100" class="gi-input" />

        <label class="gi-label">{{ t('imageFilters.invert') }}: {{ filters.invert }}%</label>
        <input v-model.number="filters.invert" type="range" min="0" max="100" class="gi-input" />

        <label class="gi-label">{{ t('imageFilters.blur') }}: {{ filters.blur }}px</label>
        <input v-model.number="filters.blur" type="range" min="0" max="20" class="gi-input" />

        <div style="display: flex; gap: 1rem; margin-top: 1.5rem">
          <button class="gi-btn-primary" style="flex: 1" @click="handleApply">{{ t('imageFilters.apply') }}</button>
          <button class="gi-btn-ghost" @click="resetFilters">Reset</button>
        </div>
      </div>

      <!-- Preview -->
      <div class="gi-result" style="margin-top: 0">
        <div class="gi-result-label">Preview (Real-time CSS)</div>
        <div style="background: var(--gi-bg); border-radius: var(--gi-radius); overflow: auto; display: flex; justify-content: center; align-items: center; min-height: 300px;">
          <img :src="originalUrl" :style="previewStyle" style="max-width: 100%; transition: filter 0.2s;" />
        </div>
      </div>
    </div>

    <!-- Result Result -->
    <div v-if="filteredUrl" class="gi-result" style="margin-top: 2rem;">
      <div class="gi-result-label">Result (Flattened)</div>
      <img :src="filteredUrl" style="max-width: 100%; border-radius: var(--gi-radius); margin-bottom: 1rem;" />
      <button class="gi-btn-primary" @click="downloadFiltered">⬇️ {{ t('imageFilters.download') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { constructFilterString, applyFilters } from '../composables/useImageFilters'

const { t } = useI18n()

const fileInput = ref<HTMLInputElement | null>(null)
const originalUrl = ref('')
const filteredUrl = ref('')

const filters = reactive({
  brightness: 100,
  contrast: 100,
  grayscale: 0,
  sepia: 0,
  invert: 0,
  blur: 0
})

const previewStyle = computed(() => ({
  filter: constructFilterString(filters)
}))

function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    originalUrl.value = ev.target?.result as string
    filteredUrl.value = ''
    resetFilters()
  }
  reader.readAsDataURL(file)
}

function resetFilters() {
  filters.brightness = 100
  filters.contrast = 100
  filters.grayscale = 0
  filters.sepia = 0
  filters.invert = 0
  filters.blur = 0
}

async function handleApply() {
  if (!originalUrl.value) return
  try {
    const result = await applyFilters(originalUrl.value, filters)
    filteredUrl.value = result
  } catch (err) {
    alert(err)
  }
}

function downloadFiltered() {
  const link = document.createElement('a')
  link.download = 'filtered-image.png'
  link.href = filteredUrl.value
  link.click()
}
</script>
