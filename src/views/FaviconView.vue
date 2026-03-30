<template>
  <div>
    <div class="gi-tool-header">
      <h1>{{ t('favicon.title') }}</h1>
      <p>{{ t('favicon.desc') }}</p>
    </div>

    <!-- Upload Area -->
    <div v-if="!originalUrl" class="gi-result" style="border: 2px dashed var(--gi-border); cursor: pointer; text-align: center; padding: 3rem;" @click="fileInput?.click()">
      <p>📁 {{ t('favicon.upload') }}</p>
      <input ref="fileInput" type="file" hidden accept="image/*" @change="handleFileChange" />
    </div>

    <div v-else>
      <div class="gi-grid">
        <!-- Controls -->
        <div class="gi-field">
          <button class="gi-btn-ghost" style="width: 100%; margin-bottom: 1rem" @click="reset">{{ t('imageCropper.reset') }}</button>
          <div class="gi-result-label">{{ t('favicon.preview') }}</div>
          
          <div class="favicon-previews">
            <div v-for="res in results" :key="res.size" class="favicon-preview-item">
              <div class="favicon-preview-box" :style="{ width: res.size > 64 ? '64px' : res.size + 'px', height: res.size > 64 ? '64px' : res.size + 'px' }">
                <img :src="res.dataUrl" alt="icon" />
              </div>
              <span>{{ res.size }}x{{ res.size }}</span>
              <button class="gi-btn-ghost" @click="downloadSingle(res)">⬇️</button>
            </div>
          </div>
        </div>

        <!-- Main Preview -->
        <div class="gi-result" style="margin-top: 0">
          <div class="gi-result-label">Source</div>
          <img :src="originalUrl" style="max-width: 100%; border-radius: var(--gi-radius); box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { generateFavicons, type FaviconResult } from '../composables/useFavicon'

const { t } = useI18n()

const fileInput = ref<HTMLInputElement | null>(null)
const originalUrl = ref('')
const results = ref<FaviconResult[]>([])

function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async (ev) => {
    originalUrl.value = ev.target?.result as string
    results.value = await generateFavicons(originalUrl.value)
  }
  reader.readAsDataURL(file)
}

function reset() {
  originalUrl.value = ''
  results.value = []
  if (fileInput.value) fileInput.value.value = ''
}

function downloadSingle(res: FaviconResult) {
  const link = document.createElement('a')
  link.download = `favicon-${res.size}x${res.size}.png`
  link.href = res.dataUrl
  link.click()
}
</script>

<style scoped>
.favicon-previews {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}
.favicon-preview-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--gi-surface-2);
  border-radius: var(--gi-radius);
  border: 1px solid var(--gi-border);
}
.favicon-preview-box {
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 4px;
  flex-shrink: 0;
}
.favicon-preview-box img {
  max-width: 100%;
  max-height: 100%;
  display: block;
}
.favicon-preview-item span {
  font-size: 0.85rem;
  font-weight: 500;
  flex: 1;
}
</style>
