<template>
  <ToolPageLayout
    :title="t('imageCropper.title')"
    :description="t('imageCropper.desc')"
    category="design"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
  >
    <template #icon>
      <Crop />
    </template>

    <GiImageUpload
      v-if="!originalUrl"
      @upload="handleImageUpload"
      @error="handleError"
    />

    <div v-else>
      <!-- Controls Card -->
      <div class="gi-card ic-controls-card">
        <div class="ic-controls-header">
          <h3 class="ic-controls-title">{{ t('imageCropper.controls') }}</h3>
          <button 
            class="gi-btn-ghost ic-btn-reset" 
            @click="resetCrop"
            :aria-label="t('imageCropper.reset')"
          >
            <RotateCcw :size="18" />
          </button>
        </div>
        
        <div class="ic-controls-body">
          <!-- Aspect Ratio Selector -->
          <div class="ic-control-group">
            <label class="gi-label" for="aspect-ratio-select">
              {{ t('imageCropper.aspectRatio') }}
            </label>
            <div class="ic-ratio-buttons">
              <button
                v-for="[key, label] in ratioOptions"
                :key="key"
                :class="['ic-ratio-btn', { active: ratioKey === key }]"
                @click="setRatio(key)"
                :aria-pressed="ratioKey === key"
              >
                {{ label }}
              </button>
            </div>
          </div>

          <!-- Image Info -->
          <div v-if="isLoaded" class="ic-image-info">
            <span class="ic-info-label">{{ t('imageCropper.imageSize') }}:</span>
            <span class="ic-info-value">{{ imageDimensions }}</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="ic-actions">
        <button
          class="gi-btn"
          :disabled="isCropping"
          @click="handleCrop"
        >
          <Crop :size="18" v-if="!isCropping" />
          <Loader2 :size="18" class="animate-spin" v-else />
          {{ isCropping ? t('imageCropper.processing') : t('imageCropper.crop') }}
        </button>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="ic-error-alert" role="alert">
        <CircleAlert :size="18" class="ic-error-icon" />
        <span class="ic-error-message">{{ errorMessage }}</span>
        <button class="ic-error-dismiss" @click="clearError" :aria-label="t('imageCropper.error.dismiss')">
          <X :size="16" />
        </button>
      </div>

      <!-- Cropper Workspace -->
      <div
        ref="containerRef"
        class="ic-workspace"
      >
        <div class="ic-image-container">
          <img
            ref="imageRef"
            :src="originalUrl"
            class="ic-image"
            @load="onImageLoad"
          />

          <!-- Dimming Overlay -->
          <div v-if="isLoaded" class="ic-dimmer"></div>

          <!-- Crop Box -->
          <div
            v-if="isLoaded"
            class="ic-crop-box"
            :class="{ 'ic-crop-box--active': isDragging || isResizing }"
            :style="boxStyle"
            tabindex="0"
            role="region"
            :aria-label="t('imageCropper.cropArea')"
            @mousedown="onBoxMouseDown"
            @keydown="onCropBoxKeyDown"
          >
            <!-- Preview of un-dimmed image -->
            <div
              class="ic-crop-preview"
              :style="previewImgStyle"
            ></div>

            <!-- Resizers -->
            <div class="ic-handle ic-handle-br" @mousedown.stop="onHandleMouseDown($event)"></div>
          </div>
        </div>
      </div>

      <!-- Result Section -->
      <div v-if="croppedUrl" class="gi-card ic-result-card">
        <div class="ic-result-header">
          <h3 class="ic-result-title">
            <CheckCircle2 :size="20" class="ic-success-icon" />
            {{ t('imageCropper.result') }}
          </h3>
          <div class="ic-result-actions">
            <button 
              class="gi-btn-ghost" 
              @click="resetCrop"
              :aria-label="t('imageCropper.reset')"
            >
              {{ t('imageCropper.reset') }}
            </button>
          </div>
        </div>
        
        <div class="ic-result-body">
          <img 
            :src="croppedUrl" 
            :alt="t('imageCropper.result')"
            class="ic-result-image" 
          />
          
          <div class="ic-result-info">
            <div class="ic-info-row">
              <span class="ic-info-label">{{ t('imageCropper.cropDimensions') }}:</span>
              <span class="ic-info-value">{{ cropDimensions }}</span>
            </div>
          </div>
          
          <div class="ic-result-actions-bottom">
            <button 
              class="gi-btn ic-download-btn" 
              @click="downloadCropped"
            >
              <Download :size="18" />
              {{ t('imageCropper.download') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Pedagogic Section -->
      <div class="ic-pedagogic">
        <h4 class="ic-pedagogic-title">{{ t('imageCropper.pedagogic.title') }}</h4>
        <p class="ic-pedagogic-description">{{ t('imageCropper.pedagogic.description') }}</p>
        <ul class="ic-pedagogic-tips">
          <li v-for="(tip, index) in pedagogicTips" :key="index">
            <Check :size="16" class="ic-tip-icon" />
            {{ tip }}
          </li>
        </ul>
      </div>
    </div>

    <template #about>{{ t('imageCropper.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { Crop, RotateCcw, Loader2, CheckCircle2, Download, CircleAlert, X, Check } from 'lucide-vue-next'
import { cropImage } from '../composables/useImageCropper'
import GiImageUpload from '../components/GiImageUpload.vue'
import ToolPageLayout from '../components/ToolPageLayout.vue'

const { t } = useI18n()

const imageRef = ref<HTMLImageElement | null>(null)
const originalUrl = ref('')
const croppedUrl = ref('')
const croppedDimensions = ref('')
const isLoaded = ref(false)
const isCropping = ref(false)
const error = ref<string | null>(null)

const errorMessage = computed(() => {
  if (!error.value) return ''
  switch (error.value) {
    case 'Invalid crop area':
      return t('imageCropper.error.invalidCrop')
    default:
      return t('imageCropper.error.cropFailed')
  }
})

function clearError() {
  error.value = null
}

const ratioKey = ref('free')
const ratios: Record<string, number | null> = {
  'free': null,
  '1:1': 1,
  '16:9': 16/9,
  '4:5': 4/5
}

const ratioOptions = computed(() => [
  ['free', t('imageCropper.free')],
  ['1:1', t('imageCropper.square')],
  ['16:9', t('imageCropper.landscape')],
  ['4:5', t('imageCropper.portrait')],
] as const)

const imageDimensions = computed(() => {
  if (!imageRef.value) return ''
  return `${imageRef.value.naturalWidth} × ${imageRef.value.naturalHeight} px`
})

const cropDimensions = computed(() => {
  return croppedDimensions.value
})

const locale = computed(() => useI18n().locale.value)

// Pedagogic tips - defined here to avoid i18n array iteration issues
const pedagogicTips = computed<string[]>(() => {
  const isFrench = locale.value === 'fr'
  return isFrench
    ? [
        '1:1 (carré) pour Instagram et les avatars',
        '16:9 pour les vidéos YouTube et les bannières',
        '4:5 pour les posts portrait Instagram',
        'Conservez les éléments importants au centre',
      ]
    : [
        '1:1 (square) for Instagram and avatars',
        '16:9 for YouTube videos and banners',
        '4:5 for Instagram portrait posts',
        'Keep important elements centered',
      ]
})

function updateCroppedDimensions() {
  if (!croppedUrl.value) {
    croppedDimensions.value = ''
    return
  }
  const img = new Image()
  img.onload = () => {
    croppedDimensions.value = `${img.naturalWidth} × ${img.naturalHeight} px`
  }
  img.src = croppedUrl.value
}

function setRatio(key: string) {
  ratioKey.value = key
  applyRatio()
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

function onCropBoxKeyDown(e: KeyboardEvent) {
  const step = e.shiftKey ? 10 : 1
  const { width: imgW, height: imgH } = imageRef.value!
  
  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault()
      cropBox.x = Math.max(0, cropBox.x - step)
      break
    case 'ArrowRight':
      e.preventDefault()
      cropBox.x = Math.min(imgW - cropBox.w, cropBox.x + step)
      break
    case 'ArrowUp':
      e.preventDefault()
      cropBox.y = Math.max(0, cropBox.y - step)
      break
    case 'ArrowDown':
      e.preventDefault()
      cropBox.y = Math.min(imgH - cropBox.h, cropBox.y + step)
      break
  }
}

async function handleCrop() {
  if (!imageRef.value || isCropping.value) return
  
  clearError()
  
  // Need to scale screen coordinates to actual image pixels
  const { naturalWidth, width } = imageRef.value
  const scale = naturalWidth / width

  isCropping.value = true
  const rect = {
    x: cropBox.x * scale,
    y: cropBox.y * scale,
    width: cropBox.w * scale,
    height: cropBox.h * scale
  }

  try {
    const result = await cropImage(originalUrl.value, rect)
    croppedUrl.value = result
    updateCroppedDimensions()
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('imageCropper.error.cropFailed')
  } finally {
    isCropping.value = false
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
/* Controls Card */
.ic-controls-card {
  padding: var(--gi-space-md);
  margin-bottom: var(--gi-space-md);
}

.ic-controls-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--gi-space-sm);
}

.ic-controls-title {
  font-size: var(--gi-font-size-md);
  font-weight: 600;
  color: var(--gi-text);
  margin: 0;
}

.ic-btn-reset {
  min-width: 44px;
  min-height: 44px;
  padding: 0.5rem;
}

.ic-controls-body {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-md);
}

.ic-control-group {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-xs);
}

