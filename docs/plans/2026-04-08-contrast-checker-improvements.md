# Contrast Checker UI/UX Improvements Plan

> **For Qwen Code:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Enhance Contrast Checker with better color picker UX, export/share functionality, and improved French translations.
**Architecture:** Add native color picker trigger, organized preset groups, copy full report, shareable URL with hash params, and refine all French i18n strings for better clarity and natural phrasing.
**Tech Stack:** Vue 3 Composition API, vue-i18n, lucide-vue-next, native Clipboard API, URLSearchParams

---

## Phase 1: Enhanced Color Picker UX

### Task 1: Add Native Color Picker Button

**Files:**
- Modify: `src/views/ContrastCheckerView.vue`

**Add eyedropper icon import:**
```typescript
import { ..., EyeDropper } from 'lucide-vue-next'
```

**Add native color picker function:**
```typescript
async function openNativeColorPicker(type: 'text' | 'bg') {
  // Try EyeDropper API first (Chrome/Edge)
  if ('EyeDropper' in window) {
    try {
      // @ts-ignore - EyeDropper is not in TypeScript DOM types yet
      const eyeDropper = new EyeDropper()
      const result = await eyeDropper.open()
      if (type === 'text') {
        textHex.value = result.sRGBHex
      } else {
        bgHex.value = result.sRGBHex
      }
      return
    } catch {
      // User cancelled, fall through to native picker
    }
  }
  
  // Fallback: trigger native color input
  openColorPicker(type)
}
```

**Update color swatch wrapper to use native picker:**
```vue
<div class="contrast-color-swatch-wrapper">
  <button
    class="contrast-color-swatch-display"
    :style="{ backgroundColor: type === 'text' ? textHex : bgHex }"
    :aria-label="t('contrastChecker.pickColor', { type: type === 'text' ? 'text' : 'background' })"
    @click="openNativeColorPicker(type)"
  >
    <EyeDropper v-if="'EyeDropper' in window" :size="16" class="contrast-eyedropper-icon" />
  </button>
  <input
    :id="`${type}-color-swatch-${componentId}`"
    :ref="type === 'text' ? 'textColorPicker' : 'bgColorPicker'"
    v-model="type === 'text' ? textHex : bgHex"
    type="color"
    class="contrast-color-swatch-hidden"
  />
</div>
```

**Add eyedropper icon style:**
```css
.contrast-eyedropper-icon {
  color: white;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
  opacity: 0;
  transition: opacity var(--gi-transition-fast);
}

.contrast-color-swatch-display:hover .contrast-eyedropper-icon {
  opacity: 1;
}
```

**Step 5: Commit**
```bash
git add src/views/ContrastCheckerView.vue
git commit -m "feat: add native color picker with EyeDropper API"
```

---

### Task 2: Organize Color Presets into Groups

**Files:**
- Modify: `src/views/ContrastCheckerView.vue`
- Modify: `src/i18n/fr.ts`
- Modify: `src/i18n/en.ts`

**Add preset groups data:**
```typescript
const textColorPresets = [
  { label: 'Noir', colors: ['#000000', '#1a1a1a', '#333333', '#4a4a4a'] },
  { label: 'Marque', colors: ['#0aaa8e', '#2563eb', '#7c3aed'] },
  { label: 'Alertes', colors: ['#dc2626', '#ea580c', '#ca8a04'] },
]

const bgColorPresets = [
  { label: 'Clairs', colors: ['#ffffff', '#f8f9fa', '#f1f3f5', '#e9ecef'] },
  { label: 'Neutres', colors: ['#dee2e6', '#adb5bd', '#6c757d', '#495057'] },
  { label: 'Marque', colors: ['#0aaa8e', '#2563eb', '#1a1a1a'] },
]
```

**Update preset template:**
```vue
<!-- Text color presets -->
<div class="contrast-presets" role="group" :aria-label="t('contrastChecker.textPresets')">
  <div v-for="group in textColorPresets" :key="group.label" class="contrast-preset-group">
    <span class="contrast-preset-group-label">{{ group.label }}</span>
    <div class="contrast-preset-row">
      <button
        v-for="color in group.colors"
        :key="color"
        class="contrast-preset-btn"
        :style="{ backgroundColor: color }"
        :aria-label="t('contrastChecker.selectColor', { color })"
        @click="textHex = color"
      ></button>
    </div>
  </div>
</div>
```

