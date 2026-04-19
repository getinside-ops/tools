<template>
  <ToolPageLayout
    :title="t('pdfX.title')"
    :description="t('pdfX.desc')"
    category="print"
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

    <div v-if="backendStatus === 'waking'" class="gi-info-box">
      {{ t('pdfX.backendWaking') }}
    </div>
    <div v-if="backendStatus === 'unreachable'" class="gi-status-error">
      {{ t('pdfX.backendUnreachable') }}
    </div>

    <button
      class="gi-btn"
      style="margin-top:1rem"
      :disabled="!selectedFile || loading || (!!selectedFile && backendStatus !== 'ready')"
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
    <template #about>{{ t('pdfX.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
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
const backendStatus = ref<'idle' | 'waking' | 'ready' | 'unreachable'>('idle')
let healthAbortController: AbortController | null = null

const fileSizeMb = computed(() =>
  selectedFile.value ? (selectedFile.value.size / 1024 / 1024).toFixed(1) : '0'
)

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }

async function checkBackendHealth() {
  healthAbortController?.abort()
  const ac = new AbortController()
  healthAbortController = ac

  const apiUrl = import.meta.env.VITE_PDFX_API_URL
  const MAX_ATTEMPTS = 12
  const POLL_INTERVAL = 5000

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    if (ac.signal.aborted) return
    try {
      const res = await fetch(`${apiUrl}/health`, { signal: AbortSignal.timeout(5000) })
      if (res.ok) { backendStatus.value = 'ready'; return }
    } catch {}
    if (i < MAX_ATTEMPTS - 1) await new Promise(r => setTimeout(r, POLL_INTERVAL))
  }
  if (!ac.signal.aborted) backendStatus.value = 'unreachable'
}

onUnmounted(() => {
  healthAbortController?.abort()
})

function handleImageUpload(file: File) {
  selectedFile.value = file
  error.value = null
  downloadUrl.value = ''
  backendStatus.value = 'waking'
  checkBackendHealth()
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
