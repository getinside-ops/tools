# Type Scale Typography & Visualization Implementation Plan

> **For Qwen Code:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Add font family/weight/line-height controls and visual scale bars to Type Scale Generator.
**Architecture:** All changes in TypeScaleView.vue (no composable modifications). Add state refs, update preview section, add visualization component, extend CSS output.
**Tech Stack:** Vue 3 Composition API, TypeScript, Vue I18n, Lucide Vue Next icons

---

## Task 1: Add i18n Translations for New Controls

**Files:**
- Modify: `src/i18n/fr.ts:531-580` (add ~15 keys to typeScale section)
- Modify: `src/i18n/en.ts:533-582` (add ~15 keys to typeScale section)

**Step 1: Add French translations**

Add to `typeScale` object in `fr.ts`:
```typescript
fontFamily: 'Police',
fontWeight: 'Graisse',
lineHeight: 'Interligne',
fonts: {
  systemUI: 'System UI',
  inter: 'Inter',
  georgia: 'Georgia',
  arial: 'Arial',
  helvetica: 'Helvetica',
  verdana: 'Verdana',
  times: 'Times New Roman',
  courier: 'Courier New',
},
weights: {
  light: 'Léger (300)',
  regular: 'Normal (400)',
  medium: 'Moyen (500)',
  semibold: 'Demi-gras (600)',
  bold: 'Gras (700)',
},
visualization: 'Visualisation de l\'échelle',
visualizationSubtitle: 'Tailles relatives de chaque niveau',
```

**Step 2: Add English translations**

Add to `typeScale` object in `en.ts`:
```typescript
fontFamily: 'Font Family',
fontWeight: 'Font Weight',
lineHeight: 'Line Height',
fonts: {
  systemUI: 'System UI',
  inter: 'Inter',
  georgia: 'Georgia',
  arial: 'Arial',
  helvetica: 'Helvetica',
  verdana: 'Verdana',
  times: 'Times New Roman',
  courier: 'Courier New',
},
weights: {
  light: 'Light (300)',
  regular: 'Regular (400)',
  medium: 'Medium (500)',
  semibold: 'Semi-bold (600)',
  bold: 'Bold (700)',
},
visualization: 'Scale Visualization',
visualizationSubtitle: 'Relative sizes for each scale step',
```

**Step 3: Commit**
```bash
git add src/i18n/fr.ts src/i18n/en.ts
git commit -m "feat: add i18n translations for font controls and visualization"
```

---

## Task 2: Add Font Controls to TypeScaleView

**Files:**
- Modify: `src/views/TypeScaleView.vue:1-90` (add controls section)
- Test: Manual browser testing

**Step 1: Add state refs in script setup**

Add after existing refs:
```typescript
const fontFamily = ref('system-ui')
const fontWeight = ref(400)
const lineHeight = ref(1.5)

// Font family options with CSS values
const FONT_FAMILIES = {
  systemUI: 'system-ui, -apple-system, sans-serif',
  inter: 'Inter, system-ui, sans-serif',
  georgia: 'Georgia, serif',
  arial: 'Arial, sans-serif',
  helvetica: 'Helvetica, sans-serif',
  verdana: 'Verdana, sans-serif',
  times: '"Times New Roman", serif',
  courier: '"Courier New", monospace',
} as const
```

**Step 2: Add font controls HTML**

Add new control row after existing ratio/steps controls:
```vue
<div class="ts-control-row ts-control-row--fonts">
  <GiFormField :label="t('typeScale.fontFamily')">
    <template #input>
      <select v-model="fontFamily" class="gi-select">
        <option v-for="(value, key) in FONT_FAMILIES" :key="key" :value="value">
          {{ t(`typeScale.fonts.${key}`) }}
        </option>
      </select>
    </template>
  </GiFormField>

  <GiFormField :label="t('typeScale.fontWeight')">
    <template #input>
      <select v-model.number="fontWeight" class="gi-select">
        <option :value="300">{{ t('typeScale.weights.light') }}</option>
        <option :value="400">{{ t('typeScale.weights.regular') }}</option>
        <option :value="500">{{ t('typeScale.weights.medium') }}</option>
        <option :value="600">{{ t('typeScale.weights.semibold') }}</option>
        <option :value="700">{{ t('typeScale.weights.bold') }}</option>
      </select>
    </template>
  </GiFormField>

  <GiFormField :label="t('typeScale.lineHeight')">
    <template #input>
      <div class="ts-field-with-slider">
        <input
          v-model.number="lineHeight"
          type="number"
          class="gi-input"
          min="1.0"
          max="2.0"
          step="0.1"
          @blur="lineHeight = clampNumber(lineHeight, 1.0, 2.0)"
        />
        <input
          v-model.number="lineHeight"
          type="range"
          class="ts-slider"
          min="1.0"
          max="2.0"
          step="0.1"
          :aria-label="t('typeScale.lineHeight')"
        />
      </div>
    </template>
  </GiFormField>
</div>
```

