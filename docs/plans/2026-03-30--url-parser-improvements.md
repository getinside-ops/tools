# URL Parser Improvements Implementation Plan

> **For Qwen Code:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Enhance the URL Parser tool with educational content, tooltips, copy buttons, and improved UI following project patterns.

**Architecture:** Create a reusable Tooltip component, add explanatory section with URL anatomy diagram, refactor UrlParserView with card-based layout and copy functionality, extend i18n translations.

**Tech Stack:** Vue 3 Composition API, vue-i18n, lucide-vue-next icons, TypeScript strict mode.

---

### Task 1: Create Tooltip Component

**Files:**
- Create: `src/components/Tooltip.vue`
- Test: N/A (simple UI component, manually verified)

**Step 1: Create Tooltip.vue component**

```vue
<template>
  <div class="gi-tooltip-wrapper">
    <div
      class="gi-tooltip-trigger"
      @mouseenter="show = true"
      @mouseleave="show = false"
      @focus="show = true"
      @blur="show = false"
      tabindex="0"
      role="button"
      aria-haspopup="tooltip"
      :aria-expanded="show"
    >
      <slot name="trigger">
        <Info class="gi-tooltip-icon" />
      </slot>
    </div>
    <Teleport to="body">
      <Transition name="gi-tooltip-fade">
        <div
          v-if="show"
          class="gi-tooltip"
          :style="tooltipStyle"
          role="tooltip"
          @mouseenter="show = true"
          @mouseleave="show = false"
        >
          <slot>{{ content }}</slot>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Info } from 'lucide-vue-next'

const props = defineProps<{
  content?: string
}>()

const show = ref(false)
const triggerRef = ref<HTMLElement | null>(null)

const tooltipStyle = computed(() => {
  if (!triggerRef.value) return {}
  const rect = triggerRef.value.getBoundingClientRect()
  return {
    top: `${rect.bottom + 8}px`,
    left: `${rect.left + rect.width / 2}px`,
    transform: 'translateX(-50%)',
  }
})
</script>

<style scoped>
.gi-tooltip-wrapper {
  display: inline-block;
  position: relative;
}

.gi-tooltip-trigger {
  cursor: help;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.gi-tooltip-trigger:hover,
.gi-tooltip-trigger:focus {
  background-color: var(--gi-tint-green-light);
}

.gi-tooltip-icon {
  width: 14px;
  height: 14px;
  color: var(--gi-text-muted);
}

.gi-tooltip {
  position: fixed;
  z-index: 9999;
  max-width: 280px;
  padding: 0.75rem 1rem;
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--gi-text);
  text-align: left;
  white-space: normal;
}

.gi-tooltip-fade-enter-active,
.gi-tooltip-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.gi-tooltip-fade-enter-from,
.gi-tooltip-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-4px);
}
</style>
```

**Step 2: Commit**
```bash
git add src/components/Tooltip.vue
git commit -m "feat: add reusable Tooltip component with Info icon"
```

---

### Task 2: Add i18n Translations for Tooltips and Explanations

**Files:**
- Modify: `src/i18n/fr.ts:266-284` (urlParser section)
- Modify: `src/i18n/en.ts:268-286` (urlParser section)

**Step 1: Add French translations**

In `fr.ts`, replace the urlParser section with:

```typescript
urlParser: {
  title: 'Analyseur d\'URL',
  desc: 'Décortiquez une URL pour comprendre ses paramètres, son chemin et ses composants.',
  label: 'URL à analyser',
  placeholder: 'https://example.com/path?param=value#hash',
  result: 'Analyse de l\'URL',
  copyAll: 'Tout copier',
  copied: 'Copié !',
  clear: 'Effacer',
  components: 'Composants',
  parameters: 'Paramètres (Query)',
  noParams: 'Aucun paramètre trouvé.',
  emptyState: 'Entrez une URL ci-dessus pour voir son analyse détaillée.',
  keys: {
    protocol: 'Protocole',
    hostname: 'Hôte',
    port: 'Port',
    pathname: 'Chemin',
    hash: 'Ancre (Hash)',
    origin: 'Origine',
    search: 'Requête',
  },
  tooltips: {
    protocol: 'Définit le protocole de communication (https = sécurisé, http = non sécurisé). Le navigateur l\'utilise pour savoir comment récupérer la ressource.',
    origin: 'URL de base combinant protocole + hôte + port. Utilisé pour les politiques de sécurité comme CORS et les vérifications same-origin.',
    hostname: 'Nom de domaine ou adresse IP où se trouve la ressource. C\'est ce que le DNS résout pour trouver le serveur.',
    port: 'La "porte" spécifique sur le serveur. Généralement masquée (80 pour HTTP, 443 pour HTTPS) mais peut être personnalisée.',
    pathname: 'Chemin vers la ressource spécifique sur le serveur, comme un chemin de fichier dans votre système d\'exploitation.',
    search: 'La partie requête de l\'URL, commençant par "?". Contient les paramètres envoyés au serveur.',
    hash: 'Ancre côté client uniquement. Jamais envoyée au serveur. Utilisée pour la navigation intra-page et le routing côté client.',
    params: 'Paires clé-valeur envoyées au serveur. Utilisées pour le tracking (UTM), les recherches, les filtres et les paramètres API.',
  },
  guide: {
    title: 'Comprendre la structure d\'une URL',
    intro: 'Une URL (Uniform Resource Locator) est composée de plusieurs parties :',
    example: 'https://example.com:8080/path/to/page?search=term#section',
    anatomy: {
      protocol: 'Protocole (communication)',
      hostname: 'Nom de domaine',
      port: 'Port (optionnel, 443 par défaut pour HTTPS)',
      pathname: 'Chemin (emplacement de la ressource)',
      search: 'Paramètres de requête (envoyés au serveur)',
      hash: 'Hash/Fragment (uniquement côté client)',
    },
    whyTitle: 'Pourquoi est-ce important ?',
    whyPoints: [
      'Débogage : Identifier les paramètres de tracking, repérer les chaînes de redirection',
      'Analytics : Comprendre les paramètres UTM dans les URLs de campagnes',
      'SEO : Les URLs propres sont mieux classées, comprendre les URLs canoniques',
      'Sécurité : Repérer les domaines suspects ou les protocoles non-HTTPS',
      'Développement : Parser et manipuler les URLs dans votre code',
    ],
  },
},
```

**Step 2: Add English translations**

In `en.ts`, replace the urlParser section with:

```typescript
urlParser: {
  title: 'URL Parser',
  desc: 'Parse and analyze URL parameters, path, and components.',
  label: 'URL to analyze',
  placeholder: 'https://example.com/path?param=value#hash',
  result: 'URL Analysis',
  copyAll: 'Copy All',
  copied: 'Copied!',
  clear: 'Clear',
  components: 'Components',
  parameters: 'Query Parameters',
  noParams: 'No parameters found.',
  emptyState: 'Enter a URL above to see its detailed analysis.',
  keys: {
    protocol: 'Protocol',
    hostname: 'Hostname',
    port: 'Port',
    pathname: 'Path',
    hash: 'Hash',
    origin: 'Origin',
    search: 'Query',
  },
  tooltips: {
    protocol: 'Defines the communication protocol (https = secure, http = unsecure). Browsers use this to know how to fetch the resource.',
    origin: 'The base URL combining protocol + hostname + port. Used for security policies like CORS and same-origin checks.',
    hostname: 'The domain name or IP address where the resource lives. This is what DNS resolves to find the server.',
    port: 'The specific "door" on the server. Usually hidden (80 for HTTP, 443 for HTTPS) but can be custom.',
    pathname: 'The path to the specific resource on the server, like a file path in your operating system.',
    search: 'The query part of the URL, starting with "?". Contains parameters sent to the server.',
    hash: 'Client-only anchor. Never sent to the server. Used for in-page navigation and client-side routing.',
    params: 'Key-value pairs sent to the server. Used for tracking (UTM), search queries, filters, and API parameters.',
  },
  guide: {
    title: 'Understanding URL Structure',
    intro: 'A URL (Uniform Resource Locator) is made up of several parts:',
    example: 'https://example.com:8080/path/to/page?search=term#section',
    anatomy: {
      protocol: 'Protocol (communication)',
      hostname: 'Hostname (domain name)',
      port: 'Port (optional, 443 default for HTTPS)',
      pathname: 'Pathname (resource location)',
      search: 'Query Parameters (sent to server)',
      hash: 'Hash/Fragment (client-side only)',
    },
    whyTitle: 'Why does this matter?',
    whyPoints: [
      'Debugging: Identify tracking params, spot redirect chains',
      'Analytics: Understand UTM parameters in campaign URLs',
      'SEO: Clean URLs rank better, understand canonical URLs',
      'Security: Spot suspicious domains or non-HTTPS protocols',
      'Development: Parse and manipulate URLs in your code',
    ],
  },
},
```

