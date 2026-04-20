# Color Palette Generator — Improvements Design

**Date:** 2026-04-20
**Scope:** `ColorPaletteView.vue`, `ColorPaletteFullscreenView.vue`, `useColorHarmony.ts`

---

## 1. Remove UI Preview

**What:** Delete the `<!-- UI Preview -->` section (`.cp-preview` block) from `ColorPaletteView.vue` and all associated `.cp-preview-*` CSS.

**Why:** The preview card adds visual noise below the palette without adding actionable value. The tool is about generating palettes, not simulating app UIs.

**Constraints:** Also remove the `getContrastColor` and `getContrastingColor` helpers defined in the script — they are only used by the preview block and have no other callers.

---

## 2. Simplify Info Panel ("i" button)

**What:** Remove the `cp-contrast-section` block (WCAG contrast on white/black) from the detail overlay in `ColorPaletteView.vue`. Remove `contrastOnWhite`, `contrastOnBlack` computed refs and the `getContrastRatio` import.

**Result:** The panel contains only: close button → color swatch + copy-able formats (HEX/RGB/HSL) → adjust sliders (hue/saturation/lightness + reset/apply). This fits within the panel height without scrolling.

---

## 3. Fullscreen Exit

**File:** `ColorPaletteFullscreenView.vue`

### Button
Add a `Minimize2` icon button in `.cpf-toolbar-right` (left of the generate button). On click: `router.push('/color-palette')`.

### Keyboard
Add an `Escape` keydown handler. Behaviour:
- If a modal is open → close modal (existing behaviour)
- If no modal is open → `router.push('/color-palette')`

This means: first `Escape` closes any open modal, second `Escape` exits fullscreen — consistent with layered dismissal patterns.

---

## 4. Algorithm — Bolder, More Varied Palettes (Approach B)

**File:** `useColorHarmony.ts`

### `spreadL` — wider lightness range
```
Before: 87 - t * 69  → range ~18–87%
After:  92 - t * 82  → range ~10–92%
```
Palettes can now include near-black anchors at one end and near-white at the other, matching the punchy Coolors aesthetic.

### `spreadS` — bolder saturation
```
Before: peak = max(baseSat, 65), min clamp = 15%
After:  peak = max(baseSat, 80), min clamp = 25%
```
Mid-tones become more vivid; even extreme-L colors stay saturated.

### `random-beautiful` — true hue diversity
```
Before: all colors use (baseHue + jitter(35)) — ±17.5° variation, near-monochromatic
After:  each color i uses (baseHue + i * 137.5 + jitter(12)) % 360
```
137.5° is the golden angle — maximally separates N points on a circle, guaranteeing each color lands in a perceptually distinct hue region. `jitter(12)` (±6°) adds organic imperfection.

### All other non-monochromatic types
`analogous`, `complementary`, `triadic`, `tetradic`, `split-complementary` all call `spreadL` and `spreadS` — they inherit the improvements automatically with no per-type changes.

### `monochromatic`
Intentionally unchanged — same-hue variation is the correct and expected behaviour.

---

## Files Changed

| File | Change |
|------|--------|
| `src/views/ColorPaletteView.vue` | Remove UI preview section + CSS; remove WCAG contrast block + refs |
| `src/views/ColorPaletteFullscreenView.vue` | Add Minimize2 exit button; add Escape → navigate back |
| `src/composables/useColorHarmony.ts` | Widen `spreadL`, boost `spreadS`, fix `random-beautiful` hue spread |

## Tests

`useColorHarmony` has existing tests in `src/composables/__tests__/useColorHarmony.test.ts`. After the algorithm change, verify:
- Tests that assert hue spread (e.g. ≤120° for analogous) still pass
- Add/update a test asserting `random-beautiful` produces hues spanning >180° total spread across 5 colors
