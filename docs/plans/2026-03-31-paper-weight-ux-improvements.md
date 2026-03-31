# Paper Weight UX Improvements Implementation Plan

> **For Qwen Code:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Refactor Paper Weight tool UI to remove precise/fast switch, show format size differences visually, and fit all content on 1080p desktop without scrolling.

**Architecture:** Two-column layout with left panel for inputs (quantity, formats, grammage) and sticky right panel for results. Add format comparison bar showing relative sizes. Remove slider mode toggle.

**Tech Stack:** Vue 3 Composition API, CSS design tokens (--gi-space-*, --gi-font-size-*, --gi-shadow-*), flexbox/grid layouts

---

### Task 1: Remove Precise/Fast Slider Mode Toggle

**Files:**
- Modify: `src/views/PaperWeightView.vue` (template lines 14-19, script lines 227-245)

**Step 1: Remove toggle button from template**
Delete the mode toggle button and simplify slider header:
```vue
<div class="gi-slider-header">
  <span class="gi-slider-value">{{ formatQuantity(quantity) }} ex.</span>
</div>
```

**Step 2: Remove slider mode state and functions from script**
Remove:
- `sliderMode` ref
- `sliderMin`, `sliderMax`, `sliderStep` computed
- `toggleSliderMode` function
- `setQuantity` mode auto-switch logic
- Update `sliderValue` initialization to use fixed range (5-50, step 1)

**Step 3: Update slider configuration**
```typescript
const sliderMin = 5
const sliderMax = 50
const sliderStep = 1
const sliderValue = ref(DEFAULT_QUANTITY / 1000)
```

**Step 4: Run build to verify no errors**
Run: `npm run build`
Expected: SUCCESS, no TypeScript errors

**Step 5: Commit**
```bash
git add src/views/PaperWeightView.vue
git commit -m "style: remove precise/fast slider mode toggle"
```

---

### Task 2: Create Format Comparison Bar Component

**Files:**
- Create: `src/components/GiFormatComparison.vue`
- Modify: `src/views/PaperWeightView.vue` (import and add to template)

**Step 1: Create format comparison component**
```vue
<template>
  <div class="gi-format-comparison">
    <div class="gi-comparison-bar">
      <div
        v-for="fmt in formats"
        :key="fmt.key"
        class="gi-comparison-rect"
        :class="{ active: selectedFormat === fmt.key }"
        :style="getRectStyle(fmt)"
        @click="$emit('select', fmt.key)"
        :title="fmt.label"
      />
    </div>
    <div class="gi-comparison-labels">
      <span
        v-for="fmt in formats"
        :key="fmt.key"
        class="gi-comparison-label"
        :class="{ active: selectedFormat === fmt.key }"
        @click="$emit('select', fmt.key)"
      >
        {{ fmt.label }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FORMATS, type FormatKey } from '../composables/usePaperWeight'

interface FormatInfo {
  key: FormatKey
  label: string
  width: number
  height: number
}

const formats: FormatInfo[] = [
  { key: 'A6', label: 'A6', width: 105, height: 148 },
  { key: 'A5', label: 'A5', width: 148, height: 210 },
  { key: 'DL', label: 'DL', width: 100, height: 210 },
  { key: 'A4', label: 'A4', width: 210, height: 297 },
  { key: 'Carte', label: 'Carte', width: 85, height: 55 },
]

const props = defineProps<{
  selectedFormat: FormatKey | 'Custom'
}>()

defineEmits<{
  select: [format: FormatKey]
}>()

const SCALE = 0.8 // Scale factor for rectangles
const MAX_HEIGHT = 60 // Max height in px

const getRectStyle = (fmt: FormatInfo) => {
  const scale = MAX_HEIGHT / Math.max(fmt.width, fmt.height) * SCALE
  return {
    width: `${fmt.width * scale}px`,
    height: `${fmt.height * scale}px`,
  }
}
</script>

<style scoped>
.gi-format-comparison {
  padding: var(--gi-space-md);
  background: var(--gi-bg-soft);
  border-radius: var(--gi-radius-lg);
  margin-bottom: var(--gi-space-md);
}

.gi-comparison-bar {
  display: flex;
  align-items: flex-end;
  gap: var(--gi-space-md);
  padding: var(--gi-space-sm);
  min-height: 80px;
  justify-content: center;
}

.gi-comparison-rect {
  background: var(--gi-brand-fade);
  border: 2px solid var(--gi-brand);
  border-radius: var(--gi-radius-sm);
  cursor: pointer;
  transition: all var(--gi-transition-fast);
  flex-shrink: 0;
}

.gi-comparison-rect:hover {
  background: var(--gi-brand);
  transform: translateY(-2px);
}

.gi-comparison-rect.active {
  background: var(--gi-brand);
  box-shadow: 0 0 0 3px rgba(10, 170, 142, 0.3);
}

.gi-comparison-labels {
  display: flex;
  justify-content: center;
  gap: var(--gi-space-md);
  margin-top: var(--gi-space-sm);
}

.gi-comparison-label {
  font-size: var(--gi-font-size-xs);
  font-weight: 600;
  color: var(--gi-text-muted);
  cursor: pointer;
  padding: var(--gi-space-xs) var(--gi-space-sm);
  border-radius: var(--gi-radius-pill);
  transition: all var(--gi-transition-fast);
}

.gi-comparison-label:hover {
  color: var(--gi-brand);
  background: rgba(10, 170, 142, 0.08);
}

.gi-comparison-label.active {
  color: var(--gi-brand);
  background: rgba(10, 170, 142, 0.12);
}
</style>
```