**Step 3: Commit**
```bash
git add src/i18n/fr.ts src/i18n/en.ts
git commit -m "feat: add URL Parser tooltips and guide translations"
```

---

### Task 3: Create URL Anatomy Diagram Component

**Files:**
- Create: `src/components/UrlAnatomyDiagram.vue`

**Step 1: Create the diagram component**

```vue
<template>
  <div class="gi-url-anatomy">
    <div class="gi-url-example">
      <span class="gi-url-part protocol">https://</span>
      <span class="gi-url-part hostname">example.com</span>
      <span class="gi-url-part port">:8080</span>
      <span class="gi-url-part pathname">/path/to/page</span>
      <span class="gi-url-part search">?search=term</span>
      <span class="gi-url-part hash">#section</span>
    </div>
    <div class="gi-url-labels">
      <div class="gi-url-label">
        <span class="gi-label-line protocol"></span>
        <span>{{ t('urlParser.guide.anatomy.protocol') }}</span>
      </div>
      <div class="gi-url-label">
        <span class="gi-label-line hostname"></span>
        <span>{{ t('urlParser.guide.anatomy.hostname') }}</span>
      </div>
      <div class="gi-url-label">
        <span class="gi-label-line port"></span>
        <span>{{ t('urlParser.guide.anatomy.port') }}</span>
      </div>
      <div class="gi-url-label">
        <span class="gi-label-line pathname"></span>
        <span>{{ t('urlParser.guide.anatomy.pathname') }}</span>
      </div>
      <div class="gi-url-label">
        <span class="gi-label-line search"></span>
        <span>{{ t('urlParser.guide.anatomy.search') }}</span>
      </div>
      <div class="gi-url-label">
        <span class="gi-label-line hash"></span>
        <span>{{ t('urlParser.guide.anatomy.hash') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.gi-url-anatomy {
  background: var(--gi-surface-alt);
  border: 1px solid var(--gi-border);
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1.5rem 0;
}

.gi-url-example {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.95rem;
  line-height: 2;
  word-break: break-all;
}

.gi-url-part {
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  margin: 0.1rem;
}

.gi-url-part.protocol {
  background: var(--gi-tint-green-light);
  color: var(--gi-tint-green-text);
}

.gi-url-part.hostname {
  background: var(--gi-tint-blue-light);
  color: var(--gi-tint-blue-text);
}

.gi-url-part.port {
  background: var(--gi-tint-yellow-light);
  color: var(--gi-tint-yellow-text);
}

.gi-url-part.pathname {
  background: var(--gi-tint-purple-light);
  color: var(--gi-tint-purple-text);
}

.gi-url-part.search {
  background: var(--gi-tint-orange-light);
  color: var(--gi-tint-orange-text);
}

.gi-url-part.hash {
  background: var(--gi-tint-red-light);
  color: var(--gi-tint-red-text);
}

.gi-url-labels {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--gi-border);
}

.gi-url-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.gi-label-line {
  width: 20px;
  height: 3px;
  border-radius: 2px;
}

.gi-label-line.protocol {
  background: var(--gi-tint-green-text);
}

.gi-label-line.hostname {
  background: var(--gi-tint-blue-text);
}

.gi-label-line.port {
  background: var(--gi-tint-yellow-text);
}

.gi-label-line.pathname {
  background: var(--gi-tint-purple-text);
}

.gi-label-line.search {
  background: var(--gi-tint-orange-text);
}

.gi-label-line.hash {
  background: var(--gi-tint-red-text);
}
</style>
```

