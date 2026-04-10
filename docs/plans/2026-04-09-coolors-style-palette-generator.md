# Coolors-Style Color Palette Generator — Full Implementation Plan

> **For Qwen Code:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Transform the Color Palette Generator into a Coolors-like full-viewport experience with beautiful color harmony algorithms, image extraction, multiple export formats, shades/tints, URL sharing, contrast checking, and gradient generation.

**Architecture:** Replace the current card-based view with a full-screen layout (`ColorPaletteFullView.vue`) that uses the existing `ToolPageLayout` only as a thin wrapper. All color generation logic moves into enhanced composables (`useColorHarmony.ts`, `usePaletteExport.ts`, `useImageExtraction.ts`, `useColorContrast.ts`, `useGradient.ts`). The URL stores the palette state for sharing. The layout is a new route (`/color-palette-full`) that coexists with the original `/color-palette` during migration.

**Tech Stack:** Vue 3 Composition API, Vite 5, TypeScript strict, lucide-vue-next icons, culori (already installed), jsqr (already installed for QR — not used here), @vue/test-utils + Vitest for testing.

**Key design principles:**
- Full-viewport color columns (Coolors signature look)
- Spacebar generates new palette
- Lock colors with click/space on individual columns
- Keyboard-first: Space=generate, C=copy, L=lock, U=unlock, G=gradient mode, E=export modal, R=restore locked, Esc=close modals
- Beautiful algorithms: analogous, complementary, triadic, tetradic, split-complementary, monochromatic, random-beautiful
- Image extraction using canvas pixel sampling (no external library needed)
- All palette data syncs to URL hash for sharing
- Dark/light mode fully supported

---

## Phase 1: Full-Screen Layout + Color Harmony Engine

### Task 1: Color Harmony Composable with Beautiful Algorithms

**Files:**
- Create: `src/composables/useColorHarmony.ts`
- Test: `src/composables/__tests__/useColorHarmony.test.ts`

**Step 1: Write the failing test**

```typescript
// src/composables/__tests__/useColorHarmony.test.ts
import { describe, it, expect } from 'vitest'
import { generateHarmony, HarmonyType } from '../useColorHarmony'

describe('generateHarmony', () => {
  it('generates 5 colors for analogous harmony', () => {
    const colors = generateHarmony('#0aaa8e', 'analogous', 5)
    expect(colors).toHaveLength(5)
    colors.forEach(c => expect(c).toMatch(/^#[0-9A-F]{6}$/))
  })

  it('generates 5 colors for complementary harmony', () => {
    const colors = generateHarmony('#0aaa8e', 'complementary', 5)
    expect(colors).toHaveLength(5)
  })

  it('generates 5 colors for triadic harmony', () => {
    const colors = generateHarmony('#0aaa8e', 'triadic', 5)
    expect(colors).toHaveLength(5)
  })

  it('generates 5 colors for tetradic harmony', () => {
    const colors = generateHarmony('#0aaa8e', 'tetradic', 5)
    expect(colors).toHaveLength(5)
  })

  it('generates 5 colors for split-complementary', () => {
    const colors = generateHarmony('#0aaa8e', 'split-complementary', 5)
    expect(colors).toHaveLength(5)
  })

  it('generates 5 colors for monochromatic', () => {
    const colors = generateHarmony('#0aaa8e', 'monochromatic', 5)
    expect(colors).toHaveLength(5)
  })

  it('random-beautiful generates varied, pleasant palettes', () => {
    const colors = generateHarmony('#0aaa8e', 'random-beautiful', 5)
    expect(colors).toHaveLength(5)
    // Should not all be the same
    const unique = new Set(colors)
    expect(unique.size).toBeGreaterThan(1)
  })

  it('handles edge case: white base color', () => {
    const colors = generateHarmony('#FFFFFF', 'analogous', 5)
    expect(colors).toHaveLength(5)
  })

  it('handles edge case: black base color', () => {
    const colors = generateHarmony('#000000', 'analogous', 5)
    expect(colors).toHaveLength(5)
  })
})
```

**Step 2: Run test to verify it fails**
```bash
npm test -- useColorHarmony.test.ts
# Expected: FAIL — module not found
```

**Step 3: Write minimal implementation**

```typescript
// src/composables/useColorHarmony.ts
export type HarmonyType =
  | 'random-beautiful'
  | 'analogous'
  | 'complementary'
  | 'triadic'
  | 'tetradic'
  | 'split-complementary'
  | 'monochromatic'

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const cleaned = hex.replace('#', '')
  const r = parseInt(cleaned.substring(0, 2), 16) / 255
  const g = parseInt(cleaned.substring(2, 4), 16) / 255
  const b = parseInt(cleaned.substring(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToHex(h: number, s: number, l: number): string {
  s = Math.max(0, Math.min(100, s)) / 100
  l = Math.max(0, Math.min(100, l)) / 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase()
}

function clampHsl(h: number, s: number, l: number) {
  return {
    h: ((h % 360) + 360) % 360,
    s: Math.max(15, Math.min(90, s)),  // Keep saturation in pleasant range
    l: Math.max(25, Math.min(80, l)),  // Keep lightness readable
  }
}

export function generateHarmony(baseHex: string, type: HarmonyType, count: number = 5): string[] {
  const base = hexToHsl(baseHex)

  switch (type) {
    case 'analogous': {
      const step = 30
      const startH = base.h - Math.floor((count - 1) / 2) * step
      return Array.from({ length: count }, (_, i) => {
        const { h, s, l } = clampHsl(startH + i * step, base.s, base.l + (i - Math.floor(count / 2)) * 5)
        return hslToHex(h, s, l)
      })
    }
    case 'complementary': {
      const colors: string[] = []
      // 3 analogous from base, base+complement, 1 analogous from complement
      for (let i = 0; i < 3; i++) {
        const { h, s, l } = clampHsl(base.h + (i - 1) * 25, base.s, base.l + (i - 1) * 5)
        colors.push(hslToHex(h, s, l))
      }
      // Complement color
      const comp = clampHsl(base.h + 180, base.s, base.l)
      colors.push(hslToHex(comp.h, comp.s, comp.l))
      // One variation of complement
      const compVar = clampHsl(base.h + 180, Math.min(base.s + 10, 90), Math.max(base.l - 10, 25))
      colors.push(hslToHex(compVar.h, compVar.s, compVar.l))
      return colors
    }
    case 'triadic': {
      const colors: string[] = []
      for (let i = 0; i < 3; i++) {
        const { h, s, l } = clampHsl(base.h + i * 120, base.s, base.l)
        colors.push(hslToHex(h, s, l))
      }
      // Add 2 lighter variants of first two
      for (let i = 0; i < 2; i++) {
        const { h, s, l } = clampHsl(base.h + i * 120, base.s - 15, base.l + 20)
        colors.push(hslToHex(h, s, l))
      }
      return colors
    }
    case 'tetradic': {
      return [0, 90, 180, 270].map(offset => {
        const { h, s, l } = clampHsl(base.h + offset, base.s, base.l + (offset === 0 ? 0 : offset === 180 ? -5 : 5))
        return hslToHex(h, s, l)
      }).concat([hslToHex(clampHsl(base.h + 45, base.s - 10, base.l + 15).h, clampHsl(base.h + 45, base.s - 10, base.l + 15).s, clampHsl(base.h + 45, base.s - 10, base.l + 15).l)])
    }
    case 'split-complementary': {
      const colors: string[] = []
      // Base + two adjacent to complement
      const { h, s, l } = clampHsl(base.h, base.s, base.l)
      colors.push(hslToHex(h, s, l))
      for (const offset of [-30, 30]) {
        const c = clampHsl(base.h + 180 + offset, base.s, base.l + (offset > 0 ? 5 : -5))
        colors.push(hslToHex(c.h, c.s, c.l))
      }
      // Two lighter variants
      for (let i = 0; i < 2; i++) {
        const c = clampHsl(base.h + (i === 0 ? -15 : 15), base.s - 20, base.l + 20)
        colors.push(hslToHex(c.h, c.s, c.l))
      }
      return colors
    }
    case 'monochromatic': {
      return Array.from({ length: count }, (_, i) => {
        const step = (60 / (count - 1 || 1))
        const { h, s, l } = clampHsl(base.h, base.s, 30 + i * step)
        return hslToHex(h, s, l)
      })
    }
    case 'random-beautiful': {
      // Generate a harmonious palette using randomized but constrained HSL values
      const hue = Math.floor(Math.random() * 360)
      const sat = 40 + Math.floor(Math.random() * 40)  // 40-80%
      const light = 35 + Math.floor(Math.random() * 30) // 35-65%
      // Generate analogous spread with variation
      return Array.from({ length: count }, (_, i) => {
        const hueOffset = (i - Math.floor(count / 2)) * (20 + Math.floor(Math.random() * 20))
        const satVar = sat + Math.floor(Math.random() * 20 - 10)
        const lightVar = light + (i - Math.floor(count / 2)) * 8
        const { h, s, l } = clampHsl(hue + hueOffset, satVar, lightVar)
        return hslToHex(h, s, l)
      })
    }
    default:
      return generateHarmony(baseHex, 'random-beautiful', count)
  }
}
```