**Add group styles:**
```css
.contrast-presets {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.contrast-preset-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.contrast-preset-group-label {
  font-size: var(--gi-font-size-xs);
  color: var(--gi-text-muted);
  font-weight: 500;
}

.contrast-preset-row {
  display: flex;
  gap: 0.375rem;
}
```

**Add i18n keys (fr.ts):**
```typescript
contrastChecker: {
  // ... existing keys
  textPresets: 'Couleurs de texte',
  bgPresets: 'Couleurs de fond',
  // Update existing keys
  commonTextColors: 'Couleurs de texte courantes',
  commonBgColors: 'Couleurs de fond courantes',
}
```

**Add i18n keys (en.ts):**
```typescript
contrastChecker: {
  // ... existing keys
  textPresets: 'Text colors',
  bgPresets: 'Background colors',
}
```

**Step 5: Commit**
```bash
git add src/views/ContrastCheckerView.vue src/i18n/fr.ts src/i18n/en.ts
git commit -m "feat: organize color presets into labeled groups"
```

---

### Task 3: Add Luminance Display

**Files:**
- Modify: `src/composables/useContrast.ts`
- Modify: `src/views/ContrastCheckerView.vue`

**Add luminance calculation to composable:**
```typescript
/**
 * Calculate relative luminance of a color (WCAG 2.1 definition)
 */
export function getRelativeLuminance(hex: string): number {
  const rgb = colorParsley(hex)
  if (!rgb) return 0
  
  const [r, g, b] = rgb.slice(0, 3).map((v: number) => {
    const srgb = v / 255
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4)
  })
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
```

**Add luminance display in view:**
```vue
<div class="contrast-luminance">
  <span class="contrast-luminance-label">{{ t('contrastChecker.luminance.text') }}</span>
  <span class="contrast-luminance-value">{{ (textLuminance * 100).toFixed(1) }}%</span>
  <span class="contrast-luminance-label">{{ t('contrastChecker.luminance.background') }}</span>
  <span class="contrast-luminance-value">{{ (bgLuminance * 100).toFixed(1) }}%</span>
</div>
```

**Add computed values:**
```typescript
import { getRelativeLuminance } from '../composables/useContrast'

const textLuminance = computed(() => getRelativeLuminance(textHex.value))
const bgLuminance = computed(() => getRelativeLuminance(bgHex.value))
```

**Add styles:**
```css
.contrast-luminance {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0.5rem 1.5rem;
  background: var(--gi-surface-elevated);
  border-top: 1px solid var(--gi-border);
  font-size: var(--gi-font-size-xs);
}

.contrast-luminance-label {
  color: var(--gi-text-muted);
}

.contrast-luminance-value {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-weight: 600;
  color: var(--gi-text);
}
```

**Step 5: Commit**
```bash
git add src/composables/useContrast.ts src/views/ContrastCheckerView.vue
git commit -m "feat: display relative luminance values"
```

---

## Phase 2: Export & Share Functionality

### Task 4: Add Shareable URL with Hash Params

**Files:**
- Modify: `src/views/ContrastCheckerView.vue`
- Modify: `src/i18n/fr.ts`
- Modify: `src/i18n/en.ts`

**Add URL sync on mount:**
```typescript
import { onMounted } from 'vue'

onMounted(() => {
  // Read colors from URL if present
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '')
  const urlText = params.get('text')
  const urlBg = params.get('bg')
  
  if (urlText && /^#[0-9A-Fa-f]{6}$/.test(urlText)) {
    textHex.value = urlText
  }
  if (urlBg && /^#[0-9A-Fa-f]{6}$/.test(urlBg)) {
    bgHex.value = urlBg
  }
})
```

**Add watch to update URL:**
```typescript
import { watch } from 'vue'

watch([textHex, bgHex], ([newText, newBg]) => {
  const params = new URLSearchParams()
  params.set('text', newText)
  params.set('bg', newBg)
  
  const newHash = `?${params.toString()}`
  window.history.replaceState(null, '', `#/contrast-checker${newHash}`)
})
```

**Add "Copy Link" button:**
```vue
<button
  class="gi-btn gi-btn-secondary contrast-action-btn"
  :aria-label="t('contrastChecker.copyLink')"
  @click="copyLink"
