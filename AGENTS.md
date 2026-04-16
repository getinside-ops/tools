# Repository Guidelines

## Project Structure
- Main app: `src/` (Vue 3 + Vite SPA)
- Backend (optional): `backend/`
- Cloudflare worker: `workers/redirect-checker/`
- Visual tests: `visual-tests/`

## Commands
```bash
npm run dev          # Dev server at http://localhost:5173/tools/
npm run build        # Type-check + build to dist/
npm run preview      # Preview production build
npm test             # Vitest suite
npm run test:watch   # Watch mode

# Backend (optional)
cd backend && npm run dev   # Watch mode
cd backend && npm start     # Plain Node server
```

## Critical Rules (agents often miss these)

### Routing: Hash History Required
Always use `createWebHashHistory()` for GitHub Pages. Using `createWebHistory()` causes 404 on refresh/direct URLs.

### External Libraries: Use Context7
Fetch current docs instead of relying on memory:
```bash
npx -y @upstash/context7-mcp
```

### Canvas-Based Tools: Manual Test Only
Composables using HTML5 Canvas (`useMockupGenerator.ts`, image tools) cannot be unit-tested reliably with jsdom. Test manually in browser.

### Component Imports: Always Import What You Use
A component used in `<template>` MUST be imported in `<script setup>`. Missing imports work in dev but fail silently in production.

### Skill System: Use It Proactively
This repo uses the Superpower skill system. Relevant skills auto-trigger based on task type:
- `brainstorming` — Before any creative work
- `test-driven-development` — Before writing implementation code
- `systematic-debugging` — Before fixing bugs
- `verification-before-completion` — Before claiming work is done
- `requesting-code-review` — Before commits/PRs

## Style & Conventions
- TypeScript strict mode, 2-space indentation
- Components: PascalCase (`ToolPageLayout.vue`)
- Composables: `useXxx.ts` pattern
- Views: `XxxView.vue`
- Shared components: `Gi*` prefix
- i18n: French is source of truth (`fr.ts` exports `type Messages`)
- CSS: Use `--gi-*` tokens from `global.css`, not hardcoded values

## Testing
- Unit tests: Vitest in `src/composables/__tests__/`
- Canvas tools: Manual browser testing required
- Test file naming: `*.test.ts`

## Environment Variables
| Variable | Purpose |
|----------|---------|
| `VITE_PDFX_API_URL` | PDF/X converter backend (optional, not deployed) |
| `VITE_REDIRECT_API_URL` | Redirect checker proxy (optional) |

## Adding a New Tool
1. Add composable to `src/composables/` + tests in `__tests__/`
2. Add translations to `src/i18n/fr.ts` (source of truth) + `en.ts`
3. Create view in `src/views/` using `ToolPageLayout`
4. Add route in `src/router/index.ts`
5. Add nav link in `src/components/AppHeader.vue`
6. Add entry to `allTools` in `src/views/HomeView.vue`

## Deployment
- GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`)
- Pages source must be set to **"GitHub Actions"** in repo settings

## Existing Instructions
- `CLAUDE.md` — Tool-specific operating notes
- `QWEN.md` — Detailed patterns and learnings