**Step 3: Add CSS for 3-column layout**

Add to styles:
```css
.ts-control-row--fonts {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr;
  gap: var(--gi-space-lg);
}

@media (max-width: 768px) {
  .ts-control-row--fonts {
    grid-template-columns: 1fr;
  }
}
```

**Step 4: Manual test**
- Run `npm run dev`
- Open http://localhost:5173/tools/#/type-scale
- Verify 3 new controls appear and work
- Commit:
```bash
git add src/views/TypeScaleView.vue
git commit -m "feat: add font family, weight, and line height controls"
```

---

## Task 3: Update Preview Section with Font Styles

**Files:**
- Modify: `src/views/TypeScaleView.vue:106-130` (preview section)

**Step 1: Update preview entries computed**

Modify `previewEntries` computed to include font styles:
```typescript
const previewEntries = computed(() => {
  const entries = scale.value
  const baseIndex = stepsDown.value

  const labels = [
    { offset: -6, key: 'display' },
    { offset: -4, key: 'heading1' },
    { offset: -2, key: 'heading2' },
    { offset: -1, key: 'heading3' },
    { offset: 0, key: 'body' },
    { offset: 1, key: 'caption' },
  ]

  return labels
    .map(({ offset, key }) => {
      const index = baseIndex + offset
      if (index >= 0 && index < entries.length) {
        return {
          ...entries[index],
          label: t(`typeScale.sampleText.${key}`),
        }
      }
      return null
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
})
```

**Step 2: Apply font styles to preview HTML**

Update visual preview section:
```vue
<div class="ts-visual-preview" :style="previewFontStyle">
  <div
    v-for="entry in previewEntries"
    :key="entry.step"
    class="ts-preview-item"
    :style="{ fontSize: entry.px + 'px' }"
  >
    <span class="ts-preview-label">{{ entry.label }}</span>
    <span class="ts-preview-value">{{ t('typeScale.sampleText.sample') }}</span>
  </div>
</div>
```

**Step 3: Add computed for preview font style**

Add to script:
```typescript
const previewFontStyle = computed(() => ({
  fontFamily: fontFamily.value,
  fontWeight: fontWeight.value,
  lineHeight: lineHeight.value,
}))
```

**Step 4: Manual test**
- Change font family → preview updates
- Change font weight → preview updates
- Change line height → preview updates
- Commit:
```bash
git add src/views/TypeScaleView.vue
git commit -m "feat: apply font styles to typography preview"
```

---

## Task 4: Add Scale Visualization Section

**Files:**
- Modify: `src/views/TypeScaleView.vue:130-150` (add visualization section)
- Test: Manual browser testing

**Step 1: Add visualization computed**

Add to script:
```typescript
const scaleVisualization = computed(() => {
  const entries = scale.value
  const maxSize = Math.max(...entries.map(e => e.px))
  
  return entries.map(entry => ({
    ...entry,
    percentage: (entry.px / maxSize) * 100,
    label: getStepLabel(entry.step),
  }))
})

function getStepLabel(step: number): string {
  if (step === 0) return t('typeScale.sampleText.body')
  if (step === 1) return t('typeScale.sampleText.caption')
  if (step === -1) return t('typeScale.sampleText.heading3')
  if (step === -2) return t('typeScale.sampleText.heading2')
  if (step === -4) return t('typeScale.sampleText.heading1')
  if (step === -6) return t('typeScale.sampleText.display')
  return `Step ${step > 0 ? '+' : ''}${step}`
}
```

**Step 2: Add visualization HTML section**

Add between visual preview and CSS output:
```vue
<GiResultCard :title="t('typeScale.visualization')" :subtitle="t('typeScale.visualizationSubtitle')">
  <div class="ts-scale-viz">
    <div
      v-for="entry in scaleVisualization"
      :key="entry.step"
      class="ts-scale-bar-row"
      :class="{ 'ts-scale-bar-row--base': entry.step === 0 }"
    >
      <div class="ts-scale-bar-label">
        <span class="ts-scale-bar-step" :class="{ 'ts-scale-bar-step--base': entry.step === 0 }">
          {{ entry.step }}
        </span>
        <span class="ts-scale-bar-name">{{ entry.label }}</span>
      </div>
      <div class="ts-scale-bar-container">
        <div
          class="ts-scale-bar"
          :class="{ 'ts-scale-bar--base': entry.step === 0 }"
          :style="{ width: entry.percentage + '%' }"
        >
          <span class="ts-scale-bar-value">{{ entry.px }}px</span>
        </div>
      </div>
    </div>
  </div>
</GiResultCard>
```

**Step 3: Add visualization CSS**

