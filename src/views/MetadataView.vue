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
      <!-- Basic File Info Section -->
      <div class="metadata-section">
        <h2 class="metadata-section-title">
          <FileIcon :size="20" class="metadata-section-icon" />
          {{ t('metadata.fileInfo') }}
        </h2>
        
        <div class="metadata-grid">
          <div class="meta-item">
            <div class="meta-label">
              <FileIcon :size="16" class="meta-icon" />
              <span>{{ t('metadata.name') }}</span>
            </div>
            <div class="meta-value-row">
              <span class="meta-value meta-value-truncate" :title="metadata.name">{{ metadata.name }}</span>
              <button 
                class="meta-copy-btn" 
                @click="copyToClipboard(metadata.name, 'name')"
                :aria-label="t('metadata.copy')"
                :title="t('metadata.copy')"
              >
                <Copy :size="14" />
              </button>
            </div>
          </div>

          <div class="meta-item">
            <div class="meta-label">
              <HardDrive :size="16" class="meta-icon" />
              <span>{{ t('metadata.size') }}</span>
            </div>
            <div class="meta-value-row">
              <span class="meta-value" :title="formatSize(metadata.size)">{{ formatSize(metadata.size) }}</span>
              <button 
                class="meta-copy-btn" 
                @click="copyToClipboard(formatSize(metadata.size), 'size')"
                :aria-label="t('metadata.copy')"
                :title="t('metadata.copy')"
              >
                <Copy :size="14" />
              </button>
            </div>
          </div>

          <div class="meta-item">
            <div class="meta-label">
              <FileType :size="16" class="meta-icon" />
              <span>{{ t('metadata.type') }}</span>
            </div>
            <div class="meta-value-row">
              <span class="meta-value">{{ getFileType(metadata.type) }}</span>
              <button 
                class="meta-copy-btn" 
                @click="copyToClipboard(getFileType(metadata.type), 'type')"
                :aria-label="t('metadata.copy')"
                :title="t('metadata.copy')"
              >
                <Copy :size="14" />
              </button>
            </div>
          </div>

          <div class="meta-item">
            <div class="meta-label">
              <Calendar :size="16" class="meta-icon" />
              <span>{{ t('metadata.lastModified') }}</span>
            </div>
            <div class="meta-value-row">
              <span class="meta-value meta-value-truncate" :title="formatDate(metadata.lastModified)">{{ formatDate(metadata.lastModified) }}</span>
              <button 
                class="meta-copy-btn" 
                @click="copyToClipboard(formatDate(metadata.lastModified), 'lastModified')"
                :aria-label="t('metadata.copy')"
                :title="t('metadata.copy')"
              >
                <Copy :size="14" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Image Properties Section -->
      <div v-if="metadata.width && metadata.height" class="metadata-section">
        <h2 class="metadata-section-title">
          <ImageIcon :size="20" class="metadata-section-icon" />
          {{ t('metadata.imageProperties') }}
        </h2>
        
        <div class="metadata-grid">
          <div class="meta-item meta-item-highlight">
            <div class="meta-label">
              <Scan :size="16" class="meta-icon" />
              <span>{{ t('metadata.dimensions') }}</span>
            </div>
            <div class="meta-value-row">
              <span class="meta-value meta-value-highlight">{{ metadata.width }} × {{ metadata.height }} px</span>
              <button 
                class="meta-copy-btn" 
                @click="copyToClipboard(`${metadata.width} × ${metadata.height} px`, 'dimensions')"
                :aria-label="t('metadata.copy')"
                :title="t('metadata.copy')"
              >
                <Copy :size="14" />
              </button>
            </div>
          </div>

          <div class="meta-item">
            <div class="meta-label">
              <FileDigit :size="16" class="meta-icon" />
              <span>{{ t('metadata.aspectRatio') }}</span>
            </div>
            <div class="meta-value-row">
              <span class="meta-value">{{ getAspectRatio(metadata.width, metadata.height) }}</span>
              <button 
                class="meta-copy-btn" 
                @click="copyToClipboard(getAspectRatio(metadata.width, metadata.height), 'aspectRatio')"
                :aria-label="t('metadata.copy')"
                :title="t('metadata.copy')"
              >
                <Copy :size="14" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- EXIF Camera Info Section -->
      <div v-if="metadata.exif && (metadata.exif.make || metadata.exif.model)" class="metadata-section">
        <h2 class="metadata-section-title">
          <Camera :size="20" class="metadata-section-icon" />
          {{ t('metadata.cameraInfo') }}
        </h2>
        
        <div class="metadata-grid">
          <div v-if="metadata.exif.make" class="meta-item">
            <div class="meta-label">
              <Camera :size="16" class="meta-icon" />
              <span>{{ t('metadata.exif.make') }}</span>
            </div>
            <span class="meta-value">{{ metadata.exif.make }}</span>
          </div>

          <div v-if="metadata.exif.model" class="meta-item">
            <div class="meta-label">
              <Camera :size="16" class="meta-icon" />
              <span>{{ t('metadata.exif.model') }}</span>
            </div>
            <span class="meta-value">{{ metadata.exif.model }}</span>
          </div>

          <div v-if="metadata.exif.lensModel" class="meta-item">
            <div class="meta-label">
              <Aperture :size="16" class="meta-icon" />
              <span>{{ t('metadata.exif.lens') }}</span>
            </div>
            <span class="meta-value">{{ metadata.exif.lensModel }}</span>
          </div>

          <div v-if="metadata.exif.software" class="meta-item">
            <div class="meta-label">
              <Settings :size="16" class="meta-icon" />
              <span>{{ t('metadata.exif.software') }}</span>
            </div>
            <span class="meta-value">{{ metadata.exif.software }}</span>
          </div>

          <div v-if="metadata.exif.artist" class="meta-item">
            <div class="meta-label">
              <Shield :size="16" class="meta-icon" />
              <span>{{ t('metadata.exif.artist') }}</span>
            </div>
            <span class="meta-value">{{ metadata.exif.artist }}</span>
          </div>

          <div v-if="metadata.exif.copyright" class="meta-item">
            <div class="meta-label">
              <Shield :size="16" class="meta-icon" />
              <span>{{ t('metadata.exif.copyright') }}</span>
            </div>
            <span class="meta-value">{{ metadata.exif.copyright }}</span>
          </div>
        </div>
      </div>

      <!-- EXIF Capture Settings Section -->
      <div v-if="metadata.exif && (metadata.exif.exposureTime || metadata.exif.fNumber || metadata.exif.iso)" class="metadata-section">
        <h2 class="metadata-section-title">
          <Aperture :size="20" class="metadata-section-icon" />
          {{ t('metadata.captureSettings') }}
        </h2>
        
        <div class="metadata-grid">
          <div v-if="metadata.exif.exposureTime" class="meta-item">
            <div class="meta-label">
              <Clock :size="16" class="meta-icon" />
              <span>{{ t('metadata.exif.exposureTime') }}</span>
            </div>
            <span class="meta-value">{{ metadata.exif.exposureTime }}</span>
          </div>

          <div v-if="metadata.exif.fNumber" class="meta-item">
            <div class="meta-label">
              <Aperture :size="16" class="meta-icon" />
              <span>{{ t('metadata.exif.fNumber') }}</span>
            </div>
            <span class="meta-value">{{ metadata.exif.fNumber }}</span>
          </div>

          <div v-if="metadata.exif.iso" class="meta-item">
            <div class="meta-label">
              <Settings :size="16" class="meta-icon" />
              <span>{{ t('metadata.exif.iso') }}</span>
            </div>
            <span class="meta-value">ISO {{ metadata.exif.iso }}</span>
          </div>

          <div v-if="metadata.exif.focalLength" class="meta-item">
            <div class="meta-label">
              <Scan :size="16" class="meta-icon" />
              <span>{{ t('metadata.exif.focalLength') }}</span>
            </div>
            <span class="meta-value">{{ metadata.exif.focalLength }}</span>
          </div>

          <div v-if="metadata.exif.exposureProgram" class="meta-item">
            <div class="meta-label">
              <Settings :size="16" class="meta-icon" />
              <span>{{ t('metadata.exif.exposureProgram') }}</span>
            </div>
            <span class="meta-value">{{ metadata.exif.exposureProgram }}</span>
          </div>

          <div v-if="metadata.exif.meteringMode" class="meta-item">
            <div class="meta-label">
              <Settings :size="16" class="meta-icon" />
              <span>{{ t('metadata.exif.meteringMode') }}</span>
            </div>
            <span class="meta-value">{{ metadata.exif.meteringMode }}</span>
          </div>

          <div v-if="metadata.exif.flash" class="meta-item">
            <div class="meta-label">
              <Settings :size="16" class="meta-icon" />
              <span>{{ t('metadata.exif.flash') }}</span>
            </div>
            <span class="meta-value">{{ metadata.exif.flash }}</span>
          </div>

          <div v-if="metadata.exif.whiteBalance" class="meta-item">
            <div class="meta-label">
              <Settings :size="16" class="meta-icon" />
              <span>{{ t('metadata.exif.whiteBalance') }}</span>
            </div>
            <span class="meta-value">{{ metadata.exif.whiteBalance }}</span>
          </div>
        </div>
      </div>

      <!-- GPS Location Section -->
      <div v-if="metadata.gps" class="metadata-section">
        <h2 class="metadata-section-title">
          <MapPin :size="20" class="metadata-section-icon" />
          {{ t('metadata.gpsLocation') }}
        </h2>
        
        <div class="metadata-grid">
          <div class="meta-item meta-item-highlight">
            <div class="meta-label">
              <MapPin :size="16" class="meta-icon" />
              <span>{{ t('metadata.gps.coordinates') }}</span>
            </div>
            <div class="meta-value-row">
              <span class="meta-value">{{ metadata.gps.latitude.toFixed(6) }}, {{ metadata.gps.longitude.toFixed(6) }}</span>
              <button 
                class="meta-copy-btn" 
                @click="copyToClipboard(`${metadata.gps!.latitude}, ${metadata.gps!.longitude}`, 'gps')"
                :aria-label="t('metadata.copy')"
                :title="t('metadata.copy')"
              >
                <Copy :size="14" />
              </button>
            </div>
          </div>

          <div v-if="metadata.gps.altitude !== undefined" class="meta-item">
            <div class="meta-label">
              <MapPin :size="16" class="meta-icon" />
              <span>{{ t('metadata.gps.altitude') }}</span>
            </div>
            <span class="meta-value">{{ metadata.gps.altitude }}m</span>
          </div>

          <div v-if="metadata.gps.latitudeRef" class="meta-item">
            <div class="meta-label">
              <Globe :size="16" class="meta-icon" />
              <span>{{ t('metadata.gps.latitudeRef') }}</span>
            </div>
            <span class="meta-value">{{ metadata.gps.latitudeRef === 'N' ? t('metadata.gps.north') : t('metadata.gps.south') }}</span>
          </div>

          <div v-if="metadata.gps.longitudeRef" class="meta-item">
            <div class="meta-label">
              <Globe :size="16" class="meta-icon" />
              <span>{{ t('metadata.gps.longitudeRef') }}</span>
            </div>
            <span class="meta-value">{{ metadata.gps.longitudeRef === 'E' ? t('metadata.gps.east') : t('metadata.gps.west') }}</span>
          </div>
        </div>

        <div v-if="metadata.gps.latitude && metadata.gps.longitude" class="metadata-map-link">
          <a 
            :href="`https://www.google.com/maps?q=${metadata.gps.latitude},${metadata.gps.longitude}`"
            target="_blank"
            rel="noopener noreferrer"
            class="metadata-map-btn"
          >
            <MapPin :size="16" />
            {{ t('metadata.gps.viewOnMap') }}
          </a>
        </div>
      </div>

      <!-- IPTC Metadata Section -->
      <div v-if="metadata.iptc" class="metadata-section">
        <h2 class="metadata-section-title">
          <FileText :size="20" class="metadata-section-icon" />
          {{ t('metadata.iptcMetadata') }}
        </h2>
        
        <div class="metadata-grid">
          <div v-if="metadata.iptc.title" class="meta-item">
            <div class="meta-label">
              <FileText :size="16" class="meta-icon" />
              <span>{{ t('metadata.iptc.title') }}</span>
            </div>
            <span class="meta-value">{{ metadata.iptc.title }}</span>
          </div>

          <div v-if="metadata.iptc.caption" class="meta-item">
            <div class="meta-label">
              <FileText :size="16" class="meta-icon" />
              <span>{{ t('metadata.iptc.caption') }}</span>
            </div>
            <span class="meta-value">{{ metadata.iptc.caption }}</span>
          </div>

          <div v-if="metadata.iptc.creator" class="meta-item">
            <div class="meta-label">
              <Shield :size="16" class="meta-icon" />
              <span>{{ t('metadata.iptc.creator') }}</span>
            </div>
            <span class="meta-value">{{ metadata.iptc.creator }}</span>
          </div>

          <div v-if="metadata.iptc.copyright" class="meta-item">
            <div class="meta-label">
              <Shield :size="16" class="meta-icon" />
              <span>{{ t('metadata.iptc.copyright') }}</span>
            </div>
            <span class="meta-value">{{ metadata.iptc.copyright }}</span>
          </div>

          <div v-if="metadata.iptc.city || metadata.iptc.state || metadata.iptc.country" class="meta-item">
            <div class="meta-label">
              <MapPin :size="16" class="meta-icon" />
              <span>{{ t('metadata.iptc.location') }}</span>
            </div>
            <span class="meta-value">
              {{ [metadata.iptc.city, metadata.iptc.state, metadata.iptc.country].filter(Boolean).join(', ') }}
            </span>
          </div>

          <div v-if="metadata.iptc.keywords && metadata.iptc.keywords.length" class="meta-item">
            <div class="meta-label">
              <FileText :size="16" class="meta-icon" />
              <span>{{ t('metadata.iptc.keywords') }}</span>
            </div>
            <div class="meta-value meta-keywords">
              <span v-for="(keyword, index) in metadata.iptc.keywords" :key="index" class="meta-keyword-tag">
                {{ keyword }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ICC Profile Section -->
      <div v-if="metadata.icc" class="metadata-section">
        <h2 class="metadata-section-title">
          <Settings :size="20" class="metadata-section-icon" />
          {{ t('metadata.colorProfile') }}
        </h2>
        
        <div class="metadata-grid">
          <div v-if="metadata.icc.profileName" class="meta-item">
            <div class="meta-label">
              <Settings :size="16" class="meta-icon" />
              <span>{{ t('metadata.icc.profileName') }}</span>
            </div>
            <span class="meta-value">{{ metadata.icc.profileName }}</span>
          </div>

          <div v-if="metadata.icc.colorSpace" class="meta-item">
            <div class="meta-label">
              <Settings :size="16" class="meta-icon" />
              <span>{{ t('metadata.icc.colorSpace') }}</span>
            </div>
            <span class="meta-value">{{ metadata.icc.colorSpace }}</span>
          </div>

          <div v-if="metadata.icc.renderingIntent" class="meta-item">
            <div class="meta-label">
              <Settings :size="16" class="meta-icon" />
              <span>{{ t('metadata.icc.renderingIntent') }}</span>
            </div>
            <span class="meta-value">{{ metadata.icc.renderingIntent }}</span>
          </div>
        </div>
      </div>

      <!-- Image Preview Section -->
      <div class="metadata-section">
        <h2 class="metadata-section-title">
          <ImageIcon :size="20" class="metadata-section-icon" />
          {{ t('metadata.preview') }}
        </h2>
        <div class="metadata-preview">
          <img :src="previewUrl" class="preview-image" :alt="metadata.name" />
        </div>
      </div>

      <!-- Pedagogic Info -->
      <GiInfoBox :title="t('metadata.pedagogic.title')" icon="info">
        <p>{{ t('metadata.pedagogic.description') }}</p>
        <ul class="metadata-tips">
          <li v-for="(tip, index) in tips" :key="index">
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

      <!-- Screen reader feedback for copy -->
      <div aria-live="polite" aria-atomic="true" class="sr-only">
        <span v-if="copiedField !== null">{{ t('metadata.copied') }}: {{ copiedField }}</span>
      </div>
    </div>

    <template #about>{{ t('metadata.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
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
  Copy,
  Settings,
  Camera,
  Aperture,
  MapPin,
  Clock,
  FileDigit,
  Shield,
  Globe,
} from 'lucide-vue-next'
import { extractComprehensiveMetadata, type ImageMetadata } from '../composables/useMetadata'
import GiImageUpload from '../components/GiImageUpload.vue'
import GiInfoBox from '../components/GiInfoBox.vue'
import ToolPageLayout from '../components/ToolPageLayout.vue'

