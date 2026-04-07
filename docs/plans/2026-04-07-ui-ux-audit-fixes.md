# UI/UX Audit Fixes Implementation Plan

> **For Qwen Code:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Fix 30 UI/UX issues identified in the comprehensive audit covering accessibility, touch targets, performance, visual quality, layout, navigation, and forms feedback.
**Architecture:** Incremental fixes across existing components, views, and global styles — no new files except test files. Each fix is isolated and independently commitable.
**Tech Stack:** Vue 3.5 (Composition API), TypeScript, CSS custom properties, Vitest

---

## Phase 1: Critical Fixes (Accessibility & Broken References)

### Task 1: Define Missing CSS Error Tokens

**Files:**
- Modify: `src/assets/styles/global.css` (in `:root` and `[data-theme="dark"]`)
- Test: Manual browser check

**Step 1: Add missing `--gi-error` and `--gi-warning` tokens to light theme**

In `global.css`, inside `:root { }`, add after the existing tint definitions:

```css
  /* Semantic Error/Warning Tokens */
  --gi-error: #dc2626;
  --gi-warning: #d97706;
```

**Step 2: Add dark mode equivalents**

In `[data-theme="dark"] { }`, add:

```css
  /* Semantic Error/Warning Tokens */
  --gi-error: #f87171;
  --gi-warning: #fcd34d;
```

**Step 3: Verify build succeeds**
```bash
npm run build
```
Expected: Build succeeds, no errors.

**Step 4: Commit**
```bash
git add src/assets/styles/global.css
git commit -m "fix: add missing --gi-error and --gi-warning CSS tokens"
```

---

### Task 2: Make `<html lang>` Dynamic

**Files:**
- Modify: `src/main.ts`
- Test: `npm test` (no test changes needed — manual verification)

**Step 1: Set initial `lang` attribute based on locale**

In `src/main.ts`, after the i18n creation but before `app.mount('#app')`, add:

```typescript
// Set HTML lang attribute based on stored locale
const storedLocale = localStorage.getItem('gi-locale')
const detectedLocale = storedLocale || navigator.language.slice(0, 2)
document.documentElement.lang = detectedLocale === 'fr' ? 'fr' : 'en'
```

**Step 2: Watch locale changes to update `lang`**

Add a locale watcher in `main.ts` or create a composable `useLocale.ts`. Simpler approach — add to `main.ts`:

```typescript
// In main.ts, after app.use(i18n):
i18n.global.watch = (newLocale: string) => {
  document.documentElement.lang = newLocale
  localStorage.setItem('gi-locale', newLocale)
}
```

Better approach — modify `AppHeader.vue` and `AppFooter.vue` to set `document.documentElement.lang` inside their `toggleLocale()` functions:

In both files, add after `locale.value = ...`:
```typescript
document.documentElement.lang = locale.value
```

**Step 3: Set initial lang on mount in main.ts**

```typescript
// After createI18n call:
const initialLocale = localStorage.getItem('gi-locale') || navigator.language.slice(0, 2)
document.documentElement.lang = initialLocale === 'fr' ? 'fr' : 'en'
```

**Step 4: Verify**
```bash
npm run build
```

**Step 5: Commit**
```bash
git add src/main.ts src/components/AppHeader.vue src/components/AppFooter.vue
git commit -m "fix: make html lang attribute dynamic based on locale"
```

---

### Task 3: Enlarge Header Language Toggle to 44×44px

**Files:**
- Modify: `src/components/AppHeader.vue`

**Step 1: Add min-height and min-width to toggle button**

In `AppHeader.vue`, update `.gi-lang-toggle` styles:

```css
.gi-lang-toggle {
  min-width: 44px;
  min-height: 44px;
  padding: 0.5rem 0.75rem;
  border: 1.5px solid var(--gi-border);
  border-radius: 6px;
  background: transparent;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--gi-text-muted);
  font-family: inherit;
  transition: border-color 0.12s, color 0.12s;
}
```

**Step 2: Verify build**
```bash
npm run build
```

**Step 3: Commit**
```bash
git add src/components/AppHeader.vue
git commit -m "fix: enlarge header lang toggle to 44x44px minimum touch target"
```

---

### Task 4: Add `aria-describedby` to GiFormField Error State

**Files:**
- Modify: `src/components/GiFormField.vue`
- Test: Manual browser accessibility check

**Step 1: Generate error ID and link to input**

In `GiFormField.vue`, add a ref for the error ID:

```typescript
const errorId = ref('')

onMounted(() => {
  inputId.value = `gi-field-${Math.random().toString(36).slice(2, 9)}`
  errorId.value = `gi-field-error-${Math.random().toString(36).slice(2, 9)}`
})
```

**Step 2: Add `aria-describedby` to input and error span**

Update the input element:
```vue
<input
  :id="inputId"
  :aria-describedby="error && errorId ? errorId : undefined"
  ...
/>
```

Update the error span:
```vue
<span v-if="error" :id="errorId" class="gi-field-error" role="alert">{{ error }}</span>
```

**Step 3: Verify build**
```bash
npm run build
```

**Step 4: Commit**
```bash
git add src/components/GiFormField.vue
git commit -m "fix: add aria-describedby linking errors to inputs for screen readers"
```

---

### Task 5: Fix Color Swatch Keyboard Support in Color Palette

**Files:**
- Modify: `src/views/ColorPaletteView.vue`

**Step 1: Add `@keydown.space` handler**

The swatch already has `@keydown.space.prevent="lock(i)"` — this is correct. The audit noted it was missing, but it's present. **Mark as already fixed.** Verify by checking the file:

```bash
grep -n "keydown.space" src/views/ColorPaletteView.vue
```

Expected: Should show the line exists.

**Step 2: Add visible focus state for swatches**

In `ColorPaletteView.vue`, add to `.gi-swatch` styles:

```css
.gi-swatch:focus-visible {
  outline: 3px solid var(--gi-brand);
  outline-offset: -3px;
  z-index: 1;
}
```

**Step 3: Verify build**
```bash
npm run build
```

**Step 4: Commit**
```bash
git add src/views/ColorPaletteView.vue
git commit -m "fix: add visible focus state to color palette swatches"
```

---

## Phase 2: High-Priority Fixes

### Task 6: Standardize Border Widths to 1px

**Files:**
- Modify: `src/assets/styles/global.css`
- Modify: `src/components/AppHeader.vue` (if 1.5px found)

**Step 1: Replace all `1.5px` borders with `1px` in global.css**

In `global.css`, change:
- `.gi-input, .gi-select`: `border: 1.5px solid` → `border: 1px solid`
- `.home-tab`: `border: 1.5px solid` → `border: 1px solid`
- `.gi-lang-toggle`: `border: 1.5px solid` → `border: 1px solid`

**Step 2: Verify no remaining 1.5px borders**
```bash
grep -rn "1.5px" src/
```
Expected: Should find zero results (or only non-border uses).

**Step 3: Verify build**
```bash
npm run build
```

**Step 4: Commit**
```bash
git add src/assets/styles/global.css src/components/AppHeader.vue
git commit -m "style: standardize border widths from 1.5px to 1px"
```

---

### Task 7: Use Token Instead of Hardcoded `#fff` in Buttons

**Files:**
- Modify: `src/assets/styles/global.css`

**Step 1: Replace hardcoded color**

In `.gi-btn` styles:
```css
/* Before */
color: #fff;
/* After */
color: var(--gi-text-inverse);
```

**Step 2: Verify build**
```bash
npm run build
```

**Step 3: Commit**
```bash
git add src/assets/styles/global.css
git commit -m "style: use --gi-text-inverse token instead of hardcoded #fff"
```

---

### Task 8: Fix Badge Contrast in Dark Mode

**Files:**
- Modify: `src/views/HomeView.vue`

**Step 1: Add dark mode override for popular badge**

In `HomeView.vue`, inside the `<style scoped>` section, add:

```css
[data-theme="dark"] .gi-badge-popular {
  background: var(--gi-tint-orange-text);
  color: var(--gi-text-inverse);
}
```

**Step 2: Verify build**
```bash
npm run build
```

**Step 3: Commit**
```bash
git add src/views/HomeView.vue
git commit -m "fix: improve popular badge contrast in dark mode"
```

---

### Task 9: Add Meta Description

**Files:**
- Modify: `index.html`

**Step 1: Add meta description tag**

In `index.html`, add inside `<head>`:

```html
<meta name="description" content="Free online tools for print, digital, and design workflows. No signup, no server — everything runs in your browser." />
```

**Step 2: Verify build**
```bash
npm run build
```

**Step 3: Commit**
```bash
git add index.html
git commit -m "feat: add meta description for SEO and accessibility"
```

---

### Task 10: Add Hex Validation to Contrast Checker

**Files:**
- Modify: `src/views/ContrastCheckerView.vue`
- Test: Manual browser test

