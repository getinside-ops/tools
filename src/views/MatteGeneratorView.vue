<template>
  <ToolPageLayout
    :title="t('matteGenerator.title')"
    :subtitle="t('matteGenerator.desc')"
  >
    <template #icon>
      <FrameIcon />
    </template>

    <GiImageUpload
      @upload="handleImageUpload"
      @error="handleError"
    />

    <!-- Editor UI -->
    <div v-if="image" style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; align-items: start;">

      <!-- Preview Pane -->
      <div class="gi-card" style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--gi-bg-soft); padding: 2rem;">
        <img v-if="previewResult" :src="previewResult" style="max-width: 100%; max-height: 500px; box-shadow: var(--gi-shadow-lg); border-radius: 4px;" />
        <p v-else style="color: var(--gi-text-muted)">Generating preview...</p>
      </div>

      <!-- Controls -->
      <div class="gi-grid" style="grid-template-columns: 1fr; gap: 1.25rem;">

        <GiFormField :label="t('matteGenerator.targetSize')">
          <template #input>
            <select v-model="targetKey" class="gi-select">
              <option value="auto">{{ t('matteGenerator.sizes.auto') }}</option>
              <option value="ig">{{ t('matteGenerator.sizes.ig') }}</option>
              <option value="story">{{ t('matteGenerator.sizes.story') }}</option>
              <option value="twitter">{{ t('matteGenerator.sizes.twitter') }}</option>
              <option value="og">{{ t('matteGenerator.sizes.og') }}</option>
            </select>
          </template>
        </GiFormField>

        <GiFormField :label="t('matteGenerator.padding')" type="number">
          <template #input>
            <input v-model.number="padding" type="number" class="gi-input" min="0" />
          </template>
        </GiFormField>

        <GiFormField :label="t('matteGenerator.color')">
          <template #input>
            <div style="display: flex; gap: 0.5rem">
              <input v-model="color" type="color" class="gi-input" style="width: 50px; padding: 2px" />
              <input v-model="color" type="text" class="gi-input" />
            </div>
          </template>
        </GiFormField>

        <GiFormField :label="t('matteGenerator.pattern')">
          <template #input>
            <select v-model="pattern" class="gi-select">
              <option value="none">{{ t('matteGenerator.patterns.none') }}</option>
              <option value="dots">{{ t('matteGenerator.patterns.dots') }}</option>
              <option value="grid">{{ t('matteGenerator.patterns.grid') }}</option>
              <option value="stripes">{{ t('matteGenerator.patterns.stripes') }}</option>
            </select>
          </template>
        </GiFormField>

        <button @click="download" class="gi-btn" style="width: 100%; justify-content: center; margin-top: 1rem;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          {{ t('matteGenerator.apply') }}
        </button>

        <button @click="image = null" class="gi-btn-ghost" style="width: 100%; justify-content: center;">
          Annuler
        </button>

      </div>
    </div>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Frame as FrameIcon } from 'lucide-vue-next'
import { applyMatte, type MatteOptions } from '../composables/useMatteGenerator'
import GiImageUpload from '../components/GiImageUpload.vue'
import GiFormField from '../components/GiFormField.vue'
import ToolPageLayout from '../components/ToolPageLayout.vue'

const { t } = useI18n()

const image = ref<string | null>(null)
const previewResult = ref<string | null>(null)
const error = ref<string | null>(null)

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

function handleImageUpload(file: File) {
  const reader = new FileReader()
  reader.onload = (e) => {
    image.value = e.target?.result as string
    error.value = null
  }
  reader.readAsDataURL(file)
}

function handleError(err: string) {
  error.value = err
}

function download() {
  if (!previewResult.value) return
  const a = document.createElement('a')
  a.href = previewResult.value
  a.download = `matte-${targetKey.value}-${Date.now()}.png`
  a.click()
}
</script>
