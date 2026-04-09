<template>
  <ToolPageLayout
    :title="t('metadata.title')"
    :description="t('metadata.desc')"
    category="digital"
  >
    <template #icon>
      <FileText :size="24" />
    </template>

    <!-- Upload Area -->
    <GiImageUpload
      ref="uploadRef"
      @upload="handleImageUpload"
      @error="handleError"
    />

    <!-- Loading State -->
    <div v-if="isProcessing" class="metadata-loading" role="status" aria-live="polite">
      <Loader2 :size="32" class="metadata-spinner" />
      <span>{{ t('metadata.processing') }}</span>
    </div>

    <!-- Results -->
    <div v-if="metadata" class="metadata-results">
      <GiResultCard :title="t('metadata.technicalProperties')">
        <div class="metadata-grid">
          <div class="meta-item">
            <div class="meta-label">
              <FileIcon :size="16" class="meta-icon" />
              <span>{{ t('metadata.name') }}</span>
            </div>
            <span class="meta-value">{{ metadata.name }}</span>
          </div>

          <div class="meta-item">
            <div class="meta-label">
              <HardDrive :size="16" class="meta-icon" />
              <span>{{ t('metadata.size') }}</span>
            </div>
            <span class="meta-value">{{ formatSize(metadata.size) }}</span>
          </div>

          <div class="meta-item">
            <div class="meta-label">
              <FileType :size="16" class="meta-icon" />
              <span>{{ t('metadata.type') }}</span>
            </div>
            <span class="meta-value">{{ getFileType(metadata.type) }}</span>
          </div>

          <div class="meta-item">
            <div class="meta-label">
              <Calendar :size="16" class="meta-icon" />
              <span>{{ t('metadata.lastModified') }}</span>
            </div>
            <span class="meta-value">{{ formatDate(metadata.lastModified) }}</span>
          </div>

          <div v-if="metadata.width && metadata.height" class="meta-item meta-item-highlight">
            <div class="meta-label">
              <ImageIcon :size="16" class="meta-icon" />
              <span>{{ t('metadata.dimensions') }}</span>
            </div>
            <span class="meta-value meta-value-highlight">{{ metadata.width }} × {{ metadata.height }} px</span>
          </div>

          <div v-if="metadata.width && metadata.height" class="meta-item">
            <div class="meta-label">
              <Scan :size="16" class="meta-icon" />
              <span>{{ t('metadata.aspectRatio') }}</span>
            </div>
            <span class="meta-value">{{ getAspectRatio(metadata.width, metadata.height) }}</span>
          </div>
        </div>

        <!-- Preview -->
        <div class="metadata-preview">
          <img :src="previewUrl" class="preview-image" :alt="metadata.name" />
        </div>
      </GiResultCard>

      <!-- Pedagogic Info -->
      <GiInfoBox :title="t('metadata.pedagogic.title')" icon="info">
        <p>{{ t('metadata.pedagogic.description') }}</p>
        <ul class="metadata-tips">
          <li v-for="(tip, index) in t('metadata.pedagogic.tips', { returnObjects: true })" :key="index">
            {{ tip }}
          </li>
        </ul>
      </GiInfoBox>

      <!-- Clear Button -->
      <div class="metadata-actions">
        <button class="gi-btn gi-btn-ghost" @click="handleClear">
          <RotateCcw :size="16" />
          {{ t('metadata.clear') }}
        </button>
      </div>
    </div>

    <template #about>{{ t('metadata.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  FileText,
  FileIcon,
  HardDrive,
  FileType,
  Calendar,
  ImageIcon,
  Scan,
  Loader2,
  RotateCcw,
} from 'lucide-vue-next'
import { extractBasicMetadata, extractDimensions, type ImageMetadata } from '../composables/useMetadata'
import GiImageUpload from '../components/GiImageUpload.vue'
import GiResultCard from '../components/GiResultCard.vue'
import GiInfoBox from '../components/GiInfoBox.vue'
import ToolPageLayout from '../components/ToolPageLayout.vue'

