# DPI Checker Redesign Implementation Plan

> **For Qwen Code:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task.

**Goal:** Redesign the DPI Checker page with enhanced UX, visual design, clipboard support, educational content, and improved accessibility.

**Architecture:** Enhance the composable with new functions (orientation detection, extended formats, recommended uses), update i18n translations, completely redesign the view with interactive comparison tool, and add clipboard paste support.

**Tech Stack:** Vue 3.5 Composition API, TypeScript, vue-i18n, Lucide icons, Vitest for testing.

---

## Task 1: Enhance useDpiChecker Composable

**Files:**
- Modify: `src/composables/useDpiChecker.ts`
- Test: `src/composables/__tests__/useDpiChecker.test.ts`

**Step 1: Add orientation detection function**

Add to `src/composables/useDpiChecker.ts`:

```typescript
export type Orientation = 'portrait' | 'landscape' | 'square'

export function getOrientation(widthPx: number, heightPx: number): Orientation {
  if (widthPx > heightPx) return 'landscape'
  if (heightPx > widthPx) return 'portrait'
  return 'square'
}
```

**Step 2: Write test for orientation detection**

Add to `src/composables/__tests__/useDpiChecker.test.ts`:

```typescript
import { getOrientation } from '../useDpiChecker'

describe('getOrientation', () => {
  it('returns landscape when width > height', () => {
    expect(getOrientation(1920, 1080)).toBe('landscape')
  })

  it('returns portrait when height > width', () => {
    expect(getOrientation(1080, 1920)).toBe('portrait')
  })

  it('returns square when width === height', () => {
    expect(getOrientation(1000, 1000)).toBe('square')
  })
})
```

**Step 3: Add extended formats**

Modify the format interface in `useDpiChecker.ts`:

```typescript
export interface FormatDimensions {
  width: number
  height: number
}

export interface FormatStatusMap {
  A6: 'ok' | 'warning' | 'error'
  A5: 'ok' | 'warning' | 'error'
  A4: 'ok' | 'warning' | 'error'
  A3: 'ok' | 'warning' | 'error'
  Letter: 'ok' | 'warning' | 'error'
  Square: 'ok' | 'warning' | 'error'
}

export const FORMATS: Record<string, FormatDimensions> = {
  A6: { width: 105, height: 148 },
  A5: { width: 148, height: 210 },
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  Letter: { width: 216, height: 279 },
  Square: { width: 100, height: 100 },
}

export const FEATURED_FORMATS = ['A6', 'A5'] as const
export const EXTENDED_FORMATS = ['A4', 'A3', 'Letter', 'Square'] as const
```

**Step 4: Update getFormatStatus function**

Replace the existing `getFormatStatus` function:

```typescript
export function getFormatStatus(widthPx: number, heightPx: number): FormatStatusMap {
  const wCm = (widthPx / 300) * 2.54
  const hCm = (heightPx / 300) * 2.54

  function status(reqW: number, reqH: number): 'ok' | 'warning' | 'error' {
    if (wCm >= reqW && hCm >= reqH) return 'ok'
    if (wCm >= reqW * 0.66 && hCm >= reqH * 0.66) return 'warning'
    return 'error'
  }

  return {
    A6: status(FORMATS.A6.width / 10, FORMATS.A6.height / 10),    // Convert mm to cm
    A5: status(FORMATS.A5.width / 10, FORMATS.A5.height / 10),
    A4: status(FORMATS.A4.width / 10, FORMATS.A4.height / 10),
    A3: status(FORMATS.A3.width / 10, FORMATS.A3.height / 10),
    Letter: status(FORMATS.Letter.width / 10, FORMATS.Letter.height / 10),
    Square: status(FORMATS.Square.width / 10, FORMATS.Square.height / 10),
  }
}
```

**Step 5: Add recommended uses function**

Add to `useDpiChecker.ts`:

