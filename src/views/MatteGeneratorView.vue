<template>
  <div>
    <div class="gi-tool-header">
      <h1>{{ t('matteGenerator.title') }}</h1>
      <p>{{ t('matteGenerator.desc') }}</p>
    </div>

    <!-- Image Upload Zone -->
    <div 
      v-if="!image"
      @drop.prevent="onDrop"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      style="border: 2px dashed var(--gi-border); border-radius: var(--gi-radius-lg); padding: 4rem 2rem; text-align: center; cursor: pointer; transition: all 0.2s;"
      :style="{ borderColor: isDragging ? 'var(--gi-brand)' : 'var(--gi-border)', background: isDragging ? 'var(--gi-bg-soft)' : 'var(--gi-surface)' }"
      @click="triggerFileInput"
    >
      <input type="file" ref="fileInput" @change="onFileSelect" accept="image/*" style="display: none;" />
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem; color: var(--gi-text-muted)"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      <p style="font-size: 1.1rem; font-weight: 500;">{{ t('matteGenerator.upload') }}</p>
    </div>

    <!-- Editor UI -->
    <div v-else style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; align-items: start;">
      
      <!-- Preview Pane -->
      <div class="gi-card" style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--gi-bg-soft); padding: 2rem;">
        <img v-if="previewResult" :src="previewResult" style="max-width: 100%; max-height: 500px; box-shadow: var(--gi-shadow-lg); border-radius: 4px;" />
        <p v-else style="color: var(--gi-text-muted)">Generating preview...</p>
      </div>

      <!-- Controls -->
      <div class="gi-grid" style="grid-template-columns: 1fr; gap: 1.25rem;">
        
        <div class="gi-input-group">
          <label class="gi-label">{{ t('matteGenerator.targetSize') }}</label>
          <select v-model="targetKey" class="gi-select">
            <option value="auto">{{ t('matteGenerator.sizes.auto') }}</option>
            <option value="ig">{{ t('matteGenerator.sizes.ig') }}</option>
            <option value="story">{{ t('matteGenerator.sizes.story') }}</option>
            <option value="twitter">{{ t('matteGenerator.sizes.twitter') }}</option>
            <option value="og">{{ t('matteGenerator.sizes.og') }}</option>
          </select>
        </div>

        <div class="gi-input-group">
          <label class="gi-label">{{ t('matteGenerator.padding') }}</label>
          <input v-model.number="padding" type="number" class="gi-input" min="0" />
        </div>

        <div class="gi-input-group">
          <label class="gi-label">{{ t('matteGenerator.color') }}</label>
          <div style="display: flex; gap: 0.5rem">
            <input v-model="color" type="color" class="gi-input" style="width: 50px; padding: 2px" />
            <input v-model="color" type="text" class="gi-input" />
          </div>
        </div>

        <div class="gi-input-group">
          <label class="gi-label">{{ t('matteGenerator.pattern') }}</label>
          <select v-model="pattern" class="gi-select">
            <option value="none">{{ t('matteGenerator.patterns.none') }}</option>
            <option value="dots">{{ t('matteGenerator.patterns.dots') }}</option>
            <option value="grid">{{ t('matteGenerator.patterns.grid') }}</option>
            <option value="stripes">{{ t('matteGenerator.patterns.stripes') }}</option>
          </select>
        </div>

        <button @click="download" class="gi-btn" style="width: 100%; justify-content: center; margin-top: 1rem;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          {{ t('matteGenerator.apply') }}
        </button>

        <button @click="image = null" class="gi-btn-ghost" style="width: 100%; justify-content: center;">
          Annuler
        </button>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { applyMatte, type MatteOptions } from '../composables/useMatteGenerator'

const { t } = useI18n()

const image = ref<string | null>(null)
const previewResult = ref<string | null>(null)
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// Params
const targetKey = ref('auto')
const padding = ref(50)
const color = ref('#191919')
const pattern = ref<'none' | 'dots' | 'grid' | 'stripes'>('none')

const TARGETS: Record<string, { w: number, h: number } | null> = {
  auto: null,
  ig: { w: 1080, h: 1080 },
  story: { w: 1080, h: 1920 },
  twitter: { w: 1500, h: 500 },
  og: { w: 1200, h: 630 }
}

watch([image, targetKey, padding, color, pattern], async () => {
  if (!image.value) return
  const options: MatteOptions = {
    padding: padding.value,
    color: color.value,
    pattern: pattern.value,
    targetSize: TARGETS[targetKey.value]
  }
  previewResult.value = await applyMatte(image.value, options)
}, { immediate: true })

function triggerFileInput() {
  fileInput.value?.click()
}

function onFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    loadFile(target.files[0])
  }
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
    loadFile(e.dataTransfer.files[0])
  }
}

function loadFile(file: File) {
  const reader = new FileReader()
  reader.onload = (e) => {
    image.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

function download() {
  if (!previewResult.value) return
  const a = document.createElement('a')
  a.href = previewResult.value
  a.download = `matte-${targetKey.value}-${Date.now()}.png`
  a.click()
}
</script>
