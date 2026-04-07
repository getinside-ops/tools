# getinside Tools — Project Context

## Commands

```bash
npm run dev        # Local dev server at http://localhost:5173/tools/
npm run build      # Build to dist/ (base: /tools/)
npm run preview    # Preview built site locally
npm test           # Run Vitest (241 tests, 40 test files)
npm run test:watch # Watch mode
```

## Project Overview

**getinside Tools** is a collection of free, client-side web tools for print, digital, and design workflows. It's a **Vue 3 + Vite SPA** deployed to GitHub Pages at `https://getinside-ops.github.io/tools/`.

**Key Characteristics:**
- **No authentication, no server-side processing** — all tools run entirely in the browser
- **Bilingual** — French (FR) and English (EN) with auto-detection from `localStorage` → `navigator.language`
- **Composable architecture** — pure logic in composables, fully unit-tested
- **Brand identity** — uses `--gi-*` CSS tokens (brand color: `#0aaa8e`)

## Superpower Skill System

**IMPORTANT:** This project uses the **Superpower skill system** — a collection of composable skills that auto-trigger based on task type.

**Skill Location:** User-level installation at `~/.qwen/extensions/superpowers/skills/`

**Core Rule:** You MUST invoke relevant skills BEFORE any task. If there's even a 1% chance a skill applies, invoke it.

### Available Skills (14 total)

| Skill | Purpose | Triggers When |
|-------|---------|---------------|
| `brainstorming` | Socratic design refinement, explores alternatives | Starting any creative work, planning features, designing architecture |
| `using-git-worktrees` | Creates isolated workspace on new branch | Starting feature work that needs isolation |
| `writing-plans` | Breaks work into bite-sized tasks (2-5 min each) | After design approval, before coding |
| `executing-plans` | Batch execution with human checkpoints | Executing approved plans |
| `subagent-driven-development` | Fast iteration with two-stage review per task | Delegating task execution |
| `dispatching-parallel-agents` | Concurrent subagent workflows | 2+ independent tasks without shared state |
| `test-driven-development` | RED-GREEN-REFACTOR cycle | Writing any implementation code |
| `systematic-debugging` | 4-phase root cause analysis | Bugs, errors, crashes, unexpected behavior |
| `verification-before-completion` | Final verification checklist | About to claim work is complete |
| `requesting-code-review` | Pre-commit/merge code review | Before committing or creating PRs |
| `receiving-code-review` | Responding to feedback | Implementing code review suggestions |
| `finishing-a-development-branch` | Merge/PR decision workflow | All tasks complete, ready to merge |
| `writing-skills` | Create/edit new skills | Extending the skill system |
| `using-superpowers` | Introduction to skills system | Starting any conversation |

### Skill Types

- **Rigid** (TDD, debugging): Follow exactly, don't adapt away discipline
- **Flexible** (patterns, brainstorming): Adapt principles to context

### Workflow

1. User request → `brainstorming` (if design needed)
2. Design approved → `using-git-worktrees` + `writing-plans`
3. Plan approved → `executing-plans` or `subagent-driven-development`
4. Each task → `test-driven-development` + `verification-before-completion`
5. Between tasks → `requesting-code-review`
6. All done → `finishing-a-development-branch`

**Note:** Skills override default system behavior, but user instructions always take highest priority.

## MCP Extensions

This project leverages four Model Context Protocol (MCP) extensions for enhanced development workflows:

### Context7

**Purpose:** Provides up-to-date, version-specific library documentation to prevent hallucinated APIs and outdated code examples.

**Command:** `npx -y @upstash/context7-mcp`

**When to Use:**
- Working with external libraries (Vue, Vite, culori, jsqr, etc.)
- Need current API documentation for specific versions
- Verifying API existence before implementation

**Usage:**
- Auto-triggers when referencing external libraries
- Mention "use Context7" or specific library IDs (e.g., `/vuejs/core`, `/vitejs/vite`)
- Supports version specification (e.g., "Vue 3.5", "Vite 6")

**Benefits:**
- Eliminates hallucinated APIs
- Provides version-specific code examples
- Pulls documentation directly from source

### Playwright MCP

**Purpose:** Browser automation for E2E testing, visual validation, and interactive debugging.

**Command:** `npx @playwright/mcp@latest`

**Capabilities:**
| Tool | Description |
|------|-------------|
| `browser_navigate` | Navigate to any URL |
| `browser_click`, `browser_type`, `browser_fill_form` | Interact with page elements |
| `browser_snapshot` | Capture accessibility snapshot (structured, not screenshot) |
| `browser_take_screenshot` | Capture screenshot |
| `browser_console_messages`, `browser_network_requests` | Inspect runtime behavior |
| `browser_evaluate` | Execute JavaScript on page |
| `browser_verify_*` | Assertion helpers for testing |

**When to Use:**
- **Manual testing** canvas-based tools (Mockup Generator, Image Compressor, Cropper, Filters)
- **E2E validation** of complete tool workflows
- **Visual regression** testing with screenshots
- **Debugging** runtime issues in browser context
- **Accessibility** verification via structured snapshots

**Usage Examples:**
```bash
# Navigate and test a tool
browser_navigate http://localhost:5173/tools/#/mockup-generator
browser_snapshot  # Get structured page data
browser_click  # Interact with elements

# Take screenshot for visual verification
browser_take_screenshot

# Check console for errors
browser_console_messages
```

**Configuration:**
- Default browser: Chrome (headed)
- Headless mode: `--headless` flag
- Isolated sessions: `--isolated` flag (fresh profile each session)
- Viewport: `--viewport-size "1280x720"`

**Note:** Playwright complements Vitest unit tests — use for integration/E2E scenarios that require real browser interaction.

### GitHub MCP

**Purpose:** Direct integration with GitHub for issue tracking, PR management, and deployment workflows.

**Configuration:** Requires `GITHUB_PERSONAL_ACCESS_TOKEN` environment variable

**Capabilities:**
- **Issues:** Create, update, search, and manage project issues
- **Pull Requests:** Create, review, merge PRs
- **Repository:** Browse files, commits, branches
- **Actions:** Trigger workflows, check deployment status
- **Code Scanning:** Access security alerts and code quality reports

**When to Use:**
- Creating issues from bug reports
- Managing PR review workflow
- Checking GitHub Actions deployment status
- Browsing repository history
- Automating release workflows

**Security:** Push protection prevents accidental secret exposure in AI-generated content.

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Vue 3.5.13 (Composition API, `<script setup>`) |
| Build Tool | Vite 5 |
| Routing | vue-router 4.6.4 (hash mode for GitHub Pages) |
| i18n | vue-i18n v9 (legacy: false) |
| Testing | Vitest 4.1.2 + jsdom + @vue/test-utils |
| Language | TypeScript 5.6.2 (strict mode) |
| Icons | lucide-vue-next |
| Utilities | culori, jsqr, apca-w3, colorparsley |

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

## Building and Running

### Development

```bash
npm install              # Install dependencies
npm run dev              # Dev server at http://localhost:5173/tools/
```

### Build & Preview

```bash
npm run build            # Type-check + build to dist/
npm run preview          # Preview production build locally
```

### Testing

```bash
npm test                 # Run Vitest (121 tests across 29 composables)
npm run test:watch       # Watch mode
```

### Deployment

**GitHub Actions** (`.github/workflows/deploy.yml`): push to `main` → `npm ci` → `npm run build` → deploy `dist/` to GitHub Pages.

**Required repo setting**: Pages source must be set to **"GitHub Actions"** (not "Deploy from a branch") in `https://github.com/getinside-ops/tools/settings/pages`.

## Tool Categories

Tools are organized into 3 categories:

