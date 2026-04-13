# Barcode UX Improvements Implementation Plan

> **For Qwen Code:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Improve barcode tool UX with 15 fixes: critical i18n bugs, error handling, input enhancements, visual polish, and pedagogical content
**Architecture:** Update composable validators with i18n, enhance view with better feedback/UX patterns, add missing UI components, render pedagogical section
**Tech Stack:** Vue 3 Composition API, vue-i18n, TypeScript, CSS custom properties

---

## Phase 1: Critical Fixes (Tasks 1-3)

### Task 1: Move Hardcoded FR Errors to i18n in useBarcodeValidator.ts

**Files:**
- Modify: `src/composables/useBarcodeValidator.ts`
- Modify: `src/composables/__tests__/useBarcodeValidator.test.ts` (create if missing)
- Modify: `src/i18n/fr.ts` (add validation error keys)
- Modify: `src/i18n/en.ts` (add validation error keys)

**Current Issue:** Error messages like `'13 chiffres maximum'` are hardcoded in English/French in the composable, bypassing i18n.

**Step 1: Add i18n keys to fr.ts**

Add to `barcode` section in `src/i18n/fr.ts`:
```typescript
validation: {
  maxDigits: '13 chiffres maximum',
  requiredDigits: '13 chiffres requis',
  onlyDigits: 'Uniquement des chiffres autorisés',
},
```

**Step 2: Add i18n keys to en.ts**

Add to `barcode` section in `src/i18n/en.ts`:
```typescript
validation: {
  maxDigits: '13 digits maximum',
  requiredDigits: '13 digits required',
  onlyDigits: 'Only digits allowed',
},
```

**Step 3: Update composable to return error codes instead of messages**

Change `useBarcodeValidator.ts` to return error codes:
```typescript
export interface BarcodeValidationState {
  isValid: boolean
  errorCode: string | null  // Changed from error: string | null
  isCalculating: boolean
  checksum: number | null
  checksumValid: boolean
  country: string | null
  countryCode: string | null
  formatted: string
}
```

Update validate function to set `errorCode` instead of `error`:
```typescript
// Instead of:
error: '13 chiffres maximum',
// Use:
errorCode: 'maxDigits',
```

**Step 4: Update BarcodeView.vue to translate error codes**

Add computed property:
```typescript
const errorMessage = computed(() => {
  if (!validationState.value.errorCode) return null
  return t(`barcode.validation.${validationState.value.errorCode}`)
})
```

Update template to use `errorMessage` instead of `validationState.error`.

**Step 5: Update tests**

Create/update `src/composables/__tests__/useBarcodeValidator.test.ts`:
```typescript
import { useBarcodeValidator } from '../useBarcodeValidator'

describe('useBarcodeValidator', () => {
  it('returns maxDigits error code for >13 digits', () => {
    const { state, validate } = useBarcodeValidator()
    validate('12345678901234')
    expect(state.value.errorCode).toBe('maxDigits')
    expect(state.value.isValid).toBe(false)
  })

  it('returns requiredDigits error code for <13 digits (not 12)', () => {
    const { state, validate } = useBarcodeValidator()
    validate('12345')
    expect(state.value.errorCode).toBe('requiredDigits')
  })

  it('returns null error for 12 digits (calculating checksum)', () => {
    const { state, validate } = useBarcodeValidator()
    validate('400638133393')
    expect(state.value.errorCode).toBeNull()
    expect(state.value.checksum).toBe(1)
  })
})
```

**Step 6: Run tests**
```bash
npm test -- src/composables/__tests__/useBarcodeValidator.test.ts
```
Expected: 3 tests passing

**Step 7: Commit**
```bash
git add src/composables/useBarcodeValidator.ts src/i18n/fr.ts src/i18n/en.ts
git commit -m "fix: move hardcoded validation errors to i18n system"
```

---

### Task 2: Add Error Display for Export Failures

**Files:**
- Modify: `src/views/BarcodeView.vue`
- Modify: `src/i18n/fr.ts` (add export error keys)
- Modify: `src/i18n/en.ts` (add export error keys)

**Current Issue:** Export errors are silently caught with only `console.error`, no user feedback.

**Step 1: Add error translations**

