<template>
  <ToolPageLayout :title="t('urlParser.title')" :subtitle="t('urlParser.desc')">
    <template #icon>
      <Link class="tool-page-icon" />
    </template>

    <!-- Input Section -->
    <GiFormField :label="t('urlParser.label')" type="url" :placeholder="t('urlParser.placeholder')" v-model="urlInput">
      <template #input>
        <div class="gi-input-wrapper">
          <input
            v-model="urlInput"
            type="url"
            :placeholder="t('urlParser.placeholder')"
            class="gi-input"
            @input="handleInput"
          />
          <button
            v-if="urlInput"
            class="gi-btn-ghost gi-btn-sm"
            @click="clearInput"
            :aria-label="t('urlParser.clear')"
          >
            <X class="gi-icon" />
          </button>
        </div>
      </template>
    </GiFormField>

    <!-- Empty State -->
    <div v-if="!urlInput && !error" class="gi-empty-state">
      <p>{{ t('urlParser.emptyState') }}</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="gi-result gi-result-error">
      <p style="color: var(--gi-tint-red-text)">{{ t('utmBuilder.invalidUrl') }}</p>
    </div>

    <!-- Results Section -->
    <div v-if="parsedUrl && !error" class="gi-url-results">
      <!-- Copy All Button -->
      <div class="gi-results-header">
        <h2 class="gi-results-title">{{ t('urlParser.result') }}</h2>
        <button class="gi-btn" @click="copyAll">
          <Copy class="gi-icon-sm" />
          {{ copiedAll ? t('urlParser.copied') : t('urlParser.copyAll') }}
        </button>
      </div>

      <!-- Components Grid -->
      <div class="gi-components-grid">
        <!-- Protocol -->
        <GiResultCard :title="t('urlParser.keys.protocol')">
          <div class="gi-card-content">
            <div class="gi-card-header">
              <Tooltip :content="t('urlParser.tooltips.protocol')">
                <Info class="gi-tooltip-icon" />
              </Tooltip>
            </div>
            <div class="gi-card-value gi-code">{{ parsedUrl.protocol }}</div>
          </div>
          <template #actions>
            <button class="gi-copy-btn" @click="copy(parsedUrl.protocol, 'protocol')">
              <Copy class="gi-icon-sm" />
              {{ copiedField === 'protocol' ? t('urlParser.copied') : t('nav.copy') }}
            </button>
          </template>
        </GiResultCard>

        <!-- Origin -->
        <GiResultCard :title="t('urlParser.keys.origin')">
          <div class="gi-card-content">
            <div class="gi-card-header">
              <Tooltip :content="t('urlParser.tooltips.origin')">
                <Info class="gi-tooltip-icon" />
              </Tooltip>
            </div>
            <div class="gi-card-value gi-code">{{ parsedUrl.origin }}</div>
          </div>
          <template #actions>
            <button class="gi-copy-btn" @click="copy(parsedUrl.origin, 'origin')">
              <Copy class="gi-icon-sm" />
              {{ copiedField === 'origin' ? t('urlParser.copied') : t('nav.copy') }}
            </button>
          </template>
        </GiResultCard>

        <!-- Hostname -->
        <GiResultCard :title="t('urlParser.keys.hostname')">
          <div class="gi-card-content">
            <div class="gi-card-header">
              <Tooltip :content="t('urlParser.tooltips.hostname')">
                <Info class="gi-tooltip-icon" />
              </Tooltip>
            </div>
            <div class="gi-card-value gi-code">{{ parsedUrl.hostname }}</div>
          </div>
          <template #actions>
            <button class="gi-copy-btn" @click="copy(parsedUrl.hostname, 'hostname')">
              <Copy class="gi-icon-sm" />
              {{ copiedField === 'hostname' ? t('urlParser.copied') : t('nav.copy') }}
            </button>
          </template>
        </GiResultCard>

        <!-- Port -->
        <GiResultCard :title="t('urlParser.keys.port')">
          <div class="gi-card-content">
            <div class="gi-card-header">
              <Tooltip :content="t('urlParser.tooltips.port')">
                <Info class="gi-tooltip-icon" />
              </Tooltip>
            </div>
            <div class="gi-card-value gi-code">{{ parsedUrl.port || '-' }}</div>
          </div>
          <template #actions>
            <button class="gi-copy-btn" @click="copy(parsedUrl.port, 'port')">
              <Copy class="gi-icon-sm" />
              {{ copiedField === 'port' ? t('urlParser.copied') : t('nav.copy') }}
            </button>
          </template>
        </GiResultCard>

        <!-- Pathname -->
        <GiResultCard :title="t('urlParser.keys.pathname')" class="gi-card-full-width">
          <div class="gi-card-content">
            <div class="gi-card-header">
              <Tooltip :content="t('urlParser.tooltips.pathname')">
                <Info class="gi-tooltip-icon" />
              </Tooltip>
            </div>
            <div class="gi-card-value gi-code">{{ parsedUrl.pathname }}</div>
          </div>
          <template #actions>
            <button class="gi-copy-btn" @click="copy(parsedUrl.pathname, 'pathname')">
              <Copy class="gi-icon-sm" />
              {{ copiedField === 'pathname' ? t('urlParser.copied') : t('nav.copy') }}
            </button>
          </template>
        </GiResultCard>

        <!-- Search -->
        <GiResultCard :title="t('urlParser.keys.search')" class="gi-card-full-width">
          <div class="gi-card-content">
            <div class="gi-card-header">
              <Tooltip :content="t('urlParser.tooltips.search')">
                <Info class="gi-tooltip-icon" />
              </Tooltip>
            </div>
            <div class="gi-card-value gi-code">{{ parsedUrl.search || '-' }}</div>
          </div>
          <template #actions>
            <button class="gi-copy-btn" @click="copy(parsedUrl.search, 'search')">
              <Copy class="gi-icon-sm" />
              {{ copiedField === 'search' ? t('urlParser.copied') : t('nav.copy') }}
            </button>
          </template>
        </GiResultCard>

        <!-- Hash -->
        <GiResultCard :title="t('urlParser.keys.hash')" class="gi-card-full-width">
          <div class="gi-card-content">
            <div class="gi-card-header">
              <Tooltip :content="t('urlParser.tooltips.hash')">
                <Info class="gi-tooltip-icon" />
              </Tooltip>
            </div>
            <div class="gi-card-value gi-code">{{ parsedUrl.hash || '-' }}</div>
          </div>
          <template #actions>
            <button class="gi-copy-btn" @click="copy(parsedUrl.hash, 'hash')">
              <Copy class="gi-icon-sm" />
              {{ copiedField === 'hash' ? t('urlParser.copied') : t('nav.copy') }}
            </button>
          </template>
        </GiResultCard>
      </div>

      <!-- Query Parameters -->
      <GiResultCard v-if="Object.keys(parsedUrl.params).length > 0" :title="t('urlParser.parameters')" class="gi-params-section">
        <div class="gi-params-header">
          <Tooltip :content="t('urlParser.tooltips.params')">
            <Info class="gi-tooltip-icon" />
          </Tooltip>
        </div>
        <div class="gi-params-grid">
          <div
            v-for="(value, key) in parsedUrl.params"
            :key="key"
            class="gi-param-row"
          >
            <span class="gi-param-key gi-code">{{ key }}</span>
            <span class="gi-param-value">{{ value }}</span>
            <button class="gi-param-copy" @click="copy(`${key}=${value}`, `param-${key}`)">
              <Copy class="gi-icon-sm" />
            </button>
          </div>
        </div>
      </GiResultCard>
    </div>

    <!-- Educational Guide (Collapsible) -->
    <template #pedagogic>
    <div class="gi-guide-section">
      <button class="gi-guide-toggle" @click="showGuide = !showGuide">
        <ChevronDown :class="['gi-guide-icon', { 'gi-guide-expanded': showGuide }]" />
        <span>{{ t('urlParser.guide.title') }}</span>
      </button>
      <Transition name="gi-guide-slide">
        <div v-if="showGuide" class="gi-guide-content">
          <p class="gi-guide-intro">{{ t('urlParser.guide.intro') }}</p>
          <UrlAnatomyDiagram />
          <h4 class="gi-guide-subtitle">{{ t('urlParser.guide.whyTitle') }}</h4>
          <ul class="gi-guide-list">
            <li v-for="(point, index) in t('urlParser.guide.whyPoints', { returnObjects: true })" :key="index">
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
import GiFormField from '../components/GiFormField.vue'
import GiResultCard from '../components/GiResultCard.vue'

