# CLAUDE.md — getinside Tools

## Commands

```bash
npm run dev        # Local dev server at http://localhost:5173/tools/
npm run build      # Build to dist/ (base: /tools/)
npm run preview    # Preview built site locally
npm test           # Run Vitest (42 tests, 6 composables)
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
│   ├── AppHeader.vue            # Logo → getinside.fr, nav links, FR/EN toggle
│   └── AppFooter.vue            # Two CTAs: getinside.fr + app.getinside.media
├── composables/                 # Pure logic, fully unit-tested
│   ├── usePaperWeight.ts        # calculatePaperWeight() + FORMATS constant
│   ├── useUtmBuilder.ts         # buildUtmUrl()
│   ├── useDpiChecker.ts         # calculatePrintDimensions() + getFormatStatus()
│   ├── useRedirectChecker.ts    # checkRedirect() — async, allorigins.win proxy
│   ├── usePromoCode.ts          # validatePromoCode() — 5-rule checklist
│   ├── useWordCounter.ts        # analyzeText() — words, chars, sentences, paragraphs, reading time
│   ├── useColorPalette.ts       # initPalette() + generatePalette() + toggleLock() — HSL color gen
│   ├── usePdfXConverter.ts      # convertToPdfX() — POST to VITE_PDFX_API_URL (backend not yet deployed)
│   └── __tests__/               # Vitest tests for the 6 pure composables
├── i18n/
│   ├── fr.ts                    # Source of truth; exports `type Messages`
│   └── en.ts                    # Imports `type Messages` from fr.ts for type safety
├── router/index.ts              # Hash history, 8 routes (pdf-x commented out — coming soon)
├── views/                       # One view per tool + HomeView
└── main.ts                      # App bootstrap: createI18n with localStorage locale detection
```

## Brand Tokens (global.css)

Key variables: `--gi-brand: #0aaa8e`, `--gi-mint: #6AE7C8`, `--gi-bg: #F7F6F3`, `--gi-surface: #fff`

Utility classes: `.gi-field`, `.gi-label`, `.gi-input`, `.gi-select`, `.gi-btn`, `.gi-btn-ghost`, `.gi-result`, `.gi-code`, `.gi-tool-header`, `.gi-table`, `.gi-status-ok/warning/error`

Color tints: `--gi-tint-green-*`, `--gi-tint-red-*`, `--gi-tint-yellow-*` (bg + text variants)

## Adding a New Tool

1. Add composable to `src/composables/` + tests in `__tests__/`
2. Add translations to `src/i18n/fr.ts` (in `nav`, `home.tools`, and tool-specific section) + `src/i18n/en.ts` — `nav.back` already exists, don't re-add
3. Create view in `src/views/` — include `<router-link to="/" class="gi-back-link">{{ t('nav.back') }}</router-link>` at top
4. Add route in `src/router/index.ts`
5. Add nav link in `src/components/AppHeader.vue`
6. Add entry to `allTools` array in `src/views/HomeView.vue` with `category` (`print`/`digital`/`design`) and `isNew` flag

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