**Step 2: Commit**
```bash
git add src/components/UrlAnatomyDiagram.vue
git commit -m "feat: add URL Anatomy Diagram component with color-coded parts"
```

---

### Task 4: Refactor UrlParserView with New UI

**Files:**
- Modify: `src/views/UrlParserView.vue` (complete rewrite)

**Step 1: Rewrite UrlParserView.vue**

```vue
<template>
  <div>
    <router-link to="/" class="gi-back-link">{{ t('nav.back') }}</router-link>

    <div class="gi-tool-header">
      <h1>{{ t('urlParser.title') }}</h1>
      <p>{{ t('urlParser.desc') }}</p>
    </div>

    <!-- Input Section -->
    <div class="gi-field">
      <label class="gi-label">{{ t('urlParser.label') }}</label>
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
    </div>

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
        <div class="gi-result-card">
          <div class="gi-card-header">
            <span class="gi-card-label">{{ t('urlParser.keys.protocol') }}</span>
            <Tooltip :content="t('urlParser.tooltips.protocol')">
              <template #trigger>
                <Info class="gi-tooltip-icon" />
              </template>
            </Tooltip>
          </div>
          <div class="gi-card-value gi-code">{{ parsedUrl.protocol }}</div>
          <button class="gi-copy-btn" @click="copy(parsedUrl.protocol)">
            <Copy class="gi-icon-sm" />
            {{ copiedField === 'protocol' ? t('urlParser.copied') : t('nav.copy') }}
          </button>
        </div>

        <!-- Origin -->
        <div class="gi-result-card">
          <div class="gi-card-header">
            <span class="gi-card-label">{{ t('urlParser.keys.origin') }}</span>
            <Tooltip :content="t('urlParser.tooltips.origin')">
              <template #trigger>
                <Info class="gi-tooltip-icon" />
              </template>
            </Tooltip>
          </div>
          <div class="gi-card-value gi-code">{{ parsedUrl.origin }}</div>
          <button class="gi-copy-btn" @click="copy(parsedUrl.origin)">
            <Copy class="gi-icon-sm" />
            {{ copiedField === 'origin' ? t('urlParser.copied') : t('nav.copy') }}
          </button>
        </div>

        <!-- Hostname -->
        <div class="gi-result-card">
          <div class="gi-card-header">
            <span class="gi-card-label">{{ t('urlParser.keys.hostname') }}</span>
            <Tooltip :content="t('urlParser.tooltips.hostname')">
              <template #trigger>
                <Info class="gi-tooltip-icon" />
              </template>
            </Tooltip>
          </div>
          <div class="gi-card-value gi-code">{{ parsedUrl.hostname }}</div>
          <button class="gi-copy-btn" @click="copy(parsedUrl.hostname)">
            <Copy class="gi-icon-sm" />
            {{ copiedField === 'hostname' ? t('urlParser.copied') : t('nav.copy') }}
          </button>
        </div>

        <!-- Port -->
        <div class="gi-result-card">
          <div class="gi-card-header">
            <span class="gi-card-label">{{ t('urlParser.keys.port') }}</span>
            <Tooltip :content="t('urlParser.tooltips.port')">
              <template #trigger>
                <Info class="gi-tooltip-icon" />
              </template>
            </Tooltip>
          </div>
          <div class="gi-card-value gi-code">{{ parsedUrl.port || '-' }}</div>
          <button class="gi-copy-btn" @click="copy(parsedUrl.port)">
            <Copy class="gi-icon-sm" />
            {{ copiedField === 'port' ? t('urlParser.copied') : t('nav.copy') }}
          </button>
        </div>

        <!-- Pathname -->
        <div class="gi-result-card gi-card-full-width">
          <div class="gi-card-header">
            <span class="gi-card-label">{{ t('urlParser.keys.pathname') }}</span>
            <Tooltip :content="t('urlParser.tooltips.pathname')">
              <template #trigger>
                <Info class="gi-tooltip-icon" />
              </template>
            </Tooltip>
          </div>
          <div class="gi-card-value gi-code">{{ parsedUrl.pathname }}</div>
          <button class="gi-copy-btn" @click="copy(parsedUrl.pathname)">
            <Copy class="gi-icon-sm" />
            {{ copiedField === 'pathname' ? t('urlParser.copied') : t('nav.copy') }}
          </button>
        </div>

        <!-- Search -->
        <div class="gi-result-card gi-card-full-width">
          <div class="gi-card-header">
            <span class="gi-card-label">{{ t('urlParser.keys.search') }}</span>
            <Tooltip :content="t('urlParser.tooltips.search')">
              <template #trigger>
                <Info class="gi-tooltip-icon" />
              </template>
            </Tooltip>
          </div>
          <div class="gi-card-value gi-code">{{ parsedUrl.search || '-' }}</div>
          <button class="gi-copy-btn" @click="copy(parsedUrl.search)">
            <Copy class="gi-icon-sm" />
            {{ copiedField === 'search' ? t('urlParser.copied') : t('nav.copy') }}
          </button>
        </div>

        <!-- Hash -->
        <div class="gi-result-card gi-card-full-width">
          <div class="gi-card-header">
            <span class="gi-card-label">{{ t('urlParser.keys.hash') }}</span>
            <Tooltip :content="t('urlParser.tooltips.hash')">
              <template #trigger>
                <Info class="gi-tooltip-icon" />
              </template>
            </Tooltip>
          </div>
          <div class="gi-card-value gi-code">{{ parsedUrl.hash || '-' }}</div>
          <button class="gi-copy-btn" @click="copy(parsedUrl.hash)">
            <Copy class="gi-icon-sm" />
            {{ copiedField === 'hash' ? t('urlParser.copied') : t('nav.copy') }}
          </button>
        </div>
      </div>

      <!-- Query Parameters -->
      <div v-if="Object.keys(parsedUrl.params).length > 0" class="gi-params-section">
        <div class="gi-params-header">
          <h3 class="gi-params-title">{{ t('urlParser.parameters') }}</h3>
          <Tooltip :content="t('urlParser.tooltips.params')">
            <template #trigger>
              <Info class="gi-tooltip-icon" />
            </template>
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
            <button class="gi-param-copy" @click="copy(`${key}=${value}`)">
              <Copy class="gi-icon-sm" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Educational Guide (Collapsible) -->
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Copy, X, Info, ChevronDown } from 'lucide-vue-next'
import { parseUrl, type ParsedUrl } from '../composables/useUrlParser'
import Tooltip from '../components/Tooltip.vue'
import UrlAnatomyDiagram from '../components/UrlAnatomyDiagram.vue'

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

async function copy(text: string) {
  if (!text) return
  await navigator.clipboard.writeText(text)
  copiedField.value = 'temp'
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

.gi-result-card {
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: 8px;
  padding: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.gi-result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.gi-card-full-width {
  grid-column: 1 / -1;
}

.gi-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.gi-card-label {
  font-size: 0.85rem;
  color: var(--gi-text-muted);
  font-weight: 500;
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
  margin-bottom: 0.75rem;
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
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.gi-params-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.gi-params-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gi-text);
  margin: 0;
}

.gi-params-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.gi-param-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0.75rem;
  background: var(--gi-surface-alt);
  border-radius: 6px;
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
  background: transparent;
  border: 1px solid var(--gi-border);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--gi-text-muted);
}

.gi-param-copy:hover {
  background: var(--gi-tint-green-light);
  border-color: var(--gi-primary);
  color: var(--gi-primary);
}

.gi-guide-section {
  margin-top: 2rem;
  border: 1px solid var(--gi-border);
  border-radius: 8px;
  overflow: hidden;
}

.gi-guide-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem 1.25rem;
  background: var(--gi-surface-alt);
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  color: var(--gi-text);
  text-align: left;
  transition: background 0.2s;
}

.gi-guide-toggle:hover {
  background: var(--gi-surface);
}

.gi-guide-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.3s;
}

.gi-guide-expanded {
  transform: rotate(180deg);
}

.gi-guide-content {
  padding: 1.5rem;
  background: var(--gi-surface);
}

.gi-guide-intro {
  font-size: 0.95rem;
  line-height: 1.6;
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
  list-style: none;
  padding: 0;
  margin: 0;
}

.gi-guide-list li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--gi-text);
}

.gi-guide-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--gi-primary);
  font-weight: bold;
}

.gi-guide-slide-enter-active,
.gi-guide-slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.gi-guide-slide-enter-from,
.gi-guide-slide-leave-to {
  opacity: 0;
  max-height: 0;
}

.gi-guide-slide-enter-to,
.gi-guide-slide-leave-from {
  opacity: 1;
  max-height: 2000px;
}
</style>
```

