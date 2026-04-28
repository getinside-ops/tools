<template>
  <ToolPageLayout
    :title="t('mockupGenerator.title')"
    :description="t('mockupGenerator.desc')"
    category="design"
  >
    <template #icon>
      <Monitor />
    </template>

    <div class="gi-device-selector">
      <div class="gi-category-tabs">
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="gi-category-tab"
          :class="{ active: selectedCategory === cat.id }"
          @click="selectedCategory = cat.id"
        >
          <component :is="cat.icon" class="gi-tab-icon" />
          <span>{{ t(cat.labelKey) }}</span>
        </button>
      </div>

      <div class="gi-devices-grid">
        <button
          v-for="device in filteredDevices"
          :key="device.id"
          class="gi-device-card"
          :class="{ active: selectedDevice?.id === device.id }"
          @click="selectDevice(device)"
        >
          <div class="gi-device-preview">
            <img :src="device.imageSrc" :alt="device.name" />
          </div>
          <span class="gi-device-name">{{ device.name }}</span>
        </button>
      </div>
    </div>

    <GiImageUpload
      @upload="handleImageUpload"
      @error="handleError"
    />

    <div v-if="canvas" class="gi-mockup-preview">
      <canvas ref="previewRef" />
    </div>

    <div v-if="canvas" class="gi-mockup-actions">
      <button class="gi-btn" :disabled="isGenerating" @click="download">
        {{ isGenerating ? t('mockupGenerator.processing') : t('mockupGenerator.download') }}
      </button>
      <button class="gi-btn-secondary" @click="copyToClipboard">
        {{ copied ? t('mockupGenerator.copied') : t('mockupGenerator.copy') }}
      </button>
    </div>

    <template #about>{{ t('mockupGenerator.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, markRaw } from 'vue'
import { useI18n } from 'vue-i18n'
import { Monitor, Smartphone, Laptop, Watch, Tv } from 'lucide-vue-next'
import { generateMockup } from '../composables/useMockupGenerator'
import { devicesByCategory } from '../composables/mockupDevices'
import type { DeviceConfig, DeviceCategory } from '../composables/mockupDevices'
import GiImageUpload from '../components/GiImageUpload.vue'
import ToolPageLayout from '../components/ToolPageLayout.vue'

const { t } = useI18n()

const previewRef = ref<HTMLCanvasElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const copied = ref(false)
const error = ref<string | null>(null)
const isGenerating = ref(false)

const categories = [
  { id: 'phone' as DeviceCategory, labelKey: 'mockupGenerator.devices.phone', icon: markRaw(Smartphone) },
  { id: 'laptop' as DeviceCategory, labelKey: 'mockupGenerator.devices.laptop', icon: markRaw(Laptop) },
  { id: 'watch' as DeviceCategory, labelKey: 'mockupGenerator.devices.watch', icon: markRaw(Watch) },
  { id: 'tv' as DeviceCategory, labelKey: 'mockupGenerator.devices.tv', icon: markRaw(Tv) },
]

const selectedCategory = ref<DeviceCategory>('phone')
const selectedDevice = ref<DeviceConfig | null>(null)

const filteredDevices = computed(() => devicesByCategory[selectedCategory.value])

function selectDevice(device: DeviceConfig) {
  selectedDevice.value = device
  selectedCategory.value = device.category
  canvas.value = null
}

const initialDevice = devicesByCategory.phone[0]
selectedDevice.value = initialDevice

function handleImageUpload(file: File) {
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.onload = async () => {
    if (!selectedDevice.value) return
    isGenerating.value = true
    try {
      canvas.value = await generateMockup(img, selectedDevice.value)
    } catch (err) {
      console.error('Mockup generation failed:', err)
      error.value = 'Failed to generate mockup'
    } finally {
      isGenerating.value = false
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
  if (!canvas.value || !selectedDevice.value) return
  canvas.value.toBlob((blob) => {
    if (!blob) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `mockup-${selectedDevice.value!.id}.png`
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
  }
}
</script>

<style scoped>
.gi-device-selector {
  margin-bottom: var(--gi-space-xl);
}

.gi-category-tabs {
  display: flex;
  gap: var(--gi-space-sm);
  margin-bottom: var(--gi-space-lg);
}

.gi-category-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--gi-space-sm);
  padding: var(--gi-space-md) var(--gi-space-lg);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  background: var(--gi-surface);
  color: var(--gi-text-muted);
  font-size: var(--gi-font-size-sm);
  font-weight: var(--gi-font-weight-medium);
  cursor: pointer;
  transition: all var(--gi-transition-base) var(--gi-ease-out);
}

.gi-category-tab:hover {
  border-color: var(--gi-border-hover);
  color: var(--gi-text);
}

.gi-category-tab.active {
  border-color: var(--gi-brand);
  background: var(--gi-brand-fade);
  color: var(--gi-brand);
}

.gi-tab-icon {
  width: 18px;
  height: 18px;
}

.gi-devices-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--gi-space-md);
}

@media (max-width: 768px) {
  .gi-devices-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .gi-devices-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.gi-device-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gi-space-sm);
  padding: var(--gi-space-lg);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-xl);
  background: var(--gi-surface);
  cursor: pointer;
  transition: all var(--gi-transition-base) var(--gi-ease-out);
}

.gi-device-card:hover {
  border-color: var(--gi-border-hover);
  transform: translateY(-2px);
  box-shadow: var(--gi-shadow-md);
}

.gi-device-card.active {
  border-color: var(--gi-brand);
  background: var(--gi-brand-fade);
  box-shadow: var(--gi-shadow-glow);
}

.gi-device-preview {
  width: 100%;
  aspect-ratio: 3/4;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--gi-radius-md);
  background: var(--gi-bg-soft);
}

.gi-device-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  pointer-events: none;
}

.gi-device-name {
  font-size: var(--gi-font-size-xs);
  font-weight: var(--gi-font-weight-medium);
  color: var(--gi-text);
  text-align: center;
}

.gi-device-card.active .gi-device-name {
  color: var(--gi-brand);
}

.gi-mockup-preview {
  display: flex;
  justify-content: center;
  margin-top: var(--gi-space-xl);
}

.gi-mockup-preview canvas {
  max-width: 320px;
  width: 100%;
  height: auto;
  border-radius: var(--gi-radius-lg);
  box-shadow: var(--gi-shadow-lg);
}

.gi-mockup-actions {
  display: flex;
  gap: var(--gi-space-md);
  justify-content: center;
  margin-top: var(--gi-space-lg);
}

.gi-btn-secondary {
  padding: var(--gi-space-md) var(--gi-space-xl);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  background: var(--gi-surface);
  color: var(--gi-text);
  font-size: var(--gi-font-size-sm);
  font-weight: var(--gi-font-weight-medium);
  cursor: pointer;
  transition: all var(--gi-transition-base) var(--gi-ease-out);
}

.gi-btn-secondary:hover {
  background: var(--gi-bg-soft);
  border-color: var(--gi-border-hover);
}
</style>