Add to both `fr.ts` and `en.ts` under `barcode`:
```typescript
// fr.ts
exportError: 'Échec de l\'exportation. Réessayez ou changez de format.',
exportProcessing: 'Traitement en cours...',

// en.ts
exportError: 'Export failed. Please try again or change format.',
exportProcessing: 'Processing...',
```

**Step 2: Add error state to component**

In BarcodeView.vue, add:
```typescript
const exportError = ref<string | null>(null)
```

**Step 3: Update downloadBarcode function**

Replace the catch block:
```typescript
catch (error) {
  console.error('Export failed:', error)
  exportError.value = t('barcode.exportError')
}
```

**Step 4: Display error in UI**

Add below the export actions buttons:
```vue
<div v-if="exportError" class="gi-text-error gi-export-error" role="alert">
  {{ exportError }}
</div>
```

Add CSS:
```css
.gi-export-error {
  margin-top: var(--gi-space-sm);
  font-size: var(--gi-font-size-xs);
}
```

**Step 5: Clear error on successful export**

At the start of `downloadBarcode`:
```typescript
exportError.value = null
```

**Step 6: Manual test**
```bash
npm run dev
```
Test export in browser, verify error displays on failure.

**Step 7: Commit**
```bash
git add src/views/BarcodeView.vue src/i18n/fr.ts src/i18n/en.ts
git commit -m "feat: display export error messages to users"
```

---

### Task 3: Fix Checksum Display Logic

**Files:**
- Modify: `src/views/BarcodeView.vue`

**Current Issue:** Shows green ✓ for 12-digit codes even though barcode is incomplete.

**Step 1: Update checksum display condition**

Change the checksum section in template:
```vue
<!-- Before: -->
<div v-if="validationState.checksum !== null" class="gi-hint">
  {{ t('barcode.checksum', { n: validationState.checksum }) }}
  <span v-if="validationState.checksumValid" class="gi-text-success"> ✓</span>
</div>

<!-- After: -->
<div v-if="fullCode.length === 13 && validationState.checksum !== null" class="gi-hint">
  {{ t('barcode.checksum', { n: validationState.checksum }) }}
  <span v-if="validationState.checksumValid" class="gi-text-success"> ✓</span>
  <span v-else class="gi-text-error"> ✗</span>
</div>
```

**Key Change:** Only show checksum when `fullCode.length === 13`, and show ✗ when checksum doesn't match.

**Step 2: Manual test**
- Enter 12 digits: no checksum display
- Enter 13 digits with correct checksum: shows ✓
- Enter 13 digits with wrong checksum: shows ✗

**Step 3: Commit**
```bash
git add src/views/BarcodeView.vue
git commit -m "fix: only show checksum validation for complete 13-digit codes"
```

---

## Phase 2: High Priority UX (Tasks 4-9)

### Task 4: Add Character Counter to Input

**Files:**
- Modify: `src/views/BarcodeView.vue`

**Step 1: Add counter below input**

Add after the input element:
```vue
<div class="gi-hint barcode-char-counter">
  {{ inputCode.length }}/13
</div>
```

**Step 2: Add CSS styling**

```css
.barcode-char-counter {
  text-align: right;
  font-weight: 500;
  color: var(--gi-text-muted);
  font-size: var(--gi-font-size-xs);
}
```

**Step 3: Commit**
```bash
git add src/views/BarcodeView.vue
git commit -m "feat: add character counter to barcode input"
```

---

### Task 5: Add Paste Button for Quick Clipboard Input

**Files:**
- Modify: `src/views/BarcodeView.vue`
- Modify: `src/i18n/fr.ts`
- Modify: `src/i18n/en.ts`

**Step 1: Add paste translations**

```typescript
// fr.ts
paste: 'Coller',
pasteSuccess: 'Code collé depuis le presse-papiers',
pasteError: 'Impossible d\'accéder au presse-papiers',

// en.ts
paste: 'Paste',
pasteSuccess: 'Code pasted from clipboard',
pasteError: 'Unable to access clipboard',
```

**Step 2: Add paste button next to input**

Wrap input in flex container with paste button:
```vue
<div class="barcode-input-group">
  <input
    id="barcode-input"
    ref="inputRef"
    v-model="inputCode"
    type="text"
    :placeholder="t('barcode.placeholder')"
    class="gi-input"
    maxlength="13"
    @input="handleInput"
  />
  <button
    class="gi-btn-ghost barcode-paste-btn"
    @click="handlePaste"
    :aria-label="t('barcode.paste')"
    :title="t('barcode.paste')"
  >
    <Clipboard :size="20" />
  </button>
</div>
```