const { t } = useI18n()

const uploadRef = ref<InstanceType<typeof GiImageUpload> | null>(null)
const metadata = ref<ImageMetadata | null>(null)
const previewUrl = ref('')
const isProcessing = ref(false)

async function handleImageUpload(file: File) {
  isProcessing.value = true
  try {
    // Extract basic file metadata
    metadata.value = extractBasicMetadata(file)

    // Extract image dimensions asynchronously
    const dims = await extractDimensions(file)
    if (dims) {
      metadata.value = {
        ...metadata.value,
        width: dims.width,
        height: dims.height,
      }
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (ev) => {
      previewUrl.value = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  } finally {
    isProcessing.value = false
  }
}

function handleError(error: string) {
  console.error(error)
  alert(error)
}

function handleClear() {
  metadata.value = null
  previewUrl.value = ''
  if (uploadRef.value) {
    uploadRef.value.reset()
  }
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

function getFileType(mimeType: string): string {
  const typeMap: Record<string, string> = {
    'image/jpeg': 'JPG',
    'image/png': 'PNG',
    'image/gif': 'GIF',
    'image/webp': 'WebP',
    'image/svg+xml': 'SVG',
    'image/bmp': 'BMP',
    'image/tiff': 'TIFF',
    'image/avif': 'AVIF',
  }
  return typeMap[mimeType] || mimeType.replace('image/', '').toUpperCase()
}

function getAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const divisor = gcd(width, height)
  const ratioW = Math.round(width / divisor)
  const ratioH = Math.round(height / divisor)

  // Common aspect ratios
  const commonRatios: Record<string, string> = {
    '4:3': '4:3',
    '3:4': '3:4',
    '16:9': '16:9',
    '9:16': '9:16',
    '1:1': '1:1',
    '3:2': '3:2',
    '2:3': '2:3',
    '5:4': '5:4',
    '4:5': '4:5',
  }

  const ratioKey = `${ratioW}:${ratioH}`
  return commonRatios[ratioKey] || `${width}:${height}`
}
</script>

<style scoped>
.metadata-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gi-space-md);
  padding: var(--gi-space-lg);
  color: var(--gi-text-muted);
}

.metadata-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.metadata-results {
  margin-top: var(--gi-space-lg);
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--gi-space-md);
  margin-bottom: var(--gi-space-lg);
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-xs);
  padding: var(--gi-space-md);
  background: var(--gi-surface-2);
  border-radius: var(--gi-radius-md);
  border: 1px solid var(--gi-border);
}

.meta-item-highlight {
  background: var(--gi-tint-green-bg);
  border-color: var(--gi-tint-green-border);
}

.meta-label {
  display: flex;
  align-items: center;
  gap: var(--gi-space-xs);
  font-size: var(--gi-font-size-xs);
  font-weight: 600;
  color: var(--gi-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.meta-icon {
  flex-shrink: 0;
  color: var(--gi-text-muted);
}

.meta-value {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text);
  word-break: break-all;
}

.meta-value-highlight {
  font-weight: 600;
  color: var(--gi-text);
}

.metadata-preview {
  display: flex;
  justify-content: center;
  padding: var(--gi-space-lg);
  background: var(--gi-surface-2);
  border-radius: var(--gi-radius-md);
  border: 1px solid var(--gi-border);
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: var(--gi-radius-sm);
  object-fit: contain;
}

.metadata-tips {
  margin-top: var(--gi-space-sm);
  padding-left: var(--gi-space-md);
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-xs);
}

.metadata-tips li {
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-muted);
  line-height: 1.5;
}

.metadata-actions {
  display: flex;
  justify-content: center;
  margin-top: var(--gi-space-lg);
}

@media (max-width: 640px) {
  .metadata-grid {
    grid-template-columns: 1fr;
  }

  .preview-image {
    max-height: 200px;
  }
}
</style>
