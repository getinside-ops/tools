<template>
  <ToolPageLayout :title="t('urlParser.title')" :subtitle="t('urlParser.desc')" category="digital">
    <template #icon>
      <Link class="tool-page-icon" />
    </template>

    <!-- Input Section -->
    <div class="url-parser-input">
      <label class="gi-label">{{ t('urlParser.label') }}</label>
      <div class="gi-input-wrapper">
        <input
          v-model="urlInput"
          type="url"
          :placeholder="t('urlParser.placeholder')"
          class="gi-input url-parser-input-field"
          @input="handleInput"
        />
        <button
          v-if="urlInput"
          class="gi-btn-icon"
          @click="clearInput"
          :aria-label="t('urlParser.clear')"
        >
          <X :size="18" />
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!urlInput && !error" class="url-parser-empty">
      <Link :size="48" class="url-parser-empty-icon" />
      <p>{{ t('urlParser.emptyState') }}</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="gi-result gi-result-error">
      <p style="color: var(--gi-tint-red-text)">{{ t('utmBuilder.invalidUrl') }}</p>
    </div>

    <!-- Results Section -->
    <div v-if="parsedUrl && !error" class="url-parser-results">
      <!-- Copy All Button -->
      <div class="url-parser-results-header">
        <h2 class="url-parser-results-title">{{ t('urlParser.result') }}</h2>
        <button class="gi-btn gi-btn-sm" @click="copyAll">
          <Copy :size="16" />
          {{ copiedAll ? t('urlParser.copied') : t('urlParser.copyAll') }}
        </button>
      </div>

      <!-- URL Display -->
      <div class="url-parser-url-display">
        <code class="url-parser-url-code">{{ parsedUrl.href }}</code>
      </div>

      <!-- Components Grid -->
      <div class="url-parser-grid">
        <!-- Protocol -->
        <div class="url-parser-item">
          <div class="url-parser-item-header">
            <span class="url-parser-item-label">{{ t('urlParser.keys.protocol') }}</span>
            <Tooltip :content="t('urlParser.tooltips.protocol')">
              <Info :size="14" class="url-parser-tooltip" />
            </Tooltip>
          </div>
          <code class="url-parser-item-value">{{ parsedUrl.protocol }}</code>
          <button class="url-parser-copy" @click="copy(parsedUrl.protocol, 'protocol')">
            <Copy :size="14" />
          </button>
        </div>

        <!-- Origin -->
        <div class="url-parser-item">
          <div class="url-parser-item-header">
            <span class="url-parser-item-label">{{ t('urlParser.keys.origin') }}</span>
            <Tooltip :content="t('urlParser.tooltips.origin')">
              <Info :size="14" class="url-parser-tooltip" />
            </Tooltip>
          </div>
          <code class="url-parser-item-value">{{ parsedUrl.origin }}</code>
          <button class="url-parser-copy" @click="copy(parsedUrl.origin, 'origin')">
            <Copy :size="14" />
          </button>
        </div>

        <!-- Hostname -->
        <div class="url-parser-item">
          <div class="url-parser-item-header">
            <span class="url-parser-item-label">{{ t('urlParser.keys.hostname') }}</span>
            <Tooltip :content="t('urlParser.tooltips.hostname')">
              <Info :size="14" class="url-parser-tooltip" />
            </Tooltip>
          </div>
          <code class="url-parser-item-value">{{ parsedUrl.hostname }}</code>
          <button class="url-parser-copy" @click="copy(parsedUrl.hostname, 'hostname')">
            <Copy :size="14" />
          </button>
        </div>

        <!-- Port -->
        <div class="url-parser-item">
          <div class="url-parser-item-header">
            <span class="url-parser-item-label">{{ t('urlParser.keys.port') }}</span>
            <Tooltip :content="t('urlParser.tooltips.port')">
              <Info :size="14" class="url-parser-tooltip" />
            </Tooltip>
          </div>
          <code class="url-parser-item-value">{{ parsedUrl.port || '—' }}</code>
          <button class="url-parser-copy" @click="copy(parsedUrl.port || '', 'port')" :disabled="!parsedUrl.port">
            <Copy :size="14" />
          </button>
        </div>

        <!-- Pathname -->
        <div class="url-parser-item url-parser-item-full">
          <div class="url-parser-item-header">
            <span class="url-parser-item-label">{{ t('urlParser.keys.pathname') }}</span>
            <Tooltip :content="t('urlParser.tooltips.pathname')">
              <Info :size="14" class="url-parser-tooltip" />
            </Tooltip>
          </div>
          <code class="url-parser-item-value">{{ parsedUrl.pathname }}</code>
          <button class="url-parser-copy" @click="copy(parsedUrl.pathname, 'pathname')">
            <Copy :size="14" />
          </button>
        </div>

        <!-- Search -->
        <div class="url-parser-item url-parser-item-full">
          <div class="url-parser-item-header">
            <span class="url-parser-item-label">{{ t('urlParser.keys.search') }}</span>
            <Tooltip :content="t('urlParser.tooltips.search')">
              <Info :size="14" class="url-parser-tooltip" />
            </Tooltip>
          </div>
          <code class="url-parser-item-value">{{ parsedUrl.search || '—' }}</code>
          <button class="url-parser-copy" @click="copy(parsedUrl.search || '', 'search')" :disabled="!parsedUrl.search">
            <Copy :size="14" />
          </button>
        </div>

        <!-- Hash -->
        <div class="url-parser-item url-parser-item-full">
          <div class="url-parser-item-header">
            <span class="url-parser-item-label">{{ t('urlParser.keys.hash') }}</span>
            <Tooltip :content="t('urlParser.tooltips.hash')">
              <Info :size="14" class="url-parser-tooltip" />
            </Tooltip>
          </div>
          <code class="url-parser-item-value">{{ parsedUrl.hash || '—' }}</code>
          <button class="url-parser-copy" @click="copy(parsedUrl.hash || '', 'hash')" :disabled="!parsedUrl.hash">
            <Copy :size="14" />
          </button>
        </div>
      </div>

      <!-- Query Parameters -->
      <div v-if="Object.keys(parsedUrl.params).length > 0" class="url-parser-params-section">
        <div class="url-parser-params-header">
          <h3>{{ t('urlParser.parameters') }}</h3>
          <Tooltip :content="t('urlParser.tooltips.params')">
            <Info :size="14" class="url-parser-tooltip" />
          </Tooltip>
        </div>
        <div class="url-parser-params-list">
          <div
            v-for="(value, key) in parsedUrl.params"
            :key="key"
            class="url-parser-param-row"
          >
            <code class="url-parser-param-key">{{ key }}</code>
            <span class="url-parser-param-value">{{ value }}</span>
            <button class="url-parser-param-copy" @click="copy(`${key}=${value}`, `param-${key}`)">
              <Copy :size="14" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Educational Guide (Collapsible) -->
    <template #about>
    <div class="url-parser-guide">
      <button class="url-parser-guide-toggle" @click="showGuide = !showGuide">
        <ChevronDown :class="['url-parser-guide-icon', { 'url-parser-guide-expanded': showGuide }]" :size="20" />
        <span>{{ t('urlParser.guide.title') }}</span>
      </button>
      <Transition name="url-parser-guide-slide">
        <div v-if="showGuide" class="url-parser-guide-content">
          <p class="url-parser-guide-intro">{{ t('urlParser.guide.intro') }}</p>
          <UrlAnatomyDiagram />
          <h4 class="url-parser-guide-subtitle">{{ t('urlParser.guide.whyTitle') }}</h4>
          <ul class="url-parser-guide-list">
            <li v-for="(point, index) in whyPoints" :key="index">
              {{ point }}
            </li>
          </ul>
        </div>
      </Transition>
    </div>
    </template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Copy, X, Info, ChevronDown, Link } from 'lucide-vue-next'
