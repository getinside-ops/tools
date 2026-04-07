# Repository Guidelines

## Project Structure & Module Organization
The main app lives in `src/` as a Vue 3 + Vite SPA. Put reusable UI in `src/components/`, route views in `src/views/`, and business logic in `src/composables/`. Keep translations in `src/i18n/`, router config in `src/router/`, shared styles in `src/assets/styles/`, and static assets in `assets/`, `public/`, and `fonts/`. The optional PDF/X service lives in `backend/`, and the Cloudflare worker for redirect checks lives in `workers/redirect-checker/`. Planning, reviews, and test notes belong in `docs/`; visual snapshots go in `visual-tests/`.

## Build, Test, and Development Commands
Run `npm run dev` to start the frontend at `http://localhost:5173/tools/`. Use `npm run build` for type-checking plus a production build, and `npm run preview` to inspect the built app locally. Run `npm test` for the Vitest suite and `npm run test:watch` while iterating. For backend work, use `cd backend && npm run dev` for watch mode or `cd backend && npm start` for a plain Node server.

## Coding Style & Naming Conventions
Use TypeScript with strict typing and 2-space indentation, matching the existing codebase. Prefer Vue SFCs with Composition API patterns. Name components and views in PascalCase like `ToolPageLayout.vue` or `RedirectCheckerView.vue`; name composables `useX.ts` like `useRedirectChecker.ts`. Keep logic in composables, keep views thin, and reuse the `Gi*` shared component pattern where possible.

## Testing Guidelines
Vitest with `@vue/test-utils` is the default test stack. Place tests in `__tests__/` and use `*.test.ts` naming, for example `src/composables/__tests__/usePalette.test.ts`. Add unit tests for composables and shared components when behavior changes. For canvas-heavy or UI-sensitive changes, also update or review the visual artifacts in `visual-tests/` and relevant notes in `docs/testing/`.

## Commit & Pull Request Guidelines
Follow the commit style already used in history: `feat:`, `fix:`, `docs:`. Keep each commit focused and describe the visible behavior change, not just the file touched. PRs should include a short summary, testing performed, linked issues when relevant, and screenshots for UI changes.

## Agent-Specific Notes
This repo already includes tool-specific operating notes in `CLAUDE.md` and `QWEN.md`; read the file that matches your agent before making broad changes. When working with external libraries, frameworks, SDKs, or CLIs, fetch current documentation with `ctx7`/Context7 instead of relying on memory.
