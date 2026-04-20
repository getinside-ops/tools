# Color Palette — Coolors-Style Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix locking bugs, overhaul palette generation for beautiful results, and redesign both views to match the coolors.co interaction model (hover actions, add/remove colors, drag-to-reorder, inline color picker).

**Architecture:** Extract shared `generateWithHarmony()` to the composable layer so both views and tests share one implementation. Rewrite `useColorHarmony.ts` with a lightness-spread archetype (light → dark, not all-same). Both views get a hover-overlay interaction model replacing click-to-lock, plus HTML5 drag-to-reorder and variable palette size (3–8 colors).

**Tech Stack:** Vue 3 Composition API, TypeScript, Vitest, Lucide icons (`GripVertical`, `Info`, `Trash2`, `Plus`), native `<input type="color">`, native HTML5 drag events — no new npm dependencies.

---

## File Map

| File | Change |
|---|---|
| `src/composables/useColorPalette.ts` | Add `generateWithHarmony()` |
| `src/composables/useColorHarmony.ts` | Rewrite `random-beautiful`, spread lightness in all harmonies |
| `src/composables/__tests__/useColorPalette.test.ts` | Add tests for `generateWithHarmony` |
| `src/composables/__tests__/useColorHarmony.test.ts` | Add tests for lightness spread + variable count |
| `src/i18n/fr.ts` | Add `addColor`, `deleteColor` |
| `src/i18n/en.ts` | Add `addColor`, `deleteColor` |
| `src/views/ColorPaletteView.vue` | Full interaction overhaul |
| `src/views/ColorPaletteFullscreenView.vue` | Full interaction overhaul |

---

## Task 1: Add `generateWithHarmony` composable function + fix locking

**Files:**
- Modify: `src/composables/useColorPalette.ts`
- Modify: `src/composables/__tests__/useColorPalette.test.ts`
- Modify: `src/views/ColorPaletteView.vue`
- Modify: `src/views/ColorPaletteFullscreenView.vue`

- [ ] **Step 1: Write the failing tests**

Add to `src/composables/__tests__/useColorPalette.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { generatePalette, toggleLock, initPalette, generateWithHarmony, usePaletteState } from '../useColorPalette'
import type { PaletteColor } from '../useColorPalette'

// ... existing tests unchanged above ...

describe('generateWithHarmony', () => {
  it('returns palette unchanged when all colors are locked', () => {
    const palette: PaletteColor[] = [
      { hex: '#AAAAAA', locked: true },
      { hex: '#BBBBBB', locked: true },
      { hex: '#CCCCCC', locked: true },
    ]
    const result = generateWithHarmony(palette, 'random-beautiful')
    expect(result[0].hex).toBe('#AAAAAA')
    expect(result[1].hex).toBe('#BBBBBB')
    expect(result[2].hex).toBe('#CCCCCC')
  })

  it('preserves locked colors and changes unlocked ones', () => {
    const palette: PaletteColor[] = [
      { hex: '#AAAAAA', locked: true },
      { hex: '#BBBBBB', locked: false },
      { hex: '#CCCCCC', locked: true },
      { hex: '#DDDDDD', locked: false },
      { hex: '#EEEEEE', locked: false },
    ]
    const result = generateWithHarmony(palette, 'analogous')
    expect(result[0].hex).toBe('#AAAAAA')
    expect(result[2].hex).toBe('#CCCCCC')
    expect(result[0].locked).toBe(true)
    expect(result[2].locked).toBe(true)
  })

  it('returns valid uppercase hex for all positions', () => {
    const palette: PaletteColor[] = Array(5).fill(null).map(() => ({ hex: '#123456', locked: false }))
    generateWithHarmony(palette, 'analogous').forEach(c => {
      expect(c.hex).toMatch(/^#[0-9A-F]{6}$/)
    })
  })

  it('works for palette counts other than 5', () => {
    const palette3: PaletteColor[] = Array(3).fill(null).map(() => ({ hex: '#FF0000', locked: false }))
    expect(generateWithHarmony(palette3, 'analogous')).toHaveLength(3)

    const palette7: PaletteColor[] = Array(7).fill(null).map(() => ({ hex: '#FF0000', locked: false }))
    expect(generateWithHarmony(palette7, 'triadic')).toHaveLength(7)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
rtk npm test -- --reporter=verbose useColorPalette
```

Expected: FAIL — `generateWithHarmony is not a function`

- [ ] **Step 3: Add `generateWithHarmony` to `useColorPalette.ts`**

At the top of `src/composables/useColorPalette.ts`, add:
```ts
import { generateHarmony, type HarmonyType } from './useColorHarmony'
```

Add this function after `toggleLock`:
```ts
export function generateWithHarmony(
  palette: PaletteColor[],
  harmonyType: HarmonyType
): PaletteColor[] {
  const unlockedIndices = palette.reduce<number[]>((acc, c, i) => {
    if (!c.locked) acc.push(i)
    return acc
  }, [])
  if (unlockedIndices.length === 0) return palette
  const base = palette[unlockedIndices[0]].hex
  const newColors = generateHarmony(base, harmonyType, palette.length)
  let newIdx = 0
  return palette.map(c => c.locked ? c : { ...c, hex: newColors[newIdx++] })
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
rtk npm test -- --reporter=verbose useColorPalette
```

Expected: all `generateWithHarmony` tests PASS

- [ ] **Step 5: Replace `generate()` in `ColorPaletteView.vue`**

Find the existing `generate()` function (around line 315) and replace it entirely:

```ts
function generate() {
  palette.value = generateWithHarmony(palette.value, harmonyType.value as HarmonyType)
  syncToUrl()
}
```

