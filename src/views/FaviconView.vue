<template>
  <ToolPageLayout :title="t('favicon.title')" :description="t('favicon.desc')">
    <template #icon>
      <Image />
    </template>

    <!-- Upload Area -->
    <div v-if="!originalUrl">
      <GiImageUpload @upload="handleImageUpload" />
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
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Image } from 'lucide-vue-next'
import { generateFavicons, type FaviconResult } from '../composables/useFavicon'
import GiImageUpload from '../components/GiImageUpload.vue'
import ToolPageLayout from '../components/ToolPageLayout.vue'

const { t } = useI18n()

const originalUrl = ref('')
const results = ref<FaviconResult[]>([])

function handleImageUpload(file: File) {
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
  background: var(--gi-bg-soft);
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
