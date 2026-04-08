<template>
  <div class="gi-image-upload">
    <!-- Initial state: clean upload button -->
    <button
      v-if="!isOpen"
      class="gi-image-upload-trigger"
      type="button"
      @click="openZone"
    >
      <ImagePlus :size="20" :stroke-width="1.5" />
      <span>{{ t('imageUpload.uploadBtn') }}</span>
    </button>

    <!-- Expanded state: drop zone with paste support -->
    <div
      v-else
      ref="dropZoneRef"
      class="gi-image-upload-zone"
      :class="{
        'gi-image-upload-zone--dragover': isDragOver,
      }"
      tabindex="0"
      role="button"
      :aria-label="ariaLabelText"
      @click="fileInputRef?.click()"
      @keydown.enter="fileInputRef?.click()"
      @keydown.space.prevent="fileInputRef?.click()"
      @paste="handlePaste"
      @dragover.prevent="onDragOver"
      @dragleave="onDragLeave"
      @drop.prevent="onDrop"
    >
      <input
        ref="fileInputRef"
        type="file"
        hidden
        :accept="computedAccept"
        :multiple="multiple"
        @change="handleFileInput"
      />

      <button
        class="gi-image-upload-zone__close"
        type="button"
        :aria-label="t('imageUpload.close')"
        @click.stop="closeZone"
      >
        <X :size="18" :stroke-width="2" />
      </button>

      <div class="gi-image-upload-zone__content">
        <div class="gi-image-upload-zone__actions">
          <div class="gi-upload-action">
            <div class="gi-upload-action__icon">
              <Clipboard :size="20" :stroke-width="1.5" />
            </div>
            <span class="gi-upload-action__label">{{ t('imageUpload.paste') }}</span>
          </div>

          <span class="gi-upload-action__separator" aria-hidden="true" />

          <div class="gi-upload-action">
            <div class="gi-upload-action__icon">
              <ArrowDownToLine :size="20" :stroke-width="1.5" />
            </div>
            <span class="gi-upload-action__label">{{ t('imageUpload.drop') }}</span>
          </div>
        </div>

        <p class="gi-image-upload-zone__hint">{{ t('imageUpload.pasteHint') }}</p>
      </div>
    </div>

    <div v-if="localError" class="gi-image-upload__error" role="alert" aria-live="polite">
      <GiStatusBadge variant="error" :showIcon="true">{{ localError }}</GiStatusBadge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { ImagePlus, Clipboard, ArrowDownToLine, X } from 'lucide-vue-next'
import { useImageUpload } from '../composables/useImageUpload'
import GiStatusBadge from './GiStatusBadge.vue'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  accept?: string[]
  multiple?: boolean
  maxSizeMB?: number
  label?: string
}>(), {
  accept: () => ['image/*'],
  multiple: false,
  maxSizeMB: undefined,
  label: undefined,
})

const emit = defineEmits<{
  upload: [file: File]
  error: [error: string]
}>()

const { isValidFile, processFile, reset } = useImageUpload({
  accept: props.accept,
  multiple: props.multiple,
  maxSizeMB: props.maxSizeMB,
})

const dropZoneRef = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)
const isOpen = ref(false)
const localError = ref<string | null>(null)

const computedAccept = computed(() => props.accept.join(','))
const ariaLabelText = computed(() => props.label || t('imageUpload.ariaLabel'))

function openZone() {
  isOpen.value = true
  // Small delay to let animation start before focusing
  requestAnimationFrame(() => {
    dropZoneRef.value?.focus()
  })
}

function closeZone() {
  isOpen.value = false
  localError.value = null
}

function onDragOver() {
  isDragOver.value = true
}

function onDragLeave() {
  isDragOver.value = false
}

function onDrop(e: DragEvent) {
  isDragOver.value = false
  localError.value = null

  const file = e.dataTransfer?.files?.[0]
  if (file) {
    handleFile(file)
  }
}

