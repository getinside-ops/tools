<template>
  <div>
    <div class="gi-tool-header">
      <h1>{{ t('matteGenerator.title') }}</h1>
      <p>{{ t('matteGenerator.desc') }}</p>
    </div>

    <!-- Upload Area -->
    <div v-if="!originalUrl" class="gi-result" style="border: 2px dashed var(--gi-border); cursor: pointer; text-align: center; padding: 3rem;" @click="fileInput?.click()">
      <p>📁 {{ t('imageCropper.select') }}</p>
      <input ref="fileInput" type="file" hidden accept="image/*" @change="handleFileChange" />
    </div>

    <div v-else class="gi-grid">
      <!-- Controls -->
      <div class="gi-field">
        <label class="gi-label">{{ t('matteGenerator.padding') }}: {{ padding }}px</label>
        <input v-model.number="padding" type="range" min="0" max="200" class="gi-input" />

        <div class="gi-field" style="margin-top: 1rem">
          <label class="gi-label">{{ t('matteGenerator.color') }}</label>
          <div style="display: flex; gap: 0.5rem">
            <input v-model="color" type="color" class="gi-input" style="width: 50px; padding: 2px" />
            <input v-model="color" type="text" class="gi-input" style="flex: 1" />
          </div>
        </div>

        <button class="gi-btn-primary" style="width: 100%; margin-top: 1.5rem" @click="handleApply">{{ t('matteGenerator.apply') }}</button>
      </div>

      <!-- Preview -->
      <div class="gi-result" style="margin-top: 0">
        <div class="gi-result-label">Preview (Visual)</div>
        <div 
          style="background: #f0f0f0; border-radius: var(--gi-radius); overflow: auto; display: flex; justify-content: center; align-items: center; min-height: 300px; padding: 2rem;"
        >
          <div :style="previewContainerStyle" style="box-shadow: 0 10px 30px rgba(0,0,0,0.1); line-height: 0; transition: all 0.2s;">
            <img :src="originalUrl" style="max-width: 100%; display: block;" />
          </div>
        </div>
      </div>
    </div>

    <!-- Result Result -->
    <div v-if="resultUrl" class="gi-result" style="margin-top: 2rem;">
      <div class="gi-result-label">Result</div>
      <img :src="resultUrl" style="max-width: 100%; border-radius: var(--gi-radius); margin-bottom: 1rem;" />
      <button class="gi-btn-primary" @click="downloadResult">⬇️ {{ t('matteGenerator.download') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { applyMatte } from '../composables/useMatteGenerator'

const { t } = useI18n()

const fileInput = ref<HTMLInputElement | null>(null)
const originalUrl = ref('')
const resultUrl = ref('')

const padding = ref(40)
const color = ref('#ffffff')

const previewContainerStyle = computed(() => ({
  padding: `${padding.value}px`,
  backgroundColor: color.value
}))

function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    originalUrl.value = ev.target?.result as string
    resultUrl.value = ''
  }
  reader.readAsDataURL(file)
}

async function handleApply() {
  if (!originalUrl.value) return
  try {
    const result = await applyMatte(originalUrl.value, {
      padding: padding.value,
      color: color.value
    })
    resultUrl.value = result
  } catch (err) {
    alert(err)
  }
}

function downloadResult() {
  const link = document.createElement('a')
  link.download = 'matte-image.png'
  link.href = resultUrl.value
  link.click()
}
</script>
