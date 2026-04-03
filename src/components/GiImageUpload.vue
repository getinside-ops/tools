<template>
  <div class="gi-image-upload-wrapper">
    <div class="gi-image-upload-panel">
      <div class="gi-image-upload-header">
        <p class="gi-image-upload-kicker">{{ uploadKickerText }}</p>
        <p class="gi-image-upload-intro">
          {{ uploadIntroText }}
        </p>
      </div>

      <div class="gi-image-upload-actions" :class="{ 'gi-image-upload-actions--single': !pasteZone }">
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

        <div v-if="pasteZone" class="gi-upload-divider" aria-hidden="true">
          <span>{{ uploadDividerText }}</span>
        </div>

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
          <div class="gi-upload-zone-content">
            <div class="gi-upload-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <p class="gi-upload-title">{{ uploadTextValue }}</p>
            <p class="gi-upload-hint">{{ uploadHintText }}</p>
          </div>
        </div>
      </div>
    </div>

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
const uploadKickerText = computed(() => t('imageUpload.kicker'))
const uploadIntroText = computed(() => t('imageUpload.intro'))
const uploadHintText = computed(() => t('imageUpload.hint'))
const uploadDividerText = computed(() => t('imageUpload.divider'))
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

.gi-image-upload-panel {
  position: relative;
  margin-bottom: 1rem;
  border: 1px solid color-mix(in srgb, var(--gi-brand) 22%, var(--gi-border));
  border-radius: var(--gi-radius-xl);
  padding: 1.25rem;
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--gi-mint) 18%, transparent), transparent 42%),
    linear-gradient(180deg, color-mix(in srgb, var(--gi-surface) 92%, var(--gi-bg-soft)), var(--gi-surface));
  box-shadow: var(--gi-shadow-sm);
}

.gi-image-upload-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.45), transparent 42%);
  pointer-events: none;
}

.gi-image-upload-header,
.gi-image-upload-actions {
  position: relative;
  z-index: 1;
}

.gi-image-upload-header {
  margin-bottom: 1rem;
}

.gi-image-upload-kicker {
  margin: 0 0 0.35rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--gi-brand-dark);
}

.gi-image-upload-intro {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.55;
  color: var(--gi-text-muted);
}

.gi-image-upload-actions {
  display: grid;
  gap: 1rem;
}

.gi-image-upload-actions--single {
  grid-template-columns: minmax(0, 1fr);
}

.gi-upload-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gi-text-muted);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.gi-upload-divider::before,
.gi-upload-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: color-mix(in srgb, var(--gi-brand) 18%, var(--gi-border));
}

.gi-upload-divider span {
  padding: 0 0.75rem;
}

.gi-paste-zone {
  min-height: 100%;
  border: 1px solid color-mix(in srgb, var(--gi-brand) 22%, var(--gi-border));
  border-radius: calc(var(--gi-radius-xl) - 4px);
  padding: 1.5rem 1.25rem;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s, box-shadow 0.15s, transform 0.15s;
  outline: none;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.92));
}

.gi-paste-zone:hover,
.gi-upload-zone:hover {
  border-color: var(--gi-brand);
  background: color-mix(in srgb, var(--gi-tint-green-bg) 68%, var(--gi-surface));
  box-shadow: var(--gi-shadow-sm);
  transform: translateY(-1px);
}

.gi-paste-zone-focus {
  border-color: var(--gi-brand);
  box-shadow: 0 0 0 3px rgba(10, 170, 142, 0.15);
}

.gi-paste-zone-content {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  justify-content: center;
  min-height: 100%;
}

.gi-paste-icon {
  color: var(--gi-brand);
  opacity: 0.85;
}

.gi-paste-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--gi-text);
  margin: 0;
}

.gi-paste-hint {
  font-size: 0.92rem;
  color: var(--gi-text-muted);
  line-height: 1.55;
  margin: 0;
}

.gi-upload-zone {
  min-height: 100%;
  border: 1px dashed color-mix(in srgb, var(--gi-brand) 38%, var(--gi-border));
  border-radius: calc(var(--gi-radius-xl) - 4px);
  padding: 1.5rem;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s, box-shadow 0.15s, transform 0.15s;
  background: color-mix(in srgb, var(--gi-bg-soft) 70%, var(--gi-surface));
}

.gi-upload-zone-content {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  justify-content: center;
  min-height: 100%;
}

.gi-upload-icon {
  color: var(--gi-brand-dark);
}

.gi-upload-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--gi-text);
}

.gi-upload-hint {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--gi-text-muted);
}

@media (min-width: 720px) {
  .gi-image-upload-actions {
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: stretch;
  }

  .gi-image-upload-actions--single {
    grid-template-columns: minmax(0, 1fr);
  }

  .gi-upload-divider {
    flex-direction: column;
    min-height: 100%;
  }

  .gi-upload-divider span {
    padding: 0.75rem 0;
  }

  .gi-upload-divider::before,
  .gi-upload-divider::after {
    width: 1px;
    height: auto;
  }
}

[data-theme='dark'] .gi-image-upload-panel::before {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), transparent 42%);
}

[data-theme='dark'] .gi-paste-zone,
[data-theme='dark'] .gi-upload-zone {
  background: color-mix(in srgb, var(--gi-surface-elevated) 88%, var(--gi-bg-soft));
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