**Step 4: Run test to verify it passes**
```bash
npm test -- useColorHarmony.test.ts
# Expected: PASS (9 tests)
```

**Step 5: Commit**
```bash
git add src/composables/useColorHarmony.ts src/composables/__tests__/useColorHarmony.test.ts
git commit -m "feat: add color harmony engine with 7 algorithms"
```

---

### Task 2: Palette State Management + URL Sync

**Files:**
- Modify: `src/composables/useColorPalette.ts` — add `usePaletteState()` composable
- Test: Add tests to `src/composables/__tests__/useColorPalette.test.ts`

**Step 1: Write the failing test**

```typescript
// Add to useColorPalette.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { usePaletteState } from '../useColorPalette'

describe('usePaletteState', () => {
  beforeEach(() => {
    window.location.hash = ''
  })

  afterEach(() => {
    window.location.hash = ''
  })

  it('initializes with default palette when no URL params', () => {
    const { palette } = usePaletteState()
    expect(palette.value).toHaveLength(5)
  })

  it('restores palette from URL hash', () => {
    window.location.hash = '#0aaa8e-b8d5b8-d7b49e-dc602e-bc412b'
    const { palette } = usePaletteState()
    expect(palette.value.map(c => c.hex.toLowerCase())).toEqual([
      '#0aaa8e', '#b8d5b8', '#d7b49e', '#dc602e', '#bc412b'
    ])
  })

  it('syncs palette changes to URL', () => {
    const { palette, syncToUrl } = usePaletteState()
    palette.value = [
      { hex: '#FF0000', locked: false },
      { hex: '#00FF00', locked: false },
      { hex: '#0000FF', locked: true },
      { hex: '#FFFF00', locked: false },
      { hex: '#FF00FF', locked: false },
    ]
    syncToUrl()
    expect(window.location.hash).toContain('ff0000')
    expect(window.location.hash).toContain('00ff00')
  })

  it('handles malformed URL gracefully', () => {
    window.location.hash = '#not-a-color-bad-data'
    const { palette } = usePaletteState()
    expect(palette.value).toHaveLength(5) // Falls back to default
  })
})
```

**Step 2: Run test to verify it fails**
```bash
npm test -- useColorPalette.test.ts -t "usePaletteState"
# Expected: FAIL — usePaletteState not defined
```

**Step 3: Write minimal implementation**

```typescript
// Add to src/composables/useColorPalette.ts

import { ref, watch } from 'vue'

export interface PaletteState {
  palette: Ref<PaletteColor[]>
  harmonyType: Ref<string>
  syncToUrl: () => void
}

export function usePaletteState(): PaletteState {
  const palette = ref<PaletteColor[]>(initPalette())
  const harmonyType = ref('random-beautiful')

  // Restore from URL on init
  const hash = window.location.hash.replace('#', '')
  if (hash && hash.includes('-')) {
    const colors = hash.split('-').filter(c => /^#[0-9A-Fa-f]{6}$/.test(c))
    if (colors.length >= 2) {
      palette.value = colors.map(hex => ({ hex: hex.toUpperCase(), locked: false }))
      // Check for harmony type after colors
      const params = hash.split('-')
      const harmonyParam = params.find(p => ['analogous','complementary','triadic','tetradic','split-complementary','monochromatic','random-beautiful'].includes(p))
      if (harmonyParam) harmonyType.value = harmonyParam
    }
  }

  function syncToUrl() {
    const colors = palette.value.map(c => c.hex.toLowerCase().replace('#', ''))
    const type = harmonyType.value
    window.location.hash = colors.join('-') + '-' + type
  }

  // Auto-sync on palette change (debounced)
  let syncTimer: ReturnType<typeof setTimeout> | null = null
  watch(palette, () => {
    if (syncTimer) clearTimeout(syncTimer)
    syncTimer = setTimeout(syncToUrl, 500)
  }, { deep: true })

  watch(harmonyType, syncToUrl)

  return { palette, harmonyType, syncToUrl }
}
```

**Step 4: Run test to verify it passes**
```bash
npm test -- useColorPalette.test.ts -t "usePaletteState"
# Expected: PASS (4 tests)
```

**Step 5: Commit**
```bash
git add src/composables/useColorPalette.ts src/composables/__tests__/useColorPalette.test.ts
git commit -m "feat: add palette state management with URL sync"
```

---

### Task 3: Full-Screen Color Palette View (Coolors Layout)

**Files:**
- Create: `src/views/ColorPaletteFullView.vue`
- Modify: `src/router/index.ts` — add new route
- Modify: `src/i18n/fr.ts` — add new i18n keys
- Modify: `src/i18n/en.ts` — add new i18n keys

**Step 1: Add i18n keys first**

```typescript
// Add to src/i18n/fr.ts in colorPalette section:
colorPaletteFull: {
  title: 'Palette de couleurs',
  generate: 'Générer',
  lock: 'Verrouiller',
  unlock: 'Déverrouiller',
  copied: 'Copié',
  harmony: {
    label: 'Harmonie',
    randomBeautiful: 'Aléatoire',
    analogous: 'Analogues',
    complementary: 'Complémentaire',
    triadic: 'Triadique',
    tetradic: 'Tétradique',
    splitComplementary: 'Split complémentaire',
    monochromatic: 'Monochromatique',
  },
  export: {
    label: 'Exporter',
    css: 'Variables CSS',
    scss: 'Variables SCSS',
    json: 'JSON',
    tailwind: 'Tailwind Config',
    ase: 'ASE (Photoshop)',
    png: 'Image PNG',
    url: 'Copier l\'URL',
  },
  shades: 'Nuances',
  tint: 'Teinte claire',
  shade: 'Teinte foncée',
  tone: 'Ton',
  contrast: {
    label: 'Contraste',
    onWhite: 'Sur blanc',
    onBlack: 'Sur noir',
    ratio: 'Ratio',
    pass: '✓',
    fail: '✗',
  },
  gradient: {
    label: 'Dégradé',
    linear: 'Linéaire',
    radial: 'Radial',
    copy: 'Copier CSS',
  },
  toast: {
    copied: 'Couleur copiée',
    urlCopied: 'URL copiée',
    cssCopied: 'CSS copié',
    exported: 'Exporté',
  },
  keyboard: {
    space: 'Générer',
    c: 'Copier',
    l: 'Verrouiller',
    g: 'Dégradé',
    e: 'Exporter',
    esc: 'Fermer',
  },
},
```

