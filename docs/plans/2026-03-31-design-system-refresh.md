# Design System Refresh Implementation Plan

> **For Qwen Code:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Modernize the getinside Tools design system to match the clean aesthetic of Zerokit and the pedagogical clarity of Delphi.tools

**Architecture:** 
- Maintain CSS variable-based theme system for light/dark modes
- Refine spacing, typography, and component styles for cleaner, more polished look
- Add new pedagogical components inspired by Delphi's educational approach
- Keep all changes backward-compatible with existing views

**Tech Stack:** Vue 3.5.13, Vite 6.2.0, CSS custom properties, Lucide icons

---

## Analysis Summary

### Current State
- ✅ Solid foundation with CSS variables (`--gi-*`)
- ✅ Light/dark theme support
- ✅ Basic pedagogic component exists
- ✅ Tool cards and layout patterns in place

### Inspiration Takeaways

**Zerokit (Clean Aesthetic):**
- Minimal, refined color palette
- Subtle shadows and borders
- Generous whitespace
- Crisp typography hierarchy
- Smooth, understated transitions

**Delphi.tools (Pedagogical Clarity):**
- Clear data presentation with hex codes/values
- Side-by-side comparisons
- Contextual help integrated into UI
- Privacy-first messaging
- "Handmade web" ethos

### Design Updates Required

1. **Refine color palette** - Softer backgrounds, more refined brand color states
2. **Improve typography scale** - Better hierarchy, tighter line-heights
3. **Enhance shadows** - Subtler, more layered shadows (Zerokit-style)
4. **Polish components** - Cards, buttons, inputs with refined borders/hover states
5. **Add new pedagogical patterns** - Comparison views, data visualization helpers
6. **Create "About" section pattern** - Standardized educational content blocks

---

## Phase 1: Foundation Updates

### Task 1: Update Global CSS - Color Palette Refinement

**Files:**
- Modify: `src/assets/styles/global.css:1-150`

**Step 1: Update brand colors and backgrounds**

Replace the current color definitions with refined versions:

```css
:root {
  /* Brand Colors - Refined */
  --gi-brand: #0aaa8e;
  --gi-brand-dark: #08937b;
  --gi-brand-light: #0dc4a5;
  --gi-brand-fade: rgba(10, 170, 142, 0.08);
  
  /* Accent Colors - Softer */
  --gi-mint: #6AE7C8;
  --gi-yellow: #FCF758;
  --gi-violet: #C990FC;
  --gi-coral: #FF8A65;

  /* Backgrounds - Zerokit-inspired neutrals */
  --gi-bg: #faf9f7;
  --gi-bg-soft: #f5f4f2;
  --gi-surface: #ffffff;
  --gi-surface-elevated: #ffffff;

  /* Borders - Subtle and refined */
  --gi-border: #e8e6e1;
  --gi-border-hover: #d4d2cd;
  --gi-border-strong: #c9c6c2;
}
```

**Step 2: Update dark theme colors**

```css
[data-theme="dark"] {
  /* Backgrounds - Refined dark neutrals */
  --gi-bg: #0d0d0f;
  --gi-bg-soft: #141418;
  --gi-surface: #1a1a20;
  --gi-surface-elevated: #1f1f26;

  /* Borders - Softer contrast */
  --gi-border: #2a2a32;
  --gi-border-hover: #3a3a42;
  --gi-border-strong: #40404a;
}
```

**Step 3: Run build to verify no syntax errors**
```bash
npm run build
```
Expected: Build succeeds with no CSS errors

**Step 4: Commit**
```bash
git add src/assets/styles/global.css
git commit -m "style: refine color palette for cleaner aesthetic"
```

---

### Task 2: Update Shadow System

**Files:**
- Modify: `src/assets/styles/global.css:60-75`

**Step 1: Replace shadow definitions with Zerokit-style layered shadows**

```css
/* Shadows - Layered and subtle */
--gi-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--gi-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
--gi-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
--gi-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
--gi-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
--gi-shadow-glow: 0 0 24px rgba(10, 170, 142, 0.2);
--gi-shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
```

**Step 2: Update dark theme shadows**

```css
[data-theme="dark"] {
  --gi-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --gi-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.3);
  --gi-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
  --gi-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.3);
  --gi-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
  --gi-shadow-glow: 0 0 24px rgba(10, 170, 142, 0.4);
}
```

