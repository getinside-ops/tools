# CLAUDE.md — getinside Tools

## Commands

```bash
npm run dev        # Local dev server at http://localhost:5173/tools/
npm run build      # Build to dist/ (base: /tools/)
npm run preview    # Preview built site locally
npm test           # Run Vitest (227 tests, 39 test files)
npm run test:watch # Watch mode
```

## Architecture

**Vite 5 + Vue 3 SPA** deployed to `https://getinside-ops.github.io/tools/` via GitHub Actions.

- **Routing**: `vue-router` in hash mode (`createWebHashHistory`) — avoids GitHub Pages 404 on direct URLs
- **i18n**: `vue-i18n` v9, `legacy: false` — locale auto-detected from `localStorage` → `navigator.language`, FR/EN toggle in header
- **Base path**: `/tools/` — configured in `vite.config.ts`; all asset URLs are `/tools/assets/...`

## File Structure

```
src/
├── assets/styles/global.css    # Brand tokens --gi-* + utility classes
├── components/
│   ├── AppHeader.vue            # Logo → getinside.fr, nav links, FR/EN + dark mode toggle
│   ├── AppFooter.vue            # Two CTAs: getinside.fr + app.getinside.media
│   ├── GiImageUpload.vue        # Reusable upload: paste / drag-drop / click (emits `upload`, `error`)
│   ├── ToolPageLayout.vue       # Standard page wrapper used by all tool views (props: title, description, category; slots: #icon, #default, #about)
│   └── Gi*.vue                  # Shared UI: GiResultCard, GiStatusBadge, GiInfoBox, GiFormField, etc.
├── composables/                 # Pure logic, fully unit-tested (34 composables)
│   ├── useTheme.ts              # Dark mode toggle — sets data-theme="dark" on <html>
│   ├── useMockupGenerator.ts    # generateMockup(img) → canvas — NOT unit-testable (canvas stub in jsdom); manual browser test only
│   ├── usePdfXConverter.ts      # convertToPdfX() — POST to VITE_PDFX_API_URL (backend not yet deployed)
│   └── __tests__/               # Vitest tests (39 test files)
├── i18n/
│   ├── fr.ts                    # Source of truth; exports `type Messages`
│   └── en.ts                    # Imports `type Messages` from fr.ts for type safety
├── router/index.ts              # Hash history, 30 active routes
├── views/                       # One view per tool + HomeView
└── main.ts                      # App bootstrap: createI18n with localStorage locale detection
```

## Brand Tokens (global.css)

Key variables: `--gi-brand: #0aaa8e`, `--gi-mint: #6AE7C8`, `--gi-bg: #F7F6F3`, `--gi-surface: #fff`

Token families: `--gi-brand-*`, `--gi-bg-*`, `--gi-surface-*`, `--gi-border-*`, `--gi-text-*`, `--gi-tint-{green,red,yellow,blue,purple,orange}-*`, `--gi-shadow-{sm,md,lg,xl}`, `--gi-space-{xs,sm,md,lg,xl,2xl,3xl}`, `--gi-radius-{sm,md,lg,xl,pill}`, `--gi-transition-{fast,base,slow}`, `--gi-ease-{in,out,in-out,bounce}`

Utility classes: `.gi-field`, `.gi-label`, `.gi-input`, `.gi-select`, `.gi-btn`, `.gi-btn-ghost`, `.gi-result`, `.gi-code`, `.gi-tool-header`, `.gi-table`, `.gi-status-ok/warning/error`

Dark mode: `useTheme()` toggles `data-theme="dark"` on `<html>`. Override tokens in `[data-theme="dark"] { }`.

## ToolPageLayout.vue

All tool views use `ToolPageLayout`. Structure:

```vue
<ToolPageLayout
  :title="t('myTool.title')"
  :description="t('myTool.desc')"
  category="print|digital|design"
>
  <template #icon><MyIcon :size="24" /></template>

  <!-- tool content -->

  <template #about>{{ t('myTool.about') }}</template>
</ToolPageLayout>
```

**Props:** `title` (required), `description` (required), `category` (`'print'|'digital'|'design'`)

**Category badge colours:** print → `--gi-brand` (green), digital → `--gi-tint-blue-text` (blue), design → `--gi-tint-purple-text` (purple)

**`#about` slot** renders a styled panel at the bottom with an accent-bar header ("About this tool" / "À propos de cet outil"). Always present when the slot is filled.

## Adding a New Tool

1. Add composable to `src/composables/` + tests in `__tests__/`
2. Add translations to `src/i18n/fr.ts` (in `nav`, `home.tools`, and tool-specific section — include an `about` key with 2–3 sentence description) + `src/i18n/en.ts` — `nav.back` already exists, don't re-add
3. Create view in `src/views/` using `ToolPageLayout` with `category` prop and `#about` slot
4. Add route in `src/router/index.ts`
5. Add nav link in `src/components/AppHeader.vue`
6. Add entry to `allTools` array in `src/views/HomeView.vue` with `category` (`print`/`digital`/`design`), `isNew`, and optionally `isPopular` flag

## Canvas Device Mockup Pattern (useMockupGenerator.ts)

Screen rect for `public/apple-iphone-15-black-portrait.png` (1419×2796): `{ x: 120, y: 120, w: 1179, h: 2556 }` — symmetric 120px borders, full display including behind notch.

Compositing order: clip to `ctx.roundRect(SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h, 130)` → draw user image → `ctx.restore()` → draw frame on top. Corner radius ~130px; adjust if bleed reappears.

`public/` assets: use `` `${import.meta.env.BASE_URL}filename.png` `` (not hardcoded `/tools/`).

## PDF/X Tool (coming soon)

The `usePdfXConverter.ts` and `PdfXView.vue` are implemented but hidden. The backend (Node.js + Ghostscript + Docker) is in `backend/`. To re-enable:
1. Deploy `backend/` to a Docker host (e.g. Hugging Face Spaces — free, no credit card)
2. Set `VITE_PDFX_API_URL` as a GitHub Actions secret in repo settings
3. Uncomment the route in `src/router/index.ts` and the nav link in `src/components/AppHeader.vue`
4. Add PDF/X entry to `allTools` in `src/views/HomeView.vue` with `category: 'print'`

## Deployment

**GitHub Actions** (`.github/workflows/deploy.yml`): push to `main` → `npm ci` → `npm run build` → deploy `dist/` to GitHub Pages.

**Required repo setting**: Pages source must be set to **"GitHub Actions"** (not "Deploy from a branch") in `https://github.com/getinside-ops/tools/settings/pages`.

## RTK (Token-Optimized CLI)

Always prefix commands with `rtk` for token savings:
```bash
rtk git status / log / diff / add / commit / push
rtk npm run <script>
```
