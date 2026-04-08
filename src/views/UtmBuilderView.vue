<template>
  <ToolPageLayout
    :title="t('utmBuilder.title')"
    :description="t('utmBuilder.desc')"
    category="digital"
  >
    <template #icon>
      <Link :size="24" />
    </template>

    <!-- Actions Bar -->
    <div class="utm-actions-bar" v-if="hasContent">
      <button class="gi-btn gi-btn-ghost gi-btn-sm" @click="clearAll">
        <RotateCcw :size="14" />
        {{ t('utmBuilder.clearAll') }}
      </button>
    </div>

    <!-- URL Input -->
    <GiFormField
      :label="t('utmBuilder.destinationUrl')"
      v-model="url"
      type="url"
      :placeholder="t('utmBuilder.destinationUrlPlaceholder')"
      autocomplete="off"
      spellcheck="false"
    />
    <span class="utm-field-hint" :class="{ 'utm-field-hint--error': urlError }">
      {{ urlError ? t('utmBuilder.invalidUrlDesc') : '' }}
    </span>

    <!-- Source & Medium -->
    <div class="utm-row">
      <GiFormField :label="t('utmBuilder.source')">
        <template #input>
          <input
            id="source-input"
            v-model="source"
            class="gi-input"
            autocomplete="off"
            spellcheck="false"
            placeholder="google"
          />
        </template>
      </GiFormField>

      <GiFormField :label="t('utmBuilder.medium')">
        <template #input>
          <input
            id="medium-input"
            v-model="medium"
            class="gi-input"
            autocomplete="off"
            spellcheck="false"
            placeholder="cpc"
          />
        </template>
      </GiFormField>
    </div>

    <!-- Quick Presets -->
    <div class="utm-presets" v-if="!source || !medium">
      <span class="utm-presets-label">{{ t('utmBuilder.presets.label') }}</span>

      <div class="utm-preset-group">
        <span class="utm-preset-group-label">{{ t('utmBuilder.presets.sourceLabel') }}</span>
        <div class="utm-chips">
          <button
            v-for="[key, label] in Object.entries(sourcePresets)"
            :key="key"
            class="utm-chip"
            :class="{ 'utm-chip--active': source === key }"
            @click="source = key"
          >
            {{ label }}
          </button>
        </div>
      </div>

      <div class="utm-preset-group">
        <span class="utm-preset-group-label">{{ t('utmBuilder.presets.mediumLabel') }}</span>
        <div class="utm-chips">
          <button
            v-for="[key, label] in Object.entries(mediumPresets)"
            :key="key"
            class="utm-chip"
            :class="{ 'utm-chip--active': medium === key }"
            @click="medium = key"
          >
            {{ label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Optional Fields -->
    <div class="utm-row">
      <GiFormField :label="t('utmBuilder.campaign') + ' (' + t('utmBuilder.optional') + ')'" v-model="campaign" />
      <GiFormField :label="t('utmBuilder.content') + ' (' + t('utmBuilder.optional') + ')'" v-model="content" />
    </div>
    <GiFormField :label="t('utmBuilder.term') + ' (' + t('utmBuilder.optional') + ')'" v-model="term" />

    <!-- Generate Button -->
    <button
      class="gi-btn gi-btn-primary gi-btn-lg utm-generate-btn"
      :disabled="!canGenerate"
      @click="generate"
    >
      <Loader2 v-if="isGenerating" :size="18" class="animate-spin" />
      {{ isGenerating ? t('utmBuilder.generating') : t('utmBuilder.generate') }}
    </button>

    <!-- Empty State -->
    <div v-if="!hasContent && !generatedUrl" class="utm-empty-state">
      <Link :size="48" class="utm-empty-icon" />
      <p class="utm-empty-text">{{ t('utmBuilder.emptyState.title') }}</p>
      <p class="utm-empty-desc">{{ t('utmBuilder.emptyState.desc') }}</p>
      <div class="utm-example-card">
        <span class="utm-example-label">{{ t('utmBuilder.emptyState.exampleLabel') }}</span>
        <code class="utm-example-code">{{ t('utmBuilder.emptyState.example') }}</code>
        <button class="gi-btn gi-btn-ghost gi-btn-sm" @click="tryExample">
          {{ t('utmBuilder.emptyState.tryExample') }}
        </button>
      </div>
    </div>

    <!-- URL Parameter Preview -->
    <div v-if="hasContent && !urlError" class="utm-url-preview">
      <span class="utm-url-preview-label">{{ t('utmBuilder.urlPreview.label') }}</span>
      <code class="utm-url-preview-code" v-if="previewParams">?{{ previewParams }}</code>
      <span v-else class="utm-url-preview-none">{{ t('utmBuilder.urlPreview.noParams') }}</span>
    </div>

    <!-- Result Card -->
    <GiResultCard :title="t('utmBuilder.result')">
      <div v-if="urlError" class="utm-error-card">
        <AlertCircle :size="20" />
        <div>
          <strong>{{ t('utmBuilder.invalidUrl') }}</strong>
          <span>{{ t('utmBuilder.invalidUrlDesc') }}</span>
        </div>
      </div>
      <div v-else-if="!generatedUrl" class="utm-empty-result">
        {{ t('utmBuilder.fillRequired') }}
      </div>
      <p v-else class="gi-code utm-result-url">{{ generatedUrl }}</p>
      <template #actions>
        <button
          class="gi-btn"
          :disabled="!generatedUrl || !!urlError"
          @click="copy"
        >
          <Clipboard v-if="!copied" :size="14" />
          <Check v-else :size="14" />
          {{ copied ? t('utmBuilder.copied') : t('utmBuilder.copy') }}
        </button>
      </template>
    </GiResultCard>

    <!-- Pedagogic Tips -->
    <div class="utm-tips">
      <button class="utm-tips-toggle" @click="showTips = !showTips" :aria-expanded="showTips">
        <Info :size="18" />
        {{ t('utmBuilder.pedagogic.title') }}
        <ChevronDown :size="16" :class="{ 'utm-tips-icon--open': showTips }" />
      </button>
      <div v-if="showTips" class="utm-tips-content">
        <p class="utm-tips-desc">{{ t('utmBuilder.pedagogic.description') }}</p>
        <ul class="utm-tips-list">
          <li v-for="(tip, i) in t('utmBuilder.pedagogic.tips')" :key="i">{{ tip }}</li>
        </ul>
      </div>
    </div>

    <template #about>{{ t('utmBuilder.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Link,
  Check,
  Clipboard,
  Loader2,
  RotateCcw,
  AlertCircle,
  Info,
  ChevronDown,
} from 'lucide-vue-next'
import ToolPageLayout from '../components/ToolPageLayout.vue'
import GiFormField from '../components/GiFormField.vue'
import GiResultCard from '../components/GiResultCard.vue'
import { buildUtmUrl } from '../composables/useUtmBuilder'

const { t } = useI18n()

const url = ref('')
const source = ref('')
const medium = ref('')
const campaign = ref('')
const content = ref('')
const term = ref('')
const copied = ref(false)
const urlError = ref(false)
const isGenerating = ref(false)
const showTips = ref(false)
const generatedUrl = ref('')

const hasContent = computed(() =>
  url.value || source.value || medium.value || campaign.value || content.value || term.value
)

const canGenerate = computed(() => url.value && source.value && medium.value && !urlError.value)

const previewParams = computed(() => {
  const params: string[] = []
  if (source.value) params.push(`utm_source=${encodeURIComponent(source.value)}`)
  if (medium.value) params.push(`utm_medium=${encodeURIComponent(medium.value)}`)
  if (campaign.value) params.push(`utm_campaign=${encodeURIComponent(campaign.value)}`)
  if (content.value) params.push(`utm_content=${encodeURIComponent(content.value)}`)
  if (term.value) params.push(`utm_term=${encodeURIComponent(term.value)}`)
  return params.length ? params.join('&') : ''
})

const sourcePresets: Record<string, string> = {
  google: t('utmBuilder.presets.sources.google'),
  facebook: t('utmBuilder.presets.sources.facebook'),
  newsletter: t('utmBuilder.presets.sources.newsletter'),
  linkedin: t('utmBuilder.presets.sources.linkedin'),
  twitter: t('utmBuilder.presets.sources.twitter'),
  instagram: t('utmBuilder.presets.sources.instagram'),
  tiktok: t('utmBuilder.presets.sources.tiktok'),
  youtube: t('utmBuilder.presets.sources.youtube'),
  organic: t('utmBuilder.presets.sources.organic'),
  referral: t('utmBuilder.presets.sources.referral'),
}

const mediumPresets: Record<string, string> = {
  cpc: t('utmBuilder.presets.mediums.cpc'),
  email: t('utmBuilder.presets.mediums.email'),
  social: t('utmBuilder.presets.mediums.social'),
  organic: t('utmBuilder.presets.mediums.organic'),
  referral: t('utmBuilder.presets.mediums.referral'),
  display: t('utmBuilder.presets.mediums.display'),
  affiliate: t('utmBuilder.presets.mediums.affiliate'),
}

function validateUrl(value: string): boolean {
  if (!value) return false
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

function generate() {
  if (!canGenerate.value) return
  isGenerating.value = true
  urlError.value = false

  // Simulate brief processing for UX feedback
  setTimeout(() => {
    try {
      if (!validateUrl(url.value)) {
        urlError.value = true
        generatedUrl.value = ''
      } else {
        generatedUrl.value = buildUtmUrl({
          url: url.value,
          source: source.value,
          medium: medium.value,
          campaign: campaign.value || undefined,
          content: content.value || undefined,
          term: term.value || undefined,
        })
      }
    } catch {
      urlError.value = true
      generatedUrl.value = ''
    } finally {
      isGenerating.value = false
    }
  }, 200)
}

function clearAll() {
  url.value = ''
  source.value = ''
  medium.value = ''
  campaign.value = ''
  content.value = ''
  term.value = ''
  generatedUrl.value = ''
  urlError.value = false
}

function tryExample() {
  url.value = 'https://example.com/landing'
  source.value = 'google'
  medium.value = 'cpc'
  campaign.value = 'summer25'
}

async function copy() {
  if (!generatedUrl.value) return
  await navigator.clipboard.writeText(generatedUrl.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<style scoped>
/* Actions Bar */
.utm-actions-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--gi-space-sm);
}

/* Field Hints */
.utm-field-hint {
  display: block;
  font-size: var(--gi-font-size-xs);
  color: var(--gi-text-secondary);
  margin-top: calc(-1 * var(--gi-space-xs));
  margin-bottom: var(--gi-space-sm);
  min-height: 1em;
  transition: color var(--gi-transition-fast) var(--gi-ease-out);
}

.utm-field-hint--error {
  color: var(--gi-error);
}

/* Row Layout */
.utm-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--gi-space-md);
}