**Step 3: Run build**
```bash
npm run build
```

**Step 4: Commit**
```bash
git add src/assets/styles/global.css
git commit -m "style: implement layered shadow system"
```

---

### Task 3: Refine Typography Scale

**Files:**
- Modify: `src/assets/styles/global.css:75-90`

**Step 1: Update typography scale with tighter line-heights**

```css
/* Typography Scale - Refined with better line-heights */
--gi-font-size-xs: 0.75rem;      /* 12px */
--gi-font-size-sm: 0.875rem;     /* 14px */
--gi-font-size-md: 1rem;         /* 16px */
--gi-font-size-lg: 1.25rem;      /* 20px */
--gi-font-size-xl: 1.5rem;       /* 24px */
--gi-font-size-2xl: 1.875rem;    /* 30px */
--gi-font-size-3xl: 2.25rem;     /* 36px */

/* Line heights - tighter for headings */
--gi-line-height-tight: 1.25;
--gi-line-height-base: 1.6;
--gi-line-height-relaxed: 1.75;

/* Font weights */
--gi-font-weight-normal: 400;
--gi-font-weight-medium: 500;
--gi-font-weight-semibold: 600;
--gi-font-weight-bold: 700;
```

**Step 2: Run build**
```bash
npm run build
```

**Step 3: Commit**
```bash
git add src/assets/styles/global.css
git commit -m "style: refine typography scale and line-heights"
```

---

### Task 4: Update Border Radius System

**Files:**
- Modify: `src/assets/styles/global.css:90-100`

**Step 1: Refine border radius values**

```css
/* Border Radius - Consistent and refined */
--gi-radius-sm: 6px;
--gi-radius-md: 8px;
--gi-radius-lg: 12px;
--gi-radius-xl: 16px;
--gi-radius-2xl: 20px;
--gi-radius-pill: 9999px;
```

**Step 2: Run build**
```bash
npm run build
```

**Step 3: Commit**
```bash
git add src/assets/styles/global.css
git commit -m "style: expand border radius system"
```

---

### Task 5: Add Transition and Animation Tokens

**Files:**
- Modify: `src/assets/styles/global.css:100-115`

**Step 1: Add refined transition tokens**

```css
/* Transitions - Smooth and natural */
--gi-transition-instant: 0.1s;
--gi-transition-fast: 0.15s;
--gi-transition-base: 0.2s;
--gi-transition-slow: 0.3s;
--gi-transition-slower: 0.4s;

/* Easing curves */
--gi-ease-in: cubic-bezier(0.4, 0, 1, 1);
--gi-ease-out: cubic-bezier(0, 0, 0.2, 1);
--gi-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--gi-ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
```

**Step 2: Run build**
```bash
npm run build
```

**Step 3: Commit**
```bash
git add src/assets/styles/global.css
git commit -m "style: add transition and easing tokens"
```

---

## Phase 2: Component Updates

### Task 6: Update Base Element Styles

**Files:**
- Modify: `src/assets/styles/global.css:150-250`

**Step 1: Update button styles with refined appearance**

```css
.gi-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: var(--gi-brand);
  color: #fff;
  border: 1px solid transparent;
  border-radius: var(--gi-radius-md);
  font-size: 0.9375rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
  text-decoration: none;
  box-shadow: var(--gi-shadow-sm);
}

.gi-btn:hover {
  background: var(--gi-brand-dark);
  transform: translateY(-1px);
  box-shadow: var(--gi-shadow);
}

.gi-btn:active {
  transform: translateY(0);
}

.gi-btn-ghost {
  background: transparent;
  color: var(--gi-brand);
  border: 1.5px solid var(--gi-brand);
  box-shadow: none;
}

.gi-btn-ghost:hover {
  background: var(--gi-brand-fade);
  transform: translateY(-1px);
}
```

**Step 2: Run build and preview**
```bash
npm run dev
```

**Step 3: Commit**
```bash
git add src/assets/styles/global.css
git commit -m "style: refine button component styles"
```

---

### Task 7: Update Input Styles

**Files:**
- Modify: `src/assets/styles/global.css:170-190`

**Step 1: Refine input and select styles**