Also update the import at the top of the `<script setup>` to include `generateWithHarmony`:
```ts
import { toggleLock as paletteToggleLock, usePaletteState, getContrastRatio, getColorFormats, adjustColor, updateColor, initPalette, generateWithHarmony } from '../composables/useColorPalette'
```

Remove the import of `generateHarmony` from `useColorHarmony` since the view no longer needs it directly:
```ts
// Remove this line:
import { generateHarmony, type HarmonyType } from '../composables/useColorHarmony'
// Keep only the type:
import type { HarmonyType } from '../composables/useColorHarmony'
```

- [ ] **Step 6: Replace `generate()` in `ColorPaletteFullscreenView.vue`**

Find the existing `generate()` function (around line 369) and replace it entirely:

```ts
function generate() {
  palette.value = generateWithHarmony(palette.value, harmonyType.value as HarmonyType)
  syncToUrl()
}
```

Update imports in the fullscreen view:
```ts
import {
  toggleLock as paletteToggleLock,
  usePaletteState,
  getContrastRatio,
  generateWithHarmony,
} from '../composables/useColorPalette'
import type { HarmonyType } from '../composables/useColorHarmony'
```

Remove the direct `generateHarmony` import.

- [ ] **Step 7: Run full test suite**

```bash
rtk npm test
```

Expected: all tests pass

- [ ] **Step 8: Commit**

```bash
rtk git add src/composables/useColorPalette.ts src/composables/__tests__/useColorPalette.test.ts src/views/ColorPaletteView.vue src/views/ColorPaletteFullscreenView.vue
rtk git commit -m "fix: extract generateWithHarmony and fix all-locked palette bug"
```

---

## Task 2: Rewrite algorithm — beautiful palettes with lightness spread

**Files:**
- Modify: `src/composables/useColorHarmony.ts`
- Modify: `src/composables/__tests__/useColorHarmony.test.ts`

- [ ] **Step 1: Add failing tests**

Append to `src/composables/__tests__/useColorHarmony.test.ts`:

```ts
describe('lightness spread', () => {
  function hexToL(hex: string): number {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    return Math.round(((max + min) / 2) * 100)
  }

  it('random-beautiful has at least 40% lightness range across 5 colors', () => {
    // Run 10 times to avoid flakiness
    for (let t = 0; t < 10; t++) {
      const colors = generateHarmony('#0aaa8e', 'random-beautiful', 5)
      const lightnesses = colors.map(hexToL)
      const spread = Math.max(...lightnesses) - Math.min(...lightnesses)
      expect(spread).toBeGreaterThanOrEqual(40)
    }
  })

  it('monochromatic has at least 50% lightness range across 5 colors', () => {
    const colors = generateHarmony('#0aaa8e', 'monochromatic', 5)
    const lightnesses = colors.map(hexToL)
    const spread = Math.max(...lightnesses) - Math.min(...lightnesses)
    expect(spread).toBeGreaterThanOrEqual(50)
  })

  it('generates correct count for non-default sizes', () => {
    (['random-beautiful', 'analogous', 'triadic', 'monochromatic'] as const).forEach(type => {
      expect(generateHarmony('#FF0000', type, 3)).toHaveLength(3)
      expect(generateHarmony('#FF0000', type, 7)).toHaveLength(7)
    })
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
rtk npm test -- --reporter=verbose useColorHarmony
```

Expected: the new lightness-spread tests FAIL

- [ ] **Step 3: Rewrite `useColorHarmony.ts`**

Replace the entire content of `src/composables/useColorHarmony.ts` with:

```ts
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
  h = ((h % 360) + 360) % 360
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

function jitter(range: number): number {
  return (Math.random() - 0.5) * range
}

// Maps t in [0,1] to lightness from ~87% (light) to ~18% (dark)
function spreadL(t: number): number {
  return Math.round(Math.max(10, Math.min(95, 87 - t * 69 + jitter(6))))
}

// Maps t in [0,1] to saturation that peaks in the vivid mid-range
function spreadS(t: number, baseSat: number): number {
  const peak = Math.max(baseSat, 65)
  const sat = peak - Math.abs(t - 0.5) * 90 + jitter(15)
  return Math.round(Math.max(15, Math.min(90, sat)))
}

export function generateHarmony(
  baseHex: string,
  type: HarmonyType,
  count: number = 5
): string[] {
  const base = hexToHsl(baseHex)
  const t = (i: number) => count === 1 ? 0.5 : i / (count - 1)

  switch (type) {
    case 'random-beautiful': {
      const baseHue = Math.floor(Math.random() * 360)
      return Array.from({ length: count }, (_, i) => {
        const ti = t(i)
        const h = ((baseHue + jitter(35) + 360) % 360)
        return hslToHex(h, spreadS(ti, 65), spreadL(ti))
      })
    }

    case 'analogous': {
      const step = 30
      const startH = base.h - Math.floor((count - 1) / 2) * step
      return Array.from({ length: count }, (_, i) => {
        const h = ((startH + i * step + 360) % 360)
        return hslToHex(h, spreadS(t(i), base.s), spreadL(t(i)))
      })
    }

    case 'complementary': {
      const half = Math.ceil(count / 2)
      const compHalf = count - half
      const baseGroup = Array.from({ length: half }, (_, i) => {
        const ti = t(i * (count - 1) / Math.max(half - 1, 1) * 0.5)
        const h = ((base.h + jitter(20) + 360) % 360)
        return hslToHex(h, spreadS(ti, base.s), spreadL(ti))
      })
      const compGroup = Array.from({ length: compHalf }, (_, i) => {
        const ti = 0.5 + t(i * (count - 1) / Math.max(compHalf - 1, 1) * 0.5) * 0.5
        const h = ((base.h + 180 + jitter(20) + 360) % 360)
        return hslToHex(h, spreadS(ti, base.s), spreadL(ti))
      })
      return [...baseGroup, ...compGroup]
    }

    case 'triadic': {
      const hues = [base.h, base.h + 120, base.h + 240]
      return Array.from({ length: count }, (_, i) => {
        const h = ((hues[i % 3] + jitter(15) + 360) % 360)
        return hslToHex(h, spreadS(t(i), base.s), spreadL(t(i)))
      })
    }

    case 'tetradic': {
      const hues = [base.h, base.h + 90, base.h + 180, base.h + 270, base.h + 45]
      return Array.from({ length: count }, (_, i) => {
        const h = ((hues[i % hues.length] + jitter(10) + 360) % 360)
        return hslToHex(h, spreadS(t(i), base.s), spreadL(t(i)))
      })
    }

    case 'split-complementary': {
      const hues = [base.h, base.h + 150, base.h + 210, base.h - 30, base.h + 30]
      return Array.from({ length: count }, (_, i) => {
        const h = ((hues[i % hues.length] + jitter(10) + 360) % 360)
        return hslToHex(h, spreadS(t(i), base.s), spreadL(t(i)))
      })
    }

    case 'monochromatic': {
      return Array.from({ length: count }, (_, i) => {
        const l = Math.round(90 - t(i) * 75)
        const s = Math.max(15, Math.min(90, base.s + jitter(10)))
        return hslToHex(base.h, s, l)
      })
    }

    default:
      return generateHarmony(baseHex, 'random-beautiful', count)
  }
}
```