**Step 2: Add component to PaperWeightView**
Import and insert after quantity chips:
```vue
<GiFormatComparison
  :selected-format="selectedFormat"
  @select="selectedFormat = $event"
/>
```

**Step 3: Run build**
Run: `npm run build`
Expected: SUCCESS

**Step 4: Commit**
```bash
git add src/components/GiFormatComparison.vue src/views/PaperWeightView.vue
git commit -m "feat: add format comparison bar showing relative sizes"
```

---

### Task 3: Create Two-Column Layout with Sticky Result Panel

**Files:**
- Modify: `src/views/PaperWeightView.vue`

**Step 1: Wrap main content in layout container**
```vue
<div class="pw-layout">
  <div class="pw-inputs">
    <!-- All input sections go here -->
  </div>
  <div class="pw-results">
    <!-- Result panel (sticky) -->
  </div>
</div>
```

**Step 2: Move result section into right column**
Cut the entire result section from its current position and place in `.pw-results`

**Step 3: Add layout CSS**
```css
.pw-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: var(--gi-space-2xl);
  align-items: start;
}

.pw-inputs {
  min-width: 0;
}

.pw-results {
  position: sticky;
  top: var(--gi-space-lg);
}

@media (max-width: 1024px) {
  .pw-layout {
    grid-template-columns: 1fr;
  }
  
  .pw-results {
    position: static;
  }
}
```

**Step 4: Run build**
Run: `npm run build`
Expected: SUCCESS

**Step 5: Commit**
```bash
git add src/views/PaperWeightView.vue
git commit -m "style: create two-column layout with sticky results"
```

---

### Task 4: Compact Spacing for 1080p No-Scroll

**Files:**
- Modify: `src/views/PaperWeightView.vue`

**Step 1: Reduce header spacing**
```css
.gi-tool-header {
  margin-bottom: var(--gi-space-xl); /* was 2xl */
}

.gi-tool-header h1 {
  font-size: var(--gi-font-size-xl); /* was 2xl */
  margin-bottom: var(--gi-space-xs); /* was sm */
}
```

**Step 2: Compact field spacing**
```css
.gi-field {
  margin-bottom: var(--gi-space-md); /* was lg */
}

.gi-slider-container {
  padding: var(--gi-space-md) var(--gi-space-sm); /* was lg md */
}
```

**Step 3: Compact format grid**
```css
.gi-format-grid {
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); /* was 200px */
  gap: var(--gi-space-sm); /* was grid-gap */
}

.gi-format-card {
  padding: var(--gi-space-md); /* was xl */
}

.gi-format-icon-box {
  width: 40px;
  height: 40px; /* was 48px */
}
```

**Step 4: Compact result panel**
```css
.gi-result {
  padding: var(--gi-space-xl) var(--gi-space-lg); /* was 2xl xl */
}

.gi-result-value {
  font-size: 3.5rem; /* was 4rem */
}
```

**Step 5: Run build and manual test**
Run: `npm run build`
Expected: SUCCESS
Manual: Open in browser at 1920x1080, verify no scrolling needed

**Step 6: Commit**
```bash
git add src/views/PaperWeightView.vue
git commit -m "style: compact spacing for 1080p no-scroll layout"
```

---

### Task 5: Verify Build, Tests, and Manual Testing

**Files:**
- All modified files

**Step 1: Run full build**
Run: `npm run build`
Expected: SUCCESS, no errors, JS bundle < 15 kB

**Step 2: Run tests**
Run: `npm test`
Expected: 166/166 tests passing

**Step 3: Manual browser testing**
Run: `npm run dev`
Open: http://localhost:5173/tools/#/paper-weight
Verify:
- No precise/fast toggle visible
- Format comparison bar shows size differences
- All content visible on 1920x1080 without scrolling
- Result panel stays visible when scrolling inputs
- Format cards still work correctly
- Quantity slider works (5-50 range)

**Step 4: Take screenshot for documentation**
Use Playwright or browser screenshot tool
Save to: `docs/plans/paper-weight-ux-after.png`

**Step 5: Final commit if any fixes needed**
```bash
git add .
git commit -m "fix: address manual testing feedback"
```

---

### Task 6: Update Documentation

**Files:**
- Modify: `docs/plans/2026-03-31-paper-weight-ux-improvements.md` (this file)

**Step 1: Add results section**
Add to end of this file:
```markdown
## Results

**Before:** Required scrolling on 1080p, no visual format comparison, complex slider toggle

**After:** 
- All content fits on 1920x1080 without scrolling
- Format comparison bar shows relative sizes at a glance
- Simplified slider (precise mode only)
- Two-column layout with sticky results panel

**Files Changed:**
- `src/views/PaperWeightView.vue` - Layout refactor, toggle removal
- `src/components/GiFormatComparison.vue` - New component

**Testing:**
- Build: ✅ PASS
- Unit Tests: ✅ 166/166 PASS
- Manual: ✅ No scrolling on 1080p, format bar shows size differences
```

**Step 2: Commit documentation**
```bash
git add docs/plans/2026-03-31-paper-weight-ux-improvements.md
git commit -m "docs: add results to paper weight UX improvements plan"
```

---

## Testing Checklist

- [ ] Build passes with no errors
- [ ] All 166 unit tests pass
- [ ] No precise/fast toggle visible
- [ ] Format comparison bar renders correctly
- [ ] Format rectangles show proportional sizes
- [ ] Two-column layout works on desktop
- [ ] Result panel is sticky on scroll
- [ ] Layout collapses to single column on mobile (<1024px)
- [ ] All content visible on 1920x1080 without scrolling
- [ ] Quantity slider works (5-50 range, step 1)
- [ ] Format selection works via cards and comparison bar
- [ ] Dark mode compatible