**Step 1: Add hex validation computed properties**

In the `<script setup>` section, add:

```typescript
const textHexError = computed(() => {
  return textHex.value && !/^#[0-9A-Fa-f]{6}$/.test(textHex.value)
})

const bgHexError = computed(() => {
  return bgHex.value && !/^#[0-9A-Fa-f]{6}$/.test(bgHex.value)
})
```

**Step 2: Add error display below color inputs**

In the template, after each `.contrast-color-input` div, add:

```vue
<span v-if="textHexError" class="contrast-color-error" role="alert">{{ t('contrastChecker.error.invalidHex') }}</span>
```

And similarly for `bgHexError`.

**Step 3: Add translations**

In `src/i18n/fr.ts`, under `contrastChecker`:
```typescript
error: {
  invalidHex: 'Code hexadécimal invalide (ex: #FF5733)',
},
```

In `src/i18n/en.ts`:
```typescript
error: {
  invalidHex: 'Invalid hex code (e.g. #FF5733)',
},
```

**Step 4: Add error styling**

In `<style scoped>`:
```css
.contrast-color-error {
  font-size: var(--gi-font-size-xs);
  color: var(--gi-error);
  margin-top: var(--gi-space-xs);
}
```

**Step 5: Verify build**
```bash
npm run build
```

**Step 6: Commit**
```bash
git add src/views/ContrastCheckerView.vue src/i18n/fr.ts src/i18n/en.ts
git commit -m "feat: add hex validation with error messages in contrast checker"
```

---

### Task 11: Add Number Validation to Paper Weight

**Files:**
- Modify: `src/views/PaperWeightView.vue`

**Step 1: Add validation computed properties**

```typescript
const quantityError = computed(() => {
  if (quantity.value <= 0) return t('paperWeight.error.minQuantity')
  if (quantity.value > 99999) return t('paperWeight.error.maxQuantity')
  return null
})

const grammageError = computed(() => {
  if (grammage.value <= 0) return t('paperWeight.error.minGrammage')
  if (grammage.value > 500) return t('paperWeight.error.maxGrammage')
  return null
})
```

**Step 2: Show error messages**

After each input section, add:
```vue
<span v-if="quantityError" class="pw-error" role="alert">{{ quantityError }}</span>
```

**Step 3: Add error styling and translations**

```css
.pw-error {
  font-size: var(--gi-font-size-xs);
  color: var(--gi-error);
  margin-top: var(--gi-space-xs);
}
```

Add to `fr.ts` under `paperWeight`:
```typescript
error: {
  minQuantity: 'Minimum 1 sheet',
  maxQuantity: 'Maximum 99,999 sheets',
  minGrammage: 'Minimum 1 g/m²',
  maxGrammage: 'Maximum 500 g/m²',
},
```

Add to `en.ts`:
```typescript
error: {
  minQuantity: 'Minimum 1 sheet',
  maxQuantity: 'Maximum 99,999 sheets',
  minGrammage: 'Minimum 1 g/m²',
  maxGrammage: 'Maximum 500 g/m²',
},
```

**Step 4: Verify build**
```bash
npm run build
```

**Step 5: Commit**
```bash
git add src/views/PaperWeightView.vue src/i18n/fr.ts src/i18n/en.ts
git commit -m "feat: add number validation with error messages in paper weight"
```

---

### Task 12: Fix Hero Font Size on Mobile

**Files:**
- Modify: `src/views/HomeView.vue`

**Step 1: Increase mobile hero body font size**

In the `@media (max-width: 768px)` block, add:

```css
.home-hero-body {
  font-size: 1rem; /* Increased from 0.875rem for mobile readability */
}
```

**Step 2: Verify build**
```bash
npm run build
```

**Step 3: Commit**
```bash
git add src/views/HomeView.vue
git commit -m "fix: increase hero body text to 1rem on mobile for readability"
```

---

## Phase 3: Medium-Priority Fixes

### Task 13: Add Loading States to Image Tool Buttons

**Files:**
- Modify: `src/views/ImageCompressorView.vue`
- Modify: `src/views/ImageCropperView.vue`
- Modify: `src/views/ImageResizerView.vue`
- Modify: `src/views/ImageFiltersView.vue`
- Modify: `src/views/ImageConverterView.vue`
- Modify: `src/views/MockupGeneratorView.vue`

**Step 1: Identify generate/process buttons in each view**