.ic-ratio-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.ic-ratio-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  background: var(--gi-surface);
  color: var(--gi-text);
  font-size: var(--gi-font-size-sm);
  cursor: pointer;
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
  min-height: 44px;
  min-width: 44px;
}

.ic-ratio-btn:hover {
  background: var(--gi-surface-hover);
  border-color: var(--gi-border-hover);
  transform: translateY(-1px);
}

.ic-ratio-btn:active {
  transform: translateY(0) scale(0.98);
}

.ic-ratio-btn.active {
  background: var(--gi-brand);
  color: var(--gi-text-inverse);
  border-color: var(--gi-brand);
  transform: translateY(-1px);
  box-shadow: var(--gi-shadow-sm);
}

.ic-image-info {
  padding-top: var(--gi-space-sm);
  border-top: 1px solid var(--gi-border);
}

.ic-info-label {
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-secondary);
}

.ic-info-value {
  font-size: var(--gi-font-size-sm);
  font-weight: 600;
  color: var(--gi-text);
  margin-left: 0.25rem;
}

.ic-actions {
  display: flex;
  gap: var(--gi-space-sm);
  margin-top: var(--gi-space-md);
}

/* Workspace */
.ic-workspace {
  position: relative;
  overflow: hidden;
  background: var(--gi-bg);
  border-radius: var(--gi-radius-lg);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  max-height: 70vh;
  border: 1px solid var(--gi-border);
}