| Category | Tools |
|----------|-------|
| **Print** | Paper Weight, DPI Checker, PDF/X Converter, Safety Margin |
| **Digital** | UTM Builder, Redirect Checker, Promo Code, Word Counter, URL Parser, QR Decoder, Barcode, Favicon, Lorem Ipsum, Metadata |
| **Design** | Color Palette, Mockup Generator, Color Converter, Contrast Checker, Type Scale, Image Compressor/Cropper/Resizer/Filters/Converter, Placeholder, Matte Generator, Colorblind Simulator, Px↔Rem |

## Key Patterns

### Composable Pattern

All business logic lives in composables (`src/composables/`). They are:
- **Pure functions** — no side effects, easy to test
- **Fully unit-tested** — tests in `__tests__/` directory
- **Type-safe** — exported interfaces/types for results

Example (`useQrDecoder.ts`):
```typescript
export interface QrDecodeResult {
  success: boolean
  data: string | null
  error?: string
}

export function decodeQrFromBlob(blob: Blob): Promise<QrDecodeResult>
export function decodeQrFromPasteEvent(e: ClipboardEvent): Promise<QrDecodeResult>
```

### i18n Pattern

- **French is source of truth** — `fr.ts` exports `type Messages`
- **English imports type** — `en.ts` uses `const en: Messages` for type safety
- **Auto-detection** — locale from `localStorage` → `navigator.language`
- **Toggle in header** — FR/EN button in `AppHeader.vue`

### View Pattern

All tool views follow the same structure:
```vue
<template>
  <div>
    <router-link to="/" class="gi-back-link">{{ t('nav.back') }}</router-link>
    <div class="gi-tool-header">
      <h1>{{ t('tool.title') }}</h1>
      <p>{{ t('tool.desc') }}</p>
    </div>
    <!-- Tool UI -->
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
// ...
</script>
```

### CSS Utility Classes

Global styles provide consistent UI components:
- `.gi-field`, `.gi-label`, `.gi-input`, `.gi-select` — form elements
- `.gi-btn`, `.gi-btn-ghost` — buttons
- `.gi-result`, `.gi-code`, `.gi-table` — results display
- `.gi-status-ok/warning/error` — status badges
- `.gi-tint-green-*`, `.gi-tint-red-*`, `.gi-tint-yellow-*` — color tints

## Brand Tokens (global.css)

Key variables: `--gi-brand: #0aaa8e`, `--gi-mint: #6AE7C8`, `--gi-bg: #F7F6F3`, `--gi-surface: #fff`

Token families: `--gi-brand-*`, `--gi-bg-*`, `--gi-surface-*`, `--gi-border-*`, `--gi-text-*`, `--gi-tint-{green,red,yellow,blue,purple,orange}-*`, `--gi-shadow-{sm,md,lg,xl}`, `--gi-space-{xs,sm,md,lg,xl,2xl,3xl}`, `--gi-radius-{sm,md,lg,xl,pill}`, `--gi-transition-{fast,base,slow}`, `--gi-ease-{in,out,in-out,bounce}`

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

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_PDFX_API_URL` | PDF/X converter backend (optional, not deployed) |
| `VITE_REDIRECT_API_URL` | Redirect checker proxy (optional) |

Set as GitHub Actions secrets for deployment.

## Canvas Device Mockup Pattern (useMockupGenerator.ts)

Screen rect for `public/apple-iphone-15-black-portrait.png` (1419×2796): `{ x: 120, y: 120, w: 1179, h: 2556 }` — symmetric 120px borders, full display including behind notch.

Compositing order: clip to `ctx.roundRect(SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h, 130)` → draw user image → `ctx.restore()` → draw frame on top. Corner radius ~130px; adjust if bleed reappears.

`public/` assets: use `` `${import.meta.env.BASE_URL}filename.png` `` (not hardcoded `/tools/`).

## GiLogSlider Component

**Location:** `src/components/GiLogSlider.vue`

**Purpose:** Logarithmic slider for values spanning wide ranges (e.g., grammage 1-500).

**Props:**
- `modelValue: number` — Current value (v-model)
- `min: number` — Minimum value
- `max: number` — Maximum value
- `step: number | ((v: number) => number)` — Step size or function
- `marks?: { value: number; label: string }[]` — Visual marks on slider
- `snapTo?: number[]` — Optional array to snap to specific values (simple nearest neighbor)
- `label?: string` — Accessible label

**Key Behavior:**
- Uses logarithmic scale for positioning (better feel for wide ranges)
- `snapTo` uses **simple nearest neighbor** (no forced capture zones or sticky behavior)
- Slider moves smoothly without complex snapping logic
- Step function rounds to nearest increment: `Math.round(value / step) * step`

**Example:**
```vue
<GiLogSlider
  v-model="grammage"
  :min="1"
  :max="500"
  :step="() => 5"
  :marks="grammageMarks"
  :label="t('paperWeight.grammage')"
/>
```

**Note:** Avoid complex snapping logic — simple step-based rounding works best. Complex "sticky" behavior was buggy and removed.

## PDF/X Tool (coming soon)

The `usePdfXConverter.ts` and `PdfXView.vue` are implemented but hidden. The backend (Node.js + Ghostscript + Docker) is in `backend/`. To re-enable:
1. Deploy `backend/` to a Docker host (e.g. Hugging Face Spaces — free, no credit card)
2. Set `VITE_PDFX_API_URL` as a GitHub Actions secret in repo settings
3. Uncomment the route in `src/router/index.ts` and the nav link in `src/components/AppHeader.vue`
4. Add PDF/X entry to `allTools` in `src/views/HomeView.vue` with `category: 'print'`

## Testing Strategy

The project uses a three-tier testing approach:

### 1. Unit Tests (Vitest)

**Purpose:** Test pure composables (business logic) in isolation.

**Setup:**
- **Framework:** Vitest 4.1.2 + jsdom + @vue/test-utils
- **Environment:** jsdom simulates browser APIs
- **Coverage:** `npx vitest run --coverage`

**Commands:**
```bash
npm test           # Run all tests
npm run test:watch # Watch mode
```

**Test Location:** `src/composables/__tests__/`

**What to Test:**
- All pure composables (e.g., `useQrDecoder`, `usePaperWeight`, `useUtmBuilder`)
- Input/output transformations
- Error handling
- Edge cases

**What NOT to Test:**
- Canvas-based composables (jsdom stubs canvas, making tests unreliable)

### 2. Manual Browser Testing

**Purpose:** Test canvas-based tools that can't be unit-tested.

**Tools Requiring Manual Testing:**
- Mockup Generator (`useMockupGenerator.ts`)
- Image Compressor/Cropper/Resizer/Filters
- Color Palette Generator
- Any tool using HTML5 Canvas API

**Process:**
1. Run `npm run dev` to start dev server
2. Open tool in browser at `http://localhost:5173/tools/`
3. Test all interactions manually
4. Verify visual output matches expectations

### 3. E2E Testing (Playwright)

**Purpose:** End-to-end validation of complete user workflows.

**Setup:**
- **Framework:** Playwright MCP (`@playwright/mcp`)
- **Browser:** Chrome (default), Firefox, WebKit
- **Mode:** Headed (default) or headless (`--headless`)

**When to Use:**
- Validate complete tool workflows
- Visual regression testing
- Accessibility verification
- Cross-browser testing
- Network request inspection

**Example Workflow:**
```bash
# Navigate to tool
browser_navigate http://localhost:5173/tools/#/qr-decoder

# Interact with UI
browser_click      # Upload button
browser_type       # Enter text
browser_fill_form  # Fill multiple fields

# Verify results
browser_snapshot           # Get structured page data
browser_take_screenshot    # Visual verification
browser_console_messages   # Check for errors
browser_verify_text_visible # Assertion
```

**Note:** Playwright tests complement (not replace) Vitest unit tests. Use Vitest for logic, Playwright for integration.