For each tool, find the primary action button and add `:disabled="isProcessing"` with a loading state.

**Step 2: Add loading indicator**

Example pattern for each tool:
```vue
<button
  class="gi-btn"
  :disabled="isProcessing"
  @click="handleProcess"
>
  <Loader2 v-if="isProcessing" :size="16" class="animate-spin" />
  {{ isProcessing ? t('common.processing') : t('tool.generate') }}
</button>
```

**Step 3: Verify build**
```bash
npm run build
```

**Step 4: Commit**
```bash
git add src/views/Image*.vue src/views/MockupGeneratorView.vue
git commit -m "feat: add loading states to image tool action buttons"
```

---

### Task 14: Add Color Copy Feedback in Palette

**Files:**
- Modify: `src/views/ColorPaletteView.vue`

**Step 1: Add brief flash animation on copy**

In the `copy()` function, after successful clipboard write:

```typescript
async function copy(hex: string, index: number) {
  try {
    await navigator.clipboard.writeText(hex)
    copiedIndex.value = index
    // Add brief visual flash
    copiedFlash.value = index
    setTimeout(() => { copiedFlash.value = null }, 300)
    setTimeout(() => { copiedIndex.value = null }, 2000)
  } catch {
    // silently ignore
  }
}
```

Add `const copiedFlash = ref<number | null>(null)`

**Step 2: Add flash styling to swatch**

```css
.gi-swatch--copied {
  animation: flash-brightness 0.3s ease-out;
}

@keyframes flash-brightness {
  0% { filter: brightness(1.8); }
  100% { filter: brightness(1); }
}
```

**Step 3: Verify build**
```bash
npm run build
```

**Step 4: Commit**
```bash
git add src/views/ColorPaletteView.vue
git commit -m "feat: add visual flash feedback on color copy in palette"
```

---

### Task 15: Add Skip-to-Content Link

**Files:**
- Create: `src/components/SkipToContent.vue`
- Modify: `src/main.ts` (or `App.vue` if exists)

**Step 1: Create SkipToContent component**

```vue
<template>
  <a href="#main-content" class="skip-link">
    {{ t('nav.skipToContent') }}
  </a>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<style scoped>
.skip-link {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.75rem 1.5rem;
  background: var(--gi-brand);
  color: white;
  border-radius: var(--gi-radius-md);
  font-weight: 600;
  z-index: 1000;
  transition: top 0.2s;
  text-decoration: none;
}

.skip-link:focus {
  top: 0.5rem;
}
</style>
```

**Step 2: Add to app layout**

Import and use in the main app component or layout. Add `<div id="main-content">` wrapper in `main.ts` mount target or in `ToolPageLayout.vue`.

**Step 3: Add translations**

In `fr.ts` under `nav`:
```typescript
skipToContent: 'Aller au contenu principal',
```

In `en.ts`:
```typescript
skipToContent: 'Skip to main content',
```

**Step 4: Verify build**
```bash
npm run build
```

**Step 5: Commit**
```bash
git add src/components/SkipToContent.vue src/i18n/fr.ts src/i18n/en.ts
git commit -m "feat: add skip-to-content link for keyboard accessibility"
```

---

### Task 16: Standardize Monospace Font Stack

**Files:**
- Modify: `src/assets/styles/global.css`

**Step 1: Update `.gi-code` font-family**

```css
.gi-code {
  font-family: ui-monospace, 'Menlo', 'Monaco', 'Cascadia Code', 'Consolas', monospace;
  font-size: 0.85rem;
  background: var(--gi-bg-soft);
  padding: 0.75rem 1rem;
  border-radius: var(--gi-radius-md);
  color: var(--gi-text);
  word-break: break-all;
}
```

**Step 2: Verify build**
```bash
npm run build
```

**Step 3: Commit**
```bash
git add src/assets/styles/global.css
git commit -m "style: expand monospace font stack for cross-platform consistency"
```

---

### Task 17: Add Line-Height to Input Elements

**Files:**
- Modify: `src/assets/styles/global.css`

**Step 1: Add line-height to `.gi-input` and `.gi-select`**

```css
.gi-input, .gi-select {
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  font-size: 0.9375rem;
  font-family: inherit;
  line-height: 1.5;
  background: var(--gi-surface);
  color: var(--gi-text);
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
  width: 100%;
  box-shadow: var(--gi-shadow-sm);
}
```

**Step 2: Verify build**
```bash
npm run build
```

**Step 3: Commit**
```bash
git add src/assets/styles/global.css
git commit -m "fix: add explicit line-height to inputs for vertical alignment consistency"
```

---

### Task 18: Fix Home-Wrap Negative Margin Hack

**Files:**
- Modify: `src/views/HomeView.vue`

**Step 1: Replace negative margin approach**

Replace the `.home-wrap` styles with a cleaner full-width breakout:

```css
.home-wrap {
  width: 100%;
  margin-top: -2rem;
  margin-bottom: -4rem;
}
```

Remove the `position: relative; left: 50%; transform: translateX(-50%)` and negative viewport margins. The `.gi-main` constraint is already broken by the hero section's own max-width.

**Step 2: Verify no horizontal scroll**

Test in browser at various viewport widths (320px, 768px, 1440px).

**Step 3: Verify build**
```bash
npm run build
```

**Step 4: Commit**
```bash
git add src/views/HomeView.vue
git commit -m "fix: simplify home-wrap layout to prevent potential horizontal scroll"
```

---

## Phase 4: Low-Priority / Nice-to-Have

### Task 19: Add Responsive Table Wrapper

**Files:**
- Modify: `src/assets/styles/global.css`

**Step 1: Add responsive wrapper class**

```css
.gi-table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.gi-table-wrapper .gi-table {
  min-width: 100%;
}
```

**Step 2: Verify build and commit**
```bash
npm run build
git add src/assets/styles/global.css
git commit -m "feat: add responsive table wrapper for mobile overflow handling"
```

---

### Task 20: Improve Color Palette Locked Swatch Visibility

**Files:**
- Modify: `src/views/ColorPaletteView.vue`

**Step 1: Enhance locked state outline**

```css
.gi-swatch--locked {
  outline: 3px solid rgba(0, 0, 0, 0.5);
  outline-offset: -3px;
}

[data-theme="dark"] .gi-swatch--locked {
  outline: 3px solid rgba(255, 255, 255, 0.6);
}
```

**Step 2: Verify build and commit**
```bash
npm run build
git add src/views/ColorPaletteView.vue
git commit -m "fix: improve locked swatch outline visibility on light colors"
```

---

### Task 21: Verify and Run Tests

**Files:**
- All modified files from previous tasks

**Step 1: Run full test suite**
```bash
npm test
```
Expected: All existing tests pass (no test changes required for these CSS/template fixes).

**Step 2: Run build**
```bash
npm run build
```
Expected: Build succeeds, no type errors.

**Step 3: Final commit**
```bash
git add -A
git commit -m "chore: verify build and tests pass after UI/UX audit fixes"
```

---

## Testing Checklist

After all tasks, manually verify:

- [ ] Homepage renders correctly in light and dark mode
- [ ] At least 4 tool pages render correctly (Paper Weight, Contrast Checker, Color Palette, QR Decoder)
- [ ] Keyboard navigation works (Tab through elements, visible focus states)
- [ ] Screen reader announces errors (GiFormField with error state)
- [ ] Lang toggle in header is 44×44px minimum
- [ ] Hex validation shows error in Contrast Checker
- [ ] Number validation shows errors in Paper Weight
- [ ] No horizontal scroll on homepage at any viewport
- [ ] Buttons show loading state during processing
- [ ] Color palette swatch shows flash on copy
- [ ] Skip-to-content link appears on focus

---

## Files Summary

| File | Tasks |
|------|-------|
| `src/assets/styles/global.css` | 1, 6, 7, 16, 17, 19 |
| `src/main.ts` | 2 |
| `src/components/AppHeader.vue` | 2, 3, 6 |
| `src/components/AppFooter.vue` | 2 |
| `src/components/GiFormField.vue` | 4 |
| `src/components/SkipToContent.vue` | 15 (new) |
| `src/views/HomeView.vue` | 8, 9, 12, 18 |
| `src/views/ContrastCheckerView.vue` | 10 |
| `src/views/PaperWeightView.vue` | 11 |
| `src/views/ColorPaletteView.vue` | 5, 14, 20 |
| `src/views/Image*.vue` (5 files) | 13 |
| `src/views/MockupGeneratorView.vue` | 13 |
| `src/i18n/fr.ts` | 10, 11, 15 |
| `src/i18n/en.ts` | 10, 11, 15 |
| `index.html` | 9 |

---

## Commit Strategy

- **1 commit per task** — small, focused, revertable
- **Total: ~21 commits**
- All commits follow conventional commit format (`fix:`, `feat:`, `style:`, `chore:`)
