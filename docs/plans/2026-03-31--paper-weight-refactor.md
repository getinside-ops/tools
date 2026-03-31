# Paper Weight Refactor for Advertisers

**Date:** 2026-03-31  
**Tool:** Paper Weight Calculator  
**Target:** Large-scale flyering campaigns (5k - 1000k units)

---

## Overview

Refactor the Paper Weight tool to serve advertisers running large-scale flyering campaigns. The tool currently targets small-to-medium print jobs (100-5000 units) and needs to accommodate campaigns between 5 000 and 1 000 000 units.

---

## Design Decisions

### 1. Quantity Input System

**Three-tier input approach:**

#### A. Quick Preset Chips
- **Values:** 10k, 25k, 50k, 100k, 500k, 1M
- **Notation:** Use "k" and "M" suffix (10k, 100k, 1M) for readability
- **Behavior:** Click to set exact value

#### B. Dual-Mode Slider
- **Range:** 5 000 to 1 000 000
- **Mode 1 (Fine):** 5k-50k range with 1k increments
- **Mode 2 (Quick):** 50k-1M range with 25k increments
- **Toggle:** Switch between modes via button
- **Visual:** Show current value above slider thumb

#### C. Custom Input Field
- **Range:** 1 to 10 000 000+
- **Type:** Number input with thousand separators
- **Validation:** Min 1, max 10M (soft limit, can exceed)
- **Placeholder:** "Montant personnalisé..."

**Default quantity:** 50 000

---

### 2. Format Additions

**Primary formats (highlighted):**
- **A6:** 105 × 148 mm (keep)
- **A5:** 148 × 210 mm (keep)

**Additional mainstream formats:**
- **DL:** 110 × 220 mm (new - standard envelope/flyer)
- **A4:** 210 × 297 mm (new - large flyer format)

**Existing formats:**
- **Carte:** 105 × 148 mm (keep)
- **Custom:** (keep)

**UI:** Visual distinction between primary (A5, A6) and secondary formats using border weight or background tint.

---

### 3. Remove Real-World Comparisons

**Action:** Remove the comparison section ("≈ un petit colis", "un sac de farine", etc.)

**Rationale:** B2B users prefer raw metrics over consumer analogies.

---

### 4. Result Display Enhancements

**Primary metrics (equal prominence):**

#### A. Total Weight
- **Display:** Auto-scale between kg and tonnes
  - < 1000 kg: Show kg (e.g., "850 kg")
  - ≥ 1000 kg: Show tonnes with 2 decimals (e.g., "1.25 tonnes")
- **Secondary:** Always show grams below (e.g., "1 250 000 g")

#### B. Weight Per 1000 Units
- **Purpose:** Logistics planning, pallet calculations
- **Display:** "Poids pour 1000 exemplaires: XX kg"
- **Calculation:** (total_kg / quantity) × 1000

**Additional info:**
- Total sheets: Display quantity with thousand separators
- Formula: Keep existing formula display

---

### 5. UI/UX Improvements

#### Visual Hierarchy
1. **Quantity section** - Most important, top of page
2. **Format section** - Second priority
3. **Grammage section** - Third
4. **Result panel** - Large, prominent, sticky on desktop

#### Slider Design
- **Track:** Thick (8px), brand color gradient
- **Thumb:** Large (24px), draggable, shows value on hover
- **Mode toggle:** Small button below slider: "Précis" ↔ "Rapide"
- **Animation:** Smooth value updates, no jank

#### Quantity Chips
- **Size:** Larger than current (padding: 0.75rem 1.25rem)
- **Typography:** Bold, 0.9rem
- **Active state:** Strong brand background with shadow
- **Hover:** Subtle lift + border highlight

#### Professional Aesthetic
- Cleaner, more corporate look
- Reduced decorative elements
- Emphasis on readability and quick scanning
- Dark mode fully supported

---

## Technical Implementation

### Files to Modify

1. **`src/composables/usePaperWeight.ts`**
   - No changes to `calculatePaperWeight` function (pure logic works)
   - Add `FORMATS` constants for DL and A4
   - Export quantity presets array