```typescript
// Add same structure to src/i18n/en.ts with English translations
```

**Step 2: Create the full-screen view**

```vue
<!-- src/views/ColorPaletteFullView.vue -->
<template>
  <div class="cpf-fullscreen">
    <!-- Top toolbar — floating, auto-hide -->
    <div class="cpf-toolbar" :class="{ 'cpf-toolbar--visible': toolbarVisible || hoverToolbar }">
      <div class="cpf-toolbar-left">
        <router-link to="/" class="cpf-back-btn" :aria-label="t('nav.back')">
          <ChevronLeft :size="18" />
        </router-link>
        <div class="cpf-harmony-selector">
          <button
            class="cpf-harmony-btn"
            @click="showHarmonyMenu = !showHarmonyMenu"
            :aria-expanded="showHarmonyMenu"
            :aria-label="t('colorPaletteFull.harmony.label')"
          >
            <Sparkles :size="16" />
            <span>{{ harmonyLabel }}</span>
            <ChevronDown :size="14" class="cpf-chevron" :class="{ 'cpf-chevron--open': showHarmonyMenu }" />
          </button>
          <div v-if="showHarmonyMenu" class="cpf-harmony-menu" role="listbox">
            <button
              v-for="type in harmonyTypes"
              :key="type.value"
              class="cpf-harmony-option"
              :class="{ 'cpf-harmony-option--active': harmonyType === type.value }"
              role="option"
              :aria-selected="harmonyType === type.value"
              @click="selectHarmony(type.value)"
            >
              {{ type.label }}
            </button>
          </div>
        </div>
      </div>
      <div class="cpf-toolbar-right">
        <button class="cpf-tool-btn" @click="showGradientModal = true" :aria-label="t('colorPaletteFull.gradient.label')">
          <Palette :size="16" />
        </button>
        <button class="cpf-tool-btn" @click="showExportModal = true" :aria-label="t('colorPaletteFull.export.label')">
          <Download :size="16" />
        </button>
        <button class="cpf-generate-btn" @click="generate" :aria-label="t('colorPaletteFull.generate')">
          <Shuffle :size="18" />
          <span class="cpf-generate-text">{{ t('colorPaletteFull.generate') }}</span>
        </button>
      </div>
    </div>

    <!-- Color columns — full viewport -->
    <div class="cpf-columns" role="group" :aria-label="t('colorPalette.title')">
      <div
        v-for="(color, i) in palette"
        :key="i"
        class="cpf-column"
        :class="{
          'cpf-column--locked': color.locked,
          'cpf-column--flash': flashIndex === i,
        }"
        :style="{ background: color.hex }"
        @click="lockToggle(i)"
      >
        <!-- Lock icon -->
        <div class="cpf-column-icon">
          <Lock v-if="color.locked" :size="24" />
        </div>

        <!-- Color info at bottom -->
        <div class="cpf-column-info">
          <button
            class="cpf-color-value"
            @click.stop="copyColor(color.hex, i)"
            :aria-label="`${color.hex} - ${t('colorPaletteFull.copied')}`"
          >
            {{ color.hex.toUpperCase() }}
          </button>
          <div class="cpf-color-actions">
            <button
              class="cpf-action-btn"
              @click.stop="showShades(i)"
              :aria-label="t('colorPaletteFull.shades')"
            >
              <Layers :size="16" />
            </button>
            <button
              class="cpf-action-btn"
              @click.stop="copyColor(color.hex, i)"
              :aria-label="t('colorPaletteFull.copied')"
            >
              <Copy :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Shades/Tints Panel — slides up from bottom -->
    <Transition name="cpf-slide-up">
      <div v-if="showShadesPanel" class="cpf-shades-panel" role="dialog" :aria-label="t('colorPaletteFull.shades')">
        <div class="cpf-shades-header">
          <h3 class="cpf-shades-title">
            <span class="cpf-shades-swatch" :style="{ background: selectedColor?.hex }"></span>
            {{ selectedColor?.hex }} — {{ t('colorPaletteFull.shades') }}
          </h3>
          <button class="cpf-close-btn" @click="showShadesPanel = false" :aria-label="t('nav.close')">
            <X :size="20" />
          </button>
        </div>
        <div class="cpf-shades-grid">
          <!-- Tints (lighter) -->
          <div class="cpf-shades-section">
            <span class="cpf-shades-label">{{ t('colorPaletteFull.tint') }}</span>
            <div class="cpf-shades-row">
              <div
                v-for="(shade, j) in tints"
                :key="'tint-' + j"
                class="cpf-shade-cell"
                :style="{ background: shade }"
                @click="copyColor(shade, -1)"
                :aria-label="shade"
              >
                <span class="cpf-shade-label" :style="{ color: getContrastColor(shade) }">{{ shade }}</span>
              </div>
            </div>
          </div>
          <!-- Original -->
          <div class="cpf-shades-section">
            <span class="cpf-shades-label">{{ t('colorPaletteFull.tone') }}</span>
            <div class="cpf-shades-row">
              <div
                v-for="(shade, j) in tones"
                :key="'tone-' + j"
                class="cpf-shade-cell"
                :style="{ background: shade }"
                @click="copyColor(shade, -1)"
                :aria-label="shade"
              >
                <span class="cpf-shade-label" :style="{ color: getContrastColor(shade) }">{{ shade }}</span>
              </div>
            </div>
          </div>
          <!-- Shades (darker) -->
          <div class="cpf-shades-section">
            <span class="cpf-shades-label">{{ t('colorPaletteFull.shade') }}</span>
            <div class="cpf-shades-row">
              <div
                v-for="(shade, j) in shades"
                :key="'shade-' + j"
                class="cpf-shade-cell"
                :style="{ background: shade }"
                @click="copyColor(shade, -1)"
                :aria-label="shade"
              >
                <span class="cpf-shade-label" :style="{ color: getContrastColor(shade) }">{{ shade }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Export Modal -->
    <Teleport to="body">
      <Transition name="cpf-fade">
        <div v-if="showExportModal" class="cpf-modal-overlay" @click.self="showExportModal = false">
          <div class="cpf-modal" role="dialog" :aria-label="t('colorPaletteFull.export.label')">
            <div class="cpf-modal-header">
              <h2 class="cpf-modal-title">{{ t('colorPaletteFull.export.label') }}</h2>
              <button class="cpf-close-btn" @click="showExportModal = false" :aria-label="t('nav.close')">
                <X :size="20" />
              </button>
            </div>
            <div class="cpf-modal-body">
              <div class="cpf-export-grid">
                <button class="cpf-export-card" @click="exportFormat('css')">
                  <Code :size="20" />
                  <span>{{ t('colorPaletteFull.export.css') }}</span>
                </button>
                <button class="cpf-export-card" @click="exportFormat('scss')">
                  <Code :size="20" />
                  <span>{{ t('colorPaletteFull.export.scss') }}</span>
                </button>
                <button class="cpf-export-card" @click="exportFormat('json')">
                  <Braces :size="20" />
                  <span>{{ t('colorPaletteFull.export.json') }}</span>
                </button>
                <button class="cpf-export-card" @click="exportFormat('tailwind')">
                  <Wind :size="20" />
                  <span>{{ t('colorPaletteFull.export.tailwind') }}</span>
                </button>
                <button class="cpf-export-card" @click="exportFormat('url')">
                  <Link :size="20" />
                  <span>{{ t('colorPaletteFull.export.url') }}</span>
                </button>
                <button class="cpf-export-card" @click="exportFormat('png')">
                  <ImageIcon :size="20" />
                  <span>{{ t('colorPaletteFull.export.png') }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Gradient Modal -->
    <Teleport to="body">
      <Transition name="cpf-fade">
        <div v-if="showGradientModal" class="cpf-modal-overlay" @click.self="showGradientModal = false">
          <div class="cpf-modal cpf-modal--gradient" role="dialog" :aria-label="t('colorPaletteFull.gradient.label')">
            <div class="cpf-modal-header">
              <h2 class="cpf-modal-title">{{ t('colorPaletteFull.gradient.label') }}</h2>
              <button class="cpf-close-btn" @click="showGradientModal = false" :aria-label="t('nav.close')">
                <X :size="20" />
              </button>
            </div>
            <div class="cpf-modal-body">
              <div class="cpf-gradient-type-toggle">
                <button
                  class="cpf-gradient-type-btn"
                  :class="{ 'cpf-gradient-type-btn--active': gradientType === 'linear' }"
                  @click="gradientType = 'linear'"
                >{{ t('colorPaletteFull.gradient.linear') }}</button>
                <button
                  class="cpf-gradient-type-btn"
                  :class="{ 'cpf-gradient-type-btn--active': gradientType === 'radial' }"
                  @click="gradientType = 'radial'"
                >{{ t('colorPaletteFull.gradient.radial') }}</button>
              </div>
              <div class="cpf-gradient-preview" :style="{ background: gradientCss }"></div>
              <div class="cpf-gradient-code">
                <code>{{ gradientCss }}</code>
                <button class="cpf-copy-code-btn" @click="copyGradient" :aria-label="t('colorPaletteFull.gradient.copy')">
                  <Copy :size="16" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Toast -->
    <Transition name="cpf-toast">
      <div v-if="toastMessage" class="cpf-toast" role="status" aria-live="polite">
        <CheckCircle :size="16" />
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>

    <!-- Keyboard shortcuts hint (bottom-left, subtle) -->
    <div class="cpf-shortcuts-hint">
      <kbd>Space</kbd> {{ t('colorPaletteFull.keyboard.space') }}
      <span class="cpf-shortcuts-divider">·</span>
      <kbd>C</kbd> {{ t('colorPaletteFull.keyboard.c') }}
      <span class="cpf-shortcuts-divider">·</span>
      <kbd>L</kbd> {{ t('colorPaletteFull.keyboard.l') }}
      <span class="cpf-shortcuts-divider">·</span>
      <kbd>G</kbd> {{ t('colorPaletteFull.keyboard.g') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ChevronLeft, ChevronDown, Shuffle, Sparkles, Download,
  Lock, Copy, Layers, X, CheckCircle, Code, Braces,
  Wind, Link, ImageIcon, Palette,
} from 'lucide-vue-next'
import {
  initPalette,
  generatePalette,
  toggleLock,
  updateColor,
  usePaletteState,
} from '../composables/useColorPalette'
import { generateHarmony, type HarmonyType } from '../composables/useColorHarmony'
import type { PaletteColor } from '../composables/useColorPalette'

const { t } = useI18n()
const { palette, harmonyType, syncToUrl } = usePaletteState()

// UI state
const toolbarVisible = ref(true)
const hoverToolbar = ref(false)
const showHarmonyMenu = ref(false)
const showExportModal = ref(false)
const showGradientModal = ref(false)
const showShadesPanel = ref(false)
const flashIndex = ref<number | null>(null)
const toastMessage = ref<string | null>(null)
const gradientType = ref<'linear' | 'radial'>('linear')
const selectedColorIndex = ref<number | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null

// Harmony types
const harmonyTypes = [
  { value: 'random-beautiful' as HarmonyType, label: t('colorPaletteFull.harmony.randomBeautiful') },
  { value: 'analogous' as HarmonyType, label: t('colorPaletteFull.harmony.analogous') },
  { value: 'complementary' as HarmonyType, label: t('colorPaletteFull.harmony.complementary') },
  { value: 'triadic' as HarmonyType, label: t('colorPaletteFull.harmony.triadic') },
  { value: 'tetradic' as HarmonyType, label: t('colorPaletteFull.harmony.tetradic') },
  { value: 'split-complementary' as HarmonyType, label: t('colorPaletteFull.harmony.splitComplementary') },
  { value: 'monochromatic' as HarmonyType, label: t('colorPaletteFull.harmony.monochromatic') },
]

const harmonyLabel = computed(() => {
  return harmonyTypes.find(h => h.value === harmonyType.value)?.label || ''
})

const selectedColor = computed(() => {
  if (selectedColorIndex.value === null) return null
  return palette.value[selectedColorIndex.value]
})

// Shades/tints computation
const tints = computed(() => {
  if (!selectedColor.value) return []
  return generateTints(selectedColor.value.hex, 6)
})

const tones = computed(() => {
  if (!selectedColor.value) return []
  return generateTones(selectedColor.value.hex, 6)
})

const shades = computed(() => {
  if (!selectedColor.value) return []
  return generateShades(selectedColor.value.hex, 6)
})

// Gradient CSS
const gradientCss = computed(() => {
  const colors = palette.value.map(c => c.hex)
  if (gradientType.value === 'linear') {
    return `linear-gradient(135deg, ${colors.join(', ')})`
  }
  return `radial-gradient(circle, ${colors.join(', ')})`
})

// --- Actions ---

function generate() {
  // Pick a random base from unlocked colors or use first color
  const unlocked = palette.value.filter(c => !c.locked)
  if (unlocked.length === 0) {
    // All locked — generate from first color
    const base = palette.value[0].hex
    const newColors = generateHarmony(base, harmonyType.value as HarmonyType, palette.value.length)
    palette.value = palette.value.map((c, i) => ({ ...c, hex: newColors[i] }))
  } else {
    // Use the first unlocked color as base for harmony
    const base = unlocked[0].hex
    const newColors = generateHarmony(base, harmonyType.value as HarmonyType, palette.value.length)
    let colorIdx = 0
    palette.value = palette.value.map(c => {
      if (c.locked) return c
      const next = newColors[colorIdx++]
      return { ...c, hex: next }
    })
  }
  syncToUrl()
}

function lockToggle(index: number) {
  palette.value = toggleLock(palette.value, index)
  syncToUrl()
}

function selectHarmony(type: HarmonyType) {
  harmonyType.value = type
  showHarmonyMenu.value = false
  generate()
}

function showShades(index: number) {
  selectedColorIndex.value = index
  showShadesPanel.value = true
}

async function copyColor(hex: string, index: number) {
  try {
    await navigator.clipboard.writeText(hex)
    if (index >= 0) {
      flashIndex.value = index
      setTimeout(() => { flashIndex.value = null }, 300)
    }
    showToast(t('colorPaletteFull.toast.copied'))
  } catch { /* silent */ }
}

function exportFormat(format: string) {
  let text = ''
  switch (format) {
    case 'css':
      text = ':root {\n' + palette.value.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n') + '\n}'
      break
    case 'scss':
      text = palette.value.map((c, i) => `$color-${i + 1}: ${c.hex};`).join('\n')
      break
    case 'json':
      text = JSON.stringify(palette.value.map(c => ({ hex: c.hex, locked: c.locked })), null, 2)
      break
    case 'tailwind':
      text = 'colors: {\n' + palette.value.map((c, i) => `  'brand-${i + 1}': '${c.hex}',`).join('\n') + '\n}'
      break
    case 'url':
      syncToUrl()
      text = window.location.href
      showToast(t('colorPaletteFull.toast.urlCopied'))
      break
    case 'png':
      showToast('PNG export coming soon')
      return
  }
  if (text) {
    navigator.clipboard.writeText(text)
    showToast(t('colorPaletteFull.toast.cssCopied'))
  }
  showExportModal.value = false
}

async function copyGradient() {
  try {
    await navigator.clipboard.writeText(gradientCss.value)
    showToast(t('colorPaletteFull.toast.cssCopied'))
  } catch { /* silent */ }
}

function showToast(msg: string) {
  if (toastTimer) clearTimeout(toastTimer)
  toastMessage.value = msg
  toastTimer = setTimeout(() => { toastMessage.value = null }, 2500)
}

// Color utilities for shades/tints
function generateTints(hex: string, count: number): string[] {
  const { h, s, l } = hexToHsl(hex)
  return Array.from({ length: count }, (_, i) => {
    const newL = l + ((95 - l) / count) * (i + 1)
    return hslToHex(h, s * 0.8, newL)
  })
}

function generateShades(hex: string, count: number): string[] {
  const { h, s, l } = hexToHsl(hex)
  return Array.from({ length: count }, (_, i) => {
    const newL = l - (l / count) * (i + 1)
    return hslToHex(h, Math.min(s + 10, 90), newL)
  })
}

function generateTones(hex: string, count: number): string[] {
  const { h, s, l } = hexToHsl(hex)
  return Array.from({ length: count }, (_, i) => {
    const newS = s - (s / count) * (i + 1)
    return hslToHex(h, Math.max(newS, 5), l)
  })
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const cleaned = hex.replace('#', '')
  const r = parseInt(cleaned.substring(0, 2), 16) / 255
  const g = parseInt(cleaned.substring(2, 4), 16) / 255
  const b = parseInt(cleaned.substring(4, 6), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToHex(h: number, s: number, l: number): string {
  s = Math.max(0, Math.min(100, s)) / 100
  l = Math.max(0, Math.min(100, l)) / 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase()
}

function getContrastColor(hex: string): string {
  const { l } = hexToHsl(hex)
  return l > 50 ? '#000000' : '#FFFFFF'
}

// Keyboard shortcuts
function handleKeydown(e: KeyboardEvent) {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

  if (e.code === 'Space') {
    e.preventDefault()
    generate()
  } else if (e.key === 'c' && !e.metaKey && !e.ctrlKey) {
    // Copy all colors
    const text = palette.value.map(c => c.hex).join(' ')
    navigator.clipboard.writeText(text)
    showToast(t('colorPaletteFull.toast.copied'))
  } else if (e.key === 'l') {
    // Toggle lock on first unlocked or first color
    const firstUnlocked = palette.value.findIndex(c => !c.locked)
    if (firstUnlocked >= 0) lockToggle(firstUnlocked)
  } else if (e.key === 'g') {
    showGradientModal.value = !showGradientModal.value
  } else if (e.key === 'e') {
    showExportModal.value = !showExportModal.value
  } else if (e.key === 'Escape') {
    showExportModal.value = false
    showGradientModal.value = false
    showShadesPanel.value = false
    showHarmonyMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  // Close harmony menu on outside click
  document.addEventListener('click', (e) => {
    if (showHarmonyMenu.value) {
      const menu = document.querySelector('.cpf-harmony-selector')
      if (menu && !menu.contains(e.target as Node)) {
        showHarmonyMenu.value = false
      }
    }
  })
})
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* Full-screen container */
.cpf-fullscreen {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: var(--gi-bg);
  overflow: hidden;
}

/* Toolbar */
.cpf-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  background: var(--gi-surface);
  border-bottom: 1px solid var(--gi-border);
  box-shadow: var(--gi-shadow-sm);
  transform: translateY(-100%);
  transition: transform 0.3s var(--gi-ease-out);
}

.cpf-toolbar--visible {
  transform: translateY(0);
}

.cpf-toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.cpf-back-btn {
  display: flex;
  align-items: center;
  padding: 0.375rem;
  color: var(--gi-text-muted);
  border-radius: var(--gi-radius-md);
  transition: color 0.15s, background 0.15s;
}

.cpf-back-btn:hover {
  color: var(--gi-text);
  background: var(--gi-bg);
}

/* Harmony selector */
.cpf-harmony-selector {
  position: relative;
}

.cpf-harmony-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: var(--gi-bg);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  font-size: var(--gi-font-size-sm);
  font-weight: 500;
  color: var(--gi-text);
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.cpf-harmony-btn:hover {
  border-color: var(--gi-brand);
  box-shadow: var(--gi-shadow-sm);
}

.cpf-chevron {
  transition: transform 0.2s var(--gi-ease-out);
}

.cpf-chevron--open {
  transform: rotate(180deg);
}

.cpf-harmony-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  box-shadow: var(--gi-shadow-lg);
  min-width: 200px;
  overflow: hidden;
  z-index: 200;
}

.cpf-harmony-option {
  display: block;
  width: 100%;
  padding: 0.625rem 1rem;
  text-align: left;
  background: none;
  border: none;
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text);
  cursor: pointer;
  transition: background 0.1s;
}

.cpf-harmony-option:hover {
  background: var(--gi-bg);
}

.cpf-harmony-option--active {
  background: var(--gi-brand-fade);
  color: var(--gi-brand);
  font-weight: 600;
}

/* Toolbar right */
.cpf-toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cpf-tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--gi-bg);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  color: var(--gi-text-muted);
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.cpf-tool-btn:hover {
  color: var(--gi-text);
  border-color: var(--gi-brand);
}

.cpf-generate-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  background: var(--gi-brand);
  color: #fff;
  border: none;
  border-radius: var(--gi-radius-md);
  font-weight: 600;
  font-size: var(--gi-font-size-sm);
  cursor: pointer;
  min-height: 44px;
  transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
  box-shadow: 0 1px 3px rgba(10, 170, 142, 0.3);
}

.cpf-generate-btn:hover {
  background: #089678;
  box-shadow: 0 2px 6px rgba(10, 170, 142, 0.4);
}

.cpf-generate-btn:active {
  transform: scale(0.97);
}

.cpf-generate-text {
  display: none;
}

@media (min-width: 640px) {
  .cpf-generate-text {
    display: inline;
  }
}

/* Color columns */
.cpf-columns {
  display: flex;
  flex: 1;
  min-height: 0;
}

.cpf-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  position: relative;
  cursor: pointer;
  transition: flex 0.3s var(--gi-ease-out);
}

.cpf-column:hover {
  flex: 1.2;
}

.cpf-column--flash {
  animation: cpf-flash 0.3s ease-out;
}

@keyframes cpf-flash {
  0% { filter: brightness(1.5); }
  100% { filter: brightness(1); }
}

/* Lock icon */
.cpf-column-icon {
  padding-top: 1.5rem;
  opacity: 0;
  transition: opacity 0.2s;
  color: white;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.cpf-column--locked .cpf-column-icon {
  opacity: 1;
}

.cpf-column:hover .cpf-column-icon {
  opacity: 0.7;
}

/* Color info */
.cpf-column-info {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.cpf-color-value {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
  border: none;
  border-radius: var(--gi-radius-md);
  padding: 0.375rem 0.75rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  cursor: pointer;
  transition: background 0.15s;
}

.cpf-color-value:hover {
  background: rgba(0, 0, 0, 0.35);
}

.cpf-color-actions {
  display: flex;
  gap: 0.375rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.cpf-column:hover .cpf-color-actions {
  opacity: 1;
}

.cpf-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
  border: none;
  border-radius: var(--gi-radius-sm);
  color: white;
  cursor: pointer;
  transition: background 0.15s;
}

.cpf-action-btn:hover {
  background: rgba(0, 0, 0, 0.4);
}

/* Shades panel */
.cpf-shades-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--gi-surface);
  border-top: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-xl) var(--gi-radius-xl) 0 0;
  box-shadow: var(--gi-shadow-lg);
  z-index: 150;
  padding: 1.25rem;
}

.cpf-shades-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.cpf-shades-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: var(--gi-font-size-sm);
  font-weight: 600;
  color: var(--gi-text);
  margin: 0;
}

.cpf-shades-swatch {
  width: 32px;
  height: 32px;
  border-radius: var(--gi-radius-md);
  box-shadow: var(--gi-shadow-sm);
}

.cpf-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  color: var(--gi-text-muted);
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.cpf-close-btn:hover {
  color: var(--gi-text);
  border-color: var(--gi-text-muted);
}

.cpf-shades-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cpf-shades-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.cpf-shades-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gi-text-muted);
  min-width: 3rem;
}

.cpf-shades-row {
  display: flex;
  gap: 0.375rem;
  flex: 1;
}

.cpf-shade-cell {
  flex: 1;
  height: 48px;
  border-radius: var(--gi-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.1s;
}

.cpf-shade-cell:hover {
  transform: scale(1.05);
}

.cpf-shade-label {
  font-size: 0.6rem;
  font-weight: 600;
  font-family: monospace;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Modals */
.cpf-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
}

.cpf-modal {
  background: var(--gi-surface);
  border-radius: var(--gi-radius-xl);
  box-shadow: var(--gi-shadow-xl);
  min-width: 320px;
  max-width: 480px;
  width: 90%;
  max-height: 80vh;
  overflow: auto;
}

.cpf-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.25rem 0.75rem;
  border-bottom: 1px solid var(--gi-border);
}

.cpf-modal-title {
  font-size: var(--gi-font-size-lg);
  font-weight: 700;
  color: var(--gi-text);
  margin: 0;
}

.cpf-modal-body {
  padding: 1.25rem;
}

/* Export grid */
.cpf-export-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.cpf-export-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--gi-bg);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  font-size: var(--gi-font-size-sm);
  font-weight: 500;
  color: var(--gi-text);
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s;
}

.cpf-export-card:hover {
  border-color: var(--gi-brand);
  box-shadow: var(--gi-shadow-sm);
  transform: translateY(-1px);
}

/* Gradient modal */
.cpf-modal--gradient {
  min-width: 400px;
}

.cpf-gradient-type-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.cpf-gradient-type-btn {
  flex: 1;
  padding: 0.5rem;
  background: var(--gi-bg);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.cpf-gradient-type-btn--active {
  background: var(--gi-brand-fade);
  border-color: var(--gi-brand);
  color: var(--gi-brand);
  font-weight: 600;
}

.cpf-gradient-preview {
  width: 100%;
  height: 120px;
  border-radius: var(--gi-radius-lg);
  margin-bottom: 1rem;
}

.cpf-gradient-code {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--gi-bg);
  border-radius: var(--gi-radius-md);
  padding: 0.75rem 1rem;
}

.cpf-gradient-code code {
  flex: 1;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.8rem;
  color: var(--gi-text);
  word-break: break-all;
}

.cpf-copy-code-btn {
  display: flex;
  align-items: center;
  padding: 0.375rem;
  background: none;
  border: none;
  color: var(--gi-text-muted);
  cursor: pointer;
  transition: color 0.15s;
}

.cpf-copy-code-btn:hover {
  color: var(--gi-brand);
}

/* Toast */
.cpf-toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--gi-surface);
  color: var(--gi-text);
  border-radius: var(--gi-radius-pill);
  box-shadow: var(--gi-shadow-lg);
  font-size: var(--gi-font-size-sm);
  font-weight: 500;
  z-index: 500;
  border: 1px solid var(--gi-border);
}

/* Keyboard shortcuts hint */
.cpf-shortcuts-hint {
  position: fixed;
  bottom: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-pill);
  font-size: 0.7rem;
  color: var(--gi-text-muted);
  z-index: 50;
  white-space: nowrap;
}

.cpf-shortcuts-hint kbd {
  display: inline-block;
  padding: 0.125rem 0.375rem;
  background: var(--gi-bg);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-sm);
  font-family: monospace;
  font-size: 0.65rem;
  font-weight: 600;
}

.cpf-shortcuts-divider {
  color: var(--gi-border);
}

/* Transitions */
.cpf-slide-up-enter-active,
.cpf-slide-up-leave-active {
  transition: transform 0.3s var(--gi-ease-out), opacity 0.3s;
}

.cpf-slide-up-enter-from,
.cpf-slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.cpf-fade-enter-active,
.cpf-fade-leave-active {
  transition: opacity 0.2s var(--gi-ease-out);
}

.cpf-fade-enter-from,
.cpf-fade-leave-to {
  opacity: 0;
}

.cpf-toast-enter-active,
.cpf-toast-leave-active {
  transition: opacity 0.2s, transform 0.2s var(--gi-ease-out);
}

.cpf-toast-enter-from,
.cpf-toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

/* Mobile responsive */
@media (max-width: 640px) {
  .cpf-columns {
    flex-direction: column;
  }

  .cpf-column {
    min-height: 120px;
  }

  .cpf-shades-row {
    flex-wrap: wrap;
  }

  .cpf-shade-cell {
    min-height: 36px;
    flex: 1 1 calc(33.333% - 0.25rem);
  }

  .cpf-export-grid {
    grid-template-columns: 1fr;
  }

  .cpf-modal {
    min-width: auto;
    width: 95%;
    margin: 1rem;
  }

  .cpf-shortcuts-hint {
    display: none;
  }
}

/* Dark mode adjustments */
[data-theme="dark"] .cpf-color-value {
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.7);
}

[data-theme="dark"] .cpf-shade-label {
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}

/* Accessibility: prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .cpf-column,
  .cpf-shade-cell,
  .cpf-export-card {
    transition: none;
  }

  .cpf-slide-up-enter-active,
  .cpf-slide-up-leave-active,
  .cpf-fade-enter-active,
  .cpf-fade-leave-active,
  .cpf-toast-enter-active,
  .cpf-toast-leave-active {
    transition: opacity 0.1s;
  }
}
</style>
```