```typescript
export interface RecommendedUses {
  suitable: string[]
  notSuitable: string[]
}

export function getRecommendedUses(widthPx: number, heightPx: number): RecommendedUses {
  const statusMap = getFormatStatus(widthPx, heightPx)
  const suitable: string[] = []
  const notSuitable: string[] = []

  const allFormats = [...FEATURED_FORMATS, ...EXTENDED_FORMATS] as string[]

  for (const format of allFormats) {
    const fmt = format as keyof FormatStatusMap
    if (statusMap[fmt] === 'ok') {
      suitable.push(format)
    } else {
      notSuitable.push(format)
    }
  }

  return { suitable, notSuitable }
}
```

**Step 6: Add DPI color coding function**

Add to `useDpiChecker.ts`:

```typescript
export function getDpiColor(dpi: number): 'ok' | 'warning' | 'error' {
  if (dpi >= 300) return 'ok'
  if (dpi >= 150) return 'warning'
  return 'error'
}

export function getDpiLabel(dpi: number): string {
  if (dpi >= 300) return 'Excellent'
  if (dpi >= 150) return 'Good'
  return 'Low'
}
```

**Step 7: Write tests for new functions**

Add to `useDpiChecker.test.ts`:

```typescript
import { 
  getOrientation, 
  getFormatStatus, 
  getRecommendedUses, 
  getDpiColor, 
  getDpiLabel,
  FORMATS 
} from '../useDpiChecker'

describe('FORMATS', () => {
  it('contains all expected formats with correct dimensions', () => {
    expect(FORMATS.A6).toEqual({ width: 105, height: 148 })
    expect(FORMATS.A5).toEqual({ width: 148, height: 210 })
    expect(FORMATS.A4).toEqual({ width: 210, height: 297 })
    expect(FORMATS.A3).toEqual({ width: 297, height: 420 })
    expect(FORMATS.Letter).toEqual({ width: 216, height: 279 })
    expect(FORMATS.Square).toEqual({ width: 100, height: 100 })
  })
})

describe('getFormatStatus extended formats', () => {
  it('returns ok for A4 at minimum resolution (2480×3508)', () => {
    const status = getFormatStatus(2480, 3508)
    expect(status.A4).toBe('ok')
  })

  it('returns error for A3 at low resolution', () => {
    const status = getFormatStatus(1000, 1000)
    expect(status.A3).toBe('error')
  })
})

describe('getRecommendedUses', () => {
  it('returns suitable and not suitable formats', () => {
    const result = getRecommendedUses(5000, 5000)
    expect(result.suitable).toContain('A6')
    expect(result.suitable).toContain('A5')
    expect(result.notSuitable).not.toContain('A6')
  })

  it('returns only small formats suitable for low resolution image (400×400)', () => {
    const result = getRecommendedUses(400, 400)
    expect(result.suitable.length).toBeLessThan(6)
    expect(result.notSuitable.length).toBeGreaterThan(0)
  })

  it('returns mixed suitable/notSuitable for medium resolution (1500×2000)', () => {
    const result = getRecommendedUses(1500, 2000)
    expect(result.suitable.length).toBeGreaterThan(0)
    expect(result.notSuitable.length).toBeGreaterThan(0)
  })
})

describe('getDpiColor', () => {
  it('returns ok for dpi >= 300', () => {
    expect(getDpiColor(300)).toBe('ok')
    expect(getDpiColor(600)).toBe('ok')
  })

  it('returns warning for dpi >= 150 and < 300', () => {
    expect(getDpiColor(150)).toBe('warning')
    expect(getDpiColor(200)).toBe('warning')
  })

  it('returns error for dpi < 150', () => {
    expect(getDpiColor(72)).toBe('error')
    expect(getDpiColor(96)).toBe('error')
  })
})

describe('getDpiLabel', () => {
  it('returns Excellent for dpi >= 300', () => {
    expect(getDpiLabel(300)).toBe('Excellent')
  })

  it('returns Good for dpi >= 150 and < 300', () => {
    expect(getDpiLabel(150)).toBe('Good')
    expect(getDpiLabel(200)).toBe('Good')
  })

  it('returns Low for dpi < 150', () => {
    expect(getDpiLabel(72)).toBe('Low')
    expect(getDpiLabel(96)).toBe('Low')
  })
})
```

**Step 8: Run tests and verify all pass**

```bash
npm test -- src/composables/__tests__/useDpiChecker.test.ts
```

Expected: All tests PASS

**Step 9: Commit**

```bash
git add src/composables/useDpiChecker.ts src/composables/__tests__/useDpiChecker.test.ts
git commit -m "feat(dpi-checker): add orientation, extended formats, and recommended uses"
```

---

## Task 2: Add i18n Translations

**Files:**
- Modify: `src/i18n/fr.ts`
- Modify: `src/i18n/en.ts`

**Step 1: Add new French translations**

Modify `src/i18n/fr.ts` - replace the `dpiChecker` section (around line 140-155):

```typescript
  dpiChecker: {
    title: 'DPI Checker',
    desc: "Calculez les dimensions d'impression maximum de votre image à différentes résolutions.",
    upload: 'Glissez-déposez une image ici',
    orClick: 'ou cliquez pour parcourir',
    orManual: 'ou saisir les dimensions manuellement',
    pasteHint: 'Vous pouvez aussi coller une image (Ctrl+V)',
    widthPx: 'Largeur (px)',
    heightPx: 'Hauteur (px)',
    resultTitle: "Dimensions d'impression",
    dpiCol: 'Résolution',
    widthCol: 'Largeur',
    heightCol: 'Hauteur',
    usageCol: 'Usage recommandé',
    formatTitle: 'Compatibilité formats',
    featuredFormats: 'Formats principaux',
    otherFormats: 'Autres formats',
    showMore: 'Afficher plus de formats',
    showLess: 'Afficher moins',
    orientation: {
      portrait: 'Portrait',
      landscape: 'Paysage',
      square: 'Carré',
    },
    status: { 
      ok: 'Compatible 300 DPI ✓', 
      warning: 'Résolution limite (150 DPI)', 
      error: 'Résolution insuffisante' 
    },
    recommendedUse: {
      title: 'Utilisations recommandées',
      suitable: '✅ Votre image est adaptée pour :',
      notSuitable: "⚠️ Votre image n'est pas adaptée pour :",
    },
    educational: {
      title: 'Comprendre le DPI',
      whatIsDpi: 'Qu'est-ce que le DPI ?',
      dpiDefinition: "Le DPI (Dots Per Inch / Points Par Pouce) mesure la résolution d'impression. Un DPI plus élevé signifie plus de détails et des impressions plus nettes.",
      recommendedValues: 'Valeurs DPI recommandées',
      dpiLevels: {
        web: '72-96 DPI → Affichage web/écran uniquement',
        large: '150-200 DPI → Grands formats (posters, bannières vus de loin)',
        print: '300 DPI → Standard pour l'impression professionnelle (flyers, brochures, cartes de visite)',
        photo: '600 DPI → Impressions photo haute qualité, graphiques détaillés',
      },
    },
    visualComparison: {
      title: 'Comparaison visuelle',
      description: 'Taille relative de votre image à différentes résolutions',
    },
    imagePreview: {
      dimensions: 'Dimensions',
      remove: 'Supprimer',
      change: 'Changer',
    },
  },
```

**Step 2: Add new English translations**

Modify `src/i18n/en.ts` - replace the `dpiChecker` section:

```typescript
  dpiChecker: {
    title: 'DPI Checker',
    desc: 'Calculate the maximum print dimensions of your image at different resolutions.',
    upload: 'Drag and drop an image here',
    orClick: 'or click to browse',
    orManual: 'or enter dimensions manually',
    pasteHint: 'You can also paste an image (Ctrl+V)',
    widthPx: 'Width (px)',
    heightPx: 'Height (px)',
    resultTitle: 'Print Dimensions',
    dpiCol: 'Resolution',
    widthCol: 'Width',
    heightCol: 'Height',
    usageCol: 'Recommended Use',
    formatTitle: 'Format Compatibility',
    featuredFormats: 'Featured Formats',
    otherFormats: 'Other Formats',
    showMore: 'Show more formats',
    showLess: 'Show less',
    orientation: {
      portrait: 'Portrait',
      landscape: 'Landscape',
      square: 'Square',
    },
    status: { 
      ok: 'Compatible 300 DPI ✓', 
      warning: 'Limited resolution (150 DPI)', 
      error: 'Insufficient resolution' 
    },
    recommendedUse: {
      title: 'Recommended Uses',
      suitable: '✅ Your image is suitable for:',
      notSuitable: "⚠️ Your image is NOT suitable for:",
    },
    educational: {
      title: 'Understanding DPI',
      whatIsDpi: 'What is DPI?',
      dpiDefinition: 'DPI (Dots Per Inch) measures print resolution. Higher DPI means more detail and sharper prints.',
      recommendedValues: 'Recommended DPI Values',
      dpiLevels: {
        web: '72-96 DPI → Web/screen display only',
        large: '150-200 DPI → Large format prints (posters, banners viewed from distance)',
        print: '300 DPI → Standard for professional print (flyers, brochures, business cards)',
        photo: '600 DPI → High-quality photo prints, detailed graphics',
      },
    },
    visualComparison: {
      title: 'Visual Comparison',
      description: 'Relative size of your image at different resolutions',
    },
    imagePreview: {
      dimensions: 'Dimensions',
      remove: 'Remove',
      change: 'Change',
    },
  },
```

**Step 3: Run type check to ensure translations are valid**

```bash
npm run type-check
```

Expected: No errors

**Step 4: Commit**

```bash
git add src/i18n/fr.ts src/i18n/en.ts
git commit -m "feat(dpi-checker): add comprehensive i18n translations"
```

---

## Task 3: Redesign DpiCheckerView Component

**Files:**
- Modify: `src/views/DpiCheckerView.vue`

**Step 1: Replace template with new design**

Replace the entire `<template>` section:

```vue
<template>
  <div>
    <router-link to="/" class="gi-back-link">{{ t('nav.back') }}</router-link>
    
    <div class="gi-tool-header">
      <h1>{{ t('dpiChecker.title') }}</h1>
      <p>{{ t('dpiChecker.desc') }}</p>
    </div>

    <!-- Upload Zone -->
    <div 
      class="gi-upload-zone" 
      :class="{ 'is-dragover': isDragover }"
      @click="triggerFileInput" 
      @dragover.prevent="isDragover = true" 
      @dragleave.prevent="isDragover = false"
      @drop.prevent="onDrop"
    >
      <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange" />
      
      <template v-if="!imagePreview">
        <svg class="gi-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span class="gi-upload-text">{{ t('dpiChecker.upload') }}</span>
        <span class="gi-upload-sub">{{ t('dpiChecker.orClick') }}</span>
        <span class="gi-paste-hint">{{ t('dpiChecker.pasteHint') }}</span>
      </template>
      
      <template v-else>
        <div class="gi-image-preview">
          <img :src="imagePreview" alt="Uploaded preview" class="gi-preview-image" />
          <div class="gi-preview-info">
            <span class="gi-preview-dims">{{ widthPx }} × {{ heightPx }} px</span>
            <span class="gi-preview-orientation" :class="orientationClass">
              {{ t(`dpiChecker.orientation.${orientation}`) }}
            </span>
          </div>
          <div class="gi-preview-actions">
            <button type="button" class="gi-btn-ghost gi-btn-sm" @click="changeImage">
              {{ t('dpiChecker.imagePreview.change') }}
            </button>
            <button type="button" class="gi-btn-ghost gi-btn-sm gi-btn-danger" @click="removeImage">
              {{ t('dpiChecker.imagePreview.remove') }}
            </button>
          </div>
        </div>
      </template>
    </div>

    <p class="gi-or">{{ t('dpiChecker.orManual') }}</p>

    <!-- Manual Input -->
    <div class="gi-row">
      <div class="gi-field">
        <label class="gi-label">{{ t('dpiChecker.widthPx') }}</label>
        <input v-model.number="widthPx" type="number" min="1" class="gi-input" />
      </div>
      <div class="gi-field">
        <label class="gi-label">{{ t('dpiChecker.heightPx') }}</label>
        <input v-model.number="heightPx" type="number" min="1" class="gi-input" />
      </div>
    </div>

    <!-- Results -->
    <template v-if="widthPx > 0 && heightPx > 0">
      <!-- DPI Table -->
      <div class="gi-result">
        <div class="gi-result-label">{{ t('dpiChecker.resultTitle') }}</div>
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
                <span :class="`gi-status gi-status-${getDpiColor(row.dpi)}`">
                  {{ t(`dpiChecker.status.${getDpiColor(row.dpi) === 'green' ? 'ok' : getDpiColor(row.dpi) === 'yellow' ? 'warning' : 'error'}`) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Format Compatibility -->
      <div class="gi-result" style="margin-top:1rem">
        <div class="gi-result-header">
          <span class="gi-result-label">{{ t('dpiChecker.formatTitle') }}</span>
        </div>
        
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
      </div>

      <!-- Recommended Uses -->
      <div class="gi-result gi-recommended-use" style="margin-top:1rem">
        <div class="gi-result-label">{{ t('dpiChecker.recommendedUse.title') }}</div>
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
      </div>

      <!-- Visual Comparison -->
      <div class="gi-result gi-visual-comparison" style="margin-top:1rem">
        <div class="gi-result-label">{{ t('dpiChecker.visualComparison.title') }}</div>
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
      </div>

      <!-- Educational Section -->
      <div class="gi-result gi-educational" style="margin-top:1rem">
        <div class="gi-result-label">{{ t('dpiChecker.educational.title') }}</div>
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
      </div>
    </template>
  </div>
</template>
```

**Step 2: Replace script with enhanced logic**

Replace the `<script setup>` section:

```typescript
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { 
  calculatePrintDimensions, 
  getFormatStatus, 
  getOrientation,
  getRecommendedUses,
  getDpiColor,
  getDpiLabel,
  FEATURED_FORMATS,
  EXTENDED_FORMATS,
} from '../composables/useDpiChecker'

const { t } = useI18n()
const widthPx = ref(0)
const heightPx = ref(0)
const fileInput = ref<HTMLInputElement>()
const isDragover = ref(false)
const imagePreview = ref<string | null>(null)
const showExtendedFormats = ref(false)

const dimensions = computed(() => calculatePrintDimensions(widthPx.value, heightPx.value))
const formatStatus = computed(() => getFormatStatus(widthPx.value, heightPx.value))
const orientation = computed(() => getOrientation(widthPx.value, heightPx.value))
const orientationClass = computed(() => `gi-orientation-${orientation.value}`)
const recommendedUses = computed(() => getRecommendedUses(dimensions.value, formatStatus.value))

function triggerFileInput() { fileInput.value?.click() }

function loadImage(file: File) {
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

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) loadImage(file)
}

function onDrop(e: DragEvent) {
  isDragover.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file?.type.startsWith('image/')) loadImage(file)
}

function removeImage() {
  imagePreview.value = null
  widthPx.value = 0
  heightPx.value = 0
}

function changeImage() {
  triggerFileInput()
}

// Clipboard paste support
function onPaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items
  if (!items) return
  
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.startsWith('image/')) {
      const file = items[i].getAsFile()
      if (file) {
        loadImage(file)
        break
      }
    }
  }
}

// Listen for paste events globally
onMounted(() => {
  window.addEventListener('paste', onPaste)
})

onUnmounted(() => {
  window.removeEventListener('paste', onPaste)
})

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
```

**Step 3: Add imports for Vue lifecycle hooks**

