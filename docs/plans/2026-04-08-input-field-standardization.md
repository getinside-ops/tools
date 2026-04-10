# Input Field Standardization Plan

> **For Qwen Code:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Standardize all input fields across all tool views to match the clean, modern styling of the Redirect Checker's URL input field (unified border, proper padding, clean focus states).

**Architecture:** Update the global `.gi-input` class in `GiFormField.vue` to match the Redirect Checker's `.rc-input-field` styling, then remove redundant custom input styles from individual view files.

**Tech Stack:** Vue 3, CSS variables, GiFormField component

---

## Current State Analysis

The Redirect Checker URL input (`.rc-input-field`) has these characteristics:
- **Padding:** `0.6rem 1rem`
- **Border:** `1px solid var(--gi-border)`
- **Border radius:** `var(--gi-radius-lg)` (when standalone) or `var(--gi-radius-lg) 0 0 var(--gi-radius-lg)` (when paired with button)
- **Background:** `var(--gi-surface)`
- **Font:** `inherit` (font-family), `var(--gi-font-size-md)` (size)
- **Min height:** `44px` (touch target)
- **Focus state:** Border color changes to `var(--gi-brand)`, NO box-shadow (clean look)
- **Placeholder:** `var(--gi-text-muted)`
- **Disabled state:** `opacity: 0.6`

The current `.gi-input` in `GiFormField.vue` has:
- **Padding:** `var(--gi-space-sm) var(--gi-space-md)` (different values)
- **Border radius:** `var(--gi-radius-md)` (smaller than Redirect Checker)
- **Focus state:** Border color + box-shadow (more complex)

**Key differences to reconcile:**
1. Border radius: `md` vs `lg` (Redirect Checker uses larger radius)
2. Focus state: Redirect Checker has NO box-shadow, only border color change
3. Padding values need alignment
4. Font size needs to be consistent

---

## Implementation Strategy

**Phase 1:** Update global `.gi-input` styles to match Redirect Checker
**Phase 2:** Remove redundant custom input styles from view files
**Phase 3:** Verify build and test
**Phase 4:** Manual visual testing

---

### Task 1: Update Global `.gi-input` Styles

**Files:**
- Modify: `src/components/GiFormField.vue:87-130`

**Step 1: Update the `.gi-input` base styles**

Replace the current `.gi-input` styles in GiFormField.vue with Redirect Checker-inspired styling:

```css
.gi-input {
  width: 100%;
  padding: 0.6rem 1rem;
  font-size: var(--gi-font-size-md);
  font-family: inherit;
  color: var(--gi-text);
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  min-height: 44px;
  transition: border-color var(--gi-transition-fast) var(--gi-ease-out);
}

.gi-input:focus {
  outline: none;
  border-color: var(--gi-brand);
  box-shadow: none; /* Remove complex shadow for cleaner look */
}

.gi-input:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

[data-theme="dark"] .gi-input:focus {
  border-color: var(--gi-brand);
  box-shadow: none;
}

.gi-input--error {
  border-color: var(--gi-error);
}

.gi-input--textarea {
  min-height: 120px;
  resize: vertical;
}

.gi-input::placeholder {
  color: var(--gi-text-muted);
}

.gi-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

**Step 2: Commit**
```bash
git add src/components/GiFormField.vue
git commit -m "style: standardize .gi-input to match Redirect Checker styling"
```

---

### Task 2: Remove Redundant Custom Input Styles from View Files

**Files to modify:**
- `src/views/PxToRemView.vue:138-170` — Remove `.px-base-input .gi-input` and `.px-value-input` overrides
- `src/views/ContrastCheckerView.vue:737-742` — Remove `.contrast-hex-input` overrides
- `src/views/UrlParserView.vue:290-300` — Remove `.gi-input-wrapper .gi-input` padding override
- `src/views/PromoCodeView.vue:174-180` — Keep monospace styling (special case), but align with new base
- `src/views/TypeScaleView.vue:435-438` — Remove `.ts-field-with-slider .gi-input` override
- `src/views/BarcodeView.vue:453-467` — Update validation state styles to work with new base
- `src/views/HomeView.vue` — Remove `.home-search--icon` padding override if present

**Step 1: PxToRemView.vue — Remove custom input styles**

Find and remove this entire block (around L138-170):

```css
/* REMOVE THIS */
.px-base-input .gi-input {
  width: 80px;
  text-align: center;
}