**Step 4: Add route**

```typescript
// Add to src/router/index.ts (after the existing color-palette route):
{ path: '/color-palette-full', component: () => import('../views/ColorPaletteFullView.vue') },
```

**Step 5: Build + manual test**
```bash
npm run build
npm run dev
# Open http://localhost:5173/tools/#/color-palette-full
# Test: Space=generate, click columns to lock, harmony dropdown, export modal, gradient modal, shades panel
```

**Step 6: Commit**
```bash
git add src/views/ColorPaletteFullView.vue src/router/index.ts src/i18n/fr.ts src/i18n/en.ts
git commit -m "feat: add full-screen Coolors-style palette view"
```

---

## Phase 2: Image Color Extraction

### Task 4: Image Extraction Composable

**Files:**
- Create: `src/composables/useImageExtraction.ts`
- Test: `src/composables/__tests__/useImageExtraction.test.ts`

**Step 1: Write the failing test**

```typescript
// src/composables/__tests__/useImageExtraction.test.ts
import { describe, it, expect } from 'vitest'
import { extractColorsFromCanvas, samplePixel } from '../useImageExtraction'

describe('extractColorsFromCanvas', () => {
  it('returns correct number of colors', () => {
    // Create a simple canvas with known colors
    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 100
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#FF0000'
    ctx.fillRect(0, 0, 50, 100)
    ctx.fillStyle = '#0000FF'
    ctx.fillRect(50, 0, 50, 100)

    const colors = extractColorsFromCanvas(canvas, 2)
    expect(colors.length).toBeLessThanOrEqual(2)
  })

  it('handles empty canvas gracefully', () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const colors = extractColorsFromCanvas(canvas, 5)
    expect(colors.length).toBe(1)
  })

  it('extracted colors are valid hex', () => {
    const canvas = document.createElement('canvas')
    canvas.width = 10
    canvas.height = 10
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#0aaa8e'
    ctx.fillRect(0, 0, 10, 10)
    const colors = extractColorsFromCanvas(canvas, 3)
    colors.forEach(c => expect(c).toMatch(/^#[0-9A-F]{6}$/))
  })
})
```