const { t } = useI18n()

const uploadRef = ref<InstanceType<typeof GiImageUpload> | null>(null)
const metadata = ref<ImageMetadata | null>(null)
const previewUrl = ref('')
const isProcessing = ref(false)
const copiedField = ref<string | null>(null)

// Safely extract tips array to avoid character-by-character rendering
const tips = computed(() => {
  const tipsArray = t('metadata.pedagogic.tips', { returnObjects: true })
  return Array.isArray(tipsArray) ? tipsArray : []
})

async function handleImageUpload(file: File) {
  isProcessing.value = true
  try {
    // Extract comprehensive metadata including EXIF, IPTC, XMP, ICC, GPS
    metadata.value = await extractComprehensiveMetadata(file)

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

async function copyToClipboard(text: string, fieldName: string) {
  try {
    await navigator.clipboard.writeText(text)
    copiedField.value = fieldName
    setTimeout(() => {
      copiedField.value = null
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
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

.metadata-section {
  margin-bottom: var(--gi-space-lg);
}

.metadata-section-title {
  display: flex;
  align-items: center;
  gap: var(--gi-space-sm);
  font-size: var(--gi-font-size-lg);
  font-weight: 600;
  color: var(--gi-text);
  margin-bottom: var(--gi-space-md);
  padding-bottom: var(--gi-space-xs);
  border-bottom: 2px solid var(--gi-border);
}

.metadata-section-icon {
  color: var(--gi-brand);
  flex-shrink: 0;
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--gi-space-md);
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-xs);
  padding: var(--gi-space-md);
  background: var(--gi-surface);
  border-radius: var(--gi-radius-md);
  border: 1px solid var(--gi-border);
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
}

.meta-item:hover {
  border-color: var(--gi-brand);
  box-shadow: 0 0 0 1px var(--gi-brand);
}

.meta-item-highlight {
  background: var(--gi-tint-green-bg);
  border-color: var(--gi-tint-green-border);
}

.meta-item-highlight:hover {
  border-color: var(--gi-tint-green-border);
  box-shadow: 0 0 0 1px var(--gi-tint-green-border);
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

.meta-value-row {
  display: flex;
  align-items: center;
  gap: var(--gi-space-xs);
}

.meta-value {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text);
  word-break: break-all;
  flex: 1;
  min-width: 0;
}

.meta-value-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta-value-highlight {
  font-weight: 600;
  color: var(--gi-text);
}

.meta-copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  padding: var(--gi-space-xs);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--gi-radius-sm);
  color: var(--gi-text-muted);
  cursor: pointer;
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
  flex-shrink: 0;
}

.meta-copy-btn:hover {
  background: var(--gi-tint-green-bg);
  color: var(--gi-brand);
  border-color: var(--gi-tint-green-border);
}

.meta-copy-btn:active {
  transform: scale(0.95);
}

.meta-copy-btn:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

.metadata-preview {
  display: flex;
  justify-content: center;
  padding: var(--gi-space-lg);
  background: var(--gi-surface);
  border-radius: var(--gi-radius-md);
  border: 1px solid var(--gi-border);
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
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

.metadata-map-link {
  margin-top: var(--gi-space-md);
  display: flex;
  justify-content: center;
}

.metadata-map-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--gi-space-xs);
  padding: var(--gi-space-sm) var(--gi-space-md);
  background: var(--gi-brand);
  color: var(--gi-text-inverse);
  border-radius: var(--gi-radius-md);
  font-size: var(--gi-font-size-sm);
  font-weight: 600;
  text-decoration: none;
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
  min-height: 44px;
}

.metadata-map-btn:hover {
  background: var(--gi-brand-dark);
  transform: translateY(-2px);
  box-shadow: var(--gi-shadow-md);
}

.metadata-map-btn:active {
  transform: translateY(0);
}

.metadata-map-btn:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

.meta-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gi-space-xs);
}

.meta-keyword-tag {
  display: inline-block;
  padding: var(--gi-space-xs) var(--gi-space-sm);
  background: var(--gi-tint-blue-bg);
  color: var(--gi-tint-blue-text);
  border-radius: var(--gi-radius-sm);
  font-size: var(--gi-font-size-xs);
  font-weight: 500;
}

@media (max-width: 640px) {
  .metadata-grid {
    grid-template-columns: 1fr;
  }

  .metadata-section-title {
    font-size: var(--gi-font-size-md);
  }

  .preview-image {
    max-height: 250px;
  }

  .meta-value-truncate {
    max-width: 200px;
  }
}
</style>
