# Paper Weight Tool Simplification Plan

**Goal:** Simplify the UI to fit in one view without scrolling - replace cards/sliders with dropdowns, keep mode toggle and custom format.

**Architecture:** Single-row layout with dropdowns instead of cards/sliders. Minimal changes to logic - only UI refactoring.

**Tech Stack:** Vue 3, existing composables unchanged

---

### Task 1: Replace Format Cards with Dropdown

**File:** `src/views/PaperWeightView.vue:116-226` (flyers) and `src/views/PaperWeightView.vue:372-512` (booklet)

Replace the 6-card format grid with a simple `<select>` dropdown:

```vue
<select v-model="selectedFormat" class="gi-select">
  <option v-for="(dims, key) in FORMATS" :key="key" :value="key">
    {{ t(`paperWeight.formats.${key}`) }} - {{ dims.width }} × {{ dims.height }} mm
  </option>
  <option value="Custom">{{ t('paperWeight.formats.Custom') }}...</option>
</select>
```

Keep the custom format inputs section (lines 228-256 and 484-512) unchanged.

---

### Task 2: Replace Grammage Slider with Dropdown

**File:** `src/views/PaperWeightView.vue:259-294` (flyers) and `src/views/PaperWeightView.vue:519-596` (booklet)

Replace slider + preset buttons with dropdown:

```vue
<select v-model.number="grammage" class="gi-select">
  <option v-for="preset in grammagePresets" :key="preset" :value="preset">
    {{ preset }} g/m²
  </option>
</select>
```

Keep the helper text and error display.

---

### Task 3: Remove Quantity Slider

**File:** `src/views/PaperWeightView.vue:71-113` (flyers) and `src/views/PaperWeightView.vue:304-333` (booklet)

Remove `<GiLogSlider>` component and preset buttons. Keep only the number input.

---

### Task 4: Compact Layout - Single Row

**File:** `src/views/PaperWeightView.vue:67-598` (entire input section)

Restructure `.pw-inputs` to horizontal layout on desktop:

```css
.pw-inputs {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--gi-space-md);
  padding-top: var(--gi-space-md); /* reduced from 80px */
}

.pw-input-group {
  flex: 1;
  min-width: 150px;
}
```

Update responsive breakpoint to stack on mobile (already at 768px).

---

### Task 5: Test & Verify

Run: `npm run build`
Expected: No type errors

Open in browser, verify:
- [ ] Mode toggle works (flyers/booklet)
- [ ] Format dropdown shows all 5 formats + Custom
- [ ] Custom format reveals inputs when selected
- [ ] Grammage dropdown with presets
- [ ] Quantity input only (no slider)
- [ ] Result updates live
- [ ] Layout fits without scrolling on desktop

---

### Task 6: Commit

```bash
git add src/views/PaperWeightView.vue
git commit -m "refactor: simplify paper weight UI - dropdowns instead of cards/sliders"
```