>
  <Link :size="16" aria-hidden="true" />
  {{ t('contrastChecker.copyLink') }}
</button>
```

**Add copyLink function:**
```typescript
import { Link } from 'lucide-vue-next'

async function copyLink() {
  const url = window.location.href
  await copyToClipboard(url)
}
```

**Add i18n keys (fr.ts):**
```typescript
contrastChecker: {
  copyLink: 'Copier le lien',
  linkCopied: 'Lien copié !',
}
```

**Add i18n keys (en.ts):**
```typescript
contrastChecker: {
  copyLink: 'Copy link',
  linkCopied: 'Link copied!',
}
```

**Step 5: Commit**
```bash
git add src/views/ContrastCheckerView.vue src/i18n/fr.ts src/i18n/en.ts
git commit -m "feat: add shareable URL with color params"
```

---

### Task 5: Add Copy Full Report

**Files:**
- Modify: `src/views/ContrastCheckerView.vue`
- Modify: `src/i18n/fr.ts`
- Modify: `src/i18n/en.ts`

**Add copy report function:**
```typescript
function copyFullReport() {
  const passCount = wcagChecks.value.filter(c => c.pass).length
  const totalCount = wcagChecks.value.length
  
  const report = [
    `Contrast Report`,
    ``,
    `Colors:`,
    `  Text: ${textHex.value}`,
    `  Background: ${bgHex.value}`,
    ``,
    `WCAG 2.1 Ratio: ${wcagRatio.value.toFixed(2)}:1`,
    `WCAG 2.1 Results: ${passCount}/${totalCount} passed`,
    wcagChecks.value.map(c => `  ${c.pass ? '✓' : '✗'} ${c.label}`).join('\n'),
    ``,
    `APCA Lc: ${Math.round(Math.abs(apcaScore.value))}`,
    ``,
    `Generated by getinside Tools`,
    window.location.href,
  ].join('\n')
  
  copyToClipboard(report)
}
```

**Add copy report button:**
```vue
<button
  class="gi-btn gi-btn-secondary contrast-action-btn"
  :aria-label="t('contrastChecker.copyReport')"
  @click="copyFullReport"
>
  <FileText :size="16" aria-hidden="true" />
  {{ t('contrastChecker.copyReport') }}