### Testing Checklist for New Tools

| Tool Type | Unit Tests | Manual Test | E2E Test |
|-----------|-----------|-------------|----------|
| Pure composable (no canvas) | ✅ Required | ❌ Not needed | ⚠️ Optional |
| Canvas-based composable | ❌ Skip | ✅ Required | ⚠️ Optional |
| Complete tool workflow | ✅ For logic | ✅ For UI | ✅ Recommended |

## Development Conventions

- **TypeScript strict mode** — no implicit any, no unused locals/parameters
- **Composition API** — `<script setup>` syntax
- **Vue 3 idioms** — `ref`, `computed`, `watch`, no Options API
- **Naming** — composables: `useXxx.ts`, views: `XxxView.vue`
- **Code style** — consistent formatting, semantic HTML

## Repository Info

- **URL:** https://github.com/getinside-ops/tools
- **Deployed:** https://getinside-ops.github.io/tools/
- **License:** See `LICENSE` file

---

## Session Learnings & Best Practices

### Subagent-Driven Development with Code Review

**Pattern that works:**
1. Dispatch subagent for each task with clear plan instructions
2. Request code review immediately after task completion
3. Fix issues before proceeding to next task
4. Repeat for all tasks

**Example workflow:**
```
Subagent executes task → Code review → Fix issues → Commit → Next task
```

**Why it works:**
- Fresh eyes on each task catch issues early
- Two-stage review (subagent + code-reviewer) prevents problems compounding
- Fast iteration with clear boundaries between tasks

### Design System Token Usage

**Always use CSS variables** for consistency:
```css
/* ✅ Good */
color: var(--gi-text);
background: var(--gi-surface);
padding: var(--gi-space-md);

/* ❌ Avoid */
color: #1a1a1a;
background: #ffffff;
padding: 0.75rem;
```

**Token categories to use:**
- `--gi-brand-*` — Brand colors (primary, dark, light, fade)
- `--gi-bg-*`, `--gi-surface-*` — Backgrounds
- `--gi-border-*` — Borders
- `--gi-text-*` — Text colors
- `--gi-tint-*-*` — Tint backgrounds (blue, green, yellow, red, purple, orange)
- `--gi-shadow-*` — Shadows (sm, md, lg, xl, inner, glow)
- `--gi-space-*` — Spacing (xs, sm, md, lg, xl, 2xl, 3xl)
- `--gi-font-size-*` — Typography (xs, sm, md, lg, xl, 2xl, 3xl, base)
- `--gi-radius-*` — Border radius (sm, md, lg, xl, 2xl, pill)
- `--gi-transition-*` — Durations (instant, fast, base, slow, slower)
- `--gi-ease-*` — Easing curves (in, out, in-out, bounce)

### Accessibility Checklist

**For all interactive components:**
- [ ] `:focus-visible` state with visible outline
- [ ] `:focus-within` for card-like containers
- [ ] ARIA roles for custom components (`role="list"`, `role="listitem"`)
- [ ] Keyboard navigation works (Tab key)
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Dark mode focus states are visible

**Example focus state:**
```css
.gi-btn:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}
```

### Component Creation Pattern

**When creating new components:**
1. Export TypeScript interfaces for reusability
2. Add `defineOptions({ name: 'ComponentName' })` for DevTools
3. Add JSDoc documentation with examples
4. Use ARIA attributes for semantic markup
5. Use stable keys in `v-for` (not array index)
6. Handle edge cases (value: 0, undefined, null)
7. Test in both light and dark modes

**Example:**
```typescript
/**
 * GiComparison - Side-by-side comparison component
 */
export interface ComparisonItem {
  label: string
  value?: string | number
}

defineOptions({
  name: 'GiComparison'
})
```

### Dark Mode Considerations

**Always verify:**
1. Tint variables have dark mode equivalents with adjusted opacity
2. Focus rings are visible on dark backgrounds (may need stronger opacity)
3. Shadows use higher opacity for dark backgrounds
4. Custom colors (passed as props) have sufficient contrast

**Example dark mode override:**
```css
[data-theme="dark"] .gi-input:focus {
  box-shadow: 0 0 0 3px rgba(10, 170, 142, 0.25); /* Stronger than light mode */
}
```

### Animation Best Practices

**For smooth, polished animations:**
1. Use easing curves (not linear): `var(--gi-ease-out)` for most transitions
2. GPU-accelerate with `transform` and `opacity` (avoid `top`, `left`)
3. Keep durations short: 0.15s for hover, 0.2s for standard, 0.4s for complex
4. Use `var(--gi-ease-bounce)` for playful micro-interactions
5. Respect `prefers-reduced-motion` media query

**Example:**
```css
.home-card {
  transition: all var(--gi-transition-base) var(--gi-ease-out);
}

.home-card:hover {
  transform: translateY(-4px); /* GPU-accelerated */
  box-shadow: var(--gi-shadow-lg);
}
```

### Code Review Integration

**When to request code review:**
- After completing each task (before next task)
- Before committing changes
- When adding new components
- When modifying core styles

**What reviewers check:**
- Critical: Syntax errors, breaking changes, accessibility
- Important: Dark mode compatibility, contrast, consistency
- Minor: Comments, organization, documentation

### Visual Testing Strategy

**Manual testing checklist:**
1. Homepage in light and dark mode
2. At least 4 individual tool pages
3. Keyboard navigation (Tab through interactive elements)
4. Focus states are visible
5. Hover animations are smooth
6. New components render correctly
7. Mobile responsive behavior

**Document with screenshots:**
- Save to `visual-tests/` directory
- Name files descriptively: `homepage-light.png`, `homepage-dark.png`
- Create report in `docs/plans/visual-regression-report.md`

### Commit Message Patterns

**Follow conventional commits:**
```
style: refine color palette for cleaner aesthetic
fix: add missing --gi-surface-elevated to dark theme
feat: add comparison component for side-by-side views
docs: update design system with new components
chore: verify build and tests pass
```

**Pattern:** `type: description` where:
- `style` — Visual/design changes
- `fix` — Bug fixes
- `feat` — New features/components
- `docs` — Documentation updates
- `chore` — Build/test verification

### Documentation Updates

**When to update docs:**
- After adding new components (add to design-system.md)
- After major refactors (update patterns section)
- At end of large changes (create results document)

**Documentation locations:**
- `docs/design-system.md` — Component API and usage
- `docs/plans/` — Implementation plans and results
- `QWEN.md` — Project-wide patterns and learnings

---

## Session Learnings & Best Practices (Continued)

### GitHub Pages Routing: Hash History Required

**Critical Rule:** Always use `createWebHashHistory()` for Vue Router when deploying to GitHub Pages.

**Why:** GitHub Pages is a static host that doesn't support URL rewriting. Using `createWebHistory()` causes 404 errors on:
- Page refresh
- Direct URL access (new tab)
- Deep linking

**Correct Configuration:**
```typescript
// ✅ Good - works with GitHub Pages
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [...]
})
```

**Incorrect Configuration:**
```typescript
// ❌ Bad - causes 404 on GitHub Pages
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...]
})
```

**URL Format:** With hash history, URLs will be:
- `https://getinside-ops.github.io/tools/#/paper-weight`
- `https://getinside-ops.github.io/tools/#/qr-decoder`

This is expected and correct for static hosting deployments.

**Debugging Tip:** If users report 404 on tool pages, check that router uses `createWebHashHistory`, not `createWebHistory`.

---

## Session Learnings: Image Upload Standardization (April 2026)

### Component Architecture Pattern

**Created `<GiImageUpload>` component** — Reusable component with three input methods:
1. **Paste zone** — Click-to-focus div with clipboard paste support (keyboard accessible)
2. **Drag & drop** — Drop files directly on the zone
3. **Click to upload** — Hidden file input triggered by zone click

