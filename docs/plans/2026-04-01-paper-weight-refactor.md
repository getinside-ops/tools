# Paper Weight Calculator Refactor Implementation Plan

> **For Qwen Code:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task.

**Goal:** Refactor Paper Weight calculator to fit in 100vh without scrolling using a compact 3-column grid layout with simplified UI elements.

**Architecture:** Replace vertical two-column layout with CSS Grid dashboard (3 columns: Quantity/Grammage | Format Grid | Result). Remove non-essential elements (format comparison bar, grammage hint, secondary metrics).

**Tech Stack:** Vue 3.5 Composition API, CSS Grid, vue-i18n for translations

---

## Pre-Implementation Checklist

### Task 0: Verify Current State

**Files to check:**
- `src/views/PaperWeightView.vue` (1023 lines)
- `src/composables/usePaperWeight.ts` (core logic)
- `src/components/GiFormatComparison.vue` (to be removed)
- `src/composables/__tests__/usePaperWeight.test.ts` (existing tests)

**Step 1: Run existing tests to ensure they pass**
```bash
npm test -- src/composables/__tests__/usePaperWeight.test.ts
```
Expected: All tests PASS

**Step 2: Verify build works**
```bash
npm run build
```
Expected: No errors

**Step 3: Commit current state**
```bash
git add .
git commit -m "chore: snapshot before paper weight refactor"
```

---

## Phase 1: Update Translations

### Task 1: Remove Unused Translation Keys

**Files:**
- Modify: `src/i18n/fr.ts` - remove unused keys
- Modify: `src/i18n/en.ts` - remove unused keys

**Step 1: Identify keys to remove**
Remove these translation keys:
- `paperWeight.hints.*` (grammage hints)
- Any format-related keys for "Carte" and "DL" if not needed

**Step 2: Edit fr.ts**
Remove the `hints` section from `paperWeight` object.

**Step 3: Edit en.ts**
Remove the corresponding `hints` section.

**Step 4: Commit**
```bash
git add src/i18n/fr.ts src/i18n/en.ts
git commit -m "refactor(paper-weight): remove unused translation keys"
```

---

## Phase 2: Refactor View Component

### Task 2: Simplify Template Structure

**Files:**
- Modify: `src/views/PaperWeightView.vue` (lines 1-250 template)

**Step 1: Remove GiFormatComparison component**
Delete the entire `<GiFormatComparison>` component usage (around line 65-68).

**Step 2: Remove grammage hint section**
Delete the `.gi-grammage-hint` div (around line 165-170).

**Step 3: Remove secondary metric cards**
In the results section, remove:
- `.gi-metric-grid` div containing "Weight per 1000" and "Total sheets" cards
- Keep only main result and formula

**Step 4: Simplify format grid**
Change the format grid to show only 4 formats:
```vue
<button v-for="fmt in ['A5', 'A6', 'A4'] as const" ... >
  <!-- A5, A6, A4 cards -->
</button>
<button type="button" @click="selectedFormat = 'Custom'">
  <!-- Libre/Custom card -->
</button>
```

**Step 5: Commit**
```bash
git add src/views/PaperWeightView.vue
git commit -m "refactor(paper-weight): simplify template structure"
```

---

### Task 3: Implement CSS Grid Layout

**Files:**
- Modify: `src/views/PaperWeightView.vue` (styles section)

**Step 1: Replace `.pw-layout` with grid**
```css
.pw-layout {
  display: grid;
  grid-template-columns: 1fr 1fr 1.2fr;
  gap: var(--gi-space-lg);
  align-items: start;
  max-height: calc(100vh - 200px);
  padding: var(--gi-space-md);
}
```

**Step 2: Compact input sections**
```css
.pw-inputs {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-md);
  min-width: 0;
}

.gi-field {
  margin-bottom: 0;
}
```

**Step 3: Compact format grid (2×2)**
```css
.gi-format-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--gi-space-sm);
}

.gi-format-card {
  padding: var(--gi-space-sm);
  min-height: 100px;
}
```

**Step 4: Compact result panel**
```css
.pw-results {
  position: sticky;
  top: var(--gi-space-md);
}

.gi-result {
  padding: var(--gi-space-md);
}

.gi-result-value {
  font-size: 2.5rem; /* Reduced from 3rem */
}
```

**Step 5: Compact slider section**
```css
.gi-slider-container {
  padding: var(--gi-space-sm) var(--gi-space-xs);
}

.gi-chips {
  gap: var(--gi-space-xs);
}

.gi-chip {
  padding: var(--gi-space-xs) var(--gi-space-sm);
  font-size: var(--gi-font-size-xs);
}
```

**Step 6: Add responsive fallback**
```css
@media (max-width: 900px) {
  .pw-layout {
    grid-template-columns: 1fr;
    max-height: none;
  }
}
```

**Step 7: Commit**
```bash
git add src/views/PaperWeightView.vue
git commit -m "feat(paper-weight): implement compact grid layout"
```

---

### Task 4: Remove Custom Format Transition

**Files:**
- Modify: `src/views/PaperWeightView.vue`