/* Loading shimmer animation */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.ic-workspace--loading {
  background: linear-gradient(
    90deg,
    var(--gi-surface) 25%,
    var(--gi-bg) 50%,
    var(--gi-surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.ic-image-container {
  position: relative;
  display: inline-block;
  line-height: 0;
}

.ic-image {
  display: block;
  max-width: 100%;
  max-height: 70vh;
  user-select: none;
  pointer-events: none;
}

/* Dimming Overlay */
.ic-dimmer {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

/* Crop Box */
.ic-crop-box {
  position: absolute;
  border: 2px solid var(--gi-brand);
  cursor: grab;
  overflow: hidden;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  transition: box-shadow var(--gi-transition-base) var(--gi-ease-out);
}

.ic-crop-box:active {
  cursor: grabbing;
}

.ic-crop-box--active {
  border-width: 3px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 0 4px rgba(10, 170, 142, 0.3);
}

/* Crop Preview */
.ic-crop-preview {
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
}

/* Handles */
.ic-handle {
  position: absolute;
  width: 20px;
  height: 20px;
  background: var(--gi-surface);
  border: 2px solid var(--gi-brand);
  border-radius: var(--gi-radius-sm);
  cursor: nwse-resize;
  transition: transform var(--gi-transition-fast) var(--gi-ease-out);
}

.ic-handle:hover {
  transform: scale(1.1);
}

.ic-handle-br {
  bottom: -10px;
  right: -10px;
}

/* Result Section */
.ic-result-card {
  margin-top: var(--gi-space-xl);
  border: 2px solid var(--gi-brand);
}

.ic-result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--gi-space-md);
}

.ic-result-title {
  display: flex;
  align-items: center;
  gap: var(--gi-space-xs);
  font-size: var(--gi-font-size-lg);
  font-weight: 600;
  color: var(--gi-text);
  margin: 0;
}

.ic-success-icon {
  color: var(--gi-brand);
}

.ic-result-actions {
  display: flex;
  gap: var(--gi-space-xs);
}

.ic-result-body {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-md);
}

.ic-result-image {
  width: 100%;
  max-width: 100%;
  border-radius: var(--gi-radius-lg);
  border: 1px solid var(--gi-border);
}

.ic-result-info {
  padding: var(--gi-space-sm);
  background: var(--gi-bg);
  border-radius: var(--gi-radius-md);
}

.ic-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ic-result-actions-bottom {
  display: flex;
  gap: var(--gi-space-sm);
  padding-top: var(--gi-space-sm);
  border-top: 1px solid var(--gi-border);
}

.ic-download-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--gi-space-xs);
  min-height: 44px;
}