**Key design decisions:**
- Component uses `useImageUpload` composable for pure validation logic
- i18n support via vue-i18n with optional prop overrides (for special cases like PDF/X)
- Emits `upload: [file: File]` and `error: [error: string]` events
- Exposes `reset()` method via `defineExpose`

**Composable API:**
```typescript
export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn

interface UseImageUploadOptions {
  accept?: string[]      // ['image/*'], ['.pdf'], etc.
  multiple?: boolean     // Future support
  maxSizeMB?: number     // File size limit
}

interface UseImageUploadReturn {
  file: Ref<File | null>
  error: Ref<string | null>
  isProcessing: Ref<boolean>
  isValidFile: (file: File) => boolean
  processFile: (file: File) => Promise<void>
  reset: () => void
}
```

### File Validation Logic

**Critical pattern for accept type validation:**
```typescript
function isValidFile(file: File): boolean {
  const isAccepted = accept.some(type => {
    // Wildcard pattern (e.g., image/*)
    if (type.endsWith('/*')) {
      const baseType = type.slice(0, -2)
      return file.type.startsWith(baseType + '/')
    }
    // MIME type (e.g., application/pdf)
    if (type.includes('/') && !type.startsWith('.')) {
      return file.type === type
    }
    // File extension (e.g., .png, .pdf)
    if (type.startsWith('.')) {
      return file.name.toLowerCase().endsWith(type.toLowerCase())
    }
    // Fallback: exact match
    return file.type === type
  })
  
  if (!isAccepted) {
    error.value = `File type "${file.type}" is not accepted`
    return false
  }
  
  // Size validation
  if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
    error.value = `File size exceeds ${maxSizeMB}MB limit`
    return false
  }
  
  return true
}
```

**Key lessons:**
- Always check wildcards FIRST, then MIME types, then extensions
- Use case-insensitive extension matching
- Provide specific error messages (not generic "invalid file")

### i18n Pattern for Components

**Correct pattern for bilingual components:**
```typescript
// Props with undefined defaults (allow overrides)
const props = withDefaults(defineProps<{
  pasteTitle?: string
  pasteHint?: string
  uploadText?: string
}>(), {
  pasteTitle: undefined,
  pasteHint: undefined,
  uploadText: undefined,
})

// Computed with i18n fallback
const pasteTitleText = computed(() => props.pasteTitle || t('imageUpload.pasteTitle'))
const pasteHintText = computed(() => props.pasteHint || t('imageUpload.pasteHint'))
const uploadTextValue = computed(() => props.uploadText || t('imageUpload.uploadText'))
```

**i18n keys structure:**
```typescript
// fr.ts (source of truth)
imageUpload: {
  pasteTitle: 'Coller une image',
  pasteHint: 'Cliquez ici et appuyez sur Ctrl+V / Cmd+V',
  uploadText: 'ou cliquez pour télécharger depuis votre appareil',
  error: {
    invalidFile: 'Type ou taille de fichier invalide',
    noClipboard: 'Aucune donnée dans le presse-papiers',
  },
}
```

### Subagent-Driven Development Lessons

**What worked:**
1. **Dispatch per task** — Fresh subagent for each composable/view update
2. **Code review between tasks** — Caught critical i18n issue before scaling to 13 tools
3. **Parallel agents for batch updates** — Updated 9 tools in parallel (3 groups of 3)

**What failed:**
- **Agents working in wrong directory** — Agents reported success but worked in main directory instead of worktree
- **Solution:** Manually copied files to worktree and verified with `git status`

**Corrected workflow:**
```bash
# After agents report completion, ALWAYS verify
cd .worktrees/<branch>
git status --short
npm run build  # Verify in worktree
```

### Git Worktree Best Practices

**Critical checks:**
1. Verify worktree directory is in `.gitignore`:
   ```bash
   git check-ignore -q .worktrees && echo "IGNORED" || echo "NOT_IGNORED"
   ```

2. Verify worktree has all changes before merge:
   ```bash
   cd .worktrees/<branch>
   git status --short
   npm test
   npm run build
   ```

3. Copy files if agents worked in wrong directory:
   ```bash
   cp src/components/GiImageUpload.vue .worktrees/<branch>/src/components/
   cp src/views/*.vue .worktrees/<branch>/src/views/
   ```

### Merge Conflict Resolution

**When merging feature branch:**
```bash
git checkout main
git merge --no-ff feat/image-upload-standardization

# If conflict occurs:
git diff <file>  # Review conflict
git checkout --theirs <file>  # Use feature branch version
git add <file>
git commit
```

**Always verify after merge:**
```bash
npm test  # Ensure tests still pass
npm run build  # Ensure build succeeds
```

### Vitest Configuration for Worktrees

**Add worktree exclusion to `vite.config.ts`:**
```typescript
test: {
  environment: 'jsdom',
  globals: true,
  exclude: ['**/node_modules/**', '**/dist/**', '**/.worktrees/**', '**/.git/**'],
}
```

**Why:** Prevents Vitest from running tests in worktrees, which causes duplicate test runs and failures.

### Accessibility Checklist for Upload Components

**Keyboard navigation:**
- [ ] Paste zone is focusable (`tabindex="0"`)
- [ ] Enter/Space keys trigger file input
- [ ] Ctrl+V / Cmd+V pastes from clipboard
- [ ] Focus state is visible (green glow: `box-shadow: 0 0 0 3px rgba(10, 170, 142, 0.15)`)

**ARIA attributes (future enhancement):**
- `role="button"` on paste and upload zones
- `aria-label` for screen readers
- `aria-describedby` linking to hint text

### Testing Strategy

**Unit tests (Vitest):**
- Test composable logic (`useImageUpload.test.ts`)
- Test file validation (wildcards, MIME types, extensions)
- Test size validation
- Test error messages

**Component tests:**
- Test paste zone renders
- Test drag-drop emits upload event
- Test click upload
- Test keyboard events (Enter, Space)
- Test error states

**Manual testing:**
- Test all 14 tools with actual images
- Test paste from clipboard (screenshots, copied images)
- Test drag-drop from file explorer
- Test keyboard navigation
- Test dark mode visibility

### Rollout Pattern for Component Refactors

**Phased approach:**
1. **Phase 1:** Create component + composable with tests
2. **Phase 2:** Update high-priority tools (9 image tools)
3. **Phase 3:** Update medium-priority tools (3 tools with existing upload)
4. **Phase 4:** Update remaining tools (Safety Margin, DPI Checker)
5. **Phase 5:** Manual testing + verification

**For each tool:**
```vue
<!-- Replace old upload UI with: -->
<GiImageUpload
  @upload="handleImageUpload"
  @error="handleError"
  :accept="['image/*']"  <!-- Customize if needed -->
/>
```

```typescript
// Add handlers
function handleImageUpload(file: File) {
  // Use file directly
}

function handleError(error: string) {
  // Handle error
}
```

### Common Pitfalls

**❌ Agents working in wrong directory:**
- Symptom: Agent reports success but files not in worktree
- Fix: Manually verify with `git status` and copy files if needed

**❌ Missing i18n:**
- Symptom: Hardcoded English strings
- Fix: Use `t()` with computed properties for override support

**❌ Variable shadowing:**
```typescript
// ❌ Bad
const file = ref<File | null>(null)
function processFile(file: File) {
  file.value = file  // Shadows reactive ref
}

// ✅ Good
function processFile(inputFile: File) {
  file.value = inputFile
}
```

**❌ Generic error messages:**
```typescript
// ❌ Bad
error.value = 'Invalid file'

// ✅ Good
error.value = `File type "${file.type}" is not accepted`
```

### Files Reference