async function handlePaste(e: ClipboardEvent) {
  e.preventDefault()
  localError.value = null

  const items = e.clipboardData?.items
  if (!items || items.length === 0) {
    localError.value = t('imageUpload.error.noClipboard')
    emit('error', localError.value)
    return
  }

  let hasImageItem = false

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      hasImageItem = true
      const blob = item.getAsFile()
      if (blob) {
        const file = new File([blob], 'pasted-image.png', { type: blob.type })
        await handleFile(file)
      }
      break
    }
  }

  if (!hasImageItem) {
    localError.value = t('imageUpload.error.noClipboard')
    emit('error', localError.value)
  }
}

function handleFileInput(e: Event) {
  localError.value = null
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    handleFile(file)
  }
}

async function handleFile(file: File) {
  if (!isValidFile(file)) {
    localError.value = t('imageUpload.error.invalidFile')
    emit('error', localError.value)
    return
  }

  await processFile(file)
  emit('upload', file)
}

// Global paste listener - works when zone is open
function onGlobalPaste(e: ClipboardEvent) {
  if (!isOpen.value) return

  // Don't intercept if user is typing in an input
  const activeElement = document.activeElement
  const isInputFocused = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA'
  if (isInputFocused) return

  e.preventDefault()
  localError.value = null

  const items = e.clipboardData?.items
  if (!items || items.length === 0) return

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const blob = item.getAsFile()
      if (blob) {
        const file = new File([blob], 'pasted-image.png', { type: blob.type })
        handleFile(file)
      }
      break
    }
  }
}

onMounted(() => {
  document.addEventListener('paste', onGlobalPaste)
})

onBeforeUnmount(() => {
  document.removeEventListener('paste', onGlobalPaste)
})

defineExpose({
  reset,
  closeZone,
})
</script>

<style scoped>
.gi-image-upload {
  margin-bottom: var(--gi-space-lg);
}

/* Upload trigger button */
.gi-image-upload-trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--gi-space-sm);
  padding: var(--gi-space-sm) var(--gi-space-lg);
  border: 1px solid var(--gi-border-hover);
  border-radius: var(--gi-radius-pill);
  background: var(--gi-surface);
  color: var(--gi-text);
  font-size: var(--gi-font-size-sm);
  font-weight: var(--gi-font-weight-medium);
  font-family: inherit;
  cursor: pointer;
  transition: all var(--gi-transition-base) var(--gi-ease-out);
  box-shadow: var(--gi-shadow-sm);
}

.gi-image-upload-trigger:hover {
  border-color: var(--gi-brand);
  color: var(--gi-brand);
  background: color-mix(in srgb, var(--gi-tint-green-bg) 40%, var(--gi-surface));
  box-shadow: var(--gi-shadow);
  transform: translateY(-1px);
}

.gi-image-upload-trigger:active {
  transform: scale(0.98);
  box-shadow: var(--gi-shadow-sm);
}

.gi-image-upload-trigger:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

/* Upload zone */
.gi-image-upload-zone {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  padding: var(--gi-space-lg);
  border: 2px dashed var(--gi-border-hover);
  border-radius: var(--gi-radius-xl);
  background: var(--gi-surface);
  cursor: pointer;
  transition: all var(--gi-transition-base) var(--gi-ease-out);
  outline: none;
  animation: zone-expand var(--gi-transition-base) var(--gi-ease-out);
}

@keyframes zone-expand {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.gi-image-upload-zone:hover {
  border-color: var(--gi-brand);
  background: color-mix(in srgb, var(--gi-tint-green-bg) 40%, var(--gi-surface));
}

.gi-image-upload-zone:focus-visible {
  border-color: var(--gi-brand);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--gi-brand) 20%, transparent);
}

.gi-image-upload-zone--dragover {
  border-color: var(--gi-brand);
  border-style: solid;
  background: color-mix(in srgb, var(--gi-tint-green-bg) 60%, var(--gi-surface));
  box-shadow: var(--gi-shadow-md);
  transform: scale(1.01);
}