</button>
```

**Add imports:**
```typescript
import { Link, FileText } from 'lucide-vue-next'
```

**Add i18n keys (fr.ts):**
```typescript
contrastChecker: {
  copyReport: 'Copier le rapport',
  reportCopied: 'Rapport copié !',
}
```

**Add i18n keys (en.ts):**
```typescript
contrastChecker: {
  copyReport: 'Copy report',
  reportCopied: 'Report copied!',
}
```

**Step 5: Commit**
```bash
git add src/views/ContrastCheckerView.vue src/i18n/fr.ts src/i18n/en.ts
git commit -m "feat: add copy full contrast report"
```

---

## Phase 3: Improved French Translations

### Task 6: Refine All French i18n Strings

**Files:**
- Modify: `src/i18n/fr.ts`

**Update contrastChecker section with better French:**
```typescript
contrastChecker: {
  title: 'Vérificateur de Contraste',
  desc: 'Vérifiez la lisibilité et l\'accessibilité (WCAG 2.1 / APCA) de vos combinaisons de couleurs.',
  about: 'Un contraste suffisant est essentiel pour l\'accessibilité web. Cet outil analyse vos couleurs selon les normes WCAG AA/AAA et APCA, avec un aperçu en temps réel.',
  
  textColor: 'Couleur du texte',
  bgColor: 'Couleur de fond',
  
  preview: 'Aperçu',
  previewAria: 'Aperçu : texte {text} sur fond {bg}, contraste {ratio}:1',
  previewSize: 'Taille de l\'aperçu',
  previewHeading: 'Titre principal',
  previewBody: 'Texte courant pour vérifier la lisibilité',
  previewSmall: 'Texte secondaire plus petit',
  
  sizes: {
    small: 'Petit',
    medium: 'Moyen',
    large: 'Grand',
  },
  
  levels: {
    aaNormal: 'AA Texte normal (4,5:1)',
    aaaNormal: 'AAA Texte normal (7:1)',
    aaLarge: 'AA Texte large (3:1)',
    aaaLarge: 'AAA Texte large (4,5:1)',
    uiComponent: 'Composants & icônes (3:1)',
  },
  
  pass: 'Conforme',
  fail: 'Non conforme',
  
  swapColors: 'Inverser les couleurs',
  currentColor: 'Couleur actuelle : {color}',
  textColorHex: 'Code hexadécimal de la couleur du texte',
  bgColorHex: 'Code hexadécimal de la couleur de fond',
  
  textPresets: 'Couleurs de texte',
  bgPresets: 'Couleurs de fond',
  selectColor: 'Sélectionner {color}',
  
  copyColors: 'Copier les couleurs',
  copyRatio: 'Copier le ratio',
  copyLink: 'Copier le lien',
  copyReport: 'Copier le rapport',
  copied: 'Copié !',
  linkCopied: 'Lien copié !',
  reportCopied: 'Rapport copié !',
  
  pickColor: 'Choisir une couleur pour le {type}',
  luminance: {
    text: 'Luminance texte',
    background: 'Luminance fond',
  },
  
  error: {
    invalidHex: 'Code hexadécimal invalide (ex. #FF5733)',
  },
  
  summary: {
    passAll: 'Tous les critères WCAG 2.1 sont respectés',
    someFail: 'Certains critères WCAG 2.1 ne sont pas respectés',
  },
  
  apca: {
    note: 'Algorithme de contraste perceptuel avancé',
    bodyPreferred: 'Recommandé pour le texte courant',
    bodyMinimum: 'Minimum pour le texte courant',
    largeMinimum: 'Minimum pour les textes larges',
    uiMinimum: 'Minimum pour les composants',
  },
  
  pedagogic: {
    title: 'À propos du contraste et de l\'accessibilité',
    description: 'Le contraste des couleurs est crucial pour l\'accessibilité. Les normes WCAG définissent des ratios minimums pour garantir la lisibilité.',
    tips: [
      'WCAG AA exige un ratio de 4,5:1 pour le texte normal',
      'WCAG AAA exige un ratio de 7:1 pour un contraste optimal',
      'Un ratio de 3:1 suffit pour les textes de grande taille (18px+)',
      'Les composants d\'interface nécessitent un minimum de 3:1',
    ],
  },
}
```

**Key improvements:**
- "Composants & Graphiques" → "Composants & icônes" (more accurate)
- "Recommandé pour le texte corporel" → "Recommandé pour le texte courant" (better French)
- "Minimum pour le texte corporel" → "Minimum pour le texte courant"
- "Minimum pour les composants UI" → "Minimum pour les composants" (UI is redundant)
- "Algorithme de Contraste Perceptuel Avancé" → "Algorithme de contraste perceptuel avancé" (lowercase, more natural)
- "Échoue" → "Non conforme" (standard accessibility term)
- "Passe" → "Conforme" (standard accessibility term)
- Use French number format: "4,5:1" instead of "4.5:1"
- "ex: #FF5733" instead of "ex: #FF5733" (French typography)
- "Couleur actuelle :" with French space

**Step 5: Commit**
```bash
git add src/i18n/fr.ts
git commit -m "i18n: improve French translations for contrast checker"
```

---

## Phase 4: Visual Polish

### Task 7: Improve Results Card Visual Hierarchy

**Files:**
- Modify: `src/views/ContrastCheckerView.vue`

**Add pass/fail count badge:**
```vue
<div class="contrast-result-header">
  <h3 class="gi-result-card-title">
    <CheckCircle2 v-if="allWcagPass" :size="20" class="contrast-result-icon" aria-hidden="true" />
    <AlertCircle v-else :size="20" class="contrast-result-icon" aria-hidden="true" />
    WCAG 2.1
    <span class="contrast-ratio-large">{{ wcagRatio.toFixed(2) }}:1</span>
  </h3>
  <div class="contrast-pass-badge" :class="{ 'contrast-pass-badge-ok': allWcagPass }">
    {{ passCount }}/{{ totalCount }}
  </div>