import { parseUrl, type ParsedUrl } from '../composables/useUrlParser'
import Tooltip from '../components/Tooltip.vue'
import UrlAnatomyDiagram from '../components/UrlAnatomyDiagram.vue'
import ToolPageLayout from '../components/ToolPageLayout.vue'

const { t, tm } = useI18n()

const urlInput = ref('')
const error = ref(false)
const copiedField = ref<string | null>(null)
const copiedAll = ref(false)
const showGuide = ref(false)

// Get whyPoints as an array using tm() for typed messages
const whyPoints = computed(() => {
  const points = tm('urlParser.guide.whyPoints') as unknown
  return Array.isArray(points) ? points as string[] : []
})

const parsedUrl = computed<ParsedUrl | null>(() => {
  if (!urlInput.value) return null
  try {
    error.value = false
    return parseUrl(urlInput.value)
  } catch {
    error.value = true
    return null
  }
})

function handleInput() {
  if (!urlInput.value) {
    error.value = false
  }
}

function clearInput() {
  urlInput.value = ''
  error.value = false
}

async function copy(text: string, fieldName: string) {
  if (!text) return
  await navigator.clipboard.writeText(text)
  copiedField.value = fieldName
  setTimeout(() => {
    copiedField.value = null
  }, 2000)
}

async function copyAll() {
  if (!parsedUrl.value) return
  const fullUrl = parsedUrl.value.href
  await navigator.clipboard.writeText(fullUrl)
  copiedAll.value = true
  setTimeout(() => {
    copiedAll.value = false
  }, 2000)
}
</script>

<style scoped>
.tool-page-icon {
  width: 24px;
  height: 24px;
}

/* Input Section */
.url-parser-input {
  margin-bottom: 1.5rem;
}

.url-parser-input .gi-label {
  display: block;
  margin-bottom: 0.5rem;
}

.url-parser-input-field {
  width: 100%;
}

.gi-input-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  position: relative;
}

.gi-input-wrapper .gi-input {
  flex: 1;
  padding-right: 2.5rem;
}

