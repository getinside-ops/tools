# Color Palette Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove UI preview, simplify info panel, add fullscreen exit, and fix overly monochromatic palette generation.

**Architecture:** Three independent file changes — algorithm fix in `useColorHarmony.ts`, UI cleanup in `ColorPaletteView.vue`, and new exit button/keyboard in `ColorPaletteFullscreenView.vue`. No new files. No shared state changes.

**Tech Stack:** Vue 3, TypeScript, Vitest, lucide-vue-next

---

### Task 1: Fix palette algorithm (TDD)

**Files:**
- Modify: `src/composables/useColorHarmony.ts:50-76`
- Modify: `src/composables/__tests__/useColorHarmony.test.ts`

- [ ] **Step 1: Write the failing test**

Add this test inside the existing `describe('generateHarmony', ...)` block in `src/composables/__tests__/useColorHarmony.test.ts`, after the existing `random-beautiful` test (after line 46):

```typescript
  it('random-beautiful produces hues spanning >180° across 5 colors', () => {
    for (let trial = 0; trial < 10; trial++) {
      const colors = generateHarmony('#0aaa8e', 'random-beautiful', 5)
      const hues = colors.map(c => {
        const r = parseInt(c.slice(1, 3), 16) / 255
        const g = parseInt(c.slice(3, 5), 16) / 255
        const b = parseInt(c.slice(5, 7), 16) / 255
        const max = Math.max(r, g, b), min = Math.min(r, g, b)
        if (max === min) return 0
        const d = max - min
        let h = 0
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
          case g: h = ((b - r) / d + 2) / 6; break
          case b: h = ((r - g) / d + 4) / 6; break
        }
        return h * 360
      })
      const hueSpread = Math.max(...hues) - Math.min(...hues)
      expect(hueSpread).toBeGreaterThan(180)
    }
  })
```

- [ ] **Step 2: Run tests to verify the new test fails**

```bash
rtk npm test -- --reporter=verbose src/composables/__tests__/useColorHarmony.test.ts
```

Expected: the new `random-beautiful produces hues spanning >180°` test FAILs (old code clusters all hues within ±17.5° of `baseHue`). All other tests pass.

- [ ] **Step 3: Implement algorithm changes**

In `src/composables/useColorHarmony.ts`, make three edits:

**Edit 1 — widen `spreadL` (line 51):**
```typescript
// Before:
function spreadL(t: number): number {
  return Math.round(Math.max(10, Math.min(95, 87 - t * 69 + jitter(6))))
}
// After:
function spreadL(t: number): number {
  return Math.round(Math.max(10, Math.min(95, 92 - t * 82 + jitter(6))))
}
```

**Edit 2 — bolder `spreadS` (lines 56-59):**
```typescript
// Before:
function spreadS(t: number, baseSat: number): number {
  const peak = Math.max(baseSat, 65)
  const sat = peak - Math.abs(t - 0.5) * 90 + jitter(15)
  return Math.round(Math.max(15, Math.min(90, sat)))
}
// After:
function spreadS(t: number, baseSat: number): number {
  const peak = Math.max(baseSat, 80)
  const sat = peak - Math.abs(t - 0.5) * 90 + jitter(15)
  return Math.round(Math.max(25, Math.min(90, sat)))
}
```

**Edit 3 — golden-angle hue spread in `random-beautiful` (lines 72-76):**
```typescript
// Before:
    case 'random-beautiful': {
      const baseHue = Math.floor(Math.random() * 360)
      return Array.from({ length: count }, (_, i) => {
        const ti = t(i)
        const h = ((baseHue + jitter(35) + 360) % 360)
        return hslToHex(h, spreadS(ti, 65), spreadL(ti))
      })
    }
// After:
    case 'random-beautiful': {
      const baseHue = Math.floor(Math.random() * 360)
      return Array.from({ length: count }, (_, i) => {
        const ti = t(i)
        const h = (baseHue + i * 137.5 + jitter(12) + 360) % 360
        return hslToHex(h, spreadS(ti, 65), spreadL(ti))
      })
    }
```