**Step 2: Run test to verify it fails**
```bash
npm test -- useImageExtraction.test.ts
# Expected: FAIL — module not found
```

**Step 3: Write minimal implementation**

```typescript
// src/composables/useImageExtraction.ts
export function extractColorsFromCanvas(canvas: HTMLCanvasElement, count: number): string[] {
  const ctx = canvas.getContext('2d')
  if (!ctx) return []

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const colorMap = new Map<string, number>()

  // Sample pixels at regular intervals
  const step = Math.max(1, Math.floor(Math.sqrt(data.length / 4 / 5000)))
  for (let i = 0; i < data.length; i += step * 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    if (a < 128) continue // Skip transparent

    // Quantize to reduce color space
    const qr = Math.round(r / 16) * 16
    const qg = Math.round(g / 16) * 16
    const qb = Math.round(b / 16) * 16
    const key = `${qr},${qg},${qb}`
    colorMap.set(key, (colorMap.get(key) || 0) + 1)
  }

  // Sort by frequency and take top colors
  const sorted = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)

  return sorted.map(([key]) => {
    const [r, g, b] = key.split(',').map(Number)
    return rgbToHex(r, g, b)
  })
}

export function samplePixel(canvas: HTMLCanvasElement, x: number, y: number): string {
  const ctx = canvas.getContext('2d')
  if (!ctx) return '#000000'
  const pixel = ctx.getImageData(x, y, 1, 1).data
  return rgbToHex(pixel[0], pixel[1], pixel[2])
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`
}
```

**Step 4: Run test to verify it passes**
```bash
npm test -- useImageExtraction.test.ts
# Expected: PASS (3 tests)
```

**Step 5: Commit**
```bash
git add src/composables/useImageExtraction.ts src/composables/__tests__/useImageExtraction.test.ts
git commit -m "feat: add image color extraction composable"
```

---

### Task 5: Image Upload Button in Full-Screen View

**Files:**
- Modify: `src/views/ColorPaletteFullView.vue` — add image upload button and drop zone overlay

**Step 1: Add image upload UI to the view**

In the toolbar, add an upload button:
```vue
<!-- In cpf-toolbar-right, before generate button -->
<label class="cpf-tool-btn cpf-upload-btn" :aria-label="'Extraire depuis une image'">
  <ImageUp :size="16" />
  <input type="file" accept="image/*" class="cpf-upload-input" @change="handleImageUpload" hidden />