const { t } = useI18n()

const urlInput = ref('')
const error = ref(false)
const copiedField = ref<string | null>(null)
const copiedAll = ref(false)
const showGuide = ref(false)

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

.gi-input-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.gi-input-wrapper .gi-input {
  flex: 1;
}

.gi-empty-state {
  padding: 3rem 2rem;
  text-align: center;
  color: var(--gi-text-muted);
  font-size: 1rem;
  background: var(--gi-surface-alt);
  border: 1px dashed var(--gi-border);
  border-radius: 8px;
  margin: 1.5rem 0;
}

.gi-result-error {
  border-color: var(--gi-tint-red-border);
  background: var(--gi-tint-red-light);
}

.gi-url-results {
  margin-top: 2rem;
}

.gi-results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.gi-results-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gi-text);
  margin: 0;
}

.gi-components-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.gi-card-full-width {
  grid-column: 1 / -1;
}

.gi-card-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.gi-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.gi-tooltip-icon {
  width: 14px;
  height: 14px;
  color: var(--gi-text-muted);
  cursor: help;
  transition: color 0.2s;
}

.gi-tooltip-icon:hover {
  color: var(--gi-primary);
}

.gi-card-value {
  font-size: 1rem;
  font-family: 'Fira Code', 'Consolas', monospace;
  word-break: break-all;
  color: var(--gi-text);
}

