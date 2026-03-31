# getinside Tools Design System Implementation Plan

> **For Qwen Code:** REQUIRED SUB-SKILL: Use `subagent-driven-development` to implement this plan task-by-task with fresh subagent per task and two-stage review.

**Goal:** Implement a comprehensive design system inspired by Zerokit (dark/light themes, interactive cards, pedagogic sections) with golden ratio typography and comprehensive component patterns.

**Architecture:** CSS variable-based theming system with light/dark modes, reusable Vue components for common patterns, and a pedagogic section component for educational content at the bottom of each tool page.

**Tech Stack:** Vue 3.5.13 (Composition API), Vite 6.2.0, TypeScript 5.6.2, CSS custom properties, vue-i18n v9

---

## Phase 0: Project Setup & Analysis

### Task 0.1: Review Current Project Structure

**Files:**
- Read: `src/assets/styles/global.css`
- Read: `src/components/AppHeader.vue`
- Read: `src/components/AppFooter.vue`
- Read: `src/views/HomeView.vue`
- Read: `src/i18n/fr.ts`
- Read: `src/i18n/en.ts`
- Read: `vite.config.ts`
- Read: `package.json`

**Step 1: Analyze current CSS variables and structure**
Review existing `--gi-*` CSS tokens in global.css to understand what needs to be preserved vs replaced.

**Step 2: Identify all tool views**
List all files in `src/views/` ending with `View.vue` to understand scope of tool page updates.

**Step 3: Document current i18n structure**
Note the translation key patterns for tools (e.g., `home.tools.*`, `tool.title`, `tool.desc`).

**Expected Output:** Mental model of current codebase structure.

---

## Phase 1: Theme System Foundation

### Task 1.1: Create Theme Composable

**Files:**
- Create: `src/composables/useTheme.ts`
- Test: `src/composables/__tests__/useTheme.test.ts`

**Step 1: Write the failing test**
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useTheme } from '../useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme')
    localStorage.clear()
  })

  it('should initialize with light theme by default', () => {
    const { theme } = useTheme()
    expect(theme.value).toBe('light')
  })

  it('should toggle between light and dark themes', () => {
    const { theme, toggleTheme } = useTheme()
    toggleTheme()
    expect(theme.value).toBe('dark')
    toggleTheme()
    expect(theme.value).toBe('light')
  })

  it('should set data-theme attribute on html element', () => {
    const { toggleTheme } = useTheme()
    toggleTheme()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('should persist theme to localStorage', () => {
    const { toggleTheme } = useTheme()
    toggleTheme()
    expect(localStorage.getItem('gi-theme')).toBe('dark')
  })

  it('should load theme from localStorage on init', () => {
    localStorage.setItem('gi-theme', 'dark')
    const { theme } = useTheme()
    expect(theme.value).toBe('dark')
  })

  it('should respect prefers-color-scheme if no localStorage value', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }),
    })
    localStorage.clear()
    const { theme } = useTheme()
    expect(theme.value).toBe('dark')
  })
})
```

**Step 2: Run test to verify it fails**
```bash
npm test -- src/composables/__tests__/useTheme.test.ts
```
Expected: FAIL with "useTheme not found"

**Step 3: Write minimal implementation**
```typescript
import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark'

export function useTheme() {
  const theme = ref<Theme>('light')

  function initTheme() {
    const stored = localStorage.getItem('gi-theme') as Theme | null
    if (stored) {
      theme.value = stored
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme.value = prefersDark ? 'dark' : 'light'
    }
    applyTheme(theme.value)
  }

  function applyTheme(newTheme: Theme) {
    if (newTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('gi-theme', theme.value)
    applyTheme(theme.value)
  }

  watch(theme, (newTheme) => {
    applyTheme(newTheme)
  })

  initTheme()

  return {
    theme,
    toggleTheme,
  }
}
```

**Step 4: Run test to verify it passes**
```bash
npm test -- src/composables/__tests__/useTheme.test.ts
```
Expected: PASS (6 tests)

**Step 5: Commit**
```bash
git add src/composables/useTheme.ts src/composables/__tests__/useTheme.test.ts
git commit -m "feat: add useTheme composable with light/dark mode support"
```

---

### Task 1.2: Update Global CSS with Theme Variables

**Files:**
- Modify: `src/assets/styles/global.css`

**Step 1: Replace CSS variables with theme-aware tokens**

Replace the existing `:root` block with the theme tokens defined in the design system (light and dark themes with golden ratio typography scale).

**Step 2: Update base element styles**

Replace the existing `*, *::before, *::after` and `body` rules with theme-aware styles.

**Step 3: Update font imports**

Keep existing Garnett font-face declarations. Ensure Inter import is present.

**Step 4: Run build to verify no CSS errors**
```bash
npm run build
```
Expected: Build succeeds with no CSS errors

**Step 5: Commit**
```bash
git add src/assets/styles/global.css
git commit -m "style: implement light/dark theme CSS variables with golden ratio scale"
```

---

### Task 1.3: Create Animations Stylesheet

**Files:**
- Create: `src/assets/styles/animations.css`

**Step 1: Write animation definitions** including:
- Page transitions (fade-in, slide-up, slide-down)
- Card hover lift
- Button press
- Shake (error)
- Shimmer (skeleton)
- Pulse (warning)
- Spin (loading)
- Checkmark draw-in
- Scale in (badge)
- Utility classes

**Step 2: Import animations in global.css**

**Step 3: Run build to verify import works**

**Step 4: Commit**

---

## Phase 2: Core Components

### Task 2.1: Update AppFooter with Theme & Language Toggles

**Files:**
- Read: `src/components/AppFooter.vue`
- Modify: `src/components/AppFooter.vue`

**Step 1-7:** Update footer with theme toggle, language toggle, proper styling.

---

### Task 2.2: Update AppHeader to Hide on Tool Pages

**Files:**
- Modify: `src/components/AppHeader.vue`
- Modify: `src/App.vue`

---

### Task 2.3: Create GiPedagogic Component

**Files:**
- Create: `src/components/GiPedagogic.vue`
- Test: `src/components/__tests__/GiPedagogic.test.ts`

---

## Phase 3: Homepage Redesign

### Task 3.1: Redesign HomeView Hero Section
### Task 3.2: Redesign Browse Section with Category Groups
### Task 3.3: Redesign Tool Cards (Zerokit Style)
### Task 3.4: Update Tab Filter Design

---

## Phase 4: Tool Page Template

### Task 4.1: Create Base Tool Page Layout
### Task 4.2: Update One Tool View as Example

---

## Phase 5: i18n Updates

### Task 5.1: Add Pedagogic Translations for All Tools

---

## Phase 6: Verification & Polish

### Task 6.1: Test All Pages in Light and Dark Modes
### Task 6.2: Fix Any CSS Issues
### Task 6.3: Run Full Test Suite
### Task 6.4: Create Design System Documentation

---

## Phase 7: Final Verification

### Task 7.1: Build and Preview Production
### Task 7.2: Create Pull Request / Deploy
