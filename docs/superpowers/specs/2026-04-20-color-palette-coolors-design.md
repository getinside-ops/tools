# Color Palette — Coolors-Style Redesign

**Date:** 2026-04-20  
**Status:** Approved  
**Scope:** `useColorHarmony.ts`, `useColorPalette.ts`, `ColorPaletteView.vue`, `ColorPaletteFullscreenView.vue`

---

## Problem

Three distinct issues:

1. **Locking bug** — In `ColorPaletteView.vue`'s `generate()`, the "all locked" branch still overwrites all hex values instead of returning early. Same bug likely exists in `ColorPaletteFullscreenView.vue`.

2. **Ugly palette generation** — `random-beautiful` keeps all 5 colors in the 35–65% lightness range with only 8% steps between them, making every palette feel flat and muddy. Other harmony types have the same ±5% lightness tweak problem.

3. **Non-coolors UX** — Swatch click = lock toggle is confusing. No add/remove colors, no drag-to-reorder, no inline color picker. Swatches are too short (280px).

---

## Goals

- Palettes that look beautiful by default, matching the quality of coolors.co
- Interaction model that matches coolors.co (lock/copy/delete/drag per swatch, add color strips, inline picker)
- Both main view and fullscreen view improved consistently
- No new npm dependencies

---

## Algorithm Overhaul (`useColorHarmony.ts`)

### `random-beautiful` — lightness-spread archetype

Instead of 5 colors at similar lightness, each position gets a fixed lightness band with random jitter:

| Position | Lightness | Saturation | Role |
|---|---|---|---|
| 0 | 88–93% | 15–30% | Soft light tint |
| 1 | 65–75% | 40–60% | Mid-light |
| 2 | 45–55% | 60–80% | Vivid accent |
| 3 | 30–42% | 50–70% | Grounded mid-dark |
| 4 | 15–28% | 25–45% | Dark anchor |

- A single base hue is chosen randomly (0–360°)
- Each color gets a gentle hue offset (±10–25° random per position) so colors feel related but distinct
- If palette count ≠ 5, select bands by evenly sampling the 5-band table (e.g. 3 colors → bands 0, 2, 4; 4 colors → bands 0, 1, 3, 4; 6+ colors → interpolate between adjacent bands)

### Other harmony types

All existing harmony types (analogous, complementary, triadic, tetradic, split-complementary, monochromatic) get the same lightness-spread treatment: instead of `base.l ± n*5`, spread lightness across each color using the band table above, keeping hue relationships intact.

Exception: `monochromatic` intentionally keeps the same hue — keep its existing lightness spread logic (already uses a 60-point range), but widen it to the full 15–90% range.

---

## Locking Bug Fix (`ColorPaletteView.vue` + `ColorPaletteFullscreenView.vue`)

In `generate()`, the `unlockedIndices.length === 0` branch must be a no-op:

```ts
if (unlockedIndices.length === 0) return  // all locked — nothing to do
```

Remove the existing code in that branch that generates and overwrites all hex values.

---

## Interaction Model (both views)

### Remove: click-to-lock

`handleSwatchClick` currently toggles the lock on click. This is replaced entirely by an explicit lock icon in the hover overlay.

### New: hover overlay per swatch

Each swatch shows a translucent overlay on hover containing:

- **Top center:** drag handle icon (`GripVertical`) — initiates drag-to-reorder
- **Upper center:** lock/unlock icon — toggles lock state
- **Lower center:** copy icon — copies hex to clipboard, shows ✓ flash
- **Bottom center:** delete icon — removes color (hidden if palette length ≤ 3)

All icons: white, `text-shadow: 0 1px 3px rgba(0,0,0,0.5)` for legibility on any color.

Overlay fades in on hover (`opacity: 0 → 1`, `transition: 0.15s`).

### New: hex badge (always visible)

The hex code badge is always visible at the bottom center of each swatch (not only on hover). Pill shape, `rgba(0,0,0,0.35)` background, `backdrop-filter: blur(6px)`, white monospace text.

Clicking the hex badge opens an `<input type="color">` (positioned absolutely, hidden, triggered via `.click()`) so the user can pick a replacement color inline.

### New: add color strips

A thin vertical strip (`6px` wide, `var(--gi-surface)` bg, dotted border) sits between each swatch and at both outer edges. On hover it expands to show a `+` icon. Clicking inserts a new color adjacent to the insertion point (generated as a harmony neighbor of the adjacent color). Maximum palette size: 8 colors.

### New: drag-to-reorder

Use native HTML5 drag events (`draggable`, `dragstart`, `dragover`, `drop`). On `dragstart`, record the dragged index. On `dragover` of a different swatch, show a visual insertion indicator. On `drop`, reorder the palette array. No external dependency.

### Info panel trigger

The detail panel (color formats, HSL sliders, WCAG contrast) is triggered by an info icon (ⓘ, `Info` from lucide) in the hover overlay — not by clicking the swatch body. In the main view it slides in as a right-side overlay panel on top of the palette area. In the fullscreen view it appears as a centered modal.

---

## Visual Design

### Main view (`ColorPaletteView.vue`)

- Swatch row height: `280px → 400px`
- Swatch border-radius: keep `var(--gi-radius-lg)`
- Lock state ring: `outline: 2px solid rgba(255,255,255,0.85)` (replaces green brand ring — readable on any color)
- Detail/info panel: becomes a right-side overlay (`position: absolute`, `right: 0`, slides in with `transform: translateX`) on top of the palette area, instead of pushing content down

### Fullscreen view (`ColorPaletteFullscreenView.vue`)

- Swatch border-radius: `0` (full bleed columns, true coolors feel)
- Hex badge: larger font (`0.85rem`), same always-visible pill style
- No layout changes to the toolbar

### Both views

- Hover overlay icons: white with drop shadow — no dark mode handling needed
- Add color strip: thin dotted strip, expands on hover, no brand color used

---

## What Does NOT Change

- ToolPageLayout wrapper in main view (header, nav, about section stay)
- Export modal (CSS/SCSS/JSON/Tailwind/URL)
- Gradient modal
- Harmony type selector
- URL sync (`syncToUrl`)
- i18n keys (may add keys for new UI elements)
- `usePaletteState` composable structure (palette ref, harmonyType, syncToUrl)

---

## Files Changed

| File | Change |
|---|---|
| `src/composables/useColorHarmony.ts` | Rewrite `random-beautiful`, improve lightness spread in all harmonies |
| `src/views/ColorPaletteView.vue` | Fix locking bug, new interaction model, taller swatches, hover overlay, add/remove, drag, inline picker, side panel |
| `src/views/ColorPaletteFullscreenView.vue` | Fix locking bug, same interaction model, no-radius swatches, always-visible hex |
| `src/i18n/fr.ts` + `src/i18n/en.ts` | Add keys for new UI elements (add color, delete color tooltips) |

---

## Out of Scope

- Color name display (e.g. "Almond", "Sage") — requires a color-name lookup library
- Palette saving / account system
- Mobile drag-to-reorder (touch events) — can be added later