.px-value-input {
  background: transparent;
  border-color: transparent;
  font-size: 1.25rem;
  padding: 0.25rem;
}

.px-value-input--rem {
  color: var(--gi-brand);
}
```

Replace with semantic wrapper styling:
```css
.px-base-input {
  width: 80px;
  margin: 0 auto;
}

.px-value-input {
  font-size: var(--gi-font-size-lg);
  text-align: center;
}

.px-value-input--rem {
  color: var(--gi-brand);
  font-weight: 600;
}
```

**Step 2: ContrastCheckerView.vue — Simplify hex input styles**

Find and remove (around L737-742):
```css
/* REMOVE THIS */
.contrast-hex-input {
  font-family: ui-monospace, 'SF Mono', 'Menlo', 'Monaco', monospace;
  flex: 1;
}
```

The monospace font should be added as a utility class in global.css if needed across multiple tools.

**Step 3: UrlParserView.vue — Keep wrapper, remove input override**

Find and remove (around L297-300):
```css
/* REMOVE THIS */
.gi-input-wrapper .gi-input {
  padding-right: 2.5rem;
}
```

Keep the wrapper flex layout, but the input should inherit standard padding. If the clear button overlaps, adjust wrapper padding instead:
```css
.gi-input-wrapper {
  padding-right: 2.5rem; /* Move padding to wrapper, not input */
}
```

**Step 4: TypeScaleView.vue — Remove input override**

Find and remove (around L435-438):
```css
/* REMOVE THIS */
.ts-field-with-slider .gi-input {
  width: 100%;
  min-height: 44px;
}
```

These properties are now in the global `.gi-input` base styles.

**Step 5: BarcodeView.vue — Update validation states**

Update validation state styles to work with new clean focus state:
```css
.gi-input-success {
  border-color: var(--gi-brand);
}

.gi-input-success:focus {
  border-color: var(--gi-brand);
  box-shadow: none;
}

.gi-input-error {
  border-color: var(--gi-error);
}

.gi-input-error:focus {
  border-color: var(--gi-error);
  box-shadow: none;
}
```

**Step 6: Commit each file**
```bash
git add src/views/PxToRemView.vue
git commit -m "style: remove redundant input overrides in PxToRem"

git add src/views/ContrastCheckerView.vue
git commit -m "style: remove redundant input overrides in ContrastChecker"

git add src/views/UrlParserView.vue
git commit -m "style: remove redundant input overrides in UrlParser"

git add src/views/TypeScaleView.vue
git commit -m "style: remove redundant input overrides in TypeScale"

