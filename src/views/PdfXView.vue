<template>
  <div>
    <div class="gi-tool-header">
      <h1>{{ t('pdfX.title') }}</h1>
      <p>{{ t('pdfX.desc') }}</p>
    </div>

    <div
      class="gi-upload-zone"
      :class="{ 'gi-upload-zone--active': dragging, 'gi-upload-zone--filled': !!selectedFile }"
      @click="fileInput?.click()"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <input ref="fileInput" type="file" accept=".pdf,application/pdf" style="display:none" @change="onFileChange" />
      <span v-if="!selectedFile">{{ t('pdfX.upload') }}</span>
      <span v-else class="gi-filename">📄 {{ selectedFile.name }} ({{ fileSizeMb }} MB)</span>
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

const { t } = useI18n()

const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const loading = ref(false)
const error = ref<ConversionError | null>(null)
const downloadUrl = ref('')
const downloadName = ref('')
const dragging = ref(false)

const fileSizeMb = computed(() =>
  selectedFile.value ? (selectedFile.value.size / 1024 / 1024).toFixed(1) : '0'
)

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }

function selectFile(file: File) {
  selectedFile.value = file
  error.value = null
  downloadUrl.value = ''
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) selectFile(file)
}

function onDrop(e: DragEvent) {
  dragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) selectFile(file)
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
.gi-upload-zone {
  border: 2px dashed var(--gi-border);
  border-radius: var(--gi-radius-lg);
  padding: 2.5rem;
  text-align: center;
  cursor: pointer;
  color: var(--gi-text-muted);
  font-size: 0.95rem;
  transition: border-color 0.15s, background 0.15s;
}
.gi-upload-zone:hover,
.gi-upload-zone--active { border-color: var(--gi-brand); background: rgba(10,170,142,0.04); }
.gi-upload-zone--filled { border-color: var(--gi-brand); border-style: solid; }
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
