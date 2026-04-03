<template>
  <ToolPageLayout
    :title="t('dpiChecker.title')"
    :description="t('dpiChecker.desc')"
    category="print"
  >
    <template #icon>
      <Ruler :size="24" />
    </template>

    <section class="dpi-analysis-stage">
      <div class="dpi-stage-intro">
        <p class="dpi-stage-kicker">{{ t('dpiChecker.analysisStage.kicker') }}</p>
        <h2 class="dpi-stage-title">{{ t('dpiChecker.analysisStage.title') }}</h2>
        <p class="dpi-stage-description">{{ t('dpiChecker.analysisStage.description') }}</p>
      </div>

      <div class="dpi-stage-grid">
        <div class="dpi-stage-inputs">
          <GiImageUpload
            @upload="handleImageUpload"
            @error="handleError"
          />

          <div class="dpi-manual-panel">
            <div class="dpi-manual-header">
              <h3 class="dpi-panel-title">{{ t('dpiChecker.analysisStage.manualTitle') }}</h3>
              <p class="dpi-panel-description">{{ t('dpiChecker.analysisStage.manualHint') }}</p>
            </div>

            <div class="dpi-manual-grid">
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

            <p v-if="uploadError" class="dpi-stage-error">{{ uploadError }}</p>
          </div>
        </div>

        <GiResultCard
          v-if="hasDimensions"
          class="dpi-stage-summary"
          :title="t('dpiChecker.analysisStage.summaryTitle')"
          :variant="summaryVariant"
        >
          <dl class="dpi-summary-grid">
            <div class="dpi-summary-item">
              <dt>{{ t('dpiChecker.analysisStage.sourceLabel') }}</dt>
              <dd>{{ imagePreview ? t('dpiChecker.analysisStage.sourceUploaded') : t('dpiChecker.analysisStage.sourceManual') }}</dd>
            </div>
            <div class="dpi-summary-item">
              <dt>{{ t('dpiChecker.analysisStage.nativeSizeLabel') }}</dt>
              <dd>{{ numericWidth }} × {{ numericHeight }} px</dd>
            </div>
            <div class="dpi-summary-item">
              <dt>{{ t('dpiChecker.analysisStage.orientationLabel') }}</dt>
              <dd>{{ orientation ? t(`dpiChecker.orientation.${orientation}`) : '—' }}</dd>
            </div>
            <div class="dpi-summary-item">
              <dt>{{ t('dpiChecker.analysisStage.bestFitLabel') }}</dt>
              <dd>{{ bestFormat ?? t('dpiChecker.analysisStage.bestFitFallback') }}</dd>
            </div>
          </dl>

          <div class="dpi-summary-callout" :class="`dpi-summary-callout--${summaryTone}`">
            <span class="dpi-summary-callout-label">{{ t('dpiChecker.analysisStage.professionalLabel') }}</span>
            <strong class="dpi-summary-callout-value">
              {{ professionalDimensions?.widthCm }} × {{ professionalDimensions?.heightCm }} cm
            </strong>
            <span class="dpi-summary-callout-status">{{ t(`dpiChecker.status.${summaryTone}`) }}</span>
          </div>
        </GiResultCard>

        <div v-else class="dpi-stage-placeholder">
          <p class="dpi-stage-placeholder-copy">{{ t('dpiChecker.analysisStage.empty') }}</p>
        </div>
      </div>
    </section>

    <section v-if="hasDimensions" class="dpi-primary-results">
      <GiResultCard :title="t('dpiChecker.resultTitle')">
        <table class="gi-table dpi-dimensions-table">
          <thead>
            <tr>
              <th>{{ t('dpiChecker.dpiCol') }}</th>
              <th>{{ t('dpiChecker.widthCol') }}</th>
              <th>{{ t('dpiChecker.heightCol') }}</th>
              <th>{{ t('dpiChecker.usageCol') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in dimensions" :key="row.dpi" :class="`dpi-dimensions-row-${getDpiColor(row.dpi)}`">
              <td>
                <strong>{{ row.dpi }} dpi</strong>
                <span class="dpi-dimensions-label">{{ getDpiLabel(row.dpi) }}</span>
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
    </section>

    <section v-if="hasDimensions" class="dpi-curated-panels">
      <GiResultCard :title="t('dpiChecker.formatTitle')">
        <div class="dpi-format-section">
          <h3 class="dpi-section-title">{{ t('dpiChecker.featuredFormats') }}</h3>
          <div class="dpi-format-grid">
            <div v-for="fmt in FEATURED_FORMATS" :key="fmt" class="dpi-format-card">
              <span class="dpi-format-name">{{ fmt }}</span>
              <span :class="`gi-status gi-status-${formatStatus[fmt]}`">
                {{ t(`dpiChecker.status.${formatStatus[fmt]}`) }}
              </span>
            </div>
          </div>
        </div>

        <div class="dpi-format-section">
          <div class="dpi-section-heading">
            <h3 class="dpi-section-title">{{ t('dpiChecker.otherFormats') }}</h3>
            <button
              type="button"
              class="gi-btn-ghost dpi-toggle-button"
              @click="showExtendedFormats = !showExtendedFormats"
            >
              {{ t(showExtendedFormats ? 'dpiChecker.showLess' : 'dpiChecker.showMore') }}
            </button>
          </div>

          <transition name="slide">
            <div v-if="showExtendedFormats" class="dpi-format-grid">
              <div v-for="fmt in EXTENDED_FORMATS" :key="fmt" class="dpi-format-card">
                <span class="dpi-format-name">{{ fmt }}</span>
                <span :class="`gi-status gi-status-${formatStatus[fmt]}`">
                  {{ t(`dpiChecker.status.${formatStatus[fmt]}`) }}
                </span>
              </div>
            </div>
          </transition>
        </div>
      </GiResultCard>

      <GiResultCard :title="t('dpiChecker.recommendedUse.title')">
        <div class="dpi-recommended-grid">
          <div class="dpi-recommended-section dpi-recommended-section--suitable">
            <h4>{{ t('dpiChecker.recommendedUse.suitable') }}</h4>
            <ul>
              <li v-for="use in recommendedUses.suitable" :key="use">{{ use }}</li>
            </ul>
          </div>
          <div v-if="recommendedUses.notSuitable.length > 0" class="dpi-recommended-section dpi-recommended-section--not-suitable">
            <h4>{{ t('dpiChecker.recommendedUse.notSuitable') }}</h4>
            <ul>
              <li v-for="use in recommendedUses.notSuitable" :key="use">{{ use }}</li>
            </ul>
          </div>
        </div>
      </GiResultCard>

      <GiResultCard :title="t('dpiChecker.visualComparison.title')" class="dpi-comparison-card">
        <p class="dpi-comparison-desc">{{ t('dpiChecker.visualComparison.description') }}</p>
        <div class="dpi-comparison-grid">
          <div v-for="row in dimensions" :key="row.dpi" class="dpi-comparison-item">
            <div class="dpi-comparison-header">
              <span class="dpi-comparison-dpi">{{ row.dpi }} dpi</span>
              <span class="dpi-comparison-label">{{ getDpiLabel(row.dpi) }}</span>
            </div>
            <div class="dpi-comparison-visual">
              <svg :viewBox="getComparisonViewBox(row.widthCm, row.heightCm)" class="dpi-comparison-svg">
                <rect
                  :width="getComparisonWidth(row.widthCm, row.heightCm)"
                  :height="getComparisonHeight(row.widthCm, row.heightCm)"
                  :class="`dpi-comparison-rect dpi-comparison-${getDpiColor(row.dpi)}`"
                  rx="10"
                />
              </svg>
            </div>
            <div class="dpi-comparison-dims">{{ row.widthCm }} × {{ row.heightCm }} cm</div>
          </div>
        </div>
      </GiResultCard>
    </section>

    <GiResultCard
      class="dpi-education-card"
      :title="t('dpiChecker.educational.title')"
      collapsible
      :collapsed="educationCollapsed"
      @update:collapsed="educationCollapsed = $event"
    >
      <div class="dpi-educational-content">
        <h3 class="dpi-education-title">{{ t('dpiChecker.educational.whatIsDpi') }}</h3>
        <p class="dpi-education-text">{{ t('dpiChecker.educational.dpiDefinition') }}</p>

        <h3 class="dpi-education-title">{{ t('dpiChecker.educational.recommendedValues') }}</h3>
        <ul class="dpi-education-list">
          <li>{{ t('dpiChecker.educational.dpiLevels.web') }}</li>
          <li>{{ t('dpiChecker.educational.dpiLevels.large') }}</li>
          <li>{{ t('dpiChecker.educational.dpiLevels.print') }}</li>
          <li>{{ t('dpiChecker.educational.dpiLevels.photo') }}</li>
        </ul>
      </div>
    </GiResultCard>

    <template #about>{{ t('dpiChecker.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Ruler } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import ToolPageLayout from '../components/ToolPageLayout.vue'
import GiFormField from '../components/GiFormField.vue'
import GiResultCard from '../components/GiResultCard.vue'
import GiImageUpload from '../components/GiImageUpload.vue'
import {
  calculatePrintDimensions,
  getFormatStatus,
  getRecommendedUses,
  getDpiColor,
  getDpiLabel,
  getOrientation,
  FEATURED_FORMATS,
  EXTENDED_FORMATS,
} from '../composables/useDpiChecker'

const { t } = useI18n()
const widthPx = ref(0)
const heightPx = ref(0)
const imagePreview = ref<string | null>(null)
const showExtendedFormats = ref(false)
const uploadError = ref('')
const educationCollapsed = ref(true)

const numericWidth = computed(() => Number(widthPx.value) || 0)
const numericHeight = computed(() => Number(heightPx.value) || 0)
const hasDimensions = computed(() => numericWidth.value > 0 && numericHeight.value > 0)
const orientation = computed(() => (
  hasDimensions.value ? getOrientation(numericWidth.value, numericHeight.value) : null
))
const dimensions = computed(() => calculatePrintDimensions(numericWidth.value, numericHeight.value))
const formatStatus = computed(() => getFormatStatus(numericWidth.value, numericHeight.value))
const recommendedUses = computed(() => getRecommendedUses(numericWidth.value, numericHeight.value))
const bestFormat = computed(() => recommendedUses.value.suitable[0] ?? null)
const professionalDimensions = computed(() => dimensions.value.find(row => row.dpi === 300) ?? null)
const summaryTone = computed<'ok' | 'warning' | 'error'>(() => {
  const featuredStatuses = FEATURED_FORMATS.map(format => formatStatus.value[format])

  if (featuredStatuses.includes('ok')) return 'ok'
  if (featuredStatuses.includes('warning')) return 'warning'
  return 'error'
})
const summaryVariant = computed<'success' | 'warning' | 'error'>(() => {
  if (summaryTone.value === 'ok') return 'success'
  if (summaryTone.value === 'warning') return 'warning'
  return 'error'
})

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

const MAX_SIZE = 120

function getComparisonViewBox(wCm: number, hCm: number) {
  const max = Math.max(wCm, hCm)
  const scale = MAX_SIZE / max
  const w = wCm * scale + 24
  const h = hCm * scale + 24
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
.dpi-analysis-stage {
  position: relative;
  margin-bottom: 1.5rem;
  padding: 1.25rem;
  border: 1px solid color-mix(in srgb, var(--gi-brand) 18%, var(--gi-border));
  border-radius: var(--gi-radius-xl);
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--gi-mint) 20%, transparent), transparent 38%),
    linear-gradient(180deg, color-mix(in srgb, var(--gi-surface) 94%, var(--gi-bg-soft)), var(--gi-surface));
  box-shadow: var(--gi-shadow-sm);
  overflow: hidden;
}