```css
.gi-input, .gi-select {
  padding: 0.625rem 0.875rem;
  border: 1.5px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  font-size: 0.9375rem;
  font-family: inherit;
  background: var(--gi-surface);
  color: var(--gi-text);
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
  width: 100%;
  box-shadow: var(--gi-shadow-sm);
}

.gi-input:hover, .gi-select:hover {
  border-color: var(--gi-border-hover);
}

.gi-input:focus, .gi-select:focus {
  outline: none;
  border-color: var(--gi-brand);
  box-shadow: 0 0 0 3px var(--gi-brand-fade);
}

.gi-input::placeholder {
  color: var(--gi-text-muted);
  opacity: 0.7;
}
```

**Step 2: Run build**
```bash
npm run build
```

**Step 3: Commit**
```bash
git add src/assets/styles/global.css
git commit -m "style: refine input component with focus ring"
```

---

### Task 8: Update Card Styles

**Files:**
- Modify: `src/assets/styles/global.css:220-240`

**Step 1: Refine card component**

```css
.gi-card {
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  padding: 1.5rem;
  box-shadow: var(--gi-shadow);
  transition: all var(--gi-transition-base) var(--gi-ease-out);
}

.gi-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--gi-shadow-md);
  border-color: var(--gi-border-hover);
}

/* Elevated card variant */
.gi-card-elevated {
  box-shadow: var(--gi-shadow-md);
}

.gi-card-elevated:hover {
  box-shadow: var(--gi-shadow-lg);
}
```

**Step 2: Run build**
```bash
npm run build
```

**Step 3: Commit**
```bash
git add src/assets/styles/global.css
git commit -m "style: refine card component styles"
```

---

### Task 9: Update Tool Card (HomeView) Styles

**Files:**
- Modify: `src/views/HomeView.vue:280-350`

**Step 1: Refine tool card hover animation**

Update the `.home-card` styles:

```css
.home-card {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-sm);
  padding: var(--gi-space-xl);
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  text-decoration: none;
  color: inherit;
  transition: all var(--gi-transition-base) var(--gi-ease-out);
  min-height: var(--gi-card-min-height);
  position: relative;
  box-shadow: var(--gi-shadow-sm);
}

.home-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--gi-shadow-lg);
  border-color: rgba(10, 170, 142, 0.4);
}

[data-theme="dark"] .home-card:hover {
  box-shadow: var(--gi-shadow-glow);
  border-color: rgba(10, 170, 142, 0.6);
}
```

**Step 2: Refine icon box hover effect**

```css
.home-icon-box {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  background: var(--gi-brand-fade);
  color: var(--gi-brand);
  border-radius: var(--gi-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--gi-transition-base) var(--gi-ease-bounce);
}

.home-card:hover .home-icon-box {
  background: var(--gi-brand);
  color: white;
  transform: scale(1.05);
}
```

**Step 3: Run dev server and visually verify**
```bash
npm run dev
```

**Step 4: Commit**
```bash
git add src/views/HomeView.vue
git commit -m "style: polish tool card animations"
```

---

### Task 10: Update Tool Page Layout

**Files:**
- Modify: `src/components/ToolPageLayout.vue:60-120`

**Step 1: Refine back link style**

```css
.tool-back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1.5rem;
  padding: 0.375rem 0.625rem;
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-muted);
  text-decoration: none;
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
  background: var(--gi-surface);
}

.tool-back-link:hover {
  border-color: var(--gi-brand);
  color: var(--gi-brand);
  background: var(--gi-brand-fade);
  transform: translateX(-2px);
}
```

**Step 2: Refine tool icon container**

```css
.tool-icon {
  width: 48px;
  height: 48px;
  background: var(--gi-brand-fade);
  color: var(--gi-brand);
  border-radius: var(--gi-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--gi-transition-base);
}
```

**Step 3: Run dev server**
```bash
npm run dev
```

**Step 4: Commit**
```bash
git add src/components/ToolPageLayout.vue
git commit -m "style: refine tool page layout polish"
```

---

### Task 11: Update Pedagogic Component

**Files:**
- Modify: `src/components/GiPedagogic.vue:50-100`

**Step 1: Refine pedagogic section appearance**