.gi-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.65rem;
  font-size: 0.8rem;
  background: var(--gi-surface-alt);
  border: 1px solid var(--gi-border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--gi-text);
}

.gi-copy-btn:hover {
  background: var(--gi-tint-green-light);
  border-color: var(--gi-primary);
  color: var(--gi-primary);
}

.gi-icon-sm {
  width: 14px;
  height: 14px;
}

.gi-params-section {
  margin-bottom: 0;
}

.gi-params-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.gi-params-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.gi-param-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--gi-border);
}

.gi-param-row:last-child {
  border-bottom: none;
}

.gi-param-key {
  min-width: 120px;
  font-size: 0.9rem;
  color: var(--gi-primary);
}

.gi-param-value {
  flex: 1;
  font-size: 0.9rem;
  color: var(--gi-text);
  word-break: break-all;
}

.gi-param-copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem;
  background: var(--gi-surface-alt);
  border: 1px solid var(--gi-border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--gi-text);
}

.gi-param-copy:hover {
  background: var(--gi-tint-green-light);
  border-color: var(--gi-primary);
  color: var(--gi-primary);
}

.gi-guide-section {
  background: var(--gi-surface-alt);
  border: 1px solid var(--gi-border);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 2rem;
}

.gi-guide-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  color: var(--gi-text);
  text-align: left;
  transition: color 0.2s;
}

.gi-guide-toggle:hover {
  color: var(--gi-primary);
}

.gi-guide-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s;
}

.gi-guide-expanded {
  transform: rotate(180deg);
}

.gi-guide-slide-enter-active,
.gi-guide-slide-leave-active {
  overflow: hidden;
  transition: all 0.3s ease;
}

.gi-guide-slide-enter-from,
.gi-guide-slide-leave-to {
  opacity: 0;
  max-height: 0;
}

.gi-guide-content {
  padding-top: 1rem;
}

.gi-guide-intro {
  font-size: 0.95rem;
  color: var(--gi-text);
  margin-bottom: 1rem;
}

.gi-guide-subtitle {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gi-text);
  margin: 1.5rem 0 1rem;
}

.gi-guide-list {
  padding-left: 1.5rem;
}

.gi-guide-list li {
  margin-bottom: 0.5rem;
  color: var(--gi-text);
  line-height: 1.6;
}
</style>