- [ ] **Step 4: Run all harmony tests**

```bash
rtk npm test -- --reporter=verbose src/composables/__tests__/useColorHarmony.test.ts
```

Expected: all tests PASS, including the new hue spread test and the existing analogous `≤120°` hue spread test.

- [ ] **Step 5: Run full test suite**

```bash
rtk npm test
```

Expected: all 227+ tests pass.

- [ ] **Step 6: Commit**

```bash
rtk git add src/composables/useColorHarmony.ts src/composables/__tests__/useColorHarmony.test.ts && rtk git commit -m "feat: bolder palettes — golden-angle hues, wider L range, stronger saturation"
```

---

### Task 2: Remove UI preview and WCAG contrast from ColorPaletteView

**Files:**
- Modify: `src/views/ColorPaletteView.vue`

This task has no unit tests — verify visually after editing.

- [ ] **Step 1: Remove the `cp-contrast-section` template block**

Remove lines 201–215 from the template (the entire `<div class="cp-contrast-section">` block). After the removal, the detail overlay should end with the `<div class="cp-adjust">` block and its closing tag.

The section to remove:
```html
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
```

- [ ] **Step 2: Remove the `<!-- UI Preview -->` template block**

Remove lines 220–235 from the template (the `<!-- UI Preview -->` comment and its `<div class="cp-preview">` block):

```html
    <!-- UI Preview -->
    <div class="cp-preview">
      <h3 class="cp-preview-title">{{ t('colorPalette.uiPreview') }}</h3>
      <div class="cp-preview-card" :style="{ borderColor: palette[0].hex }">
        <div class="cp-preview-header" :style="{ background: palette[0].hex }">
          <div class="cp-preview-dots"><span></span><span></span><span></span></div>
        </div>
        <div class="cp-preview-body" :style="{ background: palette[4].hex + '12' }">
          <div class="cp-preview-text" :style="{ color: getContrastingColor(palette[1].hex, palette[4].hex + '12') }">Title text</div>
          <div class="cp-preview-text-sm" :style="{ color: getContrastingColor(palette[2].hex, palette[4].hex + '12') }">Secondary text with some content.</div>
          <button class="cp-preview-cta" :style="{ background: palette[3].hex, color: getContrastColor(palette[3].hex) }">
            Call to action
          </button>
        </div>
      </div>
    </div>
```

- [ ] **Step 3: Remove unused script references**

In `<script setup>`:

**Remove the two computed refs** (lines 342–343):
```typescript
const contrastOnWhite = computed(() => selectedColor.value ? getContrastRatio(selectedColor.value.hex, '#FFFFFF') : 1)
const contrastOnBlack = computed(() => selectedColor.value ? getContrastRatio(selectedColor.value.hex, '#000000') : 1)
```

**Remove `getContrastRatio` from the import** (line 312). Change:
```typescript
import { toggleLock as paletteToggleLock, usePaletteState, getContrastRatio, getColorFormats, adjustColor, updateColor, initPalette, generateWithHarmony } from '../composables/useColorPalette'
```
to:
```typescript
import { toggleLock as paletteToggleLock, usePaletteState, getColorFormats, adjustColor, updateColor, initPalette, generateWithHarmony } from '../composables/useColorPalette'
```

**Remove the two color utility functions** (lines 519–520):
```typescript
function getContrastColor(hex: string): string { return toHsl(hex).l > 50 ? '#000000' : '#FFFFFF' }
function getContrastingColor(_t: string, bg: string): string { const l = parseInt(bg.slice(1, 3), 16) || 0; return l > 128 ? '#1a1a1a' : '#f0f0f0' }
```

Also remove the `toHsl` function (lines 512–518) **only if** it has no remaining callers. Check: after removing `getContrastColor` and `getContrastingColor`, search the file for `toHsl(` — if no hits remain, delete the function.