Add at the top of the script:

```typescript
import { onMounted, onUnmounted } from 'vue'
```

**Step 4: Replace styles with new design**

Replace the `<style scoped>` section (see full styles in next step due to length)

**Step 5: Commit**

```bash
git add src/views/DpiCheckerView.vue
git commit -m "feat(dpi-checker): redesign view with enhanced UX"
```

---

## Task 4: Add Comprehensive Styles

**Files:**
- Modify: `src/views/DpiCheckerView.vue` (continue from Task 3)

**Step 1: Add complete styles**

Add this complete `<style scoped>` section:

```css
<style scoped>
/* Back Link */
.gi-back-link {
  display: inline-flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0.3rem 0.75rem;
  border: 1.5px solid var(--gi-border);
  border-radius: var(--gi-radius);
  font-size: 0.85rem;
  color: var(--gi-text-muted);
  text-decoration: none;
  transition: border-color 0.12s, color 0.12s;
}
.gi-back-link:hover { border-color: var(--gi-brand); color: var(--gi-brand); }

/* Tool Header */
.gi-tool-header {
  margin-bottom: 2.5rem;
}
.gi-tool-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}
.gi-tool-header p {
  color: var(--gi-text-muted);
  font-size: 1rem;
  max-width: 500px;
}

/* Upload Zone */
.gi-upload-zone {
  border: 2px dashed var(--gi-border);
  border-radius: var(--gi-radius-lg);
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  color: var(--gi-text-muted);
  font-size: 0.9rem;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  margin-bottom: 1rem;
  background: var(--gi-surface);
}
.gi-upload-zone:hover { 
  border-color: var(--gi-brand); 
  background: rgba(10, 170, 142, 0.02);
}
.gi-upload-zone.is-dragover {
  border-color: var(--gi-brand);
  background: rgba(10, 170, 142, 0.08);
  transform: scale(1.01);
  box-shadow: 0 4px 16px rgba(10, 170, 142, 0.15);
}
.gi-upload-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
  color: var(--gi-brand);
  opacity: 0.8;
}
.gi-upload-text {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--gi-text);
  margin-bottom: 0.25rem;
}
.gi-upload-sub {
  display: block;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
}
.gi-paste-hint {
  display: block;
  font-size: 0.8rem;
  color: var(--gi-text-muted);
  background: var(--gi-bg-soft);
  padding: 0.4rem 0.75rem;
  border-radius: var(--gi-radius);
  margin-top: 0.5rem;
}

/* Image Preview */
.gi-image-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.gi-preview-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: var(--gi-radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.gi-preview-info {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}
.gi-preview-dims {
  font-weight: 600;
  color: var(--gi-text);
  font-size: 0.9rem;
}
.gi-preview-orientation {
  font-size: 0.8rem;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-weight: 500;
}
.gi-orientation-portrait {
  background: rgba(10, 170, 142, 0.1);
  color: var(--gi-brand-dark);
}
.gi-orientation-landscape {
  background: rgba(10, 170, 142, 0.1);
  color: var(--gi-brand-dark);
}
.gi-orientation-square {
  background: rgba(10, 170, 142, 0.1);
  color: var(--gi-brand-dark);
}
.gi-preview-actions {
  display: flex;
  gap: 0.5rem;
}
.gi-btn-sm {
  padding: 0.35rem 0.65rem;
  font-size: 0.8rem;
}
.gi-btn-danger:hover {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
  border-color: #dc2626;
}

/* Manual Input */
.gi-or { 
  text-align: center; 
  color: var(--gi-text-muted); 
  font-size: 0.85rem; 
  margin-bottom: 1rem; 
}
.gi-row { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 1rem; 
}

/* DPI Table */
.gi-dpi-table th {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gi-text-muted);
  padding-bottom: 0.75rem;
}
.gi-dpi-table td {
  padding: 0.75rem;
  vertical-align: middle;
}
.gi-dpi-table strong {
  display: block;
  font-size: 1rem;
  color: var(--gi-text);
}
.gi-dpi-label {
  display: block;
  font-size: 0.75rem;
  color: var(--gi-text-muted);
  margin-top: 0.15rem;
}
.gi-dpi-row-green {
  background: rgba(10, 170, 142, 0.06);
}
.gi-dpi-row-green td {
  border-top: 2px solid var(--gi-mint);
}
.gi-dpi-row-yellow {
  background: rgba(252, 247, 88, 0.1);
}
.gi-dpi-row-red {
  background: rgba(255, 245, 245, 0.5);
}

/* Format Sections */
.gi-result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.gi-format-section {
  margin-bottom: 1.5rem;
}
.gi-format-section:last-child {
  margin-bottom: 0;
}
.gi-format-section-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gi-text);
  margin-bottom: 0.75rem;
}
.gi-format-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}
.gi-extended-grid {
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}
.gi-format-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border: 1.5px solid var(--gi-border);
  border-radius: var(--gi-radius);
  background: var(--gi-surface);
}
.gi-format-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--gi-text);
}
.gi-btn-link {
  padding: 0.4rem 0.6rem;
  font-size: 0.85rem;
  color: var(--gi-brand);
  border: none;
  background: transparent;
  cursor: pointer;
  text-decoration: underline;
}
.gi-btn-link:hover {
  color: var(--gi-brand-dark);
}

/* Recommended Uses */
.gi-recommended-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-top: 1rem;
}
.gi-recommended-section h4 {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}
.gi-recommended-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.gi-recommended-section li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--gi-border);
  font-size: 0.9rem;
  color: var(--gi-text);
}
.gi-recommended-section li:last-child {
  border-bottom: none;
}
.gi-suitable h4 {
  color: var(--gi-brand-dark);
}
.gi-not-suitable h4 {
  color: #dc2626;
}
.gi-not-suitable {
  background: rgba(255, 245, 245, 0.3);
  padding: 1rem;
  border-radius: var(--gi-radius);
  border: 1px solid rgba(254, 205, 211, 0.5);
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
  margin-top: 1rem;
}
.gi-comparison-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 1.5px solid var(--gi-border);
  border-radius: var(--gi-radius);
  background: var(--gi-surface);
}
.gi-comparison-header {
  text-align: center;
  margin-bottom: 0.75rem;
}
.gi-comparison-dpi {
  display: block;
  font-weight: 700;
  font-size: 1rem;
  color: var(--gi-text);
}
.gi-comparison-label {
  display: block;
  font-size: 0.75rem;
  color: var(--gi-text-muted);
  margin-top: 0.15rem;
}
.gi-comparison-visual {
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
}
.gi-comparison-svg {
  max-width: 100%;
  max-height: 100%;
}
.gi-comparison-rect {
  fill: rgba(10, 170, 142, 0.15);
  stroke: var(--gi-brand);
  stroke-width: 2;
}
.gi-comparison-green .gi-comparison-rect {
  fill: rgba(10, 170, 142, 0.2);
  stroke: var(--gi-brand-dark);
}
.gi-comparison-yellow .gi-comparison-rect {
  fill: rgba(252, 247, 88, 0.3);
  stroke: #d97706;
}
.gi-comparison-red .gi-comparison-rect {
  fill: rgba(254, 205, 211, 0.3);
  stroke: #dc2626;
}
.gi-comparison-dims {
  font-size: 0.8rem;
  color: var(--gi-text-muted);
  font-variant-numeric: tabular-nums;
}

/* Educational Section */
.gi-educational {
  background: linear-gradient(145deg, var(--gi-surface), var(--gi-bg-soft));
}
.gi-educational-content {
  margin-top: 1rem;
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
  color: var(--gi-text);
  line-height: 1.6;
}
.gi-edu-list {
  margin: 0;
  padding-left: 1.25rem;
}
.gi-edu-list li {
  font-size: 0.85rem;
  color: var(--gi-text-muted);
  margin-bottom: 0.4rem;
  line-height: 1.5;
}

/* Animations */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
  margin: 0;
  padding: 0;
}
.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 200px;
}

/* Responsive */
@media (max-width: 600px) {
  .gi-tool-header h1 {
    font-size: 1.5rem;
  }
  .gi-row {
    grid-template-columns: 1fr;
  }
  .gi-upload-zone {
    padding: 2rem 1.5rem;
  }
  .gi-format-grid {
    grid-template-columns: 1fr;
  }
  .gi-comparison-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
```