.gi-image-upload-zone:active {
  transform: scale(0.99);
}

/* Close button */
.gi-image-upload-zone__close {
  position: absolute;
  top: var(--gi-space-sm);
  right: var(--gi-space-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--gi-radius-md);
  background: transparent;
  color: var(--gi-text-muted);
  cursor: pointer;
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
  z-index: 1;
}

.gi-image-upload-zone__close:hover {
  background: var(--gi-bg-soft);
  color: var(--gi-text);
}

.gi-image-upload-zone__close:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 1px;
}

/* Zone content */
.gi-image-upload-zone__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gi-space-md);
  text-align: center;
  pointer-events: none;
}

/* Action badges */
.gi-image-upload-zone__actions {
  display: flex;
  align-items: center;
  gap: var(--gi-space-sm);
}

.gi-upload-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gi-space-xs);
  padding: var(--gi-space-sm) var(--gi-space-md);
  border-radius: var(--gi-radius-md);
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
  min-width: 64px;
}

.gi-upload-action__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--gi-radius-md);
  background: var(--gi-bg-soft);
  color: var(--gi-brand);
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
}

.gi-image-upload-zone:hover .gi-upload-action__icon {
  background: color-mix(in srgb, var(--gi-tint-green-bg) 70%, var(--gi-bg-soft));
}

.gi-upload-action__label {
  font-size: var(--gi-font-size-xs);
  font-weight: var(--gi-font-weight-medium);
  color: var(--gi-text-muted);
  white-space: nowrap;
}

.gi-upload-action__separator {
  width: 1px;
  height: 32px;
  background: var(--gi-border);
  flex-shrink: 0;
}

/* Hint text */
.gi-image-upload-zone__hint {
  margin: 0;
  font-size: var(--gi-font-size-xs);
  color: var(--gi-text-muted);
  line-height: var(--gi-line-height-base);
}

/* Error state */
.gi-image-upload__error {
  margin-top: var(--gi-space-md);
}

/* Mobile responsive */
@media (max-width: 640px) {
  .gi-image-upload-trigger {
    width: 100%;
    justify-content: center;
    padding: var(--gi-space-md);
  }

  .gi-image-upload-zone {
    min-height: 110px;
    padding: var(--gi-space-md);
  }

  .gi-image-upload-zone__actions {
    gap: var(--gi-space-xs);
  }

  .gi-upload-action {
    padding: var(--gi-space-xs) var(--gi-space-sm);
    min-width: 56px;
  }

  .gi-upload-action__icon {
    width: 36px;
    height: 36px;
  }

  .gi-upload-action__label {
    font-size: 11px;
  }

  .gi-upload-action__separator {
    height: 28px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gi-image-upload-zone,
  .gi-upload-action,
  .gi-upload-action__icon,
  .gi-image-upload-trigger {
    transition: none;
  }

  .gi-image-upload-zone {
    animation: none;
  }
}

/* Dark mode */
[data-theme="dark"] .gi-image-upload-trigger {
  background: var(--gi-surface-elevated);
}

[data-theme="dark"] .gi-image-upload-trigger:hover {
  background: color-mix(in srgb, var(--gi-tint-green-bg) 25%, var(--gi-surface-elevated));
}

[data-theme="dark"] .gi-image-upload-zone {
  background: var(--gi-surface-elevated);
}

[data-theme="dark"] .gi-image-upload-zone:hover {
  background: color-mix(in srgb, var(--gi-tint-green-bg) 25%, var(--gi-surface-elevated));
}

[data-theme="dark"] .gi-image-upload-zone--dragover {
  background: color-mix(in srgb, var(--gi-tint-green-bg) 45%, var(--gi-surface-elevated));
}

[data-theme="dark"] .gi-upload-action__icon {
  background: var(--gi-bg-soft);
}

[data-theme="dark"] .gi-upload-action__separator {
  background: var(--gi-border-strong);
}

[data-theme="dark"] .gi-image-upload-zone__close:hover {
  background: var(--gi-surface);
}
</style>