**Step 3: Import Clipboard icon**

```typescript
import { Barcode, Loader2, Clipboard } from 'lucide-vue-next'
```

**Step 4: Add paste handler**

```typescript
async function handlePaste() {
  try {
    const text = await navigator.clipboard.readText()
    const digits = text.replace(/\D/g, '').slice(0, 13)
    if (digits) {
      inputCode.value = digits
      validate(digits)
    }
  } catch {
    // Fallback: focus input for manual paste
    inputRef.value?.focus()
  }
}
```

**Step 5: Add CSS**

```css
.barcode-input-group {
  display: flex;
  gap: var(--gi-space-xs);
  align-items: center;
}

.barcode-input-group .gi-input {
  flex: 1;
}

.barcode-paste-btn {
  padding: var(--gi-space-sm);
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
```

**Step 6: Commit**
```bash
git add src/views/BarcodeView.vue src/i18n/fr.ts src/i18n/en.ts
git commit -m "feat: add paste button for quick clipboard input"
```

---

### Task 6: Fix Format Selector Labels for Mobile

**Files:**
- Modify: `src/views/BarcodeView.vue`
- Modify: `src/i18n/fr.ts`
- Modify: `src/i18n/en.ts`

**Current Issue:** "SVG (vectoriel)" text wraps poorly on narrow screens.

**Step 1: Add short format labels to i18n**

```typescript
// fr.ts
formatShort: {
  svg: 'SVG',
  png: 'PNG',
  jpg: 'JPG',
},

// en.ts
formatShort: {
  svg: 'SVG',
  png: 'PNG',
  jpg: 'JPG',
},
```

**Step 2: Update format selector buttons**

```vue
<button
  class="gi-btn-ghost barcode-format-btn"
  :class="{ 'is-active': settings.exportFormat === 'svg' }"
  @click="setExportFormat('svg')"
>
  <FileText :size="16" class="barcode-format-icon" />
  <span class="barcode-format-label">{{ t('barcode.formatShort.svg') }}</span>
</button>
```

Import `FileText` from lucide-vue-next.

**Step 3: Add CSS for responsive labels**

```css
.barcode-format-selector {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.barcode-format-btn {
  gap: var(--gi-space-xs);
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.barcode-format-icon {
  flex-shrink: 0;
}

.barcode-format-label {
  font-weight: 500;
}
```

**Step 4: Commit**
```bash
git add src/views/BarcodeView.vue src/i18n/fr.ts src/i18n/en.ts
git commit -m "fix: add icons to format selector for better mobile UX"
```

---

### Task 7: Add Visual Fill to Sliders

**Files:**
- Modify: `src/views/BarcodeView.vue` (add CSS only)

**Current Issue:** Sliders show no progress indication.

**Step 1: Add CSS for slider track fill**

```css
/* Width slider fill */
.gi-slider[type="range"] {
  background: linear-gradient(
    to right,
    var(--gi-brand) 0%,
    var(--gi-brand) calc((var(--slider-value) - var(--slider-min)) / (var(--slider-max) - var(--slider-min)) * 100%),
    var(--gi-border) calc((var(--slider-value) - var(--slider-min)) / (var(--slider-max) - var(--slider-min)) * 100%),
    var(--gi-border) 100%
  );
}
```

**Alternative simpler approach using inline style:**

Update slider elements to have dynamic background:
```vue
<input
  type="range"
  min="100"
  max="400"
  step="10"
  :value="settings.width"
  class="gi-slider"
  :style="{
    background: `linear-gradient(to right, var(--gi-brand) ${((settings.width - 100) / 300) * 100}%, var(--gi-border) ${((settings.width - 100) / 300) * 100}%)`
  }"
  @input="(e) => setDimensions({ width: Number((e.target as HTMLInputElement).value), height: settings.height })"
/>
```

**Step 2: Apply same pattern to height slider**

```vue
:style="{
  background: `linear-gradient(to right, var(--gi-brand) ${((settings.height - 30) / 50) * 100}%, var(--gi-border) ${((settings.height - 30) / 50) * 100}%)`
}"
```

**Step 3: Manual test**
Verify sliders show green fill proportional to value.

