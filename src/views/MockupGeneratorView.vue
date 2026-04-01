<template>
  <ToolPageLayout
    :title="t('mockupGenerator.title')"
    :description="t('mockupGenerator.desc')"
  >
    <template #icon>
      <Monitor />
    </template>

    <GiImageUpload
      @upload="handleImageUpload"
      @error="handleError"
    />

    <!-- Preview -->
    <div v-if="canvas" class="gi-mockup-preview">
      <canvas ref="previewRef" />
    </div>

    <!-- Actions -->
    <div v-if="canvas" class="gi-mockup-actions">
      <button class="gi-btn" @click="download">{{ t('mockupGenerator.download') }}</button>
      <button class="gi-btn-ghost" @click="copyToClipboard">
        {{ copied ? t('mockupGenerator.copied') : t('mockupGenerator.copy') }}
      </button>
    </div>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { Monitor } from 'lucide-vue-next'
import { generateMockup } from '../composables/useMockupGenerator'
import GiImageUpload from '../components/GiImageUpload.vue'
import ToolPageLayout from '../components/ToolPageLayout.vue'

const { t } = useI18n()

const previewRef = ref<HTMLCanvasElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const copied = ref(false)
const error = ref<string | null>(null)

function handleImageUpload(file: File) {
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.onload = async () => {
    try {
      canvas.value = await generateMockup(img)
    } catch (err) {
      console.error('Mockup generation failed:', err)
      error.value = 'Failed to generate mockup'
    } finally {
      URL.revokeObjectURL(url)
    }
  }
  img.onerror = () => {
    URL.revokeObjectURL(url)
    error.value = 'Failed to load image'
  }
  img.src = url
}

function handleError(err: string) {
  error.value = err
}

// Mirror composited canvas into the <canvas> preview element
watch(canvas, async (c) => {
  if (!c) return
  await nextTick()
  const el = previewRef.value
  if (!el) return
  el.width = c.width
  el.height = c.height
  el.getContext('2d')!.drawImage(c, 0, 0)
})

function download() {
  if (!canvas.value) return
  canvas.value.toBlob((blob) => {
    if (!blob) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'mockup-iphone15.png'
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 100)
  })
}

async function copyToClipboard() {
  if (!canvas.value) return
  try {
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.value!.toBlob((b) => (b ? resolve(b) : reject()))
    )
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // clipboard unavailable — silently ignore
  }
}
</script>

<style scoped>
.gi-mockup-preview {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}
.gi-mockup-preview canvas {
  max-width: 320px;
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.gi-mockup-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1.5rem;
}
</style>