@media (max-width: 640px) {
  .utm-row {
    grid-template-columns: 1fr;
    gap: var(--gi-space-sm);
  }
}

/* Presets Section */
.utm-presets {
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  padding: var(--gi-space-md) var(--gi-space-lg);
  margin-bottom: var(--gi-space-md);
  animation: utm-fade-in 0.2s var(--gi-ease-out);
}

@keyframes utm-fade-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.utm-presets-label {
  display: block;
  font-size: var(--gi-font-size-xs);
  font-weight: 600;
  color: var(--gi-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--gi-space-sm);
}

.utm-preset-group {
  margin-bottom: var(--gi-space-sm);
}

.utm-preset-group:last-child {
  margin-bottom: 0;
}

.utm-preset-group-label {
  display: block;
  font-size: var(--gi-font-size-xs);
  color: var(--gi-text-muted);
  margin-bottom: var(--gi-space-xs);
}

.utm-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gi-space-xs);
}

.utm-chip {
  padding: var(--gi-space-xs) var(--gi-space-sm);
  font-size: var(--gi-font-size-sm);
  font-weight: 500;
  color: var(--gi-text);
  background: var(--gi-bg);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-pill);
  cursor: pointer;
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
  min-height: 32px;
  display: flex;
  align-items: center;
}

