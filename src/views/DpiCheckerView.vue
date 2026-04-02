<template>
  <ToolPageLayout
    :title="t('dpiChecker.title')"
    :description="t('dpiChecker.desc')"
    category="print"
  >
    <template #icon>
      <Ruler :size="24" />
    </template>
    <!-- Upload Zone -->
    <GiImageUpload
      @upload="handleImageUpload"
      @error="handleError"
    />

    <p class="gi-or">{{ t('dpiChecker.orManual') }}</p>

    <!-- Manual Input -->
    <div class="gi-row">
      <GiFormField
        :label="t('dpiChecker.widthPx')"
        v-model="widthPx"
        type="number"
        min="1"
      />
      <GiFormField
        :label="t('dpiChecker.heightPx')"
        v-model="heightPx"
        type="number"
        min="1"
      />
    </div>

    <!-- Results -->
    <template v-if="widthPx > 0 && heightPx > 0">
      <!-- DPI Table -->
      <GiResultCard :title="t('dpiChecker.resultTitle')">
        <table class="gi-table gi-dpi-table" style="margin-top:0.75rem">
          <thead>
            <tr>
              <th>{{ t('dpiChecker.dpiCol') }}</th>
              <th>{{ t('dpiChecker.widthCol') }}</th>
              <th>{{ t('dpiChecker.heightCol') }}</th>
              <th>{{ t('dpiChecker.usageCol') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in dimensions" :key="row.dpi" :class="`gi-dpi-row-${getDpiColor(row.dpi)}`">
              <td>
                <strong>{{ row.dpi }} dpi</strong>
                <span class="gi-dpi-label">{{ getDpiLabel(row.dpi) }}</span>
              </td>
              <td>{{ row.widthCm }} cm</td>
              <td>{{ row.heightCm }} cm</td>
              <td>
                <span :class="`gi-status gi-status-${getDpiColor(row.dpi) === 'ok' ? 'ok' : getDpiColor(row.dpi) === 'warning' ? 'warning' : 'error'}`">
                  {{ t(`dpiChecker.status.${getDpiColor(row.dpi) === 'ok' ? 'ok' : getDpiColor(row.dpi) === 'warning' ? 'warning' : 'error'}`) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </GiResultCard>

      <!-- Format Compatibility -->
      <GiResultCard :title="t('dpiChecker.formatTitle')" style="margin-top:1rem">
        <div class="gi-format-section">
          <h3 class="gi-format-section-title">{{ t('dpiChecker.featuredFormats') }}</h3>
          <div class="gi-format-grid">
            <div v-for="fmt in FEATURED_FORMATS" :key="fmt" class="gi-format-card">
              <span class="gi-format-name">{{ fmt }}</span>
              <span :class="`gi-status gi-status-${formatStatus[fmt]}`">
                {{ t(`dpiChecker.status.${formatStatus[fmt]}`) }}
              </span>
            </div>
          </div>
        </div>

        <div class="gi-format-section">
          <h3 class="gi-format-section-title">{{ t('dpiChecker.otherFormats') }}</h3>
          <transition name="slide">
            <div v-if="showExtendedFormats" class="gi-format-grid gi-extended-grid">
              <div v-for="fmt in EXTENDED_FORMATS" :key="fmt" class="gi-format-card">
                <span class="gi-format-name">{{ fmt }}</span>
                <span :class="`gi-status gi-status-${formatStatus[fmt]}`">
                  {{ t(`dpiChecker.status.${formatStatus[fmt]}`) }}
                </span>
              </div>
            </div>
          </transition>
          <button
            type="button"
            class="gi-btn-ghost gi-btn-link"
            @click="showExtendedFormats = !showExtendedFormats"
          >
            {{ t(showExtendedFormats ? 'dpiChecker.showLess' : 'dpiChecker.showMore') }}
          </button>
        </div>
      </GiResultCard>

      <!-- Recommended Uses -->
      <GiResultCard :title="t('dpiChecker.recommendedUse.title')" style="margin-top:1rem">
        <div class="gi-recommended-grid">
          <div class="gi-recommended-section gi-suitable">
            <h4>{{ t('dpiChecker.recommendedUse.suitable') }}</h4>
            <ul>
              <li v-for="use in recommendedUses.suitable" :key="use">{{ use }}</li>
            </ul>
          </div>
          <div v-if="recommendedUses.notSuitable.length > 0" class="gi-recommended-section gi-not-suitable">
            <h4>{{ t('dpiChecker.recommendedUse.notSuitable') }}</h4>
            <ul>
              <li v-for="use in recommendedUses.notSuitable" :key="use">{{ use }}</li>
            </ul>
          </div>
        </div>
      </GiResultCard>

      <!-- Visual Comparison -->
      <GiResultCard :title="t('dpiChecker.visualComparison.title')" style="margin-top:1rem">
        <p class="gi-comparison-desc">{{ t('dpiChecker.visualComparison.description') }}</p>
        <div class="gi-comparison-grid">
          <div v-for="row in dimensions" :key="row.dpi" class="gi-comparison-item">
            <div class="gi-comparison-header">
              <span class="gi-comparison-dpi">{{ row.dpi }} DPI</span>
              <span class="gi-comparison-label">{{ getDpiLabel(row.dpi) }}</span>
            </div>
            <div class="gi-comparison-visual">
              <svg :viewBox="getComparisonViewBox(row.widthCm, row.heightCm)" class="gi-comparison-svg">
                <rect
                  :width="getComparisonWidth(row.widthCm, row.heightCm)"
                  :height="getComparisonHeight(row.widthCm, row.heightCm)"
                  :class="`gi-comparison-rect gi-comparison-${getDpiColor(row.dpi)}`"
                  rx="4"
                />
              </svg>
            </div>
            <div class="gi-comparison-dims">{{ row.widthCm }} × {{ row.heightCm }} cm</div>
          </div>
        </div>
      </GiResultCard>

      <!-- Educational Section -->
      <GiResultCard :title="t('dpiChecker.educational.title')" collapsible style="margin-top:1rem">
        <div class="gi-educational-content">
          <h3 class="gi-edu-title">{{ t('dpiChecker.educational.whatIsDpi') }}</h3>
          <p class="gi-edu-text">{{ t('dpiChecker.educational.dpiDefinition') }}</p>

          <h3 class="gi-edu-title">{{ t('dpiChecker.educational.recommendedValues') }}</h3>
          <ul class="gi-edu-list">
            <li>{{ t('dpiChecker.educational.dpiLevels.web') }}</li>
            <li>{{ t('dpiChecker.educational.dpiLevels.large') }}</li>
            <li>{{ t('dpiChecker.educational.dpiLevels.print') }}</li>
            <li>{{ t('dpiChecker.educational.dpiLevels.photo') }}</li>
          </ul>
        </div>
      </GiResultCard>
    </template>

    <template #about>{{ t('dpiChecker.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Ruler } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import ToolPageLayout from '../components/ToolPageLayout.vue'
import GiFormField from '../components/GiFormField.vue'
import GiResultCard from '../components/GiResultCard.vue'
import {
  calculatePrintDimensions,
  getFormatStatus,
  getRecommendedUses,
  getDpiColor,
  getDpiLabel,
  FEATURED_FORMATS,
  EXTENDED_FORMATS,
} from '../composables/useDpiChecker'
import GiImageUpload from '../components/GiImageUpload.vue'

const { t } = useI18n()
const widthPx = ref(0)
const heightPx = ref(0)
const imagePreview = ref<string | null>(null)
const showExtendedFormats = ref(false)
const uploadError = ref('')

const dimensions = computed(() => calculatePrintDimensions(widthPx.value, heightPx.value))
const formatStatus = computed(() => getFormatStatus(widthPx.value, heightPx.value))
const recommendedUses = computed(() => getRecommendedUses(widthPx.value, heightPx.value))

function handleImageUpload(file: File) {
  uploadError.value = ''
  const img = new Image()
  const url = URL.createObjectURL(file)
  img.onload = () => {
    widthPx.value = img.naturalWidth
    heightPx.value = img.naturalHeight
    imagePreview.value = url
    URL.revokeObjectURL(url)
  }
  img.src = url
}

function handleError(error: string) {
  uploadError.value = error
}

// removeImage is no longer needed - user resets via GiImageUpload's built-in clear button

// changeImage is no longer needed - GiImageUpload handles reset internally

// Visual comparison helpers
const MAX_SIZE = 120 // max dimension in pixels for comparison SVG

function getComparisonViewBox(wCm: number, hCm: number) {
  const max = Math.max(wCm, hCm)
  const scale = MAX_SIZE / max
  const w = wCm * scale + 16
  const h = hCm * scale + 16
  return `0 0 ${w} ${h}`
}

function getComparisonWidth(wCm: number, hCm: number) {
  const max = Math.max(wCm, hCm)
  const scale = MAX_SIZE / max
  return wCm * scale
}

function getComparisonHeight(wCm: number, hCm: number) {
  const max = Math.max(wCm, hCm)
  const scale = MAX_SIZE / max
  return hCm * scale
}
</script>

<style scoped>
/* Upload Zone */
.gi-upload-zone {
  border: 2px dashed var(--gi-border);
  border-radius: var(--gi-radius-lg);
  padding: 2.5rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;
  margin-bottom: 1rem;
  background: var(--gi-bg-alt);
}
.gi-upload-zone:hover {
  border-color: var(--gi-brand);
  background: rgba(10, 170, 142, 0.03);
}
.gi-upload-zone.is-dragover {
  border-color: var(--gi-brand);
  background: rgba(10, 170, 142, 0.08);
  transform: scale(1.01);
}
.gi-upload-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 0.75rem;
  color: var(--gi-brand);
  opacity: 0.8;
}
.gi-upload-text {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: var(--gi-text);
  margin-bottom: 0.25rem;
}
.gi-upload-sub {
  display: block;
  font-size: 0.85rem;
  color: var(--gi-text-muted);
  margin-bottom: 0.5rem;
}
.gi-paste-hint {
  display: block;
  font-size: 0.8rem;
  color: var(--gi-text-muted);
  background: var(--gi-bg);
  padding: 0.25rem 0.75rem;
  border-radius: var(--gi-radius);
  border: 1px solid var(--gi-border);
}

/* Image Preview */
.gi-image-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}
.gi-preview-image {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: var(--gi-radius);
  border: 1px solid var(--gi-border);
}
.gi-preview-info {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}
.gi-preview-dims {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gi-text);
}
.gi-preview-orientation {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: var(--gi-radius);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.gi-orientation-portrait {
  background: var(--gi-tint-blue-2);
  color: var(--gi-tint-blue-12);
}
.gi-orientation-landscape {
  background: var(--gi-tint-purple-2);
  color: var(--gi-tint-purple-12);
}
.gi-orientation-square {
  background: var(--gi-tint-gray-2);
  color: var(--gi-tint-gray-12);
}
.gi-preview-actions {
  display: flex;
  gap: 0.5rem;
}

/* Or divider */
.gi-or {
  text-align: center;
  color: var(--gi-text-muted);
  font-size: 0.85rem;
  margin: 0.5rem 0 1rem;
  position: relative;
}
.gi-or::before,
.gi-or::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 30%;
  height: 1px;
  background: var(--gi-border);
}
.gi-or::before { left: 0; }
.gi-or::after { right: 0; }

/* Manual Input Row */
.gi-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* DPI Table */
.gi-dpi-table th {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--gi-text-muted);
  font-weight: 600;
}
.gi-dpi-table td {
  padding: 0.75rem 0.5rem;
  vertical-align: middle;
}
.gi-dpi-label {
  display: block;
  font-size: 0.75rem;
  color: var(--gi-text-muted);
  margin-top: 0.15rem;
}
.gi-dpi-row-ok {
  background: rgba(10, 170, 142, 0.04);
}
.gi-dpi-row-warning {
  background: rgba(255, 196, 0, 0.04);
}
.gi-dpi-row-error {
  background: rgba(255, 0, 0, 0.03);
}

