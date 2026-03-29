---
title: Mockup Generator Tool
date: 2026-03-29
status: approved
---

# Mockup Generator — Design Spec

## Overview

A client-side tool that composites a user-uploaded screenshot onto an iPhone 15 device frame, producing a polished mockup PNG. No backend, no dependencies beyond what the project already uses.

## Scope

- iPhone 15 black portrait only (one device, one orientation)
- Input: any raster image (PNG, JPG, WEBP)
- Fit mode: cover (fill screen rect, crop edges as needed)
- Output: download as PNG + copy to clipboard

## Architecture

### Composable: `src/composables/useMockupGenerator.ts`

Pure function, no Vue reactivity. Takes a user `HTMLImageElement` and returns an `HTMLCanvasElement` with the composited result.

```ts
export function generateMockup(userImage: HTMLImageElement): HTMLCanvasElement
```

**Screen rect** — hardcoded constants for the iPhone 15 frame PNG:
```ts
const FRAME_SRC = '/tools/apple-iphone-15-black-portrait.png'
const SCREEN = { x: number, y: number, w: number, h: number } // measured from PNG
```

**Compositing steps (canvas):**
1. Set canvas to frame PNG native dimensions
2. Draw user image cover-cropped to `SCREEN` rect using `drawImage` with `sx/sy/sw/sh` computed from aspect ratios
3. Load frame PNG and draw on top (`source-over`)

> **Prep requirement:** `apple-iphone-15-black-portrait.png` must have full transparency (`alpha = 0`) in the screen area before this compositing works. This is a one-time step performed before implementation using any image editor (Figma, Photoshop, GIMP, etc.).

### View: `src/views/MockupGeneratorView.vue`

Handles all Vue reactivity and user interaction. Calls `generateMockup()` and renders a `<canvas>` preview.

**State:**
- `userImage: HTMLImageElement | null` — loaded from file input
- `canvas: HTMLCanvasElement | null` — composited result
- `copied: boolean` — clipboard feedback flag

**Sections (top to bottom):**
1. Back link (`gi-back-link`)
2. Tool header (`gi-tool-header`) with title + description
3. Drop zone — dashed border area, click-to-upload + drag-and-drop, accepts `image/*`
4. Preview — `<canvas>` centered, `max-width: 400px`, hidden when no image loaded
5. Action row — "Download PNG" (`gi-btn`) + "Copy to clipboard" (`gi-btn-ghost`), hidden when no image loaded

## Data Flow

```
User drops/selects image
  → FileReader.readAsDataURL
  → new Image() with src = dataURL
  → generateMockup(img) → HTMLCanvasElement
  → canvas rendered in <canvas> element
  → Download: canvas.toBlob() → <a> click
  → Clipboard: ClipboardItem + navigator.clipboard.write()
```

## Error Handling

- Clipboard API unavailable: catch silently, button does nothing (same pattern as ColorPaletteView)
- Invalid file type: browser `accept="image/*"` attribute prevents most cases; no explicit validation needed

## i18n

New keys under `mockupGenerator` namespace in `fr.ts` and `en.ts`:

```ts
mockupGenerator: {
  title: string         // "Générateur de mockup" / "Mockup Generator"
  desc: string          // short description
  dropZone: string      // "Déposez votre capture ici ou cliquez pour importer"
  download: string      // "Télécharger en PNG"
  copy: string          // "Copier dans le presse-papiers"
  copied: string        // "Copié !"
}
```

Also add nav entry: `nav.mockupGenerator`.
Also add `home.tools` entry (title + desc keys).

## Routing & Navigation

- Route: `/mockup` → `MockupGeneratorView`
- Nav link in `AppHeader.vue`
- Entry in `allTools` array in `HomeView.vue`:
  ```ts
  { route: '/mockup', icon: '📱', titleKey: '...', descKey: '...', category: 'design', isNew: true }
  ```

## Testing

`useMockupGenerator.ts` contains canvas manipulation — not unit-testable in jsdom (canvas is a stub). No Vitest tests for this composable. Manual browser testing is the verification path.

The other 6 composables' tests are unaffected.