**Step 4: Commit**
```bash
git add src/views/BarcodeView.vue
git commit -m "feat: add visual fill to width and height sliders"
```

---

### Task 8: Make Reset Button More Prominent

**Files:**
- Modify: `src/views/BarcodeView.vue`

**Current Issue:** Reset button is buried at bottom of customization panel.

**Step 1: Move reset button to top-right of customization section**

Restructure customization panel:
```vue
<div class="barcode-customization">
  <div class="barcode-customization-header">
    <h3 class="barcode-section-title">{{ t('barcode.customize') }}</h3>
    <button class="gi-btn-ghost gi-btn-sm barcode-reset-btn" @click="reset" :title="t('barcode.reset')">
      <RotateCcw :size="16" />
    </button>
  </div>
  
  <!-- rest of customization controls -->
</div>
```

**Step 2: Import RotateCcw icon**

```typescript
import { Barcode, Loader2, Clipboard, RotateCcw } from 'lucide-vue-next'
```

**Step 3: Add CSS**

```css
.barcode-customization-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--gi-space-sm);
  border-bottom: 1px solid var(--gi-border);
}

.barcode-section-title {
  font-size: var(--gi-font-size-sm);
  font-weight: 600;
  color: var(--gi-text);
  margin: 0;
}

.barcode-reset-btn {
  min-width: 44px;
  min-height: 44px;
  cursor: pointer;
}
```

**Step 4: Remove old reset button**

Delete the reset button at the bottom of the customization panel.

**Step 5: Commit**
```bash
git add src/views/BarcodeView.vue
git commit -m "style: move reset button to prominent position in header"
```

---

### Task 9: Clarify Copy Button Label

**Files:**
- Modify: `src/views/BarcodeView.vue`
- Modify: `src/i18n/fr.ts`
- Modify: `src/i18n/en.ts`

**Current Issue:** "Copy Code" is ambiguous - doesn't clarify it copies the number.

**Step 1: Update translations**

```typescript
// fr.ts
copyNumber: 'Copier le numéro',

// en.ts
copyNumber: 'Copy number',
```

**Step 2: Update button text**

```vue
<button class="gi-btn-ghost" @click="copyCode">
  <Copy :size="16" />
  {{ copied ? t('barcode.copied') : t('barcode.copyNumber') }}
</button>
```

Import `Copy` from lucide-vue-next.

**Step 3: Commit**
```bash
git add src/views/BarcodeView.vue src/i18n/fr.ts src/i18n/en.ts
git commit -m "fix: clarify copy button copies barcode number"
```

---

## Phase 3: Medium Priority Polish (Tasks 10-14)

### Task 10: De-emphasize Country Info

**Files:**
- Modify: `src/views/BarcodeView.vue`

**Current Issue:** Country info has same visual weight as validation errors.

**Step 1: Wrap country info in muted styling**

```vue
<div v-if="validationState.country" class="gi-hint gi-country-info">
  <Globe :size="14" class="gi-country-icon" />
  <span>{{ t('barcode.country', { country: validationState.country, code: validationState.countryCode }) }}</span>
</div>
```

Import `Globe` from lucide-vue-next.

**Step 2: Add CSS**

```css
.gi-country-info {
  display: inline-flex;
  align-items: center;
  gap: var(--gi-space-xs);
  font-size: var(--gi-font-size-xs);
  color: var(--gi-text-muted);
  margin-top: var(--gi-space-xs);
}

.gi-country-icon {
  opacity: 0.6;
}
```

**Step 3: Commit**
```bash
git add src/views/BarcodeView.vue
git commit -m "style: de-emphasize country info with muted styling"
```

---

### Task 11: Make Size Presets Proportional

**Files:**
- Modify: `src/views/BarcodeView.vue`

**Current Issue:** Size presets only change width, not height.

**Step 1: Update size preset buttons**

```vue
<button
  class="gi-btn-ghost gi-btn-sm"
  :class="{ 'is-active': settings.width === 100 }"
  @click="setDimensions({ width: 100, height: 25 })"
>
  {{ t('barcode.size.small') }}
</button>
<button
  class="gi-btn-ghost gi-btn-sm"
  :class="{ 'is-active': settings.width === 200 && settings.height === 50 }"
  @click="setDimensions({ width: 200, height: 50 })"
>
  {{ t('barcode.size.medium') }}
</button>
<button
  class="gi-btn-ghost gi-btn-sm"
  :class="{ 'is-active': settings.width === 400 }"
  @click="setDimensions({ width: 400, height: 100 })"
>
  {{ t('barcode.size.large') }}
</button>
```