- [ ] **Step 4: Run all tests**

```bash
rtk npm test -- --reporter=verbose useColorHarmony
```

Expected: all tests pass including the new lightness-spread tests.

Note: the existing `it('analogous colors are perceptually similar')` test checks hue spread ≤ 120° — this still passes since `step=30` × 4 = 120° max spread. The `it('complementary includes a color ~180 degrees from base')` test still passes since we use `base.h + 180 ± 20°` jitter (still within cyan range for red base).

- [ ] **Step 5: Run full test suite**

```bash
rtk npm test
```

Expected: all 227+ tests pass

- [ ] **Step 6: Commit**

```bash
rtk git add src/composables/useColorHarmony.ts src/composables/__tests__/useColorHarmony.test.ts
rtk git commit -m "feat: rewrite harmony algorithm with lightness-spread for beautiful palettes"
```

---

## Task 3: Add i18n keys for new UI

**Files:**
- Modify: `src/i18n/fr.ts`
- Modify: `src/i18n/en.ts`

- [ ] **Step 1: Add French keys**

In `src/i18n/fr.ts`, inside the `colorPalette` object (around line 496, after the `full` block closes), add inside `full:`:

```ts
// Inside colorPalette.full, after 'extract':
addColor: 'Ajouter une couleur',
deleteColor: 'Supprimer cette couleur',
pickColor: 'Choisir une couleur',
```

- [ ] **Step 2: Add English keys**

In `src/i18n/en.ts`, inside the equivalent `colorPalette.full` location:

```ts
addColor: 'Add color',
deleteColor: 'Delete this color',
pickColor: 'Pick a color',
```

- [ ] **Step 3: Commit**

```bash
rtk git add src/i18n/fr.ts src/i18n/en.ts
rtk git commit -m "feat: add i18n keys for palette add/delete/pick actions"
```

---

## Task 4: Main view — hover overlay, hex badge, inline picker, visual polish

**Files:**
- Modify: `src/views/ColorPaletteView.vue`

This task replaces the existing swatch interaction model. The swatch body no longer locks on click; all actions live in a hover overlay.

- [ ] **Step 1: Update `<script setup>` — new refs, new functions, updated imports**

At the top of `<script setup>`, add to the existing Lucide import:
```ts
import {
  Palette, Shuffle, Sparkles, ChevronDown, Copy, Lock, Unlock,
  RotateCcw, CheckCircle, Code, Braces, Wind, X, ImageUp,
  Maximize2, Download, Link as LinkIcon, RefreshCw,
  GripVertical, Info, Trash2, Plus,  // NEW
} from 'lucide-vue-next'
```

Add to the existing reactive state (below `const showGradientModal`):
```ts
const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)
const pickerRefs = ref<(HTMLInputElement | null)[]>([])
```

Replace `handleSwatchClick` entirely with these new functions:
```ts
function toggleLockAt(i: number) {
  palette.value = paletteToggleLock(palette.value, i)
  if (selectedIndex.value === i && palette.value[i].locked) selectedIndex.value = null
  syncToUrl()
}

function openDetail(i: number) {
  selectedIndex.value = selectedIndex.value === i ? null : i
  adjustments.value = { hue: 0, saturation: 0, lightness: 0 }
}

function addColorAt(i: number) {
  if (palette.value.length >= 8) return
  const neighbor = palette.value[Math.min(i, palette.value.length - 1)].hex
  const newColors = generateWithHarmony(
    [{ hex: neighbor, locked: false }],
    harmonyType.value as HarmonyType
  )
  const newPalette = [...palette.value]
  newPalette.splice(i, 0, { hex: newColors[0], locked: false })
  palette.value = newPalette
  syncToUrl()
}

function removeColor(i: number) {
  if (palette.value.length <= 3) return
  selectedIndex.value = null  // close detail panel — avoids stale index after splice
  palette.value = palette.value.filter((_, idx) => idx !== i)
  syncToUrl()
}

function openPicker(i: number) {
  pickerRefs.value[i]?.click()
}

function onPickerInput(e: Event, i: number) {
  const hex = (e.target as HTMLInputElement).value.toUpperCase()
  palette.value = updateColor(palette.value, i, hex)
}

function onDragStart(e: DragEvent, i: number) {
  dragIndex.value = i
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(i))
  }
}

function onDragOver(i: number) {
  if (dragIndex.value !== null && dragIndex.value !== i) dragOverIndex.value = i
}

function onDrop(i: number) {
  if (dragIndex.value === null || dragIndex.value === i) return
  const newPalette = [...palette.value]
  const [dragged] = newPalette.splice(dragIndex.value, 1)
  newPalette.splice(i, 0, dragged)
  palette.value = newPalette
  dragIndex.value = null
  dragOverIndex.value = null
  syncToUrl()
}

function onDragEnd() {
  dragIndex.value = null
  dragOverIndex.value = null
}
```