/* Error Alert */
.ic-error-alert {
  display: flex;
  align-items: center;
  gap: var(--gi-space-sm);
  padding: var(--gi-space-md);
  background: rgba(220, 38, 38, 0.05);
  border: 1px solid var(--gi-error);
  border-radius: var(--gi-radius-md);
  margin-bottom: var(--gi-space-md);
}

.ic-error-icon {
  color: var(--gi-error);
  flex-shrink: 0;
}

.ic-error-message {
  flex: 1;
  color: var(--gi-error);
  font-size: var(--gi-font-size-sm);
  font-weight: 500;
}

.ic-error-dismiss {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  min-height: 32px;
  padding: 0.25rem;
  border: none;
  background: transparent;
  color: var(--gi-error);
  cursor: pointer;
  border-radius: var(--gi-radius-sm);
  transition: background var(--gi-transition-fast) var(--gi-ease-out);
}

.ic-error-dismiss:hover {
  background: rgba(220, 38, 38, 0.1);
}

/* Dark mode */
[data-theme="dark"] .ic-error-alert {
  background: rgba(248, 113, 113, 0.1);
}

[data-theme="dark"] .ic-error-icon,
[data-theme="dark"] .ic-error-message,
[data-theme="dark"] .ic-error-dismiss {
  color: #f87171;
}

/* Pedagogic Section */
.ic-pedagogic {
  margin-top: var(--gi-space-lg);
  padding: var(--gi-space-lg);
  background: linear-gradient(135deg, rgba(10, 170, 142, 0.05) 0%, rgba(106, 231, 200, 0.05) 100%);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
}

.ic-pedagogic-title {
  font-size: var(--gi-font-size-md);
  font-weight: 600;
  color: var(--gi-text);
  margin: 0 0 var(--gi-space-sm) 0;
}

.ic-pedagogic-description {
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-secondary);
  line-height: 1.6;
  margin: 0 0 var(--gi-space-md) 0;
}

.ic-pedagogic-tips {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-xs);
}

.ic-pedagogic-tips li {
  display: flex;
  align-items: flex-start;
  gap: var(--gi-space-sm);
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text);
}

.ic-tip-icon {
  color: var(--gi-brand);
  flex-shrink: 0;
  margin-top: 2px;
}

[data-theme="dark"] .ic-pedagogic {
  background: linear-gradient(135deg, rgba(10, 170, 142, 0.1) 0%, rgba(106, 231, 200, 0.1) 100%);
}

[data-theme="dark"] .ic-crop-box {
  border-color: var(--gi-mint);
}

[data-theme="dark"] .ic-handle {
  background: var(--gi-surface);
  border-color: var(--gi-mint);
}

/* Focus states */
.ic-crop-box:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

.ic-handle:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

/* Responsive */
@media (max-width: 640px) {
  .ic-ratio-buttons {
    flex-wrap: wrap;
  }

  .ic-workspace {
    min-height: 300px;
  }
  
  .ic-result-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--gi-space-sm);
  }
  
  .ic-result-actions-bottom {
    flex-direction: column;
  }
  
  .ic-pedagogic {
    padding: var(--gi-space-md);
  }
}

@media (max-width: 480px) {
  .ic-workspace {
    min-height: 250px;
    max-height: 50vh;
  }
  
  .ic-ratio-btn {
    font-size: var(--gi-font-size-xs);
    padding: 0.4rem 0.75rem;
  }
  
  .ic-handle {
    width: 24px;
    height: 24px;
  }
  
  .ic-handle-br {
    bottom: -12px;
    right: -12px;
  }
  
  .ic-controls-card {
    padding: var(--gi-space-sm);
  }
}
</style>