.dpi-analysis-stage::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.45), transparent 40%);
  pointer-events: none;
}

.dpi-stage-intro,
.dpi-stage-grid {
  position: relative;
  z-index: 1;
}

.dpi-stage-intro {
  max-width: 44rem;
  margin-bottom: 1.25rem;
}

.dpi-stage-kicker {
  margin: 0 0 0.4rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--gi-brand-dark);
}

.dpi-stage-title {
  margin: 0 0 0.5rem;
  font-family: 'Garnett', 'Inter', system-ui, sans-serif;
  font-size: clamp(1.35rem, 3vw, 1.8rem);
  line-height: 1.05;
  color: var(--gi-text);
}

.dpi-stage-description {
  margin: 0;
  max-width: 52ch;
  font-size: 0.98rem;
  line-height: 1.65;
  color: var(--gi-text-muted);
}

.dpi-stage-grid {
  display: grid;
  gap: 1rem;
}

.dpi-stage-inputs {
  min-width: 0;
}

.dpi-manual-panel,
.dpi-stage-placeholder {
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-xl);
  padding: 1rem;
  background: color-mix(in srgb, var(--gi-surface) 82%, white);
}

.dpi-manual-header {
  margin-bottom: 0.9rem;
}

.dpi-panel-title {
  margin: 0 0 0.3rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--gi-text);
}

