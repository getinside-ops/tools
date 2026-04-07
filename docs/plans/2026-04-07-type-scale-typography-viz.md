# Type Scale Generator: Typography & Visualization Improvements

**Date:** 2026-04-07
**Status:** Approved by user

## Goals

Improve the Type Scale Generator with two key features:
1. **Typography Preview Quality** — Font family, weight, and line height controls with live preview
2. **Visual Scale Comparison** — Horizontal bars showing relative size relationships

## Design Decisions

### Font Selection
- **Approach:** System font presets (no external dependencies)
- **Rationale:** Works offline, fast loading, no API calls
- **Fonts included:** System UI, Inter, Georgia, Arial, Helvetica, Verdana, Times New Roman, Courier New

### Font Weight
- **Options:** 300, 400, 500, 600, 700
- **Default:** 400 (Regular)
- **Smart filtering:** Disable unsupported weights per font (future enhancement)

### Line Height
- **Range:** 1.0 - 2.0, step 0.1
- **Default:** 1.5
- **Impact:** Applied to preview section to show readability effect

### Visual Scale Bars
- **Style:** Horizontal bars proportional to font sizes
- **Calculation:** `(size / maxSize) * 100%`
- **Interactivity:** Clickable bars showing step info
- **Color coding:** Base step = brand color, others = muted tones

## Architecture

**No composable changes** — all logic stays in TypeScaleView.vue

**New state:**
```typescript
const fontFamily = ref('system-ui')
const fontWeight = ref(400)
const lineHeight = ref(1.5)
```

## CSS Output Enhancement

Generated CSS now includes:
```css
:root {
  --font-family: system-ui, -apple-system, sans-serif;
  --font-weight: 400;
  --line-height: 1.5;
  /* ... existing font size vars */
}
```

## Files Modified

- `src/views/TypeScaleView.vue` — Add controls, visualization, CSS output
- `src/i18n/fr.ts` — Add ~15 French keys
- `src/i18n/en.ts` — Add ~15 English keys

## UI Layout

```
[Font Family: System UI ▼] [Weight: 400 ▼] [Line Height: 1.5 ▼]

VISUAL PREVIEW
(Text samples with selected font/weight/line-height)

SCALE VISUALIZATION
[====] Step -2: 10px (Caption)
[======] Step -1: 13px (Small)
[========] Step 0: 16px (Body) ← highlighted
[==========] Step 1: 20px (H3)
[============] Step 2: 25px (H2)

CSS OUTPUT
(CSS variables with font properties)
```

## Success Criteria

- [ ] Font selector changes preview font in real-time
- [ ] Weight selector changes preview weight
- [ ] Line height selector changes preview line-height
- [ ] Visual bars show correct proportions
- [ ] Generated CSS includes all new properties
- [ ] All new i18n keys in FR and EN
- [ ] Build passes
- [ ] Tests pass