- [ ] **Step 4: Remove preview and contrast CSS**

In `<style scoped>`, remove two CSS blocks:

**Contrast CSS** (lines 731–739):
```css
/* Contrast */
.cp-contrast-section { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--gi-border); }
.cp-contrast-row { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
.cp-contrast-item { flex: 1; padding: 0.5rem; border-radius: var(--gi-radius-md); display: flex; align-items: center; gap: 0.5rem; border: 1px solid var(--gi-border); }
.cp-contrast-text { font-size: 1.25rem; font-weight: 700; }
.cp-contrast-ratio { font-size: 0.75rem; font-family: monospace; color: var(--gi-text-muted); }
.cp-contrast-badge { font-size: 0.65rem; font-weight: 700; padding: 0.125rem 0.375rem; border-radius: var(--gi-radius-sm); }
.cp-contrast-badge--pass { background: var(--gi-brand-fade); color: var(--gi-brand); }
.cp-contrast-badge--fail { background: var(--gi-tint-red-bg); color: var(--gi-tint-red-text); }
```

**Preview CSS** (lines 741–753):
```css
/* Preview */
.cp-preview { margin-top: 1.5rem; }
.cp-preview-title { font-size: var(--gi-font-size-xs); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--gi-text-muted); margin: 0 0 0.75rem; }
.cp-preview-card { background: var(--gi-surface); border-radius: var(--gi-radius-lg); overflow: hidden; box-shadow: var(--gi-shadow); border: 2px solid; }
.cp-preview-header { padding: 0.625rem 0.875rem; display: flex; align-items: center; }
.cp-preview-dots { display: flex; gap: 0.375rem; }
.cp-preview-dots span { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.45); }
.cp-preview-body { padding: 1.25rem; }
.cp-preview-text { font-size: var(--gi-font-size-lg); font-weight: 700; margin-bottom: 0.375rem; }
.cp-preview-text-sm { font-size: var(--gi-font-size-sm); opacity: 0.65; margin-bottom: 1rem; }
.cp-preview-cta { display: inline-flex; align-items: center; justify-content: center; padding: 0.625rem 1.25rem; border-radius: var(--gi-radius-md); font-size: var(--gi-font-size-sm); font-weight: 600; border: none; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; }
.cp-preview-cta:hover { transform: translateY(-1px); box-shadow: var(--gi-shadow-sm); }
.cp-preview-cta:active { transform: scale(0.97); }
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
rtk tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
rtk git add src/views/ColorPaletteView.vue && rtk git commit -m "feat: remove UI preview and WCAG contrast panel from color palette"
```

---

### Task 3: Add fullscreen exit button and Escape keyboard shortcut

**Files:**
- Modify: `src/views/ColorPaletteFullscreenView.vue`

- [ ] **Step 1: Add router import and `Minimize2` icon**

In `<script setup>`, add `useRouter` import after the existing vue import (line 328):
```typescript
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
```

Add `Minimize2` to the lucide import (lines 331–335). Change:
```typescript
import {
  ChevronLeft, ChevronDown, Shuffle, Sparkles, Download,
  Lock, Unlock, Copy, Layers, X, CheckCircle, Code, Braces,
  Wind, Link as LinkIcon, ImageIcon, Palette, ImageUp,
  GripVertical, Trash2, Plus,
} from 'lucide-vue-next'
```
to:
```typescript
import {
  ChevronLeft, ChevronDown, Shuffle, Sparkles, Download,
  Lock, Unlock, Copy, Layers, X, CheckCircle, Code, Braces,
  Wind, Link as LinkIcon, ImageIcon, Palette, ImageUp,
  GripVertical, Trash2, Plus, Minimize2,
} from 'lucide-vue-next'
```

Add `const router = useRouter()` after `const { t } = useI18n()` (line 345):
```typescript
const { t } = useI18n()
const router = useRouter()
```