.dpi-panel-description,
.dpi-stage-placeholder-copy {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.55;
  color: var(--gi-text-muted);
}

.dpi-manual-grid {
  display: grid;
  gap: 0.85rem;
}

.dpi-manual-grid :deep(.gi-field) {
  margin-bottom: 0;
}

.dpi-stage-error {
  margin: 0.85rem 0 0;
  font-size: 0.85rem;
  color: var(--gi-tint-red-text);
}

.dpi-stage-summary {
  margin-bottom: 0;
  align-self: start;
}

.dpi-summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
  margin: 0;
}

.dpi-summary-item {
  padding: 0.8rem;
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  background: var(--gi-bg-soft);
}

.dpi-summary-item dt {
  margin: 0 0 0.35rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--gi-text-muted);
}

.dpi-summary-item dd {
  margin: 0;
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--gi-text);
}

.dpi-summary-callout {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: var(--gi-radius-lg);
  border: 1px solid transparent;
  display: grid;
  gap: 0.25rem;
}

.dpi-summary-callout--ok {
  background: var(--gi-tint-green-bg);
  border-color: color-mix(in srgb, var(--gi-tint-green-text) 18%, var(--gi-border));
}

.dpi-summary-callout--warning {
  background: var(--gi-tint-yellow-bg);
  border-color: color-mix(in srgb, var(--gi-tint-yellow-text) 18%, var(--gi-border));
}