Note: You may need to add a `copy` translation key to the nav section in i18n files if it doesn't exist.

**Step 2: Add "Copy" translation to i18n**

In `fr.ts`, add to nav section:
```typescript
copy: 'Copier',
```

In `en.ts`, add to nav section:
```typescript
copy: 'Copy',
```

**Step 3: Commit**
```bash
git add src/views/UrlParserView.vue src/i18n/fr.ts src/i18n/en.ts
git commit -m "feat: refactor URL Parser view with cards, tooltips, and guide"
```

---

### Task 5: Add Missing CSS Variables

**Files:**
- Modify: `src/assets/styles/global.css`

**Step 1: Add missing color tint variables if not present**

Check if these exist in global.css. If not, add them to the color tokens section:

```css
/* Add if missing */
--gi-tint-blue-light: #e3f2fd;
--gi-tint-blue-text: #1976d2;
--gi-tint-purple-light: #f3e5f5;
--gi-tint-purple-text: #7b1fa2;
--gi-tint-orange-light: #fff3e0;
--gi-tint-orange-text: #f57c00;
```

**Step 2: Commit**
```bash
git add src/assets/styles/global.css
git commit -m "style: add missing color tint variables for URL Parser"
```

---

### Task 6: Run Tests and Verify

**Files:**
- Test: `npm test`