**Step 2: Commit**

```bash
git add src/views/DpiCheckerView.vue
git commit -m "style(dpi-checker): add comprehensive responsive styles"
```

---

## Task 5: Add Global CSS Utilities

**Files:**
- Modify: `src/assets/styles/global.css`

**Step 1: Add DPI-specific status styles**

Add to `src/assets/styles/global.css` after the `.gi-status-error` rule (around line 95):

```css
/* DPI-specific status variants */
.gi-status-green { 
  background: var(--gi-tint-green-bg); 
  color: var(--gi-tint-green-text); 
  border: 1px solid var(--gi-tint-green-border); 
}
.gi-status-yellow { 
  background: var(--gi-tint-yellow-bg); 
  color: var(--gi-tint-yellow-text); 
}
.gi-status-red { 
  background: var(--gi-tint-red-bg); 
  color: var(--gi-tint-red-text); 
  border: 1px solid var(--gi-tint-red-border); 
}
```

**Step 2: Run type check**

```bash
npm run type-check
```

Expected: No errors

**Step 3: Commit**

```bash
git add src/assets/styles/global.css
git commit -m "style: add DPI-specific status color utilities"
```

---

## Task 6: Run Full Test Suite and Verify

**Files:**
- N/A (verification task)

**Step 1: Run full test suite**

