<template>
  <div class="gi-image-upload-wrapper">
    <!-- Paste Zone -->
    <div
      v-if="pasteZone"
      ref="pasteZoneRef"
      class="gi-paste-zone"
      :class="{ 'gi-paste-zone-focus': isFocused }"
      tabindex="0"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @paste="handlePaste"
      @keydown="handleKeydown"
      @click="focusPasteZone"
    >
      <div class="gi-paste-zone-content">
        <div class="gi-paste-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
          </svg>
        </div>
        <p class="gi-paste-title">{{ pasteTitleText }}</p>
        <p class="gi-paste-hint">{{ pasteHintText }}</p>
      </div>
    </div>

    <!-- Upload Zone -->
    <div
      class="gi-upload-zone"
      @click="fileInputRef?.click()"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInputRef"
        type="file"
        hidden
        :accept="computedAccept"
        :multiple="multiple"
        @change="handleFileInput"
      />
      <span>{{ uploadTextValue }}</span>
    </div>

    <!-- Error State -->
    <div v-if="localError" class="gi-result gi-result-error">
      <GiStatusBadge variant="error" :showIcon="true">{{ localError }}</GiStatusBadge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useImageUpload } from '../composables/useImageUpload'
import GiStatusBadge from './GiStatusBadge.vue'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  accept?: string[]
  multiple?: boolean
  pasteZone?: boolean
  pasteTitle?: string
  pasteHint?: string
  uploadText?: string
  maxSizeMB?: number
}>(), {
  accept: () => ['image/*'],
  multiple: false,
  pasteZone: true,
  pasteTitle: undefined,
  pasteHint: undefined,
  uploadText: undefined,
  maxSizeMB: undefined,
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

const pasteZoneRef = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)
const localError = ref<string | null>(null)

const computedAccept = computed(() => props.accept.join(','))

// Computed for i18n with override support
const pasteTitleText = computed(() => props.pasteTitle || t('imageUpload.pasteTitle'))
const pasteHintText = computed(() => props.pasteHint || t('imageUpload.pasteHint'))
const uploadTextValue = computed(() => props.uploadText || t('imageUpload.uploadText'))
const invalidFileError = computed(() => t('imageUpload.error.invalidFile'))
const noClipboardError = computed(() => t('imageUpload.error.noClipboard'))

function focusPasteZone() {
  pasteZoneRef.value?.focus()
}

function handleKeydown(e: KeyboardEvent) {
  // Allow Enter or Space to trigger file input
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    fileInputRef.value?.click()
  }
}

async function handlePaste(e: ClipboardEvent) {
  e.preventDefault()
  localError.value = null

  const items = e.clipboardData?.items
  if (!items || items.length === 0) {
    localError.value = noClipboardError.value
    emit('error', localError.value)
    return
  }

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const blob = item.getAsFile()
      if (blob) {
        const file = new File([blob], 'pasted-image.png', { type: blob.type })
        await handleFile(file)
      }
      break
    }
  }
}

function handleDrop(e: DragEvent) {
  localError.value = null
  const file = e.dataTransfer?.files?.[0]
  if (file) {
    handleFile(file)
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
    localError.value = invalidFileError.value
    emit('error', localError.value)
    return
  }

  await processFile(file)
  emit('upload', file)
}

defineExpose({
  reset,
})
</script>

<style scoped>
.gi-image-upload-wrapper {
  margin-bottom: 1rem;
}

/* Paste Zone */
.gi-paste-zone {
  border: 2px dashed var(--gi-border);
  border-radius: var(--gi-radius-lg);
  padding: 2.5rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s, box-shadow 0.15s;
  margin-bottom: 1rem;
  outline: none;
}

.gi-paste-zone:hover {
  border-color: var(--gi-brand);
  background-color: var(--gi-tint-green-bg);
}

.gi-paste-zone-focus {
  border-color: var(--gi-brand);
  box-shadow: 0 0 0 3px rgba(10, 170, 142, 0.15);
}

.gi-paste-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.gi-paste-icon {
  color: var(--gi-brand);
  opacity: 0.8;
}

.gi-paste-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gi-text);
  margin: 0;
}

.gi-paste-hint {
  font-size: 0.85rem;
  color: var(--gi-text-muted);
  margin: 0;
}

/* Upload Zone */
.gi-upload-zone {
  border: 2px dashed var(--gi-border);
  border-radius: var(--gi-radius-lg);
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  color: var(--gi-text-muted);
  font-size: 0.9rem;
  transition: border-color 0.15s;
  margin-bottom: 1rem;
}

.gi-upload-zone:hover {
  border-color: var(--gi-brand);
  color: var(--gi-brand);
}

/* Error State */
.gi-result {
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  padding: 1.25rem;
  margin-bottom: 1rem;
}
</style>