.utm-chip:hover {
  background: var(--gi-brand-fade);
  border-color: var(--gi-brand);
}

.utm-chip:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 1px;
}

.utm-chip--active {
  background: var(--gi-brand);
  color: var(--gi-text-inverse);
  border-color: var(--gi-brand);
}

.utm-chip--active:hover {
  background: var(--gi-brand-dark);
}

/* Generate Button */
.utm-generate-btn {
  width: 100%;
  margin-bottom: var(--gi-space-lg);
}

/* Empty State */
.utm-empty-state {
  text-align: center;
  padding: var(--gi-space-xl) var(--gi-space-lg);
  background: var(--gi-surface);
  border: 1px dashed var(--gi-border);
  border-radius: var(--gi-radius-lg);
  margin-bottom: var(--gi-space-lg);
}

.utm-empty-icon {
  color: var(--gi-text-muted);
  opacity: 0.3;
  margin-bottom: var(--gi-space-md);
}

.utm-empty-text {
  font-size: var(--gi-font-size-md);
  font-weight: 600;
  color: var(--gi-text);
  margin: 0 0 var(--gi-space-xs);
}

.utm-empty-desc {
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-secondary);
  margin: 0 0 var(--gi-space-md);
}

.utm-example-card {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gi-space-xs);
  padding: var(--gi-space-sm) var(--gi-space-md);
  background: var(--gi-tint-blue-bg);
  border-radius: var(--gi-radius);
}