2. **`src/views/PaperWeightView.vue`**
   - Add slider component with dual-mode logic
   - Update `POPULAR_QUANTITIES` to [10000, 25000, 50000, 100000, 500000, 1000000]
   - Change default quantity to 50000
   - Add format cards for DL and A4
   - Remove comparison section
   - Update result display to show tonnes and weight per 1000 units
   - Add slider mode toggle

3. **`src/i18n/fr.ts`**
   - Add new translation keys:
     - `paperWeight.quantitySlider` - "Ajuster la quantité"
     - `paperWeight.sliderModePrecise` - "Précis"
     - `paperWeight.sliderModeFast` - "Rapide"
     - `paperWeight.weightPerThousand` - "Poids pour 1000 ex."
     - `paperWeight.totalSheets` - "Nombre total d'exemplaires"
     - `paperWeight.formats.DL` - "DL"
     - `paperWeight.formats.A4` - "A4"
   - Update `popularQuantities` label if needed

4. **`src/i18n/en.ts`**
   - Mirror French additions

### New Components (Inline)

No new standalone components needed. Slider will be implemented inline using native `<input type="range">` with custom styling.

---

## Testing Strategy

### Unit Tests (Vitest)

**File:** `src/composables/__tests__/usePaperWeight.test.ts`

**Tests to add:**
- [ ] DL format calculation
- [ ] A4 format calculation
- [ ] Large quantity calculation (1M units)
- [ ] Tonne conversion (>1000 kg)
- [ ] Weight per 1000 units calculation

### Manual Testing (Browser)

**Checklist:**
- [ ] Slider works in both modes (Precise/Fast)
- [ ] Quantity chips update slider and input
- [ ] Custom input updates slider and chips
- [ ] All formats calculate correctly
- [ ] Result shows tonnes for large values
- [ ] Weight per 1000 units is accurate
- [ ] Dark mode renders correctly
- [ ] Mobile responsive (slider usable on touch)
- [ ] Keyboard navigation works

### E2E Testing (Playwright)

**Workflow:**
1. Navigate to paper-weight tool
2. Test slider interaction (both modes)
3. Test quantity chip selection
4. Test format selection (DL, A4)
5. Verify result calculations
6. Test custom quantity input
7. Verify dark mode

---

## Accessibility

- [ ] Slider has `aria-label` and `aria-valuemin/max/now`
- [ ] Slider mode toggle has `aria-pressed`
- [ ] Quantity chips have `aria-pressed`
- [ ] Format cards have `aria-pressed`
- [ ] All interactive elements keyboard accessible
- [ ] Focus states visible in dark mode
- [ ] Color contrast meets WCAG AA

---

## Performance

- [ ] Slider updates are debounced (100ms) to prevent lag
- [ ] Computed values memoized (Vue `computed`)
- [ ] No unnecessary re-renders on slider drag
- [ ] Result panel uses `transition` for smooth updates

---

## Migration Notes

- No breaking changes to existing functionality
- A5 and A6 remain default/primary formats
- Existing custom format inputs unchanged
- Formula calculation logic unchanged

---

## Success Metrics

**Post-launch validation:**
- Advertisers can quickly set quantities between 5k-1M
- Slider provides intuitive control for both small and large campaigns
- Result display shows relevant B2B metrics (tonnes, weight/1000)
- No regression in existing functionality

---

## Implementation Order

1. Update composables (add formats, export constants)
2. Update translations (FR + EN)
3. Refactor view:
   - Add slider component
   - Update quantity chips
   - Add DL/A4 formats
   - Remove comparisons
   - Update result display
4. Write unit tests
5. Manual testing
6. Code review
7. Commit

---

## Appendix: Format Reference

| Format | Width (mm) | Height (mm) | Use Case |
|--------|------------|-------------|----------|
| A6 | 105 | 148 | Small flyers, postcards |
| A5 | 148 | 210 | Standard flyers |
| DL | 110 | 220 | Envelopes, long flyers |
| A4 | 210 | 297 | Large posters, brochures |
| Carte | 105 | 148 | Business cards |

---