</div>
```

**Add computed values:**
```typescript
const passCount = computed(() => wcagChecks.value.filter(c => c.pass).length)
const totalCount = computed(() => wcagChecks.value.length)
```

**Add badge styles:**
```css
.contrast-pass-badge {
  padding: 0.25rem 0.625rem;
  border-radius: var(--gi-radius-pill);
  font-size: var(--gi-font-size-xs);
  font-weight: 600;
  font-family: 'SF Mono', 'Fira Code', monospace;
  background: var(--gi-tint-red-50);
  color: var(--gi-error);
}

.contrast-pass-badge-ok {
  background: var(--gi-tint-green-50);
  color: var(--gi-tint-green-text);
}
```

**Step 5: Commit**
```bash
git add src/views/ContrastCheckerView.vue
git commit -m "style: add pass/fail count badge to results"
```

---

### Task 8: Add APCA Guidance Context

**Files:**
- Modify: `src/views/ContrastCheckerView.vue`
- Modify: `src/i18n/fr.ts`
- Modify: `src/i18n/en.ts`

**Add APCA recommendation text:**
```vue
<div class="contrast-apca-recommendation" :class="apcaRecommendation.class">
  <Info :size="16" aria-hidden="true" />
  <span>{{ apcaRecommendation.text }}</span>
</div>
```

**Add computed recommendation:**
```typescript
const apcaRecommendation = computed(() => {
  const score = Math.abs(apcaScore.value)
  if (score >= 90) {
    return { text: t('contrastChecker.apca.recommendation.excellent'), class: 'apca-rec-excellent' }
  } else if (score >= 75) {
    return { text: t('contrastChecker.apca.recommendation.good'), class: 'apca-rec-good' }
  } else if (score >= 60) {
    return { text: t('contrastChecker.apca.recommendation.large'), class: 'apca-rec-large' }
  } else if (score >= 45) {
    return { text: t('contrastChecker.apca.recommendation.ui'), class: 'apca-rec-ui' }
  } else {
    return { text: t('contrastChecker.apca.recommendation.fail'), class: 'apca-rec-fail' }
  }
})
```

**Add i18n keys (fr.ts):**
```typescript
apca: {
  // ... existing
  recommendation: {
    excellent: 'Excellent — convient pour tous les usages',
    good: 'Bon — adapté au texte courant',
    large: 'Acceptable — pour les textes larges uniquement',
    ui: 'Limité — pour les composants UI uniquement',
    fail: 'Insuffisant — augmentez le contraste',
  },
}
```

**Add i18n keys (en.ts):**
```typescript
apca: {
  // ... existing
  recommendation: {
    excellent: 'Excellent — suitable for all uses',
    good: 'Good — suitable for body text',
    large: 'Acceptable — large text only',
    ui: 'Limited — UI components only',
    fail: 'Insufficient — increase contrast',
  },
}
```

**Add styles:**
```css
.contrast-apca-recommendation {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: var(--gi-radius-md);
  font-size: var(--gi-font-size-sm);
  font-weight: 500;
  margin-top: 1rem;
}

.apca-rec-excellent {
  background: var(--gi-tint-green-50);
  color: var(--gi-tint-green-text);
}

.apca-rec-good {
  background: var(--gi-tint-green-50);
  color: var(--gi-tint-green-text);
}

.apca-rec-large {
  background: var(--gi-tint-yellow-50);
  color: var(--gi-tint-yellow-text);
}

.apca-rec-ui {
  background: var(--gi-tint-orange-50);
  color: var(--gi-tint-orange-text);
}

.apca-rec-fail {
  background: var(--gi-tint-red-50);
  color: var(--gi-error);
}
```

**Step 5: Commit**
```bash
git add src/views/ContrastCheckerView.vue src/i18n/fr.ts src/i18n/en.ts
git commit -m "feat: add APCA contextual recommendation"
```

---

## Testing Checklist

- [ ] EyeDropper API works in Chrome/Edge
- [ ] Native color picker fallback works in Safari/Firefox
- [ ] Color preset groups display correctly
- [ ] Luminance values update in real-time
- [ ] Shareable URL persists colors on page reload
- [ ] Copy link copies current URL with params
- [ ] Copy report generates formatted text
- [ ] French translations display correctly
- [ ] All WCAG checks pass/fail correctly
- [ ] APCA recommendation updates with color changes
- [ ] Dark mode styling works
- [ ] Mobile responsive layout works
- [ ] Build passes: `npm run build`
- [ ] Tests pass: `npm test`

---

## Final Verification

```bash
npm run build
npm test
```