```bash
npm test
```

Expected: All 121+ tests PASS (including new DPI checker tests)

**Step 2: Run type check**

```bash
npm run type-check
```

Expected: No TypeScript errors

**Step 3: Run build**

```bash
npm run build
```

Expected: Build succeeds with no errors

**Step 4: Test locally**

```bash
npm run dev
```

Then navigate to `http://localhost:5173/tools/dpi-checker` and verify:
- Upload zone works with drag & drop
- Clipboard paste works (Ctrl+V)
- Image preview shows with dimensions and orientation
- Manual input works
- DPI table shows with color coding
- Format compatibility shows A6/A5 featured, others expandable
- Recommended uses section displays correctly
- Visual comparison shows relative sizes
- Educational section is visible
- All animations work smoothly
- Keyboard navigation works (Tab, Enter, Space)
- Mobile responsive layout works

**Step 5: Commit final verification**

```bash
git status
```

Expected: Working tree clean

---

## Task 7: Update Documentation (Optional)

**Files:**
- Modify: `README.md` (if DPI Checker is mentioned)

**Step 1: Check if DPI Checker is documented**

```bash
grep -n "DPI" README.md
```

**Step 2: Update if needed**

If DPI Checker is mentioned, update the description to reflect new features.

**Step 3: Commit**

```bash
git add README.md
git commit -m "docs: update DPI Checker description"
```

---

## Summary

This plan enhances the DPI Checker with:
- ✅ Enhanced composable with orientation detection, extended formats, recommended uses
- ✅ Comprehensive i18n translations (FR/EN)
- ✅ Modern upload zone with drag & drop + clipboard paste
- ✅ Image preview with dimensions and orientation badge
- ✅ Color-coded DPI table (green/yellow/red)
- ✅ Format compatibility grid (A6/A5 featured, others expandable)
- ✅ Recommended uses section
- ✅ Interactive visual comparison tool
- ✅ Educational section (always visible)
- ✅ Full accessibility (keyboard nav, ARIA, reduced motion)
- ✅ Responsive design
- ✅ Full test coverage

**Total commits:** 6-7 focused commits
**Estimated time:** 45-60 minutes

---