**Step 2: Update default height in customization composable**

Change DEFAULT_SETTINGS height from 50 to match the medium preset:
```typescript
const DEFAULT_SETTINGS: BarcodeSettings = {
  barColor: '#000000',
  width: 200,
  height: 50,  // Already correct
  // ...
}
```

**Step 3: Manual test**
Click each size preset, verify both width and height change proportionally.

**Step 4: Commit**
```bash
git add src/views/BarcodeView.vue
git commit -m "feat: make size presets proportional (width + height)"
```

---

### Task 12: Add Random Barcode Generator

**Files:**
- Modify: `src/views/BarcodeView.vue`
- Modify: `src/composables/useBarcode.ts`
- Modify: `src/i18n/fr.ts`
- Modify: `src/i18n/en.ts`

**Step 1: Add random barcode generator function**

In `useBarcode.ts`:
```typescript
export function generateRandomEan13(): string {
  const digits = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10))
  const checksum = calculateEanChecksum(digits.join(''))
  return digits.join('') + checksum
}
```

**Step 2: Add translations**

```typescript
// fr.ts
generateRandom: 'Générer un code aléatoire',

// en.ts
generateRandom: 'Generate random code',
```

**Step 3: Add button to view**

Below the input field:
```vue
<button class="gi-btn-ghost gi-btn-sm barcode-random-btn" @click="generateRandom">
  <Shuffle :size="16" />
  {{ t('barcode.generateRandom') }}
</button>
```

Import `Shuffle` from lucide-vue-next.

**Step 4: Add handler**

```typescript
import { generateEanBinary, generateRandomEan13 } from '../composables/useBarcode'

function generateRandom() {
  const randomCode = generateRandomEan13()
  inputCode.value = randomCode.slice(0, 12)
  validate(inputCode.value)
}
```

**Step 5: Add CSS**

```css
.barcode-random-btn {
  margin-top: var(--gi-space-xs);
  gap: var(--gi-space-xs);
  min-height: 44px;
  cursor: pointer;
}
```

**Step 6: Commit**
```bash
git add src/composables/useBarcode.ts src/views/BarcodeView.vue src/i18n/fr.ts src/i18n/en.ts
git commit -m "feat: add random barcode generator button"
```

---

### Task 13: Fix Dark Mode Preview

**Files:**
- Modify: `src/views/BarcodeView.vue`

**Current Issue:** Dark barcodes invisible on dark backgrounds.

**Step 1: Force white background for preview in dark mode**

Update preview area CSS:
```css
.barcode-preview {
  padding: var(--gi-space-md);
  border-radius: var(--gi-radius-md);
  border: 1px solid var(--gi-border);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  /* Force white background for accurate barcode preview */
  background: white !important;
}

[data-theme='dark'] .barcode-preview {
  background: white !important;
  border-color: var(--gi-border);
}
```

**Step 2: Remove dynamic background from preview div**

Change:
```vue
<!-- Before: -->
<div
  class="barcode-preview"
  :style="{ background: settings.transparentBackground ? 'transparent' : 'white' }"
>

<!-- After: -->
<div class="barcode-preview">
```

**Step 3: Handle transparent background for export only**

The `transparentBackground` setting should only affect PNG export, not preview display. This is already the case in the exporter.

**Step 4: Manual test**
Toggle dark mode, verify barcode remains visible on white background.

**Step 5: Commit**
```bash
git add src/views/BarcodeView.vue
git commit -m "fix: force white background for barcode preview in dark mode"
```

---

### Task 14: Render Pedagogical Content

**Files:**
- Modify: `src/views/BarcodeView.vue`

**Current Issue:** Pedagogical i18n keys exist but are never rendered.

**Step 1: Add pedagogical section**

Add at the bottom of the view, before the `#about` slot:
```vue
<div class="barcode-pedagogic">
  <h3 class="barcode-section-title">{{ t('barcode.pedagogic.title') }}</h3>
  <p class="gi-text-muted">{{ t('barcode.pedagogic.description') }}</p>
  <ul class="barcode-tips">
    <li v-for="(tip, idx) in t('barcode.pedagogic.tips', { returnObjects: true })" :key="idx">
      {{ tip }}
    </li>
  </ul>
</div>
```