Add to styles:
```css
/* Scale Visualization */
.ts-scale-viz {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-sm);
  padding: var(--gi-space-md) 0;
}

.ts-scale-bar-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: var(--gi-space-md);
  align-items: center;
  padding: var(--gi-space-xs) 0;
}

.ts-scale-bar-row--base {
  padding: var(--gi-space-sm) 0;
}

.ts-scale-bar-label {
  display: flex;
  align-items: center;
  gap: var(--gi-space-xs);
}

.ts-scale-bar-step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: var(--gi-radius-pill);
  font-size: var(--gi-font-size-xs);
  font-weight: 600;
  color: var(--gi-text-muted);
  background: var(--gi-bg-soft);
}

.ts-scale-bar-step--base {
  color: var(--gi-surface);
  background: var(--gi-brand);
}

.ts-scale-bar-name {
  font-size: var(--gi-font-size-xs);
  color: var(--gi-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ts-scale-bar-container {
  height: 28px;
  background: var(--gi-bg-soft);
  border-radius: var(--gi-radius-md);
  overflow: hidden;
  display: flex;
  align-items: center;
}

.ts-scale-bar {
  height: 100%;
  background: var(--gi-border-soft);
  border-radius: var(--gi-radius-md);
  display: flex;
  align-items: center;
  padding-left: var(--gi-space-sm);
  transition: width var(--gi-transition-base) var(--gi-ease-out);
  min-width: 40px;
}

.ts-scale-bar--base {
  background: var(--gi-brand);
}

.ts-scale-bar-value {
  font-size: var(--gi-font-size-xs);
  font-weight: 600;
  color: var(--gi-text);
  white-space: nowrap;
}

.ts-scale-bar--base .ts-scale-bar-value {
  color: var(--gi-surface);
}

@media (max-width: 640px) {
  .ts-scale-bar-row {
    grid-template-columns: 1fr;
    gap: var(--gi-space-xs);
  }
  .ts-scale-bar-label {
    justify-content: flex-start;
  }
}
```

**Step 4: Manual test**
- Verify scale visualization appears
- Check bars resize when changing ratio/steps
- Verify base step highlighted in brand color
- Check mobile responsive
- Commit:
```bash
git add src/views/TypeScaleView.vue
git commit -m "feat: add visual scale bars showing relative sizes"
```

---

## Task 5: Update CSS Output to Include Font Properties

**Files:**
- Modify: `src/views/TypeScaleView.vue:180-200` (cssOutput computed)
- Test: Manual browser testing

**Step 1: Update cssOutput computed**

Modify to include font properties:
```typescript
const cssOutput = computed(() => {
  const lines = [':root {']
  lines.push(`  --font-family: ${fontFamily.value};`)
  lines.push(`  --font-weight: ${fontWeight.value};`)
  lines.push(`  --line-height: ${lineHeight.value};`)
  lines.push('')
  lines.push(`  --font-size-base: ${baseSize.value}px;`)
  lines.push(`  --font-scale-ratio: ${ratio.value};`)
  lines.push('')

  scale.value.forEach((s) => {
    const stepName = s.step === 0 ? 'base' : `step-${s.step}`
    lines.push(`  --font-size-${stepName}: ${s.px}px; /* ${s.rem}rem */`)
  })

  lines.push('}')
  return lines.join('\n')
})
```

**Step 2: Manual test**
- Verify CSS output includes font-family, weight, line-height
- Copy all CSS button includes all properties
- Commit:
```bash
git add src/views/TypeScaleView.vue
git commit -m "feat: include font properties in CSS output"
```

---

## Task 6: Final Verification & Commit

**Step 1: Run full test suite**
```bash
npm test
```
Expected: 241 tests passing, 0 failures

**Step 2: Build project**
```bash
npm run build
```
Expected: ✓ built in ~6s, no TypeScript errors

**Step 3: Manual smoke test**
- Open http://localhost:5173/tools/#/type-scale
- Test font family selector changes preview
- Test font weight selector changes preview
- Test line height slider changes preview
- Test scale visualization updates with ratio changes
- Verify CSS output includes all properties
- Test dark mode
- Test mobile responsive (narrow browser window)

**Step 4: Commit final verification**
```bash
git status
git log --oneline -5
```

**Step 5: Create worktree and push**
```bash
git worktree add .worktrees/improve-type-scale-ui -b improve/type-scale-ui
cd .worktrees/improve-type-scale-ui
git push origin improve/type-scale-ui
```

---

## Implementation Order

1. Task 1: i18n translations (5 min)
2. Task 2: Font controls (10 min)
3. Task 3: Update preview (5 min)
4. Task 4: Scale visualization (15 min)
5. Task 5: CSS output (5 min)
6. Task 6: Verification (10 min)

**Total estimated time:** 50 minutes

---

## Success Criteria

- [ ] 8 font family options in dropdown
- [ ] 5 font weight options (300-700)
- [ ] Line height slider (1.0-2.0)
- [ ] Preview updates with font/weight/line-height
- [ ] Scale visualization shows proportional bars
- [ ] Base step highlighted in brand color
- [ ] CSS output includes all font properties
- [ ] Responsive on mobile (3 controls stack)
- [ ] Dark mode compatible
- [ ] All i18n keys in FR and EN
- [ ] Build passes
- [ ] Tests pass (241 tests)