**Created:**
- `src/components/GiImageUpload.vue` — Reusable upload component
- `src/composables/useImageUpload.ts` — File validation logic
- `src/composables/__tests__/useImageUpload.test.ts` — 16 tests
- `src/components/__tests__/GiImageUpload.test.ts` — 15 tests

**Updated (14 tools):**
- All image upload tools now use `<GiImageUpload>`

**Documentation:**
- `docs/plans/2026-04-01-image-upload-standardization.md` — Full implementation plan

## Redirect Checker Refactoring (April 2026)

### Problem

The Redirect Checker tool was broken in production because `VITE_REDIRECT_API_URL` environment variable was not set, causing silent failures with no user feedback.

### Solution: Graceful Error Handling Pattern

**1. Custom Error Class with Error Codes**

Create a custom error class with discriminated union for error codes:

```typescript
export class RedirectCheckerError extends Error {
  constructor(
    message: string,
    public code: 'MISSING_API_URL' | 'API_ERROR' | 'INVALID_RESPONSE' | 'NETWORK_ERROR'
  ) {
    super(message)
    this.name = 'RedirectCheckerError'
  }
}
```

**2. Helper Function for API Configuration Check**

```typescript
export function isApiUrlConfigured(): boolean {
  return !!import.meta.env.VITE_REDIRECT_API_URL
}
```

**3. Comprehensive Error Handling in Composable**

```typescript
export async function checkRedirect(inputUrl: string): Promise<RedirectResult> {
  const normalized = inputUrl.startsWith('http://') || inputUrl.startsWith('https://')
    ? inputUrl
    : `https://${inputUrl}`
  
  const apiUrl = import.meta.env.VITE_REDIRECT_API_URL
  
  if (!apiUrl) {
    throw new RedirectCheckerError(
      'Redirect checker API is not configured. Please set VITE_REDIRECT_API_URL environment variable.',
      'MISSING_API_URL'
    )
  }
  
  try {
    const res = await fetch(`${apiUrl}?url=${encodeURIComponent(normalized)}`)
    
    if (!res.ok) {
      throw new RedirectCheckerError(
        `API returned status ${res.status}`,
        'API_ERROR'
      )
    }
    
    const data = await res.json() as { hops?: RedirectHop[] }
    
    if (!data.hops || data.hops.length === 0) {
      throw new RedirectCheckerError(
        'API returned empty hop list',
        'INVALID_RESPONSE'
      )
    }
    
    return {
      inputUrl: normalized,
      finalUrl: data.hops[data.hops.length - 1].url,
      hops: data.hops,
      redirected: data.hops.length > 1,
    }
  } catch (error) {
    if (error instanceof RedirectCheckerError) {
      throw error
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new RedirectCheckerError(
        'Network error: unable to reach the redirect checker API',
        'NETWORK_ERROR'
      )
    }
    throw new RedirectCheckerError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      'NETWORK_ERROR'
    )
  }
}
```

**4. View with Computed Error Messages**

```typescript
const errorCode = ref<string | null>(null)

const errorMessage = computed(() => {
  if (!errorCode.value) return ''
  switch (errorCode.value) {
    case 'MISSING_API_URL':
      return t('redirectChecker.error.missingApi')
    case 'API_ERROR':
      return t('redirectChecker.error.apiError')
    case 'INVALID_RESPONSE':
      return t('redirectChecker.error.invalidResponse')
    case 'NETWORK_ERROR':
      return t('redirectChecker.error.networkError')
    default:
      return t('redirectChecker.error.defaultError')
  }
})

const errorTitle = computed(() => {
  if (!errorCode.value) return ''
  switch (errorCode.value) {
    case 'MISSING_API_URL':
      return t('redirectChecker.error.missingApi')
    case 'API_ERROR':
      return t('redirectChecker.error.apiError')
    case 'INVALID_RESPONSE':
      return t('redirectChecker.error.invalidResponse')
    case 'NETWORK_ERROR':
      return t('redirectChecker.error.networkError')
    default:
      return t('redirectChecker.error.defaultError')
  }
})

async function check() {
  if (!inputUrl.value) return
  loading.value = true
  result.value = null
  errorCode.value = null
  try {
    result.value = await checkRedirect(inputUrl.value)
  } catch (error) {
    if (error instanceof RedirectCheckerError) {
      errorCode.value = error.code
    } else {
      errorCode.value = 'NETWORK_ERROR'
    }
  } finally {
    loading.value = false
  }
}
```

**5. i18n Translations for All Error States**

```typescript
// fr.ts
redirectChecker: {
  // ...
  error: {
    missingApi: 'API non configurée',
    missingApiDesc: "Le Redirect Checker nécessite une configuration serveur. Contactez l'administrateur pour activer cette fonctionnalité.",
    apiError: 'Erreur API',
    invalidResponse: 'Réponse invalide',
    networkError: 'Erreur réseau',
    defaultError: 'Une erreur est survenue',
  },
}

// en.ts
redirectChecker: {
  // ...
  error: {
    missingApi: 'API Not Configured',
    missingApiDesc: 'The Redirect Checker requires server configuration. Contact the administrator to enable this feature.',
    apiError: 'API Error',
    invalidResponse: 'Invalid Response',
    networkError: 'Network Error',
    defaultError: 'An error occurred',
  },
}
```

**6. Comprehensive Test Coverage**

Test all error scenarios:

```typescript
import { 
  checkRedirect, 
  RedirectCheckerError, 
  isApiUrlConfigured 
} from '../useRedirectChecker'

describe('isApiUrlConfigured', () => {
  it('returns true when VITE_REDIRECT_API_URL is set', () => {
    vi.stubEnv('VITE_REDIRECT_API_URL', 'https://api.test.workers.dev')
    expect(isApiUrlConfigured()).toBe(true)
  })

  it('returns false when VITE_REDIRECT_API_URL is not set', () => {
    vi.stubEnv('VITE_REDIRECT_API_URL', undefined)
    expect(isApiUrlConfigured()).toBe(false)
  })
})

describe('checkRedirect', () => {
  it('throws RedirectCheckerError with MISSING_API_URL when API URL is not configured', async () => {
    vi.stubEnv('VITE_REDIRECT_API_URL', undefined)
    
    await expect(checkRedirect('https://example.com'))
      .rejects
      .toThrow(RedirectCheckerError)
    
    try {
      await checkRedirect('https://example.com')
    } catch (error) {
      expect(error).toBeInstanceOf(RedirectCheckerError)
      expect((error as RedirectCheckerError).code).toBe('MISSING_API_URL')
      expect((error as RedirectCheckerError).message).toContain('not configured')
    }
  })

  it('throws RedirectCheckerError with API_ERROR when API returns error status', async () => {
    vi.stubEnv('VITE_REDIRECT_API_URL', 'https://redirect-checker.test.workers.dev')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))

    try {
      await checkRedirect('https://example.com')
    } catch (error) {
      expect(error).toBeInstanceOf(RedirectCheckerError)
      expect((error as RedirectCheckerError).code).toBe('API_ERROR')
    }
  })

  it('throws RedirectCheckerError with INVALID_RESPONSE when API returns empty hops', async () => {
    vi.stubEnv('VITE_REDIRECT_API_URL', 'https://redirect-checker.test.workers.dev')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ hops: [] }),
    }))
    
    try {
      await checkRedirect('https://example.com')
    } catch (error) {
      expect(error).toBeInstanceOf(RedirectCheckerError)
      expect((error as RedirectCheckerError).code).toBe('INVALID_RESPONSE')
    }
  })

  it('throws RedirectCheckerError with NETWORK_ERROR on network failure', async () => {
    vi.stubEnv('VITE_REDIRECT_API_URL', 'https://redirect-checker.test.workers.dev')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    try {
      await checkRedirect('https://example.com')
    } catch (error) {
      expect(error).toBeInstanceOf(RedirectCheckerError)
      expect((error as RedirectCheckerError).code).toBe('NETWORK_ERROR')
    }
  })
})
```

### Critical Bug: Missing Component Import

**Symptom:** Input field not rendering on production site, only button visible.

**Root Cause:** Component used in template but not imported in `<script setup>`:

```vue
<template>
  <!-- ❌ This was in the template -->
  <GiFormField
    v-model="inputUrl"
    type="url"
    :label="t('redirectChecker.label')"
  />