**Step 1: Run existing tests**
```bash
npm test
```
Expected: All 121 tests pass (no changes to composables)

**Step 2: Build the project**
```bash
npm run build
```
Expected: Build succeeds with no TypeScript errors

**Step 3: Manual verification**
- Open dev server: `npm run dev`
- Navigate to URL Parser tool
- Test: Enter a URL, verify components display correctly
- Test: Click copy buttons, verify "Copied!" feedback
- Test: Toggle guide section, verify it expands/collapses
- Test: Hover over info icons, verify tooltips appear
- Test: Clear button, verify input clears
- Test: Invalid URL, verify error state shows
- Test: Switch language, verify translations work

**Step 4: Commit final changes if any fixes needed**

---

### Task 7: Update Documentation

**Files:**
- Modify: `README.md` (if URL Parser is mentioned)

**Step 1: Check if URL Parser needs README update**

If the README lists tools or features, update the URL Parser description to mention:
- Educational guide with URL anatomy
- Tooltips for each component
- Copy functionality

**Step 2: Commit**

---

## Summary

This plan transforms the URL Parser from a basic table-display tool into an educational, interactive tool with:
- **Reusable Tooltip component** for hover explanations
- **URL Anatomy Diagram** with color-coded parts
- **Card-based layout** with copy buttons for each component
- **Collapsible educational guide** explaining URL structure
- **Better UX** with clear button, empty state, and copy-all functionality

**Total estimated tasks:** 7
**Files to create:** 2 (Tooltip.vue, UrlAnatomyDiagram.vue)
**Files to modify:** 4 (UrlParserView.vue, fr.ts, en.ts, global.css)