.utm-example-label {
  font-size: var(--gi-font-size-xs);
  color: var(--gi-text-secondary);
}

.utm-example-code {
  font-family: 'Menlo', 'Monaco', monospace;
  font-size: var(--gi-font-size-sm);
  color: var(--gi-tint-blue-text);
  word-break: break-all;
}

/* URL Preview */
.utm-url-preview {
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius);
  padding: var(--gi-space-sm) var(--gi-space-md);
  margin-bottom: var(--gi-space-lg);
}

.utm-url-preview-label {
  display: block;
  font-size: var(--gi-font-size-xs);
  font-weight: 600;
  color: var(--gi-text-secondary);
  margin-bottom: var(--gi-space-xs);
}

.utm-url-preview-code {
  font-family: 'Menlo', 'Monaco', monospace;
  font-size: var(--gi-font-size-sm);
  color: var(--gi-tint-blue-text);
  word-break: break-all;
  display: block;
}

.utm-url-preview-none {
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-muted);
  font-style: italic;
}

/* Error Card */
.utm-error-card {
  display: flex;
  align-items: flex-start;
  gap: var(--gi-space-sm);
  padding: var(--gi-space-md);
  background: var(--gi-tint-red-bg);
  border: 1px solid var(--gi-tint-red-border);
  border-radius: var(--gi-radius);
  color: var(--gi-tint-red-text);
  margin-bottom: var(--gi-space-sm);
}

.utm-error-card strong {
  display: block;
  font-size: var(--gi-font-size-sm);
}

.utm-error-card span {
  font-size: var(--gi-font-size-xs);
  opacity: 0.85;
}

/* Empty Result */
.utm-empty-result {
  color: var(--gi-text-muted);
  font-size: var(--gi-font-size-sm);
  font-style: italic;
}

/* Result URL */
.utm-result-url {
  word-break: break-all;
  line-height: 1.6;
}

/* Pedagogic Tips */
.utm-tips {
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  margin-bottom: var(--gi-space-lg);
  overflow: hidden;
}

.utm-tips-toggle {
  display: flex;
  align-items: center;
  gap: var(--gi-space-sm);
  width: 100%;
  padding: var(--gi-space-md) var(--gi-space-lg);
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--gi-font-size-sm);
  font-weight: 600;
  color: var(--gi-text);
  text-align: left;
  min-height: 44px;
  transition: background var(--gi-transition-fast) var(--gi-ease-out);
}

.utm-tips-toggle:hover {
  background: var(--gi-bg);
}

.utm-tips-toggle:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: -2px;
}

.utm-tips-icon--open {
  transform: rotate(180deg);
}

.utm-tips-icon {
  transition: transform var(--gi-transition-fast) var(--gi-ease-out);
}

.utm-tips-content {
  padding: 0 var(--gi-space-lg) var(--gi-space-md);
  animation: utm-expand 0.2s var(--gi-ease-out);
}

@keyframes utm-expand {
  from { opacity: 0; max-height: 0; }
  to { opacity: 1; max-height: 400px; }
}

.utm-tips-desc {
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-secondary);
  margin-bottom: var(--gi-space-sm);
  line-height: 1.5;
}

.utm-tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-xs);
}

.utm-tips-list li {
  position: relative;
  padding-left: var(--gi-space-md);
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-secondary);
  line-height: 1.5;
}

.utm-tips-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.5em;
  width: 6px;
  height: 6px;
  background: var(--gi-brand);
  border-radius: 50%;
}

/* Dark mode */
[data-theme="dark"] .utm-empty-icon {
  opacity: 0.2;
}

[data-theme="dark"] .utm-tips-toggle:hover {
  background: rgba(255, 255, 255, 0.05);
}
</style>
