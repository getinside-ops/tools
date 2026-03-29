<template>
  <div>
    <router-link to="/" class="gi-back-link">{{ t('nav.back') }}</router-link>

    <div class="gi-tool-header">
      <h1>{{ t('mockupGenerator.title') }}</h1>
      <p>{{ t('mockupGenerator.desc') }}</p>
    </div>

    <!-- Drop zone -->
    <div
      class="gi-drop-zone"
      :class="{ 'gi-drop-zone--active': isDragging }"
      @click="triggerFileInput"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="onDrop"
    >
      <span class="gi-drop-icon">📱</span>
      <span class="gi-drop-label">{{ t('mockupGenerator.dropZone') }}</span>
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        class="gi-drop-input"
        @change="onFileChange"
      />
    </div>

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
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { generateMockup } from '../composables/useMockupGenerator'

const { t } = useI18n()

const fileInputRef = ref<HTMLInputElement | null>(null)
const previewRef = ref<HTMLCanvasElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const isDragging = ref(false)
const copied = ref(false)

function triggerFileInput() {
  fileInputRef.value?.click()
}

async function loadFromFile(file: File) {
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.onload = async () => {
    canvas.value = await generateMockup(img)
    URL.revokeObjectURL(url)
  }
  img.src = url
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) loadFromFile(file)
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) loadFromFile(file)
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
.gi-back-link {
  display: inline-flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0.3rem 0.75rem;
  border: 1.5px solid var(--gi-border);
  border-radius: var(--gi-radius);
  font-size: 0.85rem;
  color: var(--gi-text-muted);
  text-decoration: none;
  transition: border-color 0.12s, color 0.12s;
}
.gi-back-link:hover { border-color: var(--gi-brand); color: var(--gi-brand); }

.gi-drop-zone {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem 2rem;
  border: 2px dashed var(--gi-border);
  border-radius: var(--gi-radius-lg);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.gi-drop-zone:hover,
.gi-drop-zone--active {
  border-color: var(--gi-brand);
  background: color-mix(in srgb, var(--gi-brand) 5%, transparent);
}
.gi-drop-icon { font-size: 2rem; }
.gi-drop-label { font-size: 0.95rem; color: var(--gi-text-muted); text-align: center; }
.gi-drop-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  display: none; /* triggered programmatically */
}

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
