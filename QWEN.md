# getinside Tools — Project Context

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
| Build Tool | Vite 6.2.0 |
| Routing | vue-router 4.6.4 (hash mode for GitHub Pages) |
| i18n | vue-i18n v9 (legacy: false) |
| Testing | Vitest 4.1.2 + jsdom + @vue/test-utils |
| Language | TypeScript 5.6.2 (strict mode) |
| Icons | lucide-vue-next |
| Utilities | culori, jsqr, apca-w3, colorparsley |

## Project Structure

```
tools/
├── src/
│   ├── assets/styles/global.css    # Brand tokens, utility classes
│   ├── components/
│   │   ├── AppHeader.vue           # Logo, language toggle
│   │   └── AppFooter.vue           # CTAs to getinside.fr
│   ├── composables/                # Pure logic (29 composables)
│   │   ├── useQrDecoder.ts         # QR code decoding with clipboard support
│   │   ├── usePaperWeight.ts       # Paper weight calculator
│   │   ├── useUtmBuilder.ts        # UTM URL builder
│   │   ├── useDpiChecker.ts        # DPI/print dimensions
│   │   ├── useColorPalette.ts      # Color palette generator
│   │   ├── useImageCompressor.ts   # Image compression
│   │   ├── useContrastChecker.ts   # WCAG contrast checking
│   │   └── __tests__/              # Vitest tests (121 tests)
│   ├── i18n/
│   │   ├── fr.ts                   # Source of truth (exports `type Messages`)
│   │   └── en.ts                   # Imports `Messages` type from fr.ts
│   ├── router/index.ts             # 38 routes (hash history)
│   ├── views/                      # One view per tool (29 views)
│   │   ├── HomeView.vue            # Tool grid with search/filter
│   │   ├── QrDecoderView.vue       # QR decoder with paste support
│   │   └── ...
│   ├── main.ts                     # App bootstrap
│   └── App.vue
├── public/                         # Static assets (mockup frames, logos)
├── backend/                        # PDF/X converter backend (not deployed)
├── .github/workflows/
│   └── deploy.yml                  # CI/CD to GitHub Pages
├── package.json
├── vite.config.ts                  # base: '/tools/', vitest config
└── tsconfig.json                   # Strict TypeScript
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

- **Trigger:** Push to `main` branch
- **Process:** GitHub Actions → `npm ci` → `npm run build` → deploy `dist/` to GitHub Pages
- **Required setting:** Pages source must be "GitHub Actions" (not "Deploy from a branch")

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

## Adding a New Tool

1. **Create composable** — `src/composables/useNewTool.ts` + tests in `__tests__/`
2. **Add translations** — `fr.ts` (nav, home.tools, tool section) + `en.ts`
3. **Create view** — `src/views/NewToolView.vue` with back link
4. **Add route** — `src/router/index.ts`
5. **Add to HomeView** — entry in `allTools` array with `category` and `isNew` flag
6. **Update nav** — add link in `AppHeader.vue` (if needed)

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_PDFX_API_URL` | PDF/X converter backend (optional, not deployed) |
| `VITE_REDIRECT_API_URL` | Redirect checker proxy (optional) |

Set as GitHub Actions secrets for deployment.

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