```css
.gi-pedagogic {
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  padding: var(--gi-space-lg);
  margin-top: var(--gi-space-xl);
  box-shadow: var(--gi-shadow-sm);
}

.gi-pedagogic-header {
  display: flex;
  align-items: center;
  gap: var(--gi-space-sm);
  margin-bottom: var(--gi-space-md);
  padding-bottom: var(--gi-space-sm);
  border-bottom: 1px solid var(--gi-border);
}

.gi-pedagogic-icon {
  font-size: 1.25rem;
}

.gi-pedagogic-title {
  font-size: var(--gi-font-size-md);
  font-weight: 600;
  color: var(--gi-text);
  margin: 0;
  letter-spacing: -0.01em;
}
```

**Step 2: Run build**
```bash
npm run build
```

**Step 3: Commit**
```bash
git add src/components/GiPedagogic.vue
git commit -m "style: refine pedagogic component styling"
```

---

## Phase 3: New Pedagogical Patterns

### Task 12: Create Comparison Component

**Files:**
- Create: `src/components/GiComparison.vue`
- Test: N/A (visual component)

**Step 1: Create comparison component for side-by-side views**

```vue
<template>
  <div class="gi-comparison">
    <div class="gi-comparison-grid">
      <div v-for="(item, index) in items" :key="index" class="gi-comparison-item">
        <div class="gi-comparison-label">{{ item.label }}</div>
        <div class="gi-comparison-content">
          <slot :name="`item-${index}`" :item="item">
            <div class="gi-comparison-value">{{ item.value }}</div>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ComparisonItem {
  label: string
  value?: string
}

defineProps<{
  items: ComparisonItem[]
}>()
</script>

<style scoped>
.gi-comparison {
  margin: var(--gi-space-lg) 0;
}

.gi-comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--gi-space-md);
}

.gi-comparison-item {
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  padding: var(--gi-space-md);
}

.gi-comparison-label {
  font-size: var(--gi-font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gi-text-muted);
  margin-bottom: var(--gi-space-xs);
}

.gi-comparison-content {
  font-size: var(--gi-font-size-md);
  color: var(--gi-text);
}

.gi-comparison-value {
  font-family: 'Menlo', 'Monaco', monospace;
  font-weight: 500;
}
</style>
```

**Step 2: Run build**
```bash
npm run build
```

**Step 3: Commit**
```bash
git add src/components/GiComparison.vue
git commit -m "feat: add comparison component for side-by-side views"
```

---

### Task 13: Create Data Display Component

**Files:**
- Create: `src/components/GiDataDisplay.vue`

**Step 1: Create component for displaying structured data (Delphi-style)**

```vue
<template>
  <div class="gi-data-display">
    <div v-for="(row, index) in data" :key="index" class="gi-data-row">
      <div class="gi-data-label">{{ row.label }}</div>
      <div class="gi-data-value" :style="{ color: row.color }">
        <code v-if="row.code">{{ row.value }}</code>
        <span v-else>{{ row.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DataRow {
  label: string
  value: string | number
  color?: string
  code?: boolean
}

defineProps<{
  data: DataRow[]
}>()
</script>

<style scoped>
.gi-data-display {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-sm);
}

.gi-data-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--gi-space-sm) var(--gi-space-md);
  background: var(--gi-bg-soft);
  border-radius: var(--gi-radius-md);
}

.gi-data-label {
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-muted);
  font-weight: 500;
}

.gi-data-value {
  font-size: var(--gi-font-size-sm);
  font-weight: 600;
  font-family: 'Menlo', 'Monaco', monospace;
}

.gi-data-value code {
  background: var(--gi-surface);
  padding: 0.25rem 0.5rem;
  border-radius: var(--gi-radius-sm);
  border: 1px solid var(--gi-border);
}
</style>
```

**Step 2: Run build**
```bash
npm run build
```

**Step 3: Commit**
```bash
git add src/components/GiDataDisplay.vue
git commit -m "feat: add data display component for structured info"
```

---

### Task 14: Create Info Box Component

**Files:**
- Create: `src/components/GiInfoBox.vue`

**Step 1: Create reusable info/warning/tooltip box**