</label>
```

Add to imports:
```typescript
import { ImageUp } from 'lucide-vue-next'
```

Add handler:
```typescript
async function handleImageUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = Math.min(img.width, 500)
    canvas.height = Math.min(img.height, 500)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const colors = extractColorsFromCanvas(canvas, 5)
    if (colors.length > 0) {
      palette.value = colors.map(hex => ({ hex, locked: false }))
      syncToUrl()
      showToast('Palette extraite !')
    }
  }
  img.src = URL.createObjectURL(file)
  // Reset input
  ;(e.target as HTMLInputElement).value = ''
}
```

**Step 2: Build + manual test**
```bash
npm run build
# Upload an image — palette should update with extracted colors
```

**Step 3: Commit**
```bash
git add src/views/ColorPaletteFullView.vue
git commit -m "feat: add image upload for color extraction"
```

---

## Phase 3: Contrast Checker Integration

### Task 6: WCAG Contrast Checker for Each Color

**Files:**
- Modify: `src/composables/useColorPalette.ts` — add `getContrastRatio()` function
- Modify: `src/views/ColorPaletteFullView.vue` — add contrast display on hover/click

**Step 1: Add contrast utility**

```typescript
// Add to useColorPalette.ts
export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1)
  const l2 = relativeLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}
```

**Step 2: Add contrast display in full-screen view**

In the shades panel, add a contrast section showing ratio against white and black:
```vue
<!-- In shades panel, after the shades rows -->
<div class="cpf-contrast-section">
  <span class="cpf-shades-label">{{ t('colorPaletteFull.contrast.label') }}</span>
  <div class="cpf-contrast-row">
    <div class="cpf-contrast-item" :style="{ background: '#FFFFFF' }">
      <span class="cpf-contrast-text" :style="{ color: selectedColor?.hex }">Aa</span>
      <span class="cpf-contrast-ratio">{{ contrastOnWhite.toFixed(1) }}:1</span>
      <span class="cpf-contrast-badge" :class="contrastOnWhite >= 4.5 ? 'cpf-contrast-badge--pass' : 'cpf-contrast-badge--fail'">
        {{ contrastOnWhite >= 4.5 ? 'AA' : '—' }}
      </span>
    </div>
    <div class="cpf-contrast-item" :style="{ background: '#000000' }">
      <span class="cpf-contrast-text" :style="{ color: selectedColor?.hex }">Aa</span>
      <span class="cpf-contrast-ratio">{{ contrastOnBlack.toFixed(1) }}:1</span>
      <span class="cpf-contrast-badge" :class="contrastOnBlack >= 4.5 ? 'cpf-contrast-badge--pass' : 'cpf-contrast-badge--fail'">
        {{ contrastOnBlack >= 4.5 ? 'AA' : '—' }}
      </span>
    </div>
  </div>
