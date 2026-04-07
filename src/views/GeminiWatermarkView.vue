<template>
  <ToolPageLayout
    :title="t('geminiWatermark.title')"
    :description="t('geminiWatermark.desc')"
    category="design"
  >
    <template #icon>
      <Sparkles :size="24" />
    </template>

    <!-- Upload Area -->
    <GiImageUpload
      @upload="handleImageUpload"
      @error="handleError"
    />

    <!-- Error State -->
    <div v-if="uploadError" class="gi-tint-red-bg gi-tint-red-border" style="margin-top: 1.5rem; padding: 1rem; border-radius: var(--gi-radius-md)">
      <strong>{{ t('geminiWatermark.error') }}:</strong> {{ uploadError }}
    </div>

    <!-- Processing State -->
    <div v-if="isProcessing" class="gi-tint-blue-bg gi-tint-blue-border" style="margin-top: 1.5rem; padding: 1rem; border-radius: var(--gi-radius-md); display: flex; align-items: center; gap: 0.75rem">
      <Loader2 :size="20" class="animate-spin" />
      <span>{{ t('geminiWatermark.processing') }}</span>
    </div>

    <!-- Result: Before/After Preview -->
    <div v-if="originalUrl && cleanUrl" style="margin-top: 2rem">
      <h2 style="font-size: var(--gi-font-size-lg); margin-bottom: 1rem">{{ t('geminiWatermark.preview') }}</h2>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem">
        <!-- Original -->
        <div class="gi-card" style="padding: 0; overflow: hidden">
          <div style="padding: 0.75rem 1rem; background: var(--gi-tint-red-bg); font-weight: 600; font-size: var(--gi-font-size-sm)">
            {{ t('geminiWatermark.original') }}
          </div>
          <img :src="originalUrl" :alt="t('geminiWatermark.original')" style="width: 100%; display: block" />
        </div>

        <!-- Clean -->
        <div class="gi-card" style="padding: 0; overflow: hidden">
          <div style="padding: 0.75rem 1rem; background: var(--gi-tint-green-bg); font-weight: 600; font-size: var(--gi-font-size-sm)">
            {{ t('geminiWatermark.cleaned') }}
          </div>
          <img :src="cleanUrl" :alt="t('geminiWatermark.cleaned')" style="width: 100%; display: block" />
        </div>
      </div>

      <!-- Download Button -->
      <button
        class="gi-btn-primary"
        style="width: 100%"
        :disabled="isProcessing"
        @click="downloadImage"
      >
        <Download :size="18" style="margin-right: 0.5rem" />
        {{ t('geminiWatermark.download') }}
      </button>

      <!-- Reset Button -->
      <button
        class="gi-btn gi-btn-ghost"
        style="width: 100%; margin-top: 0.5rem"
        @click="reset"
      >
        <RotateCcw :size="18" style="margin-right: 0.5rem" />
        {{ t('geminiWatermark.reset') }}
      </button>
    </div>

    <template #about>{{ t('geminiWatermark.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Sparkles, Download, RotateCcw, Loader2 } from 'lucide-vue-next'
import GiImageUpload from '../components/GiImageUpload.vue'
import ToolPageLayout from '../components/ToolPageLayout.vue'
import { removeGeminiWatermark } from '../composables/useGeminiWatermarkRemover'

const { t } = useI18n()

const originalUrl = ref('')
const cleanUrl = ref('')
const uploadError = ref('')
const isProcessing = ref(false)

function handleImageUpload(file: File) {
  uploadError.value = ''
  const reader = new FileReader()
  reader.onload = async (ev) => {
    originalUrl.value = ev.target?.result as string
    await processImage()
  }
  reader.onerror = () => {
    uploadError.value = t('geminiWatermark.errorReadFile')
  }
  reader.readAsDataURL(file)
}

function handleError(error: string) {
  uploadError.value = error
}

async function processImage() {
  if (!originalUrl.value || isProcessing.value) return

  isProcessing.value = true
  try {
    const result = await removeGeminiWatermark(originalUrl.value)

    if (result.success && result.dataUrl) {
      cleanUrl.value = result.dataUrl
    } else {
      uploadError.value = result.error || t('geminiWatermark.errorProcessing')
    }
  } catch (err) {
    console.error(err)
    uploadError.value = t('geminiWatermark.errorProcessing')
  } finally {
    isProcessing.value = false
  }
}

function downloadImage() {
  if (!cleanUrl.value) return

  const link = document.createElement('a')
  link.download = 'gemini-watermark-removed.png'
  link.href = cleanUrl.value
  link.click()
}

function reset() {
  originalUrl.value = ''
  cleanUrl.value = ''
  uploadError.value = ''
}
</script>