```vue
<template>
  <div :class="['gi-info-box', `gi-info-box--${variant}`]">
    <div class="gi-info-box-icon">
      <slot name="icon">
        <span v-if="variant === 'info'">ℹ️</span>
        <span v-else-if="variant === 'tip'">💡</span>
        <span v-else-if="variant === 'warning'">⚠️</span>
      </slot>
    </div>
    <div class="gi-info-box-content">
      <div v-if="title" class="gi-info-box-title">{{ title }}</div>
      <div class="gi-info-box-text">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'info' | 'tip' | 'warning'
  title?: string
}>()
</script>

<style scoped>
.gi-info-box {
  display: flex;
  gap: var(--gi-space-sm);
  padding: var(--gi-space-md);
  border-radius: var(--gi-radius-md);
  border: 1px solid;
}

.gi-info-box--info {
  background: var(--gi-tint-blue-bg);
  border-color: var(--gi-tint-blue-border);
  color: var(--gi-tint-blue-text);
}

.gi-info-box--tip {
  background: var(--gi-tint-green-bg);
  border-color: var(--gi-tint-green-border);
  color: var(--gi-tint-green-text);
}

.gi-info-box--warning {
  background: var(--gi-tint-yellow-bg);
  border-color: var(--gi-tint-yellow-border);
  color: var(--gi-tint-yellow-text);
}

.gi-info-box-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.gi-info-box-content {
  flex: 1;
}

.gi-info-box-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.gi-info-box-text {
  font-size: var(--gi-font-size-sm);
  line-height: 1.5;
}
</style>
```

**Step 2: Run build**
```bash
npm run build
```

**Step 3: Commit**
```bash
git add src/components/GiInfoBox.vue
git commit -m "feat: add info box component for contextual help"
```

---

### Task 15: Update Design System Documentation

**Files:**
- Modify: `docs/design-system.md`

**Step 1: Update the design system documentation with new components and patterns**

Add sections for:
- New color tokens
- Shadow system
- New components (GiComparison, GiDataDisplay, GiInfoBox)
- Usage examples
- Pedagogical patterns

**Step 2: Commit**
```bash
git add docs/design-system.md
git commit -m "docs: update design system documentation"
```

---

## Phase 4: Verification & Polish

### Task 16: Visual Regression Testing

**Files:**
- Manual testing across views

**Step 1: Run dev server and test homepage**
```bash
npm run dev
```
Navigate to `http://localhost:5173/tools/` and verify:
- Hero section looks clean and polished
- Tool cards have smooth hover animations
- Tabs have refined appearance
- Search input has focus ring

**Step 2: Test individual tool pages**
Navigate to several tools:
- `/paper-weight`
- `/utm-builder`
- `/colorblind`
Verify:
- Tool headers look refined
- Pedagogic sections are clear
- Inputs and buttons have proper states

**Step 3: Test dark mode**
Toggle dark mode and verify all styles work correctly

**Step 4: Document any issues**
Create a list of any visual regressions or issues found

---

### Task 17: Run Build and Type Check

**Files:**
- All modified files

**Step 1: Run full build with type checking**
```bash
npm run build
```
Expected: No errors, successful build to `dist/`

**Step 2: Run tests**
```bash
npm test
```
Expected: All 121 tests pass

**Step 3: Commit final changes**
```bash
git add .
git commit -m "chore: verify build and tests pass"
```

---

### Task 18: Create Before/After Documentation

**Files:**
- Create: `docs/plans/design-refresh-results.md`

**Step 1: Document the changes made**

Create a summary document with:
- List of all updated tokens
- New components added
- Screenshots or descriptions of visual improvements
- Migration notes for future tool updates

**Step 2: Commit**
```bash
git add docs/plans/design-refresh-results.md
git commit -m "docs: document design refresh results"
```

---

## Testing Checklist

After completing all tasks, verify:

- [ ] Homepage loads correctly in light mode
- [ ] Homepage loads correctly in dark mode
- [ ] Tool cards have smooth hover animations
- [ ] All tool pages render correctly
- [ ] Pedagogic sections are clear and readable
- [ ] New components (GiComparison, GiDataDisplay, GiInfoBox) work
- [ ] Build completes without errors
- [ ] All 121 tests pass
- [ ] No console errors in browser
- [ ] Accessibility maintained (keyboard nav, focus states)

---

## Rollback Plan

If issues are found:

```bash
# Revert to previous commit
git revert HEAD~18..HEAD

# Or reset specific files
git checkout HEAD~1 -- src/assets/styles/global.css
```

---

**Plan complete.** Two execution options:

**1. Subagent-Driven (this session)**
- I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)**
- Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