.dpi-summary-callout--error {
  background: var(--gi-tint-red-bg);
  border-color: color-mix(in srgb, var(--gi-tint-red-text) 18%, var(--gi-border));
}

.dpi-summary-callout-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--gi-text-muted);
}

.dpi-summary-callout-value {
  font-size: 1.2rem;
  line-height: 1.1;
  color: var(--gi-text);
}

.dpi-summary-callout-status {
  font-size: 0.85rem;
  color: var(--gi-text-muted);
}

.dpi-primary-results,
.dpi-curated-panels {
  margin-bottom: 1.5rem;
}

.dpi-primary-results :deep(.gi-result-card) {
  margin-bottom: 0;
}

.dpi-dimensions-table {
  margin-top: 0.25rem;
}

.dpi-dimensions-table th {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--gi-text-muted);
}

.dpi-dimensions-table td {
  padding: 0.85rem 0.65rem;
  vertical-align: middle;
}

.dpi-dimensions-row-ok {
  background: color-mix(in srgb, var(--gi-tint-green-bg) 72%, white);
}

.dpi-dimensions-row-warning {
  background: color-mix(in srgb, var(--gi-tint-yellow-bg) 74%, white);
}

.dpi-dimensions-row-error {
  background: color-mix(in srgb, var(--gi-tint-red-bg) 72%, white);
}

.dpi-dimensions-label {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.72rem;
  color: var(--gi-text-muted);
}

.dpi-curated-panels {
  display: grid;
  gap: 1rem;
}

.dpi-curated-panels :deep(.gi-result-card) {
  margin-bottom: 0;
}

.dpi-format-section + .dpi-format-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--gi-border);
}

.dpi-section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.dpi-section-title {
  margin: 0 0 0.75rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--gi-text);
}

.dpi-section-heading .dpi-section-title {
  margin-bottom: 0;
}

.dpi-format-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 0.75rem;
}

.dpi-format-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.8rem 0.95rem;
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  background: var(--gi-bg-soft);
}