- [ ] **Step 2: Replace the palette template section**

Replace the entire `<!-- Color swatches -->` block (the `div.cp-palette` and its children) with:

```html
<!-- Color swatches -->
<div class="cp-palette-wrapper">
  <div class="cp-palette" role="group" :aria-label="t('colorPalette.title')">
    <template v-for="(color, i) in palette" :key="i">
      <!-- Add strip before each swatch -->
      <div
        v-if="palette.length < 8"
        class="cp-add-strip"
        @click="addColorAt(i)"
        :aria-label="t('colorPalette.full.addColor')"
        role="button"
        tabindex="0"
        @keydown.enter="addColorAt(i)"
      >
        <Plus :size="12" />
      </div>
      <!-- Swatch -->
      <div
        class="cp-swatch"
        :class="{
          'cp-swatch--locked': color.locked,
          'cp-swatch--flash': flashIndex === i,
          'cp-swatch--drag-over': dragOverIndex === i,
        }"
        :style="{ background: color.hex }"
        draggable="true"
        @dragstart="onDragStart($event, i)"
        @dragover.prevent="onDragOver(i)"
        @drop.prevent="onDrop(i)"
        @dragend="onDragEnd"
      >
        <!-- Hover overlay -->
        <div class="cp-swatch-overlay">
          <div class="cp-drag-handle"><GripVertical :size="16" /></div>
          <button
            class="cp-swatch-btn"
            @click.stop="toggleLockAt(i)"
            :aria-label="color.locked ? t('colorPalette.unlock') : t('colorPalette.lock')"
          >
            <Lock v-if="color.locked" :size="17" />
            <Unlock v-else :size="17" />
          </button>
          <div class="cp-swatch-action-row">
            <button class="cp-swatch-btn cp-swatch-btn--sm" @click.stop="copyColor(color.hex, i)" :aria-label="t('colorPalette.copied')">
              <Copy :size="15" />
            </button>
            <button class="cp-swatch-btn cp-swatch-btn--sm" @click.stop="openDetail(i)" :aria-label="t('colorPalette.selectedColor')">
              <Info :size="15" />
            </button>
            <button
              v-if="palette.length > 3"
              class="cp-swatch-btn cp-swatch-btn--sm cp-swatch-btn--delete"
              @click.stop="removeColor(i)"
              :aria-label="t('colorPalette.full.deleteColor')"
            >
              <Trash2 :size="15" />
            </button>
          </div>
        </div>
        <!-- Always-visible hex badge -->
        <div class="cp-swatch-hex" @click.stop="openPicker(i)">
          <span>{{ copiedIndex === i ? '✓' : color.hex }}</span>
          <input
            type="color"
            class="cp-picker-input"
            :ref="(el) => { pickerRefs[i] = el as HTMLInputElement }"
            :value="color.hex"
            @input="onPickerInput($event, i)"
            tabindex="-1"
            aria-hidden="true"
          />
        </div>
      </div>
    </template>
    <!-- Trailing add strip -->
    <div
      v-if="palette.length < 8"
      class="cp-add-strip"
      @click="addColorAt(palette.length)"
      :aria-label="t('colorPalette.full.addColor')"
      role="button"
      tabindex="0"
      @keydown.enter="addColorAt(palette.length)"
    >
      <Plus :size="12" />
    </div>
  </div>

  <!-- Detail panel — right-side overlay -->
  <Transition name="cp-detail-slide">
    <div v-if="selectedIndex !== null" class="cp-detail-overlay" role="dialog">
      <button class="cp-detail-close" @click="selectedIndex = null" :aria-label="t('colorPalette.full.keyboard.esc')">
        <X :size="16" />
      </button>
      <!-- (paste the existing detail panel content here — the cp-detail-header, cp-adjust, cp-contrast-section divs) -->
      <div class="cp-detail-header">
        <div class="cp-detail-swatch" :style="{ background: palette[selectedIndex].hex }"></div>
        <div class="cp-detail-info">
          <h3 class="cp-detail-title">{{ t('colorPalette.selectedColor') }}</h3>
          <div class="cp-format-row" @click="copyColor(formats.hex, selectedIndex)">
            <span class="cp-format-label">HEX</span>
            <code class="cp-format-value">{{ formats.hex }}</code>
            <Copy :size="14" class="cp-format-copy" />
          </div>
          <div class="cp-format-row" @click="copyColor(formats.rgb, selectedIndex)">
            <span class="cp-format-label">RGB</span>
            <code class="cp-format-value">{{ formats.rgb }}</code>
            <Copy :size="14" class="cp-format-copy" />
          </div>
          <div class="cp-format-row" @click="copyColor(formats.hsl, selectedIndex)">
            <span class="cp-format-label">HSL</span>
            <code class="cp-format-value">{{ formats.hsl }}</code>
            <Copy :size="14" class="cp-format-copy" />
          </div>
        </div>
      </div>
      <div class="cp-adjust">
        <h4 class="cp-adjust-title">{{ t('colorPalette.adjust') }}</h4>
        <div class="cp-slider-group">
          <label class="cp-slider-label">{{ t('colorPalette.hue') }}<span class="cp-slider-value">{{ adjustments.hue }}°</span></label>
          <input type="range" v-model.number="adjustments.hue" min="-180" max="180" step="1" class="cp-slider cp-slider--hue" />
        </div>
        <div class="cp-slider-group">
          <label class="cp-slider-label">{{ t('colorPalette.saturation') }}<span class="cp-slider-value">{{ adjustments.saturation > 0 ? '+' : '' }}{{ adjustments.saturation }}%</span></label>
          <input type="range" v-model.number="adjustments.saturation" min="-50" max="50" step="1" class="cp-slider" />
        </div>
        <div class="cp-slider-group">
          <label class="cp-slider-label">{{ t('colorPalette.lightness') }}<span class="cp-slider-value">{{ adjustments.lightness > 0 ? '+' : '' }}{{ adjustments.lightness }}%</span></label>
          <input type="range" v-model.number="adjustments.lightness" min="-50" max="50" step="1" class="cp-slider" />
        </div>
        <div class="cp-adjust-actions">
          <button class="cp-reset-btn" @click="resetAdjustments"><RotateCcw :size="14" />{{ t('colorPalette.reset') }}</button>
          <button class="cp-apply-btn" @click="applyAdjustments">{{ t('colorPalette.apply') }}</button>
        </div>
      </div>
      <div class="cp-contrast-section">
        <span class="cp-adjust-title" style="margin: 0;">Contraste WCAG</span>
        <div class="cp-contrast-row">
          <div class="cp-contrast-item" style="background: #FFFFFF;">
            <span class="cp-contrast-text" :style="{ color: palette[selectedIndex].hex }">Aa</span>
            <span class="cp-contrast-ratio">{{ contrastOnWhite.toFixed(1) }}:1</span>
            <span class="cp-contrast-badge" :class="contrastOnWhite >= 4.5 ? 'cp-contrast-badge--pass' : 'cp-contrast-badge--fail'">{{ contrastOnWhite >= 4.5 ? 'AA ✓' : '—' }}</span>
          </div>
          <div class="cp-contrast-item" style="background: #000000;">
            <span class="cp-contrast-text" :style="{ color: palette[selectedIndex].hex }">Aa</span>
            <span class="cp-contrast-ratio">{{ contrastOnBlack.toFixed(1) }}:1</span>
            <span class="cp-contrast-badge" :class="contrastOnBlack >= 4.5 ? 'cp-contrast-badge--pass' : 'cp-contrast-badge--fail'">{{ contrastOnBlack >= 4.5 ? 'AA ✓' : '—' }}</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</div>
```

