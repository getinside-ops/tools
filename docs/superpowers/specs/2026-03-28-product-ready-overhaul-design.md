# Design Spec: Product-Ready Overhaul

**Date:** 2026-03-28
**Status:** Approved

---

## Context

The getinside Tools site is a working prototype with 5 active tools deployed to GitHub Pages. The goal is to make it product-ready to share with external users and use as a lead magnet. The reference for layout and UX patterns is [zerokit-dun.vercel.app](https://zerokit-dun.vercel.app/), but the getinside light theme (warm beige, teal brand color) is kept — only ZeroKit's *layout patterns* are adopted, not its dark aesthetic.

All new tools must be 100% client-side (no paid APIs, no server, no credit card required).

---

## Scope

1. Homepage restructure (search, category tabs, featured strip, "New" badges)
2. Tool page improvement (back navigation)
3. New tool: Color Palette Generator
4. New tool: Word & Character Counter

---

## 1. Homepage Restructure

**File:** `src/views/HomeView.vue`

### Hero
Keep existing title ("getinside Tools") and subtitle. Tighten vertical spacing — the featured strip below provides the visual weight.

### Featured Strip
A horizontal row of 3 larger tool cards placed between the hero and the category tabs. Cards are slightly taller than regular grid cards, with a subtle "⭐ Featured" label.

Featured tools (hardcoded): **UTM Builder**, **DPI Checker**, **Color Palette Generator**.

### Category Tabs
A horizontal tab bar below the featured strip:

| Tab | Tools |
|-----|-------|
| All | All tools |
| Print | Paper Weight, DPI Checker |
| Digital | UTM Builder, Redirect Checker, Promo Code, Word Counter |
| Design | Color Palette Generator |

- Active tab stored in a local `ref<string>` (no routing change)
- Filters the tool grid client-side
- Default: "All"

### Search Bar
A text input above the category tabs. Filters tools by name + description in real time (case-insensitive). When a search query is active, the category tabs are hidden (search results span all categories).

- Search state: local `ref<string>`
- Filtering logic: inline in the component (no composable needed — single-use)

### Tool Grid
Same responsive auto-fill grid as today (`repeat(auto-fill, minmax(280px, 1fr))`). Each card gains:

- A **category tag** (small pill, muted, bottom of card) — for visual context when "All" tab is active
- A **"New" badge** (top-right, mint tint) on Color Palette and Word Counter
- PDF/X card is excluded from the category filter until the route is re-enabled

### i18n additions (fr.ts / en.ts)
```
nav.search (placeholder)
home.categories.all / print / digital / design
home.featured (section label)
home.new (badge label)
```

---

## 2. Tool Pages — Back Navigation

**Files:** All 7 files in `src/views/`

Add a `← Back to tools` link at the very top of each tool view, above `.gi-tool-header`. Uses `.gi-btn-ghost` styling, calls `router.push('/')`.

No breadcrumb trail, no share button.

---

## 3. New Tool: Color Palette Generator

**Composable:** `src/composables/useColorPalette.ts`
**View:** `src/views/ColorPaletteView.vue`
**Route:** `/color-palette`
**Category:** Design

### UX
- 5 color swatches displayed horizontally, each filling ~20% of the viewport width
- Press `spacebar` or click a "Generate" button to randomize unlocked colors
- Click a swatch to **lock** it (locked icon overlay, locked colors skip regeneration)
- Click the hex code below each swatch to **copy** to clipboard (2s confirmation)
- Swatches are tall (minimum 200px height) to feel immersive like coolors.co

### Composable API
```typescript
interface PaletteColor {
  hex: string
  locked: boolean
}

generatePalette(current: PaletteColor[]): PaletteColor[]
// Regenerates unlocked colors using HSL randomization
// Keeps locked colors unchanged

toggleLock(palette: PaletteColor[], index: number): PaletteColor[]

copyHex(hex: string): void
// Copies to clipboard, returns Promise<void>
```

### Color generation
HSL with controlled ranges for aesthetically pleasing palettes:
- Hue: 0–360 (full range)
- Saturation: 40–80% (avoids muddy/washed-out colors)
- Lightness: 35–65% (ensures readable hex text on swatch)

### i18n keys
```
colorPalette.title, desc, generate, lock, unlock, copied, pressSpace
```

### Tests
- `generatePalette` respects locked colors
- Unlocked colors change between calls
- `toggleLock` flips lock state at given index

---

## 4. New Tool: Word & Character Counter

**Composable:** `src/composables/useWordCounter.ts`
**View:** `src/views/WordCounterView.vue`
**Route:** `/word-counter`
**Category:** Digital

### UX
- Single `<textarea>` (full-width, ~8 rows)
- Results update live (computed from textarea content)
- 6 metrics displayed in a result grid:

| Metric | Calculation |
|--------|-------------|
| Words | Split on whitespace, filter empty |
| Characters (with spaces) | `str.length` |
| Characters (without spaces) | `str.replace(/\s/g, '').length` |
| Sentences | Split on `.!?`, filter empty |
| Paragraphs | Split on `\n\n+`, filter empty |
| Reading time | `Math.ceil(wordCount / 200)` min (200 wpm average) |

### Composable API
```typescript
interface TextStats {
  words: number
  charsWithSpaces: number
  charsWithoutSpaces: number
  sentences: number
  paragraphs: number
  readingTimeMin: number
}

analyzeText(text: string): TextStats
```

### i18n keys
```
wordCounter.title, desc, placeholder,
wordCounter.stats.words, charsWithSpaces, charsWithoutSpaces,
sentences, paragraphs, readingTime
```

### Tests
- Empty string returns all zeros
- Word count handles multiple spaces, leading/trailing whitespace
- Reading time rounds up (1 word = 1 min, not 0)
- Sentence/paragraph splitting edge cases

---

## 5. Router & Nav Updates

**File:** `src/router/index.ts`
- Add `/color-palette` → `ColorPaletteView` (lazy)
- Add `/word-counter` → `WordCounterView` (lazy)

**File:** `src/components/AppHeader.vue`
- Add nav links for Color Palette and Word Counter
- Add search input to header (synced with HomeView search state via a shared `provide/inject` or router query param — simpler: just duplicate the search in HomeView, since header search is not strictly needed for v1)

> **Decision:** Search lives only in `HomeView.vue` for v1 — no header search. ZeroKit has it in the header, but given our tool count (7), in-page search is sufficient. Revisit when tool count grows.

---

## 6. Verification

```bash
npm run dev        # Confirm all routes work, search filters, tabs filter
npm test           # 21 existing + new tests for useColorPalette + useWordCounter
npm run build      # No build errors, check dist/ size
npm run preview    # Smoke test on built output
```

Manual checks:
- Spacebar triggers palette regeneration on `/color-palette`
- Locked colors survive regeneration
- Hex copy shows 2s feedback
- Word counter updates live as you type
- "← Back to tools" navigates home on all 7 tool pages
- Category tabs correctly filter tools
- Search hides tabs and filters across all tools
- "New" badges visible on Color Palette and Word Counter cards
- FR/EN toggle works for all new strings