</template>

<script setup lang="ts">
// ❌ But this import was missing!
import GiFormField from '../components/GiFormField.vue'
</script>
```

**Fix:** Add the missing import statement.

**Verification:** After deployment, users may need to hard refresh (Ctrl+Shift+R / Cmd+Shift+R) to clear browser cache.

### Files Modified

- `src/composables/useRedirectChecker.ts` — Error class and handling
- `src/composables/__tests__/useRedirectChecker.test.ts` — 11 tests for error scenarios
- `src/views/RedirectCheckerView.vue` — Error state UI with computed messages
- `src/i18n/fr.ts` — French error translations
- `src/i18n/en.ts` — English error translations

### Deployment Checklist

1. ✅ Commit and push changes
2. ✅ GitHub Actions builds with `VITE_REDIRECT_API_URL` secret injected
3. ✅ Deploy to GitHub Pages
4. ⚠️ Users may need hard refresh to see fix (browser cache)

### Environment Variables

**Required for Redirect Checker to work:**
- `VITE_REDIRECT_API_URL` — Cloudflare Worker URL (e.g., `https://gi-redirect-checker.<subdomain>.workers.dev`)

**To configure:**
1. Deploy Cloudflare Worker from `workers/redirect-checker/`
2. Add worker URL as GitHub secret: Settings → Secrets and variables → Actions → `VITE_REDIRECT_API_URL`
3. Trigger new deployment (push commit or manual workflow run)

### Pattern Reusability

This error handling pattern can be applied to any tool that depends on external APIs:
- `usePdfXConverter.ts` (PDF/X converter)
- Any future tool with backend dependencies

**Key principles:**
1. Custom error class with specific error codes
2. Check configuration before making API calls
3. Wrap fetch errors in typed error classes
4. Display contextual error messages in UI
5. Provide actionable fallback (e.g., curl command)
6. Test all error scenarios

## RTK (Token-Optimized CLI)

Always prefix commands with `rtk` for token savings:
```bash
rtk git status / log / diff / add / commit / push
rtk npm run <script>
```

---

## Session Learnings: UI/UX Audit & Accessibility Fixes (April 2026)

### Audit Methodology

**Used `ui-ux-pro-max` skill** to perform comprehensive UI/UX audit across 10 priority categories:
1. Accessibility (CRITICAL)
2. Touch & Interaction (CRITICAL)
3. Performance (HIGH)
4. Style Selection (HIGH)
5. Layout & Responsive (HIGH)
6. Typography & Color (MEDIUM)
7. Animation (MEDIUM)
8. Forms & Feedback (MEDIUM)
9. Navigation Patterns (HIGH)
10. Charts & Data (LOW)

**Workflow:** Read key files → identify issues by severity → create prioritized plan → implement in batches (P0 → P3) → verify build + tests.

### Critical: Never Use Emoji as Structural Icons

**Problem:** ColorPaletteView used `🔒`/`🔓` emoji for lock/unlock states.

**Why it's bad:**
- Emoji rendering varies by OS/browser (not consistent)
- Cannot be styled with CSS tokens
- Screen readers may read them inconsistently
- Font-dependent, not vector-based

**Correct pattern:**
```typescript
// ✅ Good — Lucide SVG icons
import { Lock as LockIcon, Unlock as UnlockIcon } from 'lucide-vue-next'

<LockIcon v-if="color.locked" :size="20" />
<UnlockIcon v-else :size="20" />
```

**Also replaced inline SVGs with Lucide throughout:**
- `ToolPageLayout.vue` — back arrow → `<ChevronLeft />`
- `PaperWeightView.vue` — reset icon → `<RotateCcw />`
- `QrDecoderView.vue` — paste icon → `<ClipboardPaste />`
- `ContrastCheckerView.vue` — swap icon → `<ArrowLeftRight />`

### Touch Target Minimum: 44×44px

**Problem:** Footer toggle buttons were 36×36px — below Apple HIG minimum of 44×44pt.

**Fix:**
```css
.gi-footer-toggle {
  min-width: 44px;
  min-height: 44px;
  width: 44px;
  height: 44px;
}
```

**Rule:** All interactive elements must be ≥44×44px (iOS) or ≥48×48dp (Android).

### ARIA Attributes for Toggle Buttons

**Pattern for toggle/state buttons:**
```vue
<button
  @click="toggleLocale"
  :aria-pressed="locale === 'fr'"
  :aria-label="t('footer.toggleLanguage')"
>
  {{ locale === 'fr' ? 'EN' : 'FR' }}
</button>
```

**For tab-like controls:**
```vue
<div class="home-tab-bar" role="tablist" aria-label="Tool categories">
  <button
    role="tab"
    :aria-pressed="activeCategory === cat"
  >
    {{ t(`home.categories.${cat}`) }}
  </button>
</div>
```

### Keyboard Accessibility for Custom Interactive Elements

**Any element with `role="button"` and `tabindex="0"` must have keyboard handlers:**
```vue
<div
  class="gi-swatch"
  :tabindex="0"
  role="button"
  :aria-label="color.locked ? t('colorPalette.unlock') : t('colorPalette.lock')"
  @click="lock(i)"
  @keydown.enter="lock(i)"
  @keydown.space.prevent="lock(i)"
>
```

**Key points:**
- `tabindex="0"` makes element focusable
- `@keydown.enter` handles Enter key
- `@keydown.space.prevent` handles Space key (prevent default scroll)
- `aria-label` provides screen reader context

### Horizontal Scroll Risk: `100vw` Anti-Pattern

**Problem:** `width: 100vw` includes scrollbar width, causing horizontal scroll on some browsers.

**Incorrect:**
```css
.home-wrap {
  width: 100vw;
}
```

**Correct:**
```css
.home-wrap {
  width: 100%;
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
}
```

This pattern breaks out of a constrained parent (`max-width: 800px`) without causing horizontal scroll.

### Responsive Fallback for Flex Row Layouts

**Problem:** Color palette used `display: flex` row — collapses on narrow screens.

**Fix:**
```css
.gi-palette {
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 640px) {
  .gi-palette {
    flex-wrap: wrap;
    height: auto;
  }
  .gi-swatch {
    min-height: 100px;
    flex: 1 1 calc(50% - 0.25rem);
  }
}
```

### Interactive Feedback: `:active` States

**All tappable elements need press feedback:**
```css
.gi-btn:active {
  transform: scale(0.98);
}

.home-card:active {
  transform: scale(0.98);
}

.gi-swatch:active {
  transform: scale(0.98);
}
```

**Why `scale(0.98)` instead of `translateY(0)`:** Scale provides visual "press" feedback without layout shift.

### Card Focus State: Use Outline, Not Border

**Problem:** `.gi-card` had both `border` and `box-shadow` — redundant visual weight.

**Fix:**
```css
.gi-card {
  background: var(--gi-surface);
  border-radius: var(--gi-radius-lg);
  padding: 1.5rem;
  box-shadow: var(--gi-shadow);
  /* No border */
}

.gi-card:focus-within {
  outline: 2px solid var(--gi-brand);
  outline-offset: 1px;
}
```

