<template>
  <div>
    <div class="gi-tool-header">
      <h1>{{ t('metadata.title') }}</h1>
      <p>{{ t('metadata.desc') }}</p>
    </div>

    <div class="gi-field">
      <!-- Upload Area -->
      <div 
        class="gi-result" 
        style="border: 2px dashed var(--gi-border); cursor: pointer; text-align: center; padding: 3rem;" 
        @click="fileInput?.click()"
      >
        <p>📁 {{ t('metadata.upload') }}</p>
        <input ref="fileInput" type="file" hidden accept="image/*" @change="handleFile" />
      </div>
    </div>

    <div v-if="metadata" class="gi-result" style="margin-top: 2rem;">
      <div class="gi-result-label">Technical Properties</div>
      <div class="metadata-table">
        <div class="meta-row">
          <span class="meta-key">{{ t('metadata.name') }}</span>
          <span class="meta-val">{{ metadata.name }}</span>
        </div>
        <div class="meta-row">
          <span class="meta-key">{{ t('metadata.size') }}</span>
          <span class="meta-val">{{ formatSize(metadata.size) }}</span>
        </div>
        <div class="meta-row">
          <span class="meta-key">{{ t('metadata.type') }}</span>
          <span class="meta-val">{{ metadata.type }}</span>
        </div>
        <div class="meta-row">
          <span class="meta-key">{{ t('metadata.lastModified') }}</span>
          <span class="meta-val">{{ formatDate(metadata.lastModified) }}</span>
        </div>
      </div>

      <div class="gi-field" style="margin-top: 2rem; display: flex; justify-content: center;">
        <img :src="previewUrl" class="preview-thumb" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { extractBasicMetadata, type ImageMetadata } from '../composables/useMetadata'

const { t } = useI18n()

const fileInput = ref<HTMLInputElement | null>(null)
const metadata = ref<ImageMetadata | null>(null)
const previewUrl = ref('')

function handleFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  metadata.value = extractBasicMetadata(file)
  
  const reader = new FileReader()
  reader.onload = (ev) => {
    previewUrl.value = ev.target?.result as string
  }
  reader.readAsDataURL(file)
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleString()
}
</script>

<style scoped>
.metadata-table {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}
.meta-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: var(--gi-surface-2);
  border-radius: var(--gi-radius);
  border: 1px solid var(--gi-border);
}
.meta-key {
  font-weight: 600;
  color: var(--gi-text-muted);
}
.meta-val {
  font-family: monospace;
}
.preview-thumb {
  max-width: 200px;
  max-height: 200px;
  border-radius: var(--gi-radius);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
</style>