- [ ] **Step 2: Add the exit button to the toolbar**

In the template, inside `.cpf-toolbar-right` (lines 35–50), add the `Minimize2` button **before** the generate button:

```html
      <div class="cpf-toolbar-right">
        <label class="cpf-tool-btn" :aria-label="t('colorPalette.full.extract')" tabindex="0">
          <ImageUp :size="16" />
          <input type="file" accept="image/*" class="cpf-upload-input" @change="handleImageUpload" />
        </label>
        <button class="cpf-tool-btn" @click="showGradientModal = true" :aria-label="t('colorPalette.full.gradient.label')">
          <Palette :size="16" />
        </button>
        <button class="cpf-tool-btn" @click="showExportModal = true" :aria-label="t('colorPalette.full.export.label')">
          <Download :size="16" />
        </button>
        <button class="cpf-tool-btn" @click="router.push('/color-palette')" :aria-label="t('colorPalette.full.exitFullscreen')">
          <Minimize2 :size="16" />
        </button>
        <button class="cpf-generate-btn" @click="generate" :aria-label="t('colorPalette.full.generate')">
          <Shuffle :size="18" />
          <span class="cpf-generate-text">{{ t('colorPalette.full.generate') }}</span>
        </button>
      </div>
```

- [ ] **Step 3: Update the Escape keyboard handler**

In `handleKeydown` (lines 660–679), replace the Escape branch:

```typescript
  else if (e.key === 'Escape') {
    showExportModal.value = false
    showGradientModal.value = false
    showShadesPanel.value = false
    showHarmonyMenu.value = false
  }
```

with:

```typescript
  else if (e.key === 'Escape') {
    const anyOpen = showExportModal.value || showGradientModal.value || showShadesPanel.value || showHarmonyMenu.value
    showExportModal.value = false
    showGradientModal.value = false
    showShadesPanel.value = false
    showHarmonyMenu.value = false
    if (!anyOpen) router.push('/color-palette')
  }
```

- [ ] **Step 4: Add the i18n key**

The button uses `t('colorPalette.full.exitFullscreen')`. Add this key to both locale files.

In `src/i18n/fr.ts`, find the `colorPalette.full` section and add:
```typescript
exitFullscreen: 'Quitter le plein écran',
```

In `src/i18n/en.ts`, add:
```typescript
exitFullscreen: 'Exit fullscreen',
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
rtk tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Run full test suite**

```bash
rtk npm test
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
rtk git add src/views/ColorPaletteFullscreenView.vue src/i18n/fr.ts src/i18n/en.ts && rtk git commit -m "feat: add fullscreen exit button and Escape keyboard shortcut"
```

---

### Self-Review Checklist

**Spec coverage:**
- [x] Task 1 — remove UI preview (template + CSS + two helper functions + computed refs + import)
- [x] Task 2 — remove WCAG contrast from info panel (template + CSS + computed refs + import)
- [x] Task 3 — `Minimize2` exit button in `.cpf-toolbar-right`
- [x] Task 3 — Escape: first press closes modal, second press exits fullscreen
- [x] Task 1 — `spreadL` widened to 10–92%
- [x] Task 1 — `spreadS` peak boosted to max(baseSat, 80), min 25%
- [x] Task 1 — `random-beautiful` golden-angle hue distribution
- [x] Task 1 — test asserting `random-beautiful` hue spread >180°

**Notes:**
- `getContrastRatio` remains in `useColorPalette.ts` — it's still used by `ColorPaletteFullscreenView.vue` (`contrastOnWhite`/`contrastOnBlack` computed refs in the shades panel). Only the import in `ColorPaletteView.vue` is removed.
- `toHsl` in `ColorPaletteView.vue` also appears in `getContrastColor` — after removing both helpers, verify no other callers remain before deleting.
- The `colorPalette.full.exitFullscreen` i18n key must exist in both locale files before the template renders without error.