/* Format Section */
.gi-format-section {
  margin-bottom: 1.25rem;
}
.gi-format-section:last-child {
  margin-bottom: 0;
}
.gi-format-section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gi-text);
  margin-bottom: 0.75rem;
}
.gi-format-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}
.gi-extended-grid {
  animation: slideDown 0.2s ease-out;
}
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.gi-format-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--gi-bg);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius);
  gap: 0.75rem;
}
.gi-format-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--gi-text);
}

/* Recommended Uses */
.gi-recommended-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-top: 0.75rem;
}
@media (min-width: 640px) {
  .gi-recommended-grid {
    grid-template-columns: 1fr 1fr;
  }
}
.gi-recommended-section h4 {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.gi-recommended-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.gi-recommended-section li {
  font-size: 0.85rem;
  padding: 0.4rem 0.6rem;
  margin-bottom: 0.25rem;
  background: var(--gi-bg);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius);
}
.gi-suitable h4 {
  color: var(--gi-brand);
}
.gi-suitable li {
  border-color: var(--gi-tint-green-8);
  background: var(--gi-tint-green-1);
}
.gi-not-suitable h4 {
  color: var(--gi-tint-red-11);
}
.gi-not-suitable li {
  border-color: var(--gi-tint-red-6);
  background: var(--gi-tint-red-1);
}

