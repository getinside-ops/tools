<template>
  <div @mousemove="onMouseMove" @mouseup="onMouseUp" @mouseleave="onMouseUp">
    <div class="gi-tool-header">
      <h1>{{ t('imageCropper.title') }}</h1>
      <p>{{ t('imageCropper.desc') }}</p>
    </div>

    <GiImageUpload
      v-if="!originalUrl"
      @upload="handleImageUpload"
      @error="handleError"
    />

    <div v-else>
      <!-- Controls -->
      <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
        <div class="gi-field" style="margin-bottom: 0; min-width: 200px">
          <label class="gi-label">{{ t('imageCropper.aspectRatio') }}</label>
          <select v-model="ratioKey" class="gi-select" @change="applyRatio">
            <option value="free">{{ t('imageCropper.free') }}</option>
            <option value="1:1">{{ t('imageCropper.square') }}</option>
            <option value="16:9">{{ t('imageCropper.landscape') }}</option>
            <option value="4:5">{{ t('imageCropper.portrait') }}</option>
          </select>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: flex-end;">
          <button class="gi-btn-primary" @click="handleCrop">{{ t('imageCropper.crop') }}</button>
          <button class="gi-btn-ghost" @click="resetCrop">{{ t('imageCropper.reset') }}</button>
        </div>
      </div>

      <!-- Cropper Workspace -->
      <div
        ref="containerRef"
        class="cropper-workspace"
        style="position: relative; overflow: hidden; background: var(--gi-bg); border-radius: var(--gi-radius); display: flex; justify-content: center; align-items: center; min-height: 400px; max-height: 70vh;"
      >
        <div style="position: relative; display: inline-block;">
          <img 
            ref="imageRef"
            :src="originalUrl" 
            style="display: block; max-width: 100%; max-height: 70vh; user-select: none;"
            @load="onImageLoad"
          />
          
          <!-- Dimming Overlay -->
          <div v-if="isLoaded" class="crop-dimmer" style="position: absolute; inset: 0; background: rgba(0,0,0,0.5); pointer-events: none;"></div>

          <!-- Crop Box -->
          <div 
            v-if="isLoaded"
            class="crop-box"
            :style="boxStyle"
            @mousedown.self="onBoxMouseDown"
          >
            <!-- Preview of un-dimmed image -->
            <div 
              class="crop-preview-img" 
              :style="previewImgStyle"
            ></div>

            <!-- Resizers -->
            <div class="handle br" @mousedown.stop="onHandleMouseDown($event)"></div>
          </div>
        </div>
      </div>

      <!-- Result Result -->
      <div v-if="croppedUrl" class="gi-result" style="margin-top: 2rem;">
        <div class="gi-result-label">Result</div>
        <img :src="croppedUrl" style="max-width: 100%; border-radius: var(--gi-radius); margin-bottom: 1rem;" />
        <button class="gi-btn-primary" @click="downloadCropped">⬇️ {{ t('imageCropper.download') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { cropImage } from '../composables/useImageCropper'
import GiImageUpload from '../components/GiImageUpload.vue'

const { t } = useI18n()

const imageRef = ref<HTMLImageElement | null>(null)
const originalUrl = ref('')
const croppedUrl = ref('')
const isLoaded = ref(false)

const ratioKey = ref('free')
const ratios: Record<string, number | null> = {
  'free': null,
  '1:1': 1,
  '16:9': 16/9,
  '4:5': 4/5
}

// Visual state in pixels relative to the *rendered* image
const cropBox = reactive({
  x: 0,
  y: 0,
  w: 100,
  h: 100
})

// Mouse Interaction
const isDragging = ref(false)
const isResizing = ref(false)
const dragStart = { x: 0, y: 0, boxX: 0, boxY: 0, boxW: 0, boxH: 0 }

function handleImageUpload(file: File) {
  const reader = new FileReader()
  reader.onload = (ev) => {
    originalUrl.value = ev.target?.result as string
    isLoaded.value = false
    croppedUrl.value = ''
  }
  reader.readAsDataURL(file)
}

function handleError(error: string) {
  console.error(error)
  alert(error)
}

const boxStyle = computed(() => ({
  left: `${cropBox.x}px`,
  top: `${cropBox.y}px`,
  width: `${cropBox.w}px`,
  height: `${cropBox.h}px`,
  position: 'absolute' as const,
  border: '2px solid var(--gi-text-brand)',
  cursor: isDragging.value ? 'grabbing' : 'grab',
  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)', // Alternative dimming
  overflow: 'hidden'
}))

const previewImgStyle = computed(() => {
  if (!imageRef.value) return {}
  const { width, height } = imageRef.value.getBoundingClientRect()
  return {
    backgroundImage: `url(${originalUrl.value})`,
    backgroundPosition: `-${cropBox.x}px -${cropBox.y}px`,
    backgroundSize: `${width}px ${height}px`,
    width: '100%',
    height: '100%',
  }
})

function onImageLoad() {
  if (!imageRef.value) return
  isLoaded.value = true
  resetCrop()
}

function resetCrop() {
  if (!imageRef.value) return
  const { width, height } = imageRef.value
  const size = Math.min(width, height) * 0.8
  cropBox.w = size
  cropBox.h = size
  cropBox.x = (width - size) / 2
  cropBox.y = (height - size) / 2
  applyRatio()
}

function applyRatio() {
  const ratio = ratios[ratioKey.value]
  if (!ratio) return
  
  if (cropBox.w / cropBox.h > ratio) {
    cropBox.w = cropBox.h * ratio
  } else {
    cropBox.h = cropBox.w / ratio
  }
}

function onBoxMouseDown(e: MouseEvent) {
  isDragging.value = true
  dragStart.x = e.clientX
  dragStart.y = e.clientY
  dragStart.boxX = cropBox.x
  dragStart.boxY = cropBox.y
}

function onHandleMouseDown(e: MouseEvent) {
  isResizing.value = true
  dragStart.x = e.clientX
  dragStart.y = e.clientY
  dragStart.boxW = cropBox.w
  dragStart.boxH = cropBox.h
}

function onMouseMove(e: MouseEvent) {
  if (!imageRef.value) return
  const { width: imgW, height: imgH } = imageRef.value

  if (isDragging.value) {
    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y
    cropBox.x = Math.max(0, Math.min(imgW - cropBox.w, dragStart.boxX + dx))
    cropBox.y = Math.max(0, Math.min(imgH - cropBox.h, dragStart.boxY + dy))
  } else if (isResizing.value) {
    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y
    let nw = Math.max(20, dragStart.boxW + dx)
    let nh = Math.max(20, dragStart.boxH + dy)
    
    // Clamp to image bounds
    nw = Math.min(nw, imgW - cropBox.x)
    nh = Math.min(nh, imgH - cropBox.y)

    const ratio = ratios[ratioKey.value]
    if (ratio) {
      if (nw / nh > ratio) {
        nw = nh * ratio
      } else {
        nh = nw / ratio
      }
      // Re-clamp after ratio adjustment
      if (nw > imgW - cropBox.x) { nw = imgW - cropBox.x; nh = nw / ratio }
      if (nh > imgH - cropBox.y) { nh = imgH - cropBox.y; nw = nh * ratio }
    }

    cropBox.w = nw
    cropBox.h = nh
  }
}

function onMouseUp() {
  isDragging.value = false
  isResizing.value = false
}

async function handleCrop() {
  if (!imageRef.value) return
  // Need to scale screen coordinates to actual image pixels
  const { naturalWidth, width } = imageRef.value
  const scale = naturalWidth / width
  
  const rect = {
    x: cropBox.x * scale,
    y: cropBox.y * scale,
    width: cropBox.w * scale,
    height: cropBox.h * scale
  }
  
  try {
    const result = await cropImage(originalUrl.value, rect)
    croppedUrl.value = result
  } catch (err) {
    alert(err)
  }
}

function downloadCropped() {
  const link = document.createElement('a')
  link.download = 'cropped-image.png'
  link.href = croppedUrl.value
  link.click()
}
</script>

<style scoped>
.handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: white;
  border: 2px solid var(--gi-text-brand);
  border-radius: 50%;
}
.handle.br {
  bottom: -6px;
  right: -6px;
  cursor: nwse-resize;
}
</style>