.dpi-format-name {
  font-weight: 700;
  color: var(--gi-text);
}

.dpi-toggle-button {
  flex-shrink: 0;
}

.dpi-recommended-grid {
  display: grid;
  gap: 0.9rem;
}

.dpi-recommended-section h4 {
  margin: 0 0 0.65rem;
  font-size: 0.92rem;
  font-weight: 700;
}

.dpi-recommended-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.45rem;
}

.dpi-recommended-section li {
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  background: var(--gi-bg-soft);
  font-size: 0.9rem;
}

.dpi-recommended-section--suitable h4 {
  color: var(--gi-brand-dark);
}

.dpi-recommended-section--suitable li {
  border-color: color-mix(in srgb, var(--gi-brand) 22%, var(--gi-border));
  background: var(--gi-brand-fade);
}

.dpi-recommended-section--not-suitable h4 {
  color: var(--gi-tint-red-text);
}

.dpi-recommended-section--not-suitable li {
  border-color: color-mix(in srgb, var(--gi-tint-red-text) 18%, var(--gi-border));
  background: var(--gi-tint-red-bg);
}

.dpi-comparison-card {
  grid-column: 1 / -1;
}

.dpi-comparison-desc {
  margin: 0 0 0.95rem;
  font-size: 0.9rem;
  color: var(--gi-text-muted);
}

.dpi-comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.9rem;
}

.dpi-comparison-item {
  padding: 1rem;
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  background: var(--gi-bg-soft);
  display: grid;
  justify-items: center;
  gap: 0.7rem;
}

.dpi-comparison-header {
  display: grid;
  gap: 0.2rem;
  justify-items: center;
}

.dpi-comparison-dpi {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--gi-text);
}

.dpi-comparison-label {
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--gi-text-muted);
}

.dpi-comparison-visual {
  width: 100%;
  display: flex;
  justify-content: center;
}

.dpi-comparison-svg {
  max-width: 100%;
  height: auto;
}

.dpi-comparison-rect {
  transition: fill 0.2s ease;
}

.dpi-comparison-ok {
  fill: color-mix(in srgb, var(--gi-brand) 26%, white);
  stroke: var(--gi-brand);
  stroke-width: 2;
}

.dpi-comparison-warning {
  fill: color-mix(in srgb, var(--gi-tint-yellow-text) 22%, white);
  stroke: var(--gi-tint-yellow-text);
  stroke-width: 2;
}

.dpi-comparison-error {
  fill: color-mix(in srgb, var(--gi-tint-red-text) 16%, white);
  stroke: var(--gi-tint-red-text);
  stroke-width: 2;
}

.dpi-comparison-dims {
  font-size: 0.82rem;
  color: var(--gi-text-muted);
  text-align: center;
}

.dpi-education-card {
  margin-bottom: 0;
}

.dpi-education-card :deep(.gi-result-card) {
  margin-bottom: 0;
  background: color-mix(in srgb, var(--gi-surface) 90%, var(--gi-bg-soft));
}

.dpi-educational-content {
  display: grid;
  gap: 0.8rem;
}

.dpi-education-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--gi-text);
}

.dpi-education-text {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.65;
  color: var(--gi-text-muted);
}

.dpi-education-list {
  margin: 0;
  padding-left: 1.1rem;
  display: grid;
  gap: 0.35rem;
  font-size: 0.9rem;
  line-height: 1.65;
  color: var(--gi-text-muted);
}

.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (min-width: 900px) {
  .dpi-stage-grid {
    grid-template-columns: minmax(0, 1.3fr) minmax(280px, 0.8fr);
    align-items: start;
  }

  .dpi-manual-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dpi-curated-panels {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dpi-recommended-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 639px) {
  .dpi-analysis-stage {
    padding: 1rem;
  }

  .dpi-summary-grid {
    grid-template-columns: 1fr;
  }

  .dpi-dimensions-table {
    display: block;
    overflow-x: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .slide-enter-active,
  .slide-leave-active,
  .dpi-comparison-rect {
    transition: none;
  }

  .slide-enter-from,
  .slide-leave-to {
    transform: none;
  }
}
</style>
