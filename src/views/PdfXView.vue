<template>
  <div>
    <div class="gi-tool-header">
      <h1>{{ t('pdfX.title') }}</h1>
      <p>{{ t('pdfX.desc') }}</p>
    </div>

    <GiImageUpload
      :accept="['.pdf', 'application/pdf']"
      :paste-zone="true"
      :paste-title="t('pdfX.pasteTitle')"
      :upload-text="t('pdfX.upload')"
      @upload="handleImageUpload"
      @error="handleError"
    />

    <div v-if="selectedFile" class="gi-result">
      <span class="gi-filename">📄 {{ selectedFile.name }} ({{ fileSizeMb }} MB)</span>
    </div>

    <div v-if="error" class="gi-error-box">{{ t(`pdfX.error${capitalize(error)}`) }}</div>

    <button
      class="gi-btn"
      style="margin-top:1rem"
      :disabled="!selectedFile || loading"
      @click="convert"
    >
      {{ loading ? t('pdfX.converting') : t('pdfX.convert') }}
    </button>

    <div v-if="downloadUrl" class="gi-result" style="margin-top:1.5rem">
      <a :href="downloadUrl" :download="downloadName" class="gi-btn">
        ⬇ {{ t('pdfX.download') }}
      </a>
      <p class="gi-disclaimer">{{ t('pdfX.disclaimer') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { convertToPdfX, type ConversionError } from '../composables/usePdfXConverter'
import GiImageUpload from '../components/GiImageUpload.vue'

const { t } = useI18n()

const selectedFile = ref<File | null>(null)
const loading = ref(false)
const error = ref<ConversionError | null>(null)
const downloadUrl = ref('')
const downloadName = ref('')

const fileSizeMb = computed(() =>
  selectedFile.value ? (selectedFile.value.size / 1024 / 1024).toFixed(1) : '0'
)

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }

function handleImageUpload(file: File) {
  selectedFile.value = file
  error.value = null
  downloadUrl.value = ''
}

function handleError(err: string) {
  error.value = err as ConversionError
}

async function convert() {
  if (!selectedFile.value) return
  loading.value = true
  error.value = null
  downloadUrl.value = ''

  try {
    const blob = await convertToPdfX(selectedFile.value)
    if (downloadUrl.value) URL.revokeObjectURL(downloadUrl.value)
    downloadUrl.value = URL.createObjectURL(blob)
    downloadName.value = selectedFile.value.name.replace(/\.pdf$/i, '-pdfx.pdf')
  } catch (err: unknown) {
    error.value = (err as { code?: ConversionError }).code ?? 'server'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.gi-result {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
}
.gi-filename { color: var(--gi-text); font-weight: 500; }
.gi-error-box {
  margin-top: 0.75rem;
  padding: 0.6rem 1rem;
  background: var(--gi-tint-red-bg);
  color: var(--gi-tint-red-text);
  border-radius: var(--gi-radius);
  font-size: 0.9rem;
}
.gi-disclaimer { margin-top: 0.75rem; font-size: 0.8rem; color: var(--gi-text-muted); }
</style>