/* Visual Comparison */
.gi-comparison-desc {
  font-size: 0.85rem;
  color: var(--gi-text-muted);
  margin-bottom: 1rem;
}
.gi-comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin-top: 0.75rem;
}
.gi-comparison-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: var(--gi-bg);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
}
.gi-comparison-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}
.gi-comparison-dpi {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--gi-text);
}
.gi-comparison-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--gi-text-muted);
}
.gi-comparison-visual {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
}
.gi-comparison-svg {
  max-width: 100%;
  height: auto;
}
.gi-comparison-rect {
  transition: fill 0.2s;
}
.gi-comparison-ok {
  fill: var(--gi-tint-green-9);
  stroke: var(--gi-brand);
  stroke-width: 2;
}
.gi-comparison-warning {
  fill: var(--gi-tint-yellow-8);
  stroke: var(--gi-tint-yellow-11);
  stroke-width: 2;
}
.gi-comparison-error {
  fill: var(--gi-tint-red-6);
  stroke: var(--gi-tint-red-10);
  stroke-width: 2;
}
.gi-comparison-dims {
  font-size: 0.8rem;
  color: var(--gi-text-muted);
  text-align: center;
}

/* Educational Section */
.gi-educational-content {
  margin-top: 0.75rem;
}
.gi-edu-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--gi-text);
  margin-bottom: 0.5rem;
  margin-top: 1rem;
}
.gi-edu-title:first-child {
  margin-top: 0;
}
.gi-edu-text {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--gi-text);
}
.gi-edu-list {
  font-size: 0.9rem;
  line-height: 1.8;
  color: var(--gi-text);
  padding-left: 1.25rem;
}
.gi-edu-list li {
  margin-bottom: 0.25rem;
}

/* Button variants */
.gi-btn-sm {
  padding: 0.35rem 0.65rem;
  font-size: 0.8rem;
}
.gi-btn-danger {
  color: var(--gi-tint-red-11);
}
.gi-btn-danger:hover {
  background: var(--gi-tint-red-2);
  border-color: var(--gi-tint-red-8);
}
.gi-btn-link {
  display: inline;
  padding: 0;
  border: none;
  background: none;
  color: var(--gi-brand);
  font-size: 0.85rem;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.gi-btn-link:hover {
  color: var(--gi-text);
  background: none;
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .slide-enter-active,
  .slide-leave-active {
    transition: none;
  }
  .slide-enter-from,
  .slide-leave-to {
    transform: none;
  }
  .gi-upload-zone.is-dragover {
    transform: none;
  }
  .gi-upload-zone,
  .gi-comparison-rect {
    transition: none;
  }
}
</style>