**Key:** Use `outline` for focus (doesn't affect layout), not `border`.

### Screen Reader Utility Class (`.sr-only`)

**Add to global.css for accessibility live regions:**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

**Usage for copy feedback:**
```vue
<div aria-live="polite" aria-atomic="true" class="sr-only">
  <span v-if="copiedIndex !== null">{{ t('colorPalette.copied') }}: {{ palette[copiedIndex]?.hex }}</span>
</div>
```

### Number Inputs: Always Add `step="1"`

**Prevents accidental decimal values:**
```vue
<input v-model.number="quantity" type="number" min="1" step="1" />
```

### Google Fonts Performance: Preconnect

**Add to `index.html` before font stylesheet:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

Reduces font loading latency by establishing early connections.

### Dark Mode: Avoid Pure White Outlines

**Problem:** Locked swatch outline used `white` — too harsh on dark backgrounds.

**Fix:**
```css
.gi-swatch--locked {
  outline: 3px solid rgba(255, 255, 255, 0.4);
  outline-offset: -3px;
}
```

### i18n: Never Hardcode UI Text

**Always use `t()` keys, even for simple words:**
```vue
<!-- ❌ Bad -->
<button @click="reset">Clear</button>

<!-- ✅ Good -->
<button @click="reset">{{ t('qrDecoder.clear') }}</button>
```

**Add keys to both `fr.ts` and `en.ts`:**
```typescript
// fr.ts
qrDecoder: {
  clear: 'Effacer',
}

// en.ts
qrDecoder: {
  clear: 'Clear',
}
```

### Audit Fix Priority Framework

| Priority | Category | Examples |
|----------|----------|----------|
| P0 | Accessibility | Emoji icons, touch targets, ARIA, keyboard nav |
| P1 | Layout/Responsive | Horizontal scroll, breakpoints, word-wrap |
| P2 | Visual/Consistency | Icon standardization, active states, i18n |
| P3 | Performance/Polish | Preconnect, animation cleanup, dark mode tweaks |

### Files Modified in This Audit

- `index.html` — Google Fonts preconnect
- `src/assets/styles/global.css` — Card border removal, `.sr-only`, button active state, grid minmax
- `src/components/AppHeader.vue` — aria-pressed on language toggle
- `src/components/AppFooter.vue` — 44×44px toggles, aria-pressed
- `src/components/ToolPageLayout.vue` — ChevronLeft icon
- `src/views/ColorPaletteView.vue` — Lock/Unlock icons, keyboard support, responsive wrap, aria-live
- `src/views/ContrastCheckerView.vue` — ArrowLeftRight icon, word-wrap, responsive
- `src/views/HomeView.vue` — tab ARIA, home-wrap fix, card active state
- `src/views/PaperWeightView.vue` — RotateCcw icon, step="1"
- `src/views/QrDecoderView.vue` — ClipboardPaste icon, i18n clear
- `src/views/UtmBuilderView.vue` — Check icon on copy
- `src/i18n/fr.ts` — clear, swapColors keys
- `src/i18n/en.ts` — clear, swapColors keys

---

## Session Learnings: UI/UX Audit #2 — Accessibility & Forms (April 2026)

### Audit Methodology

**Used `ui-ux-pro-max` skill + `subagent-driven-development`** to perform comprehensive audit and fix 21 issues across 4 priority phases:
1. **Critical (5):** Missing CSS tokens, dynamic lang attribute, touch targets, ARIA, focus states
2. **High (7):** Border standardization, token usage, badge contrast, meta description, form validation
3. **Medium (6):** Loading states, skip link, font fixes, layout cleanup
4. **Low (2):** Table wrapper, locked swatch visibility

**Workflow:** `ui-ux-pro-max` audit → `writing-plans` creates plan → `subagent-driven-development` executes task-by-task with code review between each → `finishing-a-development-branch` to merge.

### Critical: Define Semantic CSS Error Tokens

**Problem:** `GiFormField.vue` referenced `var(--gi-error)` but it was never defined in `global.css`.

**Fix pattern — always define tokens before use:**
```css
/* Light theme */
:root {
  --gi-error: #dc2626;   /* red-600, passes WCAG AA on white */
  --gi-warning: #d97706; /* amber-600, passes WCAG AA on white */
}

/* Dark theme */
[data-theme="dark"] {
  --gi-error: #f87171;   /* red-400, passes on dark bg */
  --gi-warning: #fcd34d; /* amber-300, passes on dark bg */
}
```

**Rule:** Never reference CSS variables that aren't defined in both light and dark themes.

### Dynamic HTML Lang Attribute

**Problem:** `<html lang="fr">` hardcoded — screen readers announce wrong language for EN users.

**Fix in `main.ts`:**
```typescript
const storedLocale = localStorage.getItem('gi-locale')
const detectedLocale = storedLocale || navigator.language.slice(0, 2)
document.documentElement.lang = detectedLocale === 'fr' ? 'fr' : 'en'
```

**Also update in every locale toggle function:**
```typescript
function toggleLocale() {
  locale.value = locale.value === 'fr' ? 'en' : 'fr'
  localStorage.setItem('gi-locale', locale.value)
  document.documentElement.lang = locale.value // ← Always sync
}
```

### ARIA: Link Error Messages to Inputs

**Problem:** Error spans existed but screen readers didn't announce them.

**Pattern for `aria-describedby`:**
```vue
<script setup>
const inputId = ref('')
onMounted(() => {
  inputId.value = `gi-field-${Math.random().toString(36).slice(2, 9)}`
})
const errorId = computed(() => inputId.value ? `${inputId.value}-error` : '')
</script>

<template>
  <input :id="inputId" :aria-describedby="error && errorId ? errorId : undefined" />
  <span v-if="error" :id="errorId" role="alert">{{ error }}</span>
</template>
```

**Key:** `role="alert"` ensures immediate announcement, `aria-describedby` links input to error.

### Form Validation: Always Show Error Messages

**Problem:** Number inputs accepted invalid values (negative, zero) with silent failure.

**Pattern for computed validation errors:**
```typescript
const quantityError = computed(() => {
  if (quantity.value <= 0) return t('tool.error.minQuantity')
  if (quantity.value > 99999) return t('tool.error.maxQuantity')
  return null
})
```

```vue
<input v-model.number="quantity" type="number" min="1" />
<span v-if="quantityError" class="pw-error" role="alert">{{ quantityError }}</span>
```

```css
.pw-error {
  font-size: var(--gi-font-size-xs);
  color: var(--gi-error);
  margin-top: var(--gi-space-xs);
}
```

**Same pattern for text validation** (hex codes, email, URLs).

### Async Buttons: Always Show Loading State

**Problem:** Image tool async actions had no disabled/loading feedback — users could double-click.

**Pattern for loading state:**
```typescript
const isProcessing = ref(false)

async function handleAction() {
  if (!input.value || isProcessing.value) return
  isProcessing.value = true
  try {
    const result = await asyncOperation(input.value)
    output.value = result
  } catch (err) {
    handleError(err)
  } finally {
    isProcessing.value = false
  }
}
```

```vue
<button
  class="gi-btn-primary"
  :disabled="isProcessing"
  @click="handleAction"
>
  <Loader2 v-if="isProcessing" :size="16" class="animate-spin" />
  {{ isProcessing ? t('tool.processing') : t('tool.action') }}
</button>
```

**Key:** `try/finally` ensures loading state is always cleared, even on error.

### Skip-to-Content Link Pattern

**Create `SkipToContent.vue`:**
```vue
<template>
  <a href="#main-content" class="skip-link">{{ t('nav.skipToContent') }}</a>
</template>

<style scoped>
.skip-link {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.75rem 1.5rem;
  background: var(--gi-brand);
  color: var(--gi-text-inverse);
  border-radius: var(--gi-radius-md);
  font-weight: 600;
  z-index: 1000;
  transition: top var(--gi-transition-fast) var(--gi-ease-out);
  text-decoration: none;
}
.skip-link:focus { top: 0.5rem; }
</style>
```

**Add to app layout** before header, with `id="main-content"` on the `<main>` element.

### Visual Flash Feedback for Copy Actions

**Pattern for immediate visual confirmation:**
```typescript
const copiedFlash = ref<number | null>(null)

async function copy(value: string, index: number) {
  await navigator.clipboard.writeText(value)
  copiedFlash.value = index
  setTimeout(() => { copiedFlash.value = null }, 300)
  setTimeout(() => { copiedIndex.value = null }, 2000)
}
```

```css
.gi-swatch--flash {
  animation: flash-brightness 0.3s ease-out;
}
@keyframes flash-brightness {
  0% { filter: brightness(1.8); }
  100% { filter: brightness(1); }
}
```

### Border Width Standardization

**Rule:** Use `1px` for all borders. Mixing `1px` and `1.5px` creates visual inconsistency.

**Command to audit:**
```bash
grep -rn "1\.5px" src/
```

### Hardcoded Colors → CSS Tokens

**Always use semantic tokens, never hardcoded hex in styles:**
```css
/* ❌ Bad */
color: #fff;

/* ✅ Good */
color: var(--gi-text-inverse);
```

**Audit command:**
```bash
grep -rn "#[0-9a-fA-F]\{3,6\}" src/ --include="*.vue" --include="*.css" | grep -v "node_modules"
```

### Subagent-Driven Development: What Worked

**Pattern:** Dispatch fresh subagent per task → review → fix → next task.

**Why it works:**
- Each task gets fresh attention
- Code review between tasks catches issues early
- Small, focused commits
- Fast iteration (2-5 min per task)

**Tips:**
- Give exact file paths and code snippets in prompts
- Include acceptance criteria (build passes, commit made)
- Batch independent small tasks together
- Always run `npm run build` after each change

### Audit Fix Priority Framework (Updated)

| Priority | Category | Examples from this audit |
|----------|----------|-------------------------|
| P0 | Accessibility | CSS tokens, lang attr, aria-describedby, focus states, touch targets |
| P1 | Form Validation | Hex validation, number validation, error display |
| P2 | UX Feedback | Loading states, copy flash, skip link |
| P3 | Visual Polish | Border standardization, font stacks, table wrapper, swatch outlines |

### Files Modified in This Audit

**New files:**
- `src/components/SkipToContent.vue` — Skip-to-content link component

**Modified files:**
- `src/assets/styles/global.css` — Error/warning tokens, border standardization, monospace font, input line-height
- `src/main.ts` — Dynamic lang attribute
- `src/components/AppHeader.vue` — 44px toggle, lang sync, border fix
- `src/components/AppFooter.vue` — Lang sync
- `src/components/GiFormField.vue` — aria-describedby linking
- `src/views/HomeView.vue` — Badge contrast, meta description, mobile font, home-wrap fix, border fix
- `src/views/ContrastCheckerView.vue` — Hex validation with error display
- `src/views/PaperWeightView.vue` — Number validation with error display
- `src/views/ColorPaletteView.vue` — Focus state, copy flash, locked swatch outline
- `src/views/ImageCompressorView.vue` — Loading state
- `src/views/ImageCropperView.vue` — Loading state
- `src/views/ImageResizerView.vue` — Loading state
- `src/views/ImageFiltersView.vue` — Loading state
- `src/views/ImageConverterView.vue` — Loading state
- `src/views/MockupGeneratorView.vue` — Loading state
- `src/i18n/fr.ts` — Error messages, processing translations
- `src/i18n/en.ts` — Error messages, processing translations
- `index.html` — Meta description

---

## Session Learnings: Paper Weight Calculator Improvements (April 2026)

### Weight Per Unit Display

**For flyers mode**, show weight per individual item alongside total:
```typescript
const weightPerUnit = computed(() => {
  if (mode.value === 'flyers') {
    return totalWeight.value / quantity.value
  }
  return null
})
```

**Display in result banner:**
```vue
<div class="pw-result-banner">
  <div class="pw-result-main">{{ totalWeight.toFixed(1) }} kg</div>
  <div class="pw-result-sub">{{ weightPerUnit?.toFixed(2) }} g per flyer</div>
</div>
```

### Booklet Pages Dropdown

**Replace number input with scrollable select:**
- 18 preset multiples of 4 (4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72)
- "Custom" option at bottom for manual entry
- Pattern: pages must be multiple of 4 for folded booklets

```vue
<select v-model="bookletPages" class="pw-select">
  <option v-for="pages in presetPages" :key="pages" :value="pages">
    {{ pages }} pages
  </option>
  <option value="custom">Custom...</option>
</select>
<input
  v-if="bookletPages === 'custom'"
  v-model.number="customBookletPages"
  type="number"
  min="4"
  step="4"
/>
```

**i18n keys:**
```typescript
paperWeight: {
  customPages: 'Custom number of pages',
  customPagesPlaceholder: 'Enter multiple of 4',
}
```

### Compact Layout Pattern

**Reduce spacing throughout for ~25% more compact layout:**

```css
/* Reduce gaps */
.pw-section { gap: var(--gi-space-md); } /* was lg */
.pw-controls { gap: var(--gi-space-xs); } /* was sm */

/* Reduce padding */
.pw-card { padding: var(--gi-space-md); } /* was lg */

/* Reduce font sizes */
.pw-result-value {
  font-size: clamp(1.75rem, 5vw, 2.5rem); /* was 2-3rem */
}
.pw-input {
  font-size: var(--gi-font-size-md); /* was lg */
  min-height: 44px; /* was 48px, keep 44px for touch target */
}
```

**Rule:** Always maintain 44px minimum touch target for accessibility.

### Silent Clamping Pattern

**Use `@blur` handlers instead of error messages for out-of-range values:**

```vue
<input
  v-model.number="quantity"
  type="number"
  min="1"
  max="99999999"
  @blur="quantity = clampNumber(quantity, 1, 99999999)"
/>
```

**Why:** Better UX than validation errors — values silently correct on blur.

**Composable helper:**
```typescript
export function clampNumber(value: number, min: number, max: number): number {
  if (isNaN(value)) return min
  return Math.max(min, Math.min(max, value))
}
```

### Slider Behavior Lesson

**Avoid complex "sticky" snapping logic** — it was buggy and unpredictable.

**What works:**
- Simple step-based rounding: `Math.round(value / step) * step`
- If `snapTo` provided, use simple nearest neighbor calculation
- No forced capture zones or logarithmic distance thresholds

**Implementation:**
```typescript
function roundToStep(value: number, min: number, max: number, stepFn: (v: number) => number): number {
  const clamped = Math.max(min, Math.min(max, value))
  
  // Simple nearest neighbor for snapTo
  if (props.snapTo && props.snapTo.length > 0) {
    let nearest = props.snapTo[0]
    let minDist = Math.abs(clamped - nearest)
    
    for (let i = 1; i < props.snapTo.length; i++) {
      const dist = Math.abs(clamped - props.snapTo[i])
      if (dist < minDist) {
        minDist = dist
        nearest = props.snapTo[i]
      }
    }
    return nearest
  }
  
  // Otherwise, use step function
  const step = stepFn(clamped)
  return Math.round(clamped / step) * step
}
```

**Key lesson:** Simple is better — users prefer predictable slider behavior over "helpful" snapping.

### Files Modified

- `src/components/GiLogSlider.vue` — Simplified snapTo logic, removed complex sticky behavior
- `src/views/PaperWeightView.vue` — Weight per unit display, booklet pages dropdown, compact layout, silent clamping
- `src/i18n/fr.ts` — Custom pages translations
- `src/i18n/en.ts` — Custom pages translations
