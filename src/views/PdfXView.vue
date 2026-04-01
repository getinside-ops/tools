<template>
  <ToolPageLayout
    :title="t('pdfX.title')"
    :description="t('pdfX.desc')"
  >
    <template #icon>
      <FileText :size="24" />
    </template>

    <GiImageUpload
      :accept="['.pdf', 'application/pdf']"
      :paste-zone="true"
      :paste-title="t('pdfX.pasteTitle')"
      :upload-text="t('pdfX.upload')"
      @upload="handleImageUpload"
      @error="handleError"
    />

    <GiResultCard
      v-if="selectedFile"
      :title="t('pdfX.selectedFile')"
      variant="info"
    >
      📄 {{ selectedFile.name }} ({{ fileSizeMb }} MB)
    </GiResultCard>

    <GiResultCard
      v-if="error"
      :title="t('pdfX.error')"
      variant="error"
    >
      {{ t(`pdfX.error${capitalize(error)}`) }}
    </GiResultCard>

    <button
      class="gi-btn"
      style="margin-top:1rem"
      :disabled="!selectedFile || loading"
      @click="convert"
    >
      {{ loading ? t('pdfX.converting') : t('pdfX.convert') }}
    </button>

    <GiResultCard
      v-if="downloadUrl"
      :title="t('pdfX.ready')"
      variant="success"
    >
      <a :href="downloadUrl" :download="downloadName" class="gi-btn">
        ⬇ {{ t('pdfX.download') }}
      </a>
      <p class="gi-disclaimer">{{ t('pdfX.disclaimer') }}</p>
    </GiResultCard>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { FileText } from 'lucide-vue-next'
import ToolPageLayout from '../components/ToolPageLayout.vue'
import { convertToPdfX, type ConversionError } from '../composables/usePdfXConverter'
import GiImageUpload from '../components/GiImageUpload.vue'
import GiResultCard from '../components/GiResultCard.vue'

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
.gi-disclaimer { margin-top: 0.75rem; font-size: 0.8rem; color: var(--gi-text-muted); }
</style>