**Step 2: Add CSS**

```css
.barcode-pedagogic {
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  padding: var(--gi-space-md);
  background: var(--gi-surface);
  margin-top: var(--gi-space-md);
}

.barcode-tips {
  margin: var(--gi-space-sm) 0 0;
  padding-left: var(--gi-space-md);
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-muted);
}

.barcode-tips li {
  margin-bottom: var(--gi-space-xs);
}
```

**Step 3: Manual test**
Verify pedagogical section renders with proper styling.

**Step 4: Commit**
```bash
git add src/views/BarcodeView.vue
git commit -m "feat: render pedagogical content about EAN barcodes"
```

---

### Task 15: Add i18n Translations Summary

This task is integrated into the tasks above where translations are added.

**Files updated across all tasks:**
- `src/i18n/fr.ts` - ~25 new keys
- `src/i18n/en.ts` - ~25 new keys

---

## Phase 4: Verification (Task 16)

### Task 16: Build and Test All Changes

**Step 1: Run full test suite**
```bash
npm test
```
Expected: All tests passing (255+ tests)

**Step 2: Build project**
```bash
npm run build
```
Expected: No TypeScript errors, clean build

**Step 3: Manual browser testing**

```bash
npm run dev
```

Test the following scenarios:

1. **Input validation:**
   - Type 12 digits: checksum appears, no error
   - Type 13 digits with correct checksum: green ✓
   - Type 13 digits with wrong checksum: red ✗
   - Type 14 digits: error message appears
   - Type letters: only digits accepted

2. **Character counter:**
   - Shows "0/13", "12/13", "13/13" correctly

3. **Paste button:**
   - Click paste with barcode in clipboard: fills input
   - Click paste with text in clipboard: extracts digits only

4. **Format selector:**
   - All three formats work (SVG, PNG, JPG)
   - Icons display properly
   - Mobile layout doesn't wrap awkwardly

5. **Slider fill:**
   - Width slider shows green fill
   - Height slider shows green fill
   - Fill percentage matches value position

6. **Reset button:**
   - Located in header of customization panel
   - Resets all settings to defaults
   - Icon displays properly

7. **Copy button:**
   - Label says "Copy number" not "Copy code"
   - Copies 13-digit number to clipboard

8. **Country info:**
   - Displays with muted styling
   - Globe icon visible
   - Less prominent than error messages

9. **Size presets:**
   - S sets 100x25
   - M sets 200x50
   - L sets 400x100

10. **Random generator:**
    - Generates valid 13-digit code
    - Checksum validates correctly
    - Country detected properly

11. **Dark mode:**
    - Preview area stays white
    - Barcode visible regardless of bar color
    - All UI elements adapt to dark theme

12. **Pedagogical content:**
    - Displays at bottom of page
    - Proper styling with muted text
    - Tips list renders correctly

13. **Export error handling:**
    - Simulate error (temporarily break export function)
    - Verify error message displays to user
    - Verify error clears on successful export

**Step 4: Visual regression screenshots**

Take screenshots in both light and dark mode:
- Homepage showing barcode tool card
- Barcode tool full page light mode
- Barcode tool full page dark mode
- Barcode tool mobile view (< 640px)

Save to project root:
- `barcode-ux-light.png`
- `barcode-ux-dark.png`
- `barcode-ux-mobile.png`

**Step 5: Final commit**
```bash
git status
git add .
git commit -m "chore: verify all barcode UX improvements working"
```

---

## Summary

**Total Tasks:** 16 (4 phases)
**Estimated Commits:** 14+ focused commits
**Files Modified:** 6 files
- `src/composables/useBarcodeValidator.ts` - Error code system
- `src/composables/useBarcode.ts` - Random generator
- `src/views/BarcodeView.vue` - All UI improvements
- `src/i18n/fr.ts` - French translations
- `src/i18n/en.ts` - English translations
- `src/composables/__tests__/useBarcodeValidator.test.ts` - New test file

**Testing:** 255+ existing tests + 3 new validator tests + 13 manual test scenarios

**Key Patterns Used:**
- i18n for all user-facing text
- Lucide icons for visual clarity
- CSS custom properties for theming
- Composable pattern for pure logic
- TDD for validator changes
- Frequent focused commits