.gi-btn-icon {
  position: absolute;
  right: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: var(--gi-text-muted);
  transition: all 0.2s;
}

.gi-btn-icon:hover {
  background: var(--gi-surface-alt);
  color: var(--gi-text);
}

/* Empty State */
.url-parser-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--gi-text-muted);
  background: var(--gi-surface-alt);
  border: 1px dashed var(--gi-border);
  border-radius: var(--gi-radius-md);
  margin: 1.5rem 0;
}

.url-parser-empty-icon {
  color: var(--gi-border);
  opacity: 0.5;
}

.url-parser-empty p {
  font-size: 1rem;
  margin: 0;
}

/* Error State */
.gi-result-error {
  border-color: var(--gi-tint-red-border);
  background: var(--gi-tint-red-light);
}

/* Results Section */
.url-parser-results {
  margin-top: 1.5rem;
}

.url-parser-results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.url-parser-results-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gi-text);
  margin: 0;
}

/* URL Display */
.url-parser-url-display {
  background: var(--gi-surface-alt);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.url-parser-url-code {
  font-size: 0.9rem;
  font-family: 'Fira Code', 'Consolas', monospace;
  word-break: break-all;
  color: var(--gi-text);
}

/* Components Grid */
.url-parser-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.url-parser-item {
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  padding: 0.875rem;
  position: relative;
  transition: all 0.2s;
}

.url-parser-item:hover {
  border-color: var(--gi-brand);
  box-shadow: 0 0 0 1px var(--gi-brand);
}

.url-parser-item-full {
  grid-column: 1 / -1;
}

.url-parser-item-header {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 0.5rem;
}

.url-parser-item-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--gi-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.url-parser-tooltip {
  color: var(--gi-text-muted);
  cursor: help;
  transition: color 0.2s;
  flex-shrink: 0;
}

.url-parser-tooltip:hover {
  color: var(--gi-brand);
}

.url-parser-item-value {
  font-size: 0.9rem;
  font-family: 'Fira Code', 'Consolas', monospace;
  word-break: break-all;
  color: var(--gi-text);
  display: block;
  padding-right: 2rem;
}

.url-parser-copy {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: var(--gi-surface-alt);
  border: 1px solid var(--gi-border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--gi-text-muted);
}

.url-parser-copy:hover:not(:disabled) {
  background: var(--gi-tint-green-light);
  border-color: var(--gi-brand);
  color: var(--gi-brand);
}

.url-parser-copy:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Query Parameters */
.url-parser-params-section {
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  padding: 1rem;
}

.url-parser-params-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--gi-border);
}

.url-parser-params-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gi-text);
  margin: 0;
}

.url-parser-params-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.url-parser-param-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0;
  border-bottom: 1px solid var(--gi-border);
}

.url-parser-param-row:last-child {
  border-bottom: none;
}

.url-parser-param-key {
  min-width: 120px;
  font-size: 0.85rem;
  font-family: 'Fira Code', 'Consolas', monospace;
  color: var(--gi-brand);
  font-weight: 500;
}

.url-parser-param-value {
  flex: 1;
  font-size: 0.9rem;
  color: var(--gi-text);
  word-break: break-all;
}

.url-parser-param-copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: var(--gi-surface-alt);
  border: 1px solid var(--gi-border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--gi-text-muted);
  flex-shrink: 0;
}

.url-parser-param-copy:hover {
  background: var(--gi-tint-green-light);
  border-color: var(--gi-brand);
  color: var(--gi-brand);
}

/* Guide Section */
.url-parser-guide {
  background: var(--gi-surface-alt);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  padding: 0.75rem;
  margin-top: 2rem;
}

.url-parser-guide-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--gi-text);
  text-align: left;
  transition: color 0.2s;
}

.url-parser-guide-toggle:hover {
  color: var(--gi-brand);
}

.url-parser-guide-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s;
}

.url-parser-guide-expanded {
  transform: rotate(180deg);
}

.url-parser-guide-slide-enter-active,
.url-parser-guide-slide-leave-active {
  overflow: hidden;
  transition: all 0.3s ease;
}

.url-parser-guide-slide-enter-from,
.url-parser-guide-slide-leave-to {
  opacity: 0;
  max-height: 0;
}

.url-parser-guide-content {
  padding-top: 1rem;
}

.url-parser-guide-intro {
  font-size: 0.95rem;
  color: var(--gi-text);
  margin-bottom: 1rem;
}

.url-parser-guide-subtitle {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gi-text);
  margin: 1.5rem 0 1rem;
}

.url-parser-guide-list {
  padding-left: 1.5rem;
}

.url-parser-guide-list li {
  margin-bottom: 0.5rem;
  color: var(--gi-text);
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 640px) {
  .url-parser-grid {
    grid-template-columns: 1fr;
  }
  
  .url-parser-param-row {
    flex-wrap: wrap;
  }
  
  .url-parser-param-key {
    min-width: 100%;
    margin-bottom: 0.25rem;
  }
}
</style>