</div>
```

Add computed values:
```typescript
import { getContrastRatio } from '../composables/useColorPalette'

const contrastOnWhite = computed(() => {
  if (!selectedColor.value) return 1
  return getContrastRatio(selectedColor.value.hex, '#FFFFFF')
})

const contrastOnBlack = computed(() => {
  if (!selectedColor.value) return 1
  return getContrastRatio(selectedColor.value.hex, '#000000')
})
```

Add CSS for contrast section:
```css
.cpf-contrast-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--gi-border);
}

.cpf-contrast-row {
  display: flex;
  gap: 0.5rem;
  flex: 1;
}

.cpf-contrast-item {
  flex: 1;
  padding: 0.5rem;
  border-radius: var(--gi-radius-md);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid var(--gi-border);
}

.cpf-contrast-text {
  font-size: 1.25rem;
  font-weight: 700;
}

.cpf-contrast-ratio {
  font-size: 0.75rem;
  font-family: monospace;
  color: var(--gi-text-muted);
}

.cpf-contrast-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.125rem 0.375rem;
  border-radius: var(--gi-radius-sm);
}

.cpf-contrast-badge--pass {
  background: var(--gi-brand-fade);
  color: var(--gi-brand);
}

.cpf-contrast-badge--fail {
  background: var(--gi-tint-red-bg);
  color: var(--gi-tint-red-text);
}
```

**Step 3: Build + manual test**
```bash
npm run build
# Open shades panel — check contrast ratios are accurate
```

**Step 4: Commit**
```bash
git add src/composables/useColorPalette.ts src/views/ColorPaletteFullView.vue
git commit -m "feat: add WCAG contrast checker to palette colors"
```

---

## Phase 4: Polish + Dark Mode + Accessibility

### Task 7: Full Dark Mode Support

**Files:**
- Modify: `src/views/ColorPaletteFullView.vue` — add dark mode styles

**Step 1: Add dark mode CSS overrides**

```css
[data-theme="dark"] .cpf-toolbar {
  background: var(--gi-surface-dark, #1a1a1a);
  border-color: var(--gi-border-dark, #333);
}

[data-theme="dark"] .cpf-column-info {
  background: rgba(0, 0, 0, 0.4);
}

[data-theme="dark"] .cpf-shades-panel {
  background: var(--gi-surface-dark, #1a1a1a);
  border-color: var(--gi-border-dark, #333);
}

[data-theme="dark"] .cpf-modal {
  background: var(--gi-surface-dark, #1a1a1a);
  border-color: var(--gi-border-dark, #333);
}

[data-theme="dark"] .cpf-harmony-menu {
  background: var(--gi-surface-dark, #1a1a1a);
  border-color: var(--gi-border-dark, #333);
}

[data-theme="dark"] .cpf-shortcuts-hint {
  background: var(--gi-surface-dark, #1a1a1a);
  border-color: var(--gi-border-dark, #333);
}

[data-theme="dark"] .cpf-toast {
  background: var(--gi-surface-dark, #1a1a1a);
  border-color: var(--gi-border-dark, #333);
}
```

**Step 2: Build + manual test in dark mode**
```bash
npm run build
npm run dev
# Toggle dark mode — verify all panels, modals, and text are readable
```

**Step 3: Commit**
```bash
git add src/views/ColorPaletteFullView.vue
git commit -m "style: add dark mode support to full-screen palette view"
```

---

### Task 8: Accessibility Pass

**Files:**
- Modify: `src/views/ColorPaletteFullView.vue`

**Step 1: Add focus trapping to modals**

Use a simple focus trap utility:
```typescript
function trapFocus(element: HTMLElement) {
  const focusable = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  if (focusable.length === 0) return
  const first = focusable[0] as HTMLElement
  const last = focusable[focusable.length - 1] as HTMLElement
  first.focus()
  element.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  })
}
```

**Step 2: Add aria-live for toast, ensure all buttons have labels**

Already done in the template above.

**Step 3: Add `prefers-reduced-motion` support**

Already in CSS above.

**Step 4: Commit**
```bash
git add src/views/ColorPaletteFullView.vue
git commit -m "a11y: add focus trapping, aria labels, reduced motion support"
```

---

## Phase 5: Migrate Route + Cleanup

### Task 9: Make Full-Screen View the Default

**Files:**
- Modify: `src/router/index.ts`
- Modify: `src/views/HomeView.vue`

**Step 1: Update route**

```typescript
// Change the color-palette route to point to the new view:
{ path: '/color-palette', component: () => import('../views/ColorPaletteFullView.vue') },
// Keep the old view under a different path for reference:
{ path: '/color-palette-classic', component: () => import('../views/ColorPaletteView.vue') },
```

**Step 2: Build + verify**
```bash
npm run build
npm test
# All 239 tests should still pass
```

**Step 3: Commit**
```bash
git add src/router/index.ts
git commit -m "feat: make full-screen palette view the default color-palette route"
```

---

## Summary of Files Created/Modified

| Phase | File | Action |
|-------|------|--------|
| 1 | `src/composables/useColorHarmony.ts` | Create |
| 1 | `src/composables/__tests__/useColorHarmony.test.ts` | Create |
| 1 | `src/composables/useColorPalette.ts` | Modify (add `usePaletteState`) |
| 1 | `src/composables/__tests__/useColorPalette.test.ts` | Modify (add tests) |
| 1 | `src/views/ColorPaletteFullView.vue` | Create |
| 1 | `src/router/index.ts` | Modify (add route) |
| 1 | `src/i18n/fr.ts` | Modify (add keys) |
| 1 | `src/i18n/en.ts` | Modify (add keys) |
| 2 | `src/composables/useImageExtraction.ts` | Create |
| 2 | `src/composables/__tests__/useImageExtraction.test.ts` | Create |
| 2 | `src/views/ColorPaletteFullView.vue` | Modify (add upload) |
| 3 | `src/composables/useColorPalette.ts` | Modify (add contrast) |
| 3 | `src/views/ColorPaletteFullView.vue` | Modify (add contrast UI) |
| 4 | `src/views/ColorPaletteFullView.vue` | Modify (dark mode) |
| 4 | `src/views/ColorPaletteFullView.vue` | Modify (a11y) |
| 5 | `src/router/index.ts` | Modify (swap routes) |

**Total estimated commits:** 9 (one per task)
**Total new files:** 5
**Total modified files:** 6

---

## Pre-Delivery Checklist

- [ ] Build passes (`npm run build`)
- [ ] All tests pass (`npm test` — 239+ tests)
- [ ] Full-screen layout works on desktop (1920px, 1440px, 1024px)
- [ ] Mobile layout works (375px) — columns stack vertically
- [ ] Dark mode fully tested — all panels, modals, text readable
- [ ] Keyboard shortcuts work: Space, C, L, G, E, Esc
- [ ] URL sync works — palette persists in URL, can be shared
- [ ] Image extraction works with various image types
- [ ] Harmony algorithms produce beautiful, varied palettes
- [ ] Shades/tints/tones are useful and well-calculated
- [ ] Contrast ratios are accurate (verified against WebAIM calculator)
- [ ] Export formats produce valid output (CSS, SCSS, JSON, Tailwind)
- [ ] Gradient CSS is valid
- [ ] Focus trapping works in modals
- [ ] `prefers-reduced-motion` respected
- [ ] All buttons have aria-labels
- [ ] Toast messages are announced via aria-live