Also **remove** the old `<!-- Selected color detail panel -->` block that previously existed below `.cp-palette` (it's now inside the wrapper above).

- [ ] **Step 3: Replace the swatch-related CSS**

Remove all old CSS rules for: `.cp-swatch`, `.cp-swatch-lock`, `.cp-swatch-hex`, `.cp-detail-panel`, `.cp-detail-header`, `.cp-detail-swatch`, `.cp-detail-info`, `.cp-detail-title`.

Add these new CSS rules in the `<style scoped>` section:

```css
/* Palette wrapper + overlay */
.cp-palette-wrapper { position: relative; margin-bottom: 1.5rem; }
.cp-detail-overlay {
  position: absolute; top: 0; right: 0; bottom: 0; width: 280px;
  background: var(--gi-surface); border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-xl); box-shadow: var(--gi-shadow-lg);
  overflow-y: auto; padding: 1.25rem; z-index: 10;
}
.cp-detail-close {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; background: var(--gi-bg); border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-sm); color: var(--gi-text-muted); cursor: pointer;
  margin-bottom: 0.75rem; transition: color 0.15s, border-color 0.15s;
}
.cp-detail-close:hover { color: var(--gi-text); border-color: var(--gi-text-muted); }
.cp-detail-slide-enter-active, .cp-detail-slide-leave-active {
  transition: transform 0.22s var(--gi-ease-out), opacity 0.22s;
}
.cp-detail-slide-enter-from, .cp-detail-slide-leave-to { transform: translateX(16px); opacity: 0; }

/* Palette row */
.cp-palette { display: flex; align-items: stretch; gap: 0; height: 400px; }

/* Add strip */
.cp-add-strip {
  display: flex; align-items: center; justify-content: center;
  width: 8px; flex-shrink: 0; cursor: pointer;
  color: var(--gi-text-muted); opacity: 0;
  border: 1px dashed transparent; border-radius: var(--gi-radius-sm);
  transition: width 0.18s var(--gi-ease-out), opacity 0.18s, border-color 0.18s;
}
.cp-palette:hover .cp-add-strip { opacity: 1; }
.cp-add-strip:hover {
  width: 36px; border-color: var(--gi-border); color: var(--gi-brand);
  background: var(--gi-brand-fade);
}

/* Swatch */
.cp-swatch {
  flex: 1; position: relative; border-radius: var(--gi-radius-lg); overflow: hidden;
  display: flex; flex-direction: column; justify-content: space-between;
  box-shadow: var(--gi-shadow-sm);
  transition: flex 0.22s var(--gi-ease-out), box-shadow 0.2s, transform 0.12s;
  cursor: default;
}
.cp-swatch:hover { flex: 1.3; box-shadow: var(--gi-shadow-md); transform: translateY(-2px); }
.cp-swatch:focus-visible { outline: 3px solid var(--gi-brand); outline-offset: 2px; z-index: 1; }
.cp-swatch--locked { outline: 2px solid rgba(255, 255, 255, 0.85); outline-offset: -2px; }
.cp-swatch--flash { animation: cp-flash 0.3s ease-out; }
.cp-swatch--drag-over { outline: 2px dashed rgba(255,255,255,0.8); outline-offset: -2px; }
@keyframes cp-flash { 0% { filter: brightness(1.8); } 100% { filter: brightness(1); } }

/* Hover overlay */
.cp-swatch-overlay {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: space-between;
  padding: 0.625rem 0.5rem;
  opacity: 0; transition: opacity 0.15s;
}
.cp-swatch:hover .cp-swatch-overlay { opacity: 1; }

.cp-drag-handle {
  color: white; cursor: grab; opacity: 0.8;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
}
.cp-drag-handle:active { cursor: grabbing; }

.cp-swatch-btn {
  display: flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; background: rgba(0,0,0,0.25); backdrop-filter: blur(6px);
  border: none; border-radius: var(--gi-radius-md); color: white; cursor: pointer;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  transition: background 0.12s;
}
.cp-swatch-btn:hover { background: rgba(0,0,0,0.45); }
.cp-swatch-btn--sm { width: 28px; height: 28px; border-radius: var(--gi-radius-sm); }
.cp-swatch-btn--delete:hover { background: rgba(200,30,30,0.5); }

.cp-swatch-action-row { display: flex; gap: 0.3rem; }

/* Hex badge (always visible) */
.cp-swatch-hex {
  padding: 0.5rem; text-align: center;
  background: rgba(0,0,0,0.3); backdrop-filter: blur(6px);
  cursor: pointer; position: relative;
  transition: background 0.15s;
}
.cp-swatch-hex:hover { background: rgba(0,0,0,0.45); }
.cp-swatch-hex span { font-size: 0.72rem; font-weight: 700; color: white; text-shadow: 0 1px 3px rgba(0,0,0,0.5); letter-spacing: 0.05em; font-family: monospace; }
.cp-picker-input { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
```

Also update the responsive block at the bottom:
```css
@media (max-width: 640px) {
  .cp-palette { flex-wrap: wrap; height: auto; }
  .cp-swatch { min-height: 120px; flex: 1 1 calc(50% - 0.375rem); }
  .cp-detail-overlay { position: static; width: 100%; border-radius: var(--gi-radius-xl); margin-top: 0.75rem; }
  .cp-add-strip { display: none; }
  .cp-actions { flex-direction: column; align-items: stretch; }
  .cp-actions-right { justify-content: center; }
  .cp-export-grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 3b: Add bounds guard to `formats` computed**

In `ColorPaletteView.vue`, find the `formats` computed (around line 286) and add a bounds check:

```ts
const formats = computed<ColorFormats>(() => {
  if (selectedIndex.value === null || selectedIndex.value >= palette.value.length) return { hex: '', rgb: '', hsl: '' }
  return getColorFormats(palette.value[selectedIndex.value].hex)
})
```

Also do the same for `contrastOnWhite` and `contrastOnBlack` computeds — they already guard on `selectedColor.value` being null, which is fine since `selectedColor` reads `palette.value[selectedIndex.value]` and Vue's reactivity will recompute when `palette` changes.

- [ ] **Step 4: Start dev server and verify in browser**

```bash
rtk npm run dev
```

Open `http://localhost:5173/tools/#/color-palette` and check:
- Swatches are 400px tall
- Hovering reveals drag handle, lock icon, copy/info/delete icons
- Hex badge always visible at bottom
- Clicking hex badge opens browser color picker
- Lock icon rings are white, not green
- Pressing Space regenerates unlocked colors
- Locked colors don't change when Space is pressed

- [ ] **Step 5: Commit**

```bash
rtk git add src/views/ColorPaletteView.vue
rtk git commit -m "feat: main view coolors-style hover overlay, inline picker, 400px swatches"
```

---

## Task 5: Main view — add/remove colors and drag-to-reorder

**Files:**
- Modify: `src/views/ColorPaletteView.vue`

The template changes from Task 4 already include the add strips and drag event bindings. This task verifies they work correctly end-to-end.

- [ ] **Step 1: Start dev server**

```bash
rtk npm run dev
```

Open `http://localhost:5173/tools/#/color-palette` and verify:

**Add color:**
- Thin strips visible between swatches on palette hover
- Clicking a strip inserts a new color at that position
- Max 8: strips disappear when palette reaches 8 colors
- New color is a valid hex, palette count increases

**Remove color:**
- Delete icon visible in swatch hover overlay when palette has > 3 colors
- Clicking delete removes that swatch
- Palette count decreases, no crash if selectedIndex was that swatch

**Drag to reorder:**
- Grabbing the grip handle and dragging a swatch reorders it
- Visual indicator (`cp-swatch--drag-over`) shows drop target
- Palette order updates correctly on drop
- URL sync updates after drop

- [ ] **Step 2: Fix any issues found during browser testing, then commit**

```bash
rtk git add src/views/ColorPaletteView.vue
rtk git commit -m "feat: main view add/remove colors and drag-to-reorder"
```

---

## Task 6: Fullscreen view — hover overlay, inline picker, visual polish

**Files:**
- Modify: `src/views/ColorPaletteFullscreenView.vue`

- [ ] **Step 1: Update `<script setup>` — new refs and functions**

Add to the existing Lucide import:
```ts
import {
  ChevronLeft, ChevronDown, Shuffle, Sparkles, Download,
  Lock, Unlock, Copy, Layers, X, CheckCircle, Code, Braces,
  Wind, Link as LinkIcon, ImageIcon, Palette, ImageUp,
  GripVertical, Trash2, Plus,  // NEW
} from 'lucide-vue-next'
```

Update imports from `useColorPalette`:
```ts
import {
  toggleLock as paletteToggleLock,
  usePaletteState,
  getContrastRatio,
  generateWithHarmony,
  updateColor,
} from '../composables/useColorPalette'
```

Add new refs after `const copiedIndex`:
```ts
const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)
const cpfPickerRefs = ref<(HTMLInputElement | null)[]>([])
```

Add new functions (after `lockToggle`):
```ts
function addColorAt(i: number) {
  if (palette.value.length >= 8) return
  const neighbor = palette.value[Math.min(i, palette.value.length - 1)].hex
  const newColors = generateWithHarmony(
    [{ hex: neighbor, locked: false }],
    harmonyType.value as HarmonyType
  )
  const newPalette = [...palette.value]
  newPalette.splice(i, 0, { hex: newColors[0], locked: false })
  palette.value = newPalette
  syncToUrl()
}

function removeColor(i: number) {
  if (palette.value.length <= 3) return
  palette.value = palette.value.filter((_, idx) => idx !== i)
  syncToUrl()  // no selectedIndex in fullscreen view — no cleanup needed
}

function openCpfPicker(i: number) {
  cpfPickerRefs.value[i]?.click()
}

function onCpfPickerInput(e: Event, i: number) {
  const hex = (e.target as HTMLInputElement).value.toUpperCase()
  palette.value = updateColor(palette.value, i, hex)
}

function onDragStart(e: DragEvent, i: number) {
  dragIndex.value = i
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(i))
  }
}

function onDragOver(i: number) {
  if (dragIndex.value !== null && dragIndex.value !== i) dragOverIndex.value = i
}

function onDrop(i: number) {
  if (dragIndex.value === null || dragIndex.value === i) return
  const newPalette = [...palette.value]
  const [dragged] = newPalette.splice(dragIndex.value, 1)
  newPalette.splice(i, 0, dragged)
  palette.value = newPalette
  dragIndex.value = null
  dragOverIndex.value = null
  syncToUrl()
}

function onDragEnd() {
  dragIndex.value = null
  dragOverIndex.value = null
}
```

- [ ] **Step 2: Replace the columns template**

Replace the entire `<!-- Color columns -->` block (`div.cpf-columns` and its contents) with:

```html
<!-- Color columns -->
<div class="cpf-columns" role="group" :aria-label="t('colorPalette.title')">
  <template v-for="(color, i) in palette" :key="i">
    <!-- Add strip before each column -->
    <div
      v-if="palette.length < 8"
      class="cpf-add-strip"
      @click="addColorAt(i)"
      :aria-label="t('colorPalette.full.addColor')"
      role="button"
      tabindex="0"
    >
      <Plus :size="14" />
    </div>
    <!-- Column -->
    <div
      class="cpf-column"
      :class="{
        'cpf-column--locked': color.locked,
        'cpf-column--flash': flashIndex === i,
        'cpf-column--drag-over': dragOverIndex === i,
      }"
      :style="{ background: color.hex }"
      draggable="true"
      @dragstart="onDragStart($event, i)"
      @dragover.prevent="onDragOver(i)"
      @drop.prevent="onDrop(i)"
      @dragend="onDragEnd"
    >
      <!-- Top overlay: drag handle + lock -->
      <div class="cpf-col-top-overlay">
        <div class="cpf-drag-handle"><GripVertical :size="20" /></div>
        <button
          class="cpf-col-btn"
          @click.stop="lockToggle(i)"
          :aria-label="color.locked ? t('colorPalette.full.unlock') : t('colorPalette.full.lock')"
        >
          <Lock v-if="color.locked" :size="20" />
          <Unlock v-else :size="20" />
        </button>
      </div>

      <!-- Bottom info: hex badge + actions -->
      <div class="cpf-column-info">
        <button
          class="cpf-color-value"
          @click.stop="openCpfPicker(i)"
          :aria-label="t('colorPalette.full.pickColor')"
        >
          {{ copiedIndex === i ? '✓' : color.hex.toUpperCase() }}
          <input
            type="color"
            class="cpf-picker-input"
            :ref="(el) => { cpfPickerRefs[i] = el as HTMLInputElement }"
            :value="color.hex"
            @input="onCpfPickerInput($event, i)"
            tabindex="-1"
            aria-hidden="true"
          />
        </button>
        <div class="cpf-color-actions">
          <button class="cpf-action-btn" @click.stop="openShades(i)" :aria-label="t('colorPalette.full.shades')">
            <Layers :size="16" />
          </button>
          <button class="cpf-action-btn" @click.stop="copyColor(color.hex, i)" :aria-label="t('colorPalette.full.copied')">
            <Copy :size="16" />
          </button>
          <button
            v-if="palette.length > 3"
            class="cpf-action-btn cpf-action-btn--delete"
            @click.stop="removeColor(i)"
            :aria-label="t('colorPalette.full.deleteColor')"
          >
            <Trash2 :size="16" />
          </button>
        </div>
      </div>
    </div>
  </template>
  <!-- Trailing add strip -->
  <div
    v-if="palette.length < 8"
    class="cpf-add-strip"
    @click="addColorAt(palette.length)"
    role="button"
    tabindex="0"
  >
    <Plus :size="14" />
  </div>
</div>
```

- [ ] **Step 3: Update the columns CSS**

Replace `.cpf-column`, `.cpf-column-icon`, `.cpf-column-info`, `.cpf-color-value`, `.cpf-color-actions`, `.cpf-action-btn` with:

```css
/* Columns layout */
.cpf-columns { display: flex; flex: 1; min-height: 0; }

/* Add strip */
.cpf-add-strip {
  display: flex; align-items: center; justify-content: center;
  width: 6px; flex-shrink: 0; cursor: pointer;
  color: rgba(255,255,255,0.7); opacity: 0;
  transition: width 0.18s var(--gi-ease-out), opacity 0.18s;
}
.cpf-columns:hover .cpf-add-strip { opacity: 1; }
.cpf-add-strip:hover { width: 40px; background: rgba(0,0,0,0.15); }

/* Column */
.cpf-column {
  flex: 1; display: flex; flex-direction: column;
  justify-content: space-between; align-items: center;
  position: relative;
  transition: flex 0.3s var(--gi-ease-out);
}
.cpf-column:hover { flex: 1.2; }
.cpf-column--locked { outline: 2px solid rgba(255,255,255,0.85); outline-offset: -2px; }
.cpf-column--flash { animation: cpf-flash 0.3s ease-out; }
.cpf-column--drag-over { outline: 2px dashed rgba(255,255,255,0.8); outline-offset: -2px; }
@keyframes cpf-flash { 0% { filter: brightness(1.5); } 100% { filter: brightness(1); } }

/* Top overlay: drag handle + lock */
.cpf-col-top-overlay {
  display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
  padding-top: 1.5rem; opacity: 0; transition: opacity 0.2s;
}
.cpf-column:hover .cpf-col-top-overlay,
.cpf-column--locked .cpf-col-top-overlay { opacity: 1; }

.cpf-drag-handle {
  color: white; cursor: grab; opacity: 0.7;
  text-shadow: 0 1px 3px rgba(0,0,0,0.4);
}
.cpf-drag-handle:active { cursor: grabbing; }

.cpf-col-btn {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; background: rgba(0,0,0,0.2); backdrop-filter: blur(4px);
  border: none; border-radius: var(--gi-radius-md); color: white; cursor: pointer;
  text-shadow: 0 1px 3px rgba(0,0,0,0.4);
  transition: background 0.12s;
}
.cpf-col-btn:hover { background: rgba(0,0,0,0.4); }

/* Bottom info */
.cpf-column-info {
  padding: 1rem; display: flex; flex-direction: column;
  align-items: center; gap: 0.5rem;
}
.cpf-color-value {
  position: relative; background: rgba(0,0,0,0.25); backdrop-filter: blur(4px);
  border: none; border-radius: var(--gi-radius-md);
  padding: 0.375rem 0.75rem; font-size: 0.85rem; font-weight: 700;
  color: white; text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  cursor: pointer; transition: background 0.15s;
}
.cpf-color-value:hover { background: rgba(0,0,0,0.4); }
.cpf-picker-input { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }

.cpf-color-actions {
  display: flex; gap: 0.375rem; opacity: 0; transition: opacity 0.2s;
}
.cpf-column:hover .cpf-color-actions { opacity: 1; }
.cpf-action-btn {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; background: rgba(0,0,0,0.2);
  backdrop-filter: blur(4px); border: none; border-radius: var(--gi-radius-sm);
  color: white; cursor: pointer; transition: background 0.15s;
}
.cpf-action-btn:hover { background: rgba(0,0,0,0.4); }
.cpf-action-btn--delete:hover { background: rgba(200,30,30,0.45); }
```

Also update the responsive section:
```css
@media (max-width: 640px) {
  .cpf-columns { flex-direction: column; }
  .cpf-column { min-height: 120px; }
  .cpf-add-strip { display: none; }
  /* rest unchanged */
}
```

- [ ] **Step 4: Start dev server and verify fullscreen view**

```bash
rtk npm run dev
```

Open `http://localhost:5173/tools/#/color-palette` and click the fullscreen button. Verify:
- Columns are full-height, no border-radius (full-bleed)
- Hover reveals drag handle + lock icon at top
- Hex badge still visible, clicking it opens color picker
- Actions row visible on hover (shades, copy, delete)
- Lock ring is white outline, not green
- Pressing Space regenerates unlocked colors
- Locked colors stay when Space is pressed
- Add strips between columns appear on palette hover
- Drag-to-reorder works
- Adding color inserts a new column
- Removing color removes the column (min 3)

- [ ] **Step 5: Commit**

```bash
rtk git add src/views/ColorPaletteFullscreenView.vue
rtk git commit -m "feat: fullscreen view coolors-style hover overlay, add/remove, drag-to-reorder"
```

---

## Task 7: Final verification + run full test suite

- [ ] **Step 1: Run all tests**

```bash
rtk npm test
```

Expected: all tests pass. If any fail, fix before continuing.

- [ ] **Step 2: Browser smoke test — main view**

```bash
rtk npm run dev
```

Open `http://localhost:5173/tools/#/color-palette`. Verify these scenarios:
1. Press Space 5 times — each press generates a visibly different palette with clear light-to-dark contrast
2. Lock 2 colors (click their lock icons) → press Space → locked colors unchanged
3. Lock all 5 colors → press Space → nothing changes
4. Click hex badge → color picker opens → change color → swatch updates
5. Add a color via + strip → palette grows to 6
6. Delete a color → palette shrinks
7. Drag a swatch to reorder → palette reorders
8. Click ⓘ icon → detail panel slides in from right
9. Click X on detail panel → panel closes

- [ ] **Step 3: Browser smoke test — fullscreen view**

Open the fullscreen view. Repeat the same scenarios. Also verify:
- "Shades" panel still works (Layers icon → bottom panel appears)
- Export modal still works
- Gradient modal still works
- Keyboard shortcuts still work (Space, E, G, Esc)

- [ ] **Step 4: Build check**

```bash
rtk npm run build
```

Expected: build completes with no TypeScript errors.

- [ ] **Step 5: Final commit**

```bash
rtk git add -A
rtk git commit -m "feat: complete coolors-style palette redesign — algorithm, UX, add/remove, drag"
```