git add src/views/BarcodeView.vue
git commit -m "style: update validation states to match new input style"
```

---

### Task 3: Update GiInput Component (Optional Enhancement)

**Files:**
- Create: `src/components/GiInput.vue` (optional, for future use)

**Purpose:** Create a standalone input component that can be used with or without GiFormField, supporting the action button pattern (like Redirect Checker).

**This task is OPTIONAL and can be done later if needed.**

---

### Task 4: Verify Build and Tests

**Step 1: Run build**
```bash
npm run build
```
Expected: No type errors, build succeeds.

**Step 2: Run tests**
```bash
npm test
```
Expected: All tests pass (may need to update GiFormField tests if focus behavior changed).

**Step 3: Preview locally**
```bash
npm run preview
```
Navigate to various tool pages to verify visual appearance.

**Step 4: Commit if needed**
```bash
git add .
git commit -m "fix: address any build/test issues from input standardization"
```

---

### Task 5: Manual Visual Testing

**Step 1: Start dev server**
```bash
npm run dev
```

**Step 2: Test the following pages in browser:**

| Tool | URL Hash | What to Check |
|------|----------|---------------|
| Redirect Checker | `#/redirect-checker` | Baseline — should look unchanged |
| UTM Builder | `#/utm-builder` | All input fields match Redirect Checker style |
| Contrast Checker | `#/contrast-checker` | Hex inputs should match, monospace font preserved |
| Color Converter | `#/color-converter` | HEX/RGB/HSL inputs should match |
| Paper Weight | `#/paper-weight` | Numeric inputs should match |
| Px to Rem | `#/px-to-rem` | Base size and value inputs should match |
| URL Parser | `#/url-parser` | URL input with clear button should work |
| Barcode | `#/barcode` | Validation states (success/error) should be visible |
| Word Counter | `#/word-counter` | Textarea should match new style |
| Promo Code | `#/promo-code` | Monospace, uppercase styling preserved |

**For each tool, verify:**
1. Input fields have consistent border radius (`var(--gi-radius-lg)`)
2. Focus state shows green border (no box-shadow)
3. Placeholder text is muted color
4. Disabled inputs have reduced opacity
5. Text and number inputs are 44px minimum height
6. Padding is consistent (`0.6rem 1rem`)

**Step 3: Test in both light and dark mode**

Toggle the theme and verify:
- Border colors are visible in dark mode
- Focus ring is visible in dark mode
- Text contrast is sufficient
- Background colors are appropriate

**Step 4: Document findings**
Create `visual-tests/input-standardization-report.md` with screenshots of:
- One tool in light mode
- One tool in dark mode
- Focus state example
- Validation state example (Barcode)

---

## Acceptance Criteria

✅ All input fields use consistent `.gi-input` class
✅ No view file overrides `.gi-input` with custom padding, border-radius, or focus styles
✅ Focus state is clean (green border, no box-shadow)
✅ All inputs are minimum 44px tall (touch target)
✅ Build succeeds with no errors
✅ All existing tests pass
✅ Visual appearance matches Redirect Checker input style
✅ Dark mode is properly supported

---

## Risk Assessment

**Low Risk:**
- Most views already use `.gi-input` class, so styling changes will apply automatically
- GiFormField component is well-tested

**Medium Risk:**
- Some views rely on custom input styling (PxToRem transparent inputs, Color Converter inline styles)
- May need to preserve some view-specific styling as utility classes

**Mitigation:**
- Manual visual testing will catch any regressions
- Can preserve special cases (monospace for PromoCode, color swatches for ContrastChecker) as semantic wrapper classes

---

## Files Modified Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `src/components/GiFormField.vue` | **Modify** | Update `.gi-input` base styles |
| `src/views/PxToRemView.vue` | **Modify** | Remove input overrides |
| `src/views/ContrastCheckerView.vue` | **Modify** | Remove input overrides |
| `src/views/UrlParserView.vue` | **Modify** | Remove input overrides |
| `src/views/TypeScaleView.vue` | **Modify** | Remove input overrides |
| `src/views/BarcodeView.vue` | **Modify** | Update validation state styles |
| `src/views/HomeView.vue` | **Modify** | Remove search input overrides (if any) |
| `visual-tests/input-standardization-report.md` | **Create** | Visual testing documentation |

---

## Future Enhancements (Not in Scope)

1. **Input+Button pattern:** Create a reusable `<GiInputGroup>` component for patterns like Redirect Checker's URL input + action button
2. **Range slider standardization:** Convert `<input type="range" class="gi-input">` to `<input type="range" class="gi-slider">` across all image tools
3. **Monospace utility class:** Add `.gi-font-mono` to global.css for PromoCode, hex inputs, etc.
4. **Validation states:** Add built-in error/warning/success variants to GiFormField