**Step 1: Remove `<transition>` wrapper**
Replace the transition wrapper with inline conditional rendering:
```vue
<div v-if="selectedFormat === 'Custom'" class="gi-custom-format-inline">
  <div class="gi-custom-inputs">
    <input v-model.number="customWidth" type="number" />
    <span>×</span>
    <input v-model.number="customHeight" type="number" />
    <span>mm</span>
  </div>
</div>
```

**Step 2: Add compact inline styles**
```css
.gi-custom-format-inline {
  padding: var(--gi-space-sm);
  background: var(--gi-bg-soft);
  border-radius: var(--gi-radius-md);
  margin-top: var(--gi-space-xs);
}

.gi-custom-inputs {
  display: flex;
  align-items: center;
  gap: var(--gi-space-xs);
  font-size: var(--gi-font-size-sm);
}

.gi-custom-inputs input {
  width: 60px;
  padding: var(--gi-space-xs);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-sm);
}
```

**Step 3: Commit**
```bash
git add src/views/PaperWeightView.vue
git commit -m "refactor(paper-weight): simplify custom format inputs"
```

---

## Phase 3: Testing

### Task 5: Manual Visual Testing

**Files:**
- Test: Browser at `http://localhost:5173/tools/#/paper-weight`

**Step 1: Start dev server**
```bash
npm run dev
```

**Step 2: Verify no scrolling**
- Open browser to tool page
- Set viewport to 1280×720
- Verify entire tool fits without page scrollbar

**Step 3: Test all interactions**
- [ ] Quantity slider updates result
- [ ] Quantity chips (10k, 25k, 50k, 100k, 500k, 1M) work
- [ ] Custom quantity input works
- [ ] Format cards (A5, A6, A4) switch correctly
- [ ] Libre (Custom) format shows inline inputs
- [ ] Grammage chips update result
- [ ] Custom grammage input works
- [ ] Reset button clears all values
- [ ] Result updates in real-time

**Step 4: Test responsive behavior**
- Resize browser to < 900px width
- Verify layout switches to single column
- Verify scrolling works on mobile

**Step 5: Test dark mode**
- Toggle dark mode
- Verify all elements visible and readable
- Check focus states are visible

**Step 6: Take screenshot for documentation**
Save to: `docs/plans/paper-weight-refactored.png`

---

### Task 6: Playwright E2E Test (Optional)

**Files:**
- Create: `tests/e2e/paper-weight.spec.ts`

**Step 1: Create basic E2E test**
```typescript
import { test, expect } from '@playwright/test'

test('paper weight calculator fits in viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('#/paper-weight')
  
  // Verify no scrollbar
  const hasVerticalScrollbar = await page.evaluate(() => {
    return document.documentElement.scrollHeight > document.documentElement.clientHeight
  })
  expect(hasVerticalScrollbar).toBe(false)
  
  // Verify main elements visible
  await expect(page.getByText('Calculateur poids papier')).toBeVisible()
  await expect(page.getByText('POIDS TOTAL ESTIMÉ')).toBeVisible()
})
```

**Step 2: Run test**
```bash
npx playwright test tests/e2e/paper-weight.spec.ts
```

**Step 3: Commit**
```bash
git add tests/e2e/paper-weight.spec.ts
git commit -m "test: add E2E test for paper weight layout"
```

---

## Phase 4: Verification

### Task 7: Final Verification

**Step 1: Run all tests**
```bash
npm test
```
Expected: All tests PASS

**Step 2: Run build**
```bash
npm run build
```
Expected: No errors, clean build

**Step 3: Type check**
```bash
npx vue-tsc --noEmit
```
Expected: No type errors

**Step 4: Verify in production preview**
```bash
npm run preview
```
- Navigate to paper weight tool
- Verify layout matches dev version

**Step 5: Commit final state**
```bash
git add .
git commit -m "chore: verify paper weight refactor complete"
```

---

## Summary of Changes

### Files Modified:
1. `src/i18n/fr.ts` - Remove unused translation keys
2. `src/i18n/en.ts` - Remove unused translation keys
3. `src/views/PaperWeightView.vue` - Complete refactor

### Files Unchanged:
- `src/composables/usePaperWeight.ts` - Core logic remains the same
- `src/components/GiFormatComparison.vue` - No longer used but not deleted (could be removed later)

### UI Elements Removed:
- ❌ Format comparison bar (GiFormatComparison component)
- ❌ Grammage hint (💡 tooltip)
- ❌ "Weight per 1000 sheets" metric card
- ❌ "Total sheets" metric card
- ❌ DL format from main grid
- ❌ Carte format from main grid
- ❌ Custom format transition animation

### Layout Changes:
- ✅ 3-column CSS Grid (1fr 1fr 1.2fr)
- ✅ Format grid: 2×2 (A5, A6, A4, Libre)
- ✅ Compact spacing throughout
- ✅ Result panel dominant (40% width)
- ✅ Max-height constraint for 100vh fit
- ✅ Responsive fallback to single column

---

## Risk Mitigation

**Potential Issues:**
1. **Text overflow in compact layout** → Use `text-overflow: ellipsis` if needed
2. **Result panel too tall** → Reduce font sizes further (2rem for main value)
3. **Grid too cramped on small screens** → Lower breakpoint to 1024px if needed
4. **Dark mode contrast issues** → Test with both themes

**Rollback Plan:**
```bash
git revert HEAD~10..HEAD
```
(Revert all commits from this refactor)

---
