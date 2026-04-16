# Matte Generator UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Matte Generator into a clearer, more polished two-step workspace with guided format selection, richer styling guidance, and a stronger preview experience.

**Architecture:** Keep the matte rendering logic in `useMatteGenerator.ts` unchanged and build a thin presentation layer around it. Extract UI metadata for format presets, pattern descriptions, and summary labels into a dedicated helper module so the view stays readable and testable while i18n and layout changes remain localized to the view.

**Tech Stack:** Vue 3 Composition API, TypeScript, Vue I18n, Vitest, `@vue/test-utils`, existing shared `Gi*` components

---

## File Structure

### Existing files to modify

- `src/views/MatteGeneratorView.vue`
  - Restructure the page into the guided two-step layout, preview artboard, status handling, and mobile-friendly action area.
- `src/i18n/en.ts`
  - Add step labels, preset descriptions, helper copy, summary labels, swatch names, and status/error strings for the new UI.
- `src/i18n/fr.ts`
  - Mirror the new matte-generator translation keys in French.
- `src/composables/__tests__/useMatteGenerator.test.ts`
  - Keep existing rendering math coverage and add one regression assertion if the view refactor needs a new helper import path or a summary-specific utility from the rendering module.

### New files to create

- `src/composables/useMatteGeneratorConfig.ts`
  - Single responsibility: expose typed metadata for format preset cards, pattern card content, color swatches, summary generation, and initial step-state decisions.
- `src/composables/__tests__/useMatteGeneratorConfig.test.ts`
  - Covers preset ordering, target-size mapping, pattern metadata, and summary output.
- `src/views/__tests__/MatteGeneratorView.test.ts`
  - Covers the guided flow: empty state, stepper, format cards, auto-selected default, preview summary, and primary CTA state.

## Task 1: Extract Matte UI Metadata

**Files:**
- Create: `src/composables/useMatteGeneratorConfig.ts`
- Test: `src/composables/__tests__/useMatteGeneratorConfig.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import {
  MATTE_FORMAT_OPTIONS,
  MATTE_PATTERN_OPTIONS,
  MATTE_COLOR_SWATCHES,
  getMatteSummary,
  getTargetSizeByKey,
} from '../useMatteGeneratorConfig'

describe('useMatteGeneratorConfig', () => {
  it('exposes the expected preset order and target sizes', () => {
    expect(MATTE_FORMAT_OPTIONS.map((option) => option.key)).toEqual([
      'auto',
      'ig',
      'story',
      'twitter',
      'og',
    ])

    expect(getTargetSizeByKey('auto')).toBeNull()
    expect(getTargetSizeByKey('twitter')).toEqual({ w: 1500, h: 500 })
  })

  it('exposes user-facing pattern metadata', () => {
    expect(MATTE_PATTERN_OPTIONS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'none', labelKey: 'matteGenerator.patternCards.none.label' }),
        expect.objectContaining({ key: 'grid', descriptionKey: 'matteGenerator.patternCards.grid.description' }),
      ]),
    )
  })

  it('builds a compact preview summary payload', () => {
    expect(
      getMatteSummary({
        formatKey: 'story',
        padding: 64,
        color: '#191919',
        pattern: 'stripes',
      }),
    ).toEqual([
      { labelKey: 'matteGenerator.summary.format', valueKey: 'matteGenerator.sizes.story' },
      { labelKey: 'matteGenerator.summary.padding', value: '64px' },
      { labelKey: 'matteGenerator.summary.color', value: '#191919' },
      { labelKey: 'matteGenerator.summary.pattern', valueKey: 'matteGenerator.patternCards.stripes.label' },
    ])
  })

  it('provides editorial color swatches for fast selection', () => {
    expect(MATTE_COLOR_SWATCHES[0]).toEqual(
      expect.objectContaining({ value: '#191919', labelKey: 'matteGenerator.swatches.ink' }),
    )
    expect(MATTE_COLOR_SWATCHES.length).toBeGreaterThanOrEqual(4)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/composables/__tests__/useMatteGeneratorConfig.test.ts`
Expected: FAIL with `Failed to resolve import "../useMatteGeneratorConfig"` or missing export errors.

- [ ] **Step 3: Write minimal implementation**

```ts
export type MatteFormatKey = 'auto' | 'ig' | 'story' | 'twitter' | 'og'
export type MattePatternKey = 'none' | 'dots' | 'grid' | 'stripes'

export interface MatteFormatOption {
  key: MatteFormatKey
  labelKey: string
  hintKey: string
  sizeLabel: string
  ratio: string
}

export interface MattePatternOption {
  key: MattePatternKey
  labelKey: string
  descriptionKey: string
}

export interface MatteSummaryItem {
  labelKey: string
  value?: string
  valueKey?: string
}

const TARGETS: Record<MatteFormatKey, { w: number; h: number } | null> = {
  auto: null,
  ig: { w: 1080, h: 1080 },
  story: { w: 1080, h: 1920 },
  twitter: { w: 1500, h: 500 },
  og: { w: 1200, h: 630 },
}

export const MATTE_FORMAT_OPTIONS: MatteFormatOption[] = [
  { key: 'auto', labelKey: 'matteGenerator.sizes.auto', hintKey: 'matteGenerator.formatHints.auto', sizeLabel: 'Original ratio', ratio: '4 / 3' },
  { key: 'ig', labelKey: 'matteGenerator.sizes.ig', hintKey: 'matteGenerator.formatHints.ig', sizeLabel: '1080×1080', ratio: '1 / 1' },
  { key: 'story', labelKey: 'matteGenerator.sizes.story', hintKey: 'matteGenerator.formatHints.story', sizeLabel: '1080×1920', ratio: '9 / 16' },
  { key: 'twitter', labelKey: 'matteGenerator.sizes.twitter', hintKey: 'matteGenerator.formatHints.twitter', sizeLabel: '1500×500', ratio: '3 / 1' },
  { key: 'og', labelKey: 'matteGenerator.sizes.og', hintKey: 'matteGenerator.formatHints.og', sizeLabel: '1200×630', ratio: '1.91 / 1' },
]

export const MATTE_PATTERN_OPTIONS: MattePatternOption[] = [
  { key: 'none', labelKey: 'matteGenerator.patternCards.none.label', descriptionKey: 'matteGenerator.patternCards.none.description' },
  { key: 'grid', labelKey: 'matteGenerator.patternCards.grid.label', descriptionKey: 'matteGenerator.patternCards.grid.description' },
  { key: 'dots', labelKey: 'matteGenerator.patternCards.dots.label', descriptionKey: 'matteGenerator.patternCards.dots.description' },
  { key: 'stripes', labelKey: 'matteGenerator.patternCards.stripes.label', descriptionKey: 'matteGenerator.patternCards.stripes.description' },
]

export const MATTE_COLOR_SWATCHES = [
  { value: '#191919', labelKey: 'matteGenerator.swatches.ink' },
  { value: '#F4EFE6', labelKey: 'matteGenerator.swatches.paper' },
  { value: '#B6C7B2', labelKey: 'matteGenerator.swatches.sage' },
  { value: '#D9C2B0', labelKey: 'matteGenerator.swatches.clay' },
]

export function getTargetSizeByKey(key: MatteFormatKey) {
  return TARGETS[key]
}

export function getMatteSummary(input: {
  formatKey: MatteFormatKey
  padding: number
  color: string
  pattern: MattePatternKey
}): MatteSummaryItem[] {
  return [
    { labelKey: 'matteGenerator.summary.format', valueKey: `matteGenerator.sizes.${input.formatKey}` },
    { labelKey: 'matteGenerator.summary.padding', value: `${input.padding}px` },
    { labelKey: 'matteGenerator.summary.color', value: input.color.toUpperCase() },
    { labelKey: 'matteGenerator.summary.pattern', valueKey: `matteGenerator.patternCards.${input.pattern}.label` },
  ]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/composables/__tests__/useMatteGeneratorConfig.test.ts`
Expected: PASS with 4 tests passed.

- [ ] **Step 5: Commit**

```bash
git add src/composables/useMatteGeneratorConfig.ts src/composables/__tests__/useMatteGeneratorConfig.test.ts
git commit -m "feat: add matte generator UI config metadata"
```

## Task 2: Lock the Guided Flow in a View Test

**Files:**
- Create: `src/views/__tests__/MatteGeneratorView.test.ts`
- Modify: `src/views/MatteGeneratorView.vue`
- Modify: `src/i18n/en.ts`
- Modify: `src/i18n/fr.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createRouter, createMemoryHistory } from 'vue-router'
import MatteGeneratorView from '../MatteGeneratorView.vue'
import en from '../../i18n/en'
import fr from '../../i18n/fr'

const applyMatte = vi.fn(async () => 'data:image/png;base64,preview')

vi.mock('../../composables/useMatteGenerator', async () => {
  const actual = await vi.importActual<typeof import('../../composables/useMatteGenerator')>('../../composables/useMatteGenerator')
  return {
    ...actual,
    applyMatte,
  }
})

function mountView() {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: { en, fr },
  })

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>home</div>' } },
      { path: '/matte', component: MatteGeneratorView },
    ],
  })

  return mount(MatteGeneratorView, {
    global: {
      plugins: [i18n, router],
      stubs: {
        GiImageUpload: {
          template: '<button data-test="upload" @click="$emit(\'upload\', new File([\'x\'], \'sample.png\', { type: \'image/png\' }))">upload</button>',
        },
      },
    },
  })
}

describe('MatteGeneratorView', () => {
  beforeEach(() => {
    applyMatte.mockClear()
  })

  it('shows guided empty-state copy before upload', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('Choose a format')
    expect(wrapper.text()).toContain('Style the matte')
  })

  it('reveals the stepper, preset cards, summary, and export action after upload', async () => {
    const wrapper = mountView()
    await wrapper.get('[data-test=\"upload\"]').trigger('click')
    await Promise.resolve()

    expect(applyMatte).toHaveBeenCalled()
    expect(wrapper.text()).toContain('1. Format')
    expect(wrapper.text()).toContain('2. Style')
    expect(wrapper.text()).toContain('Instagram Post')
    expect(wrapper.text()).toContain('Generate & Download')
    expect(wrapper.text()).toContain('Format')
    expect(wrapper.text()).toContain('#191919')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/views/__tests__/MatteGeneratorView.test.ts`
Expected: FAIL because the current view has no stepper, no preset cards, and no guided empty state.

- [ ] **Step 3: Add the translation keys the test depends on**

```ts
matteGenerator: {
  ...existingKeys,
  workflowTitle: 'Build a cleaner frame in two quick steps',
  workflowDescription: 'Pick the destination first, then refine the matte styling.',
  steps: {
    format: 'Format',
    style: 'Style',
  },
  formatHints: {
    auto: 'Keep the original image ratio and add breathing room around it.',
    ig: 'Balanced square framing for Instagram feed posts.',
    story: 'Tall vertical frame for stories, reels covers, and mobile promos.',
    twitter: 'Wide banner framing for profile headers and announcements.',
    og: 'Landscape social share card for links and previews.',
  },
  summary: {
    format: 'Format',
    padding: 'Padding',
    color: 'Color',
    pattern: 'Pattern',
  },
  styleSections: {
    paddingTitle: 'Breathing room',
    paddingHint: 'Use padding to give the image more space without cropping it.',
    colorTitle: 'Background color',
    colorHint: 'Start from a curated swatch or type a custom hex value.',
    patternTitle: 'Background texture',
    patternHint: 'Keep it clean for product imagery, or add a subtle editorial surface.',
  },
  patternCards: {
    none: { label: 'Clean', description: 'Solid matte with no visible texture.' },
    grid: { label: 'Editorial Grid', description: 'Adds structure without competing with the image.' },
    dots: { label: 'Subtle Dots', description: 'Soft texture for lighter, playful framing.' },
    stripes: { label: 'Soft Stripes', description: 'Directional texture for wide and promotional crops.' },
  },
  swatches: {
    ink: 'Ink',
    paper: 'Paper',
    sage: 'Sage',
    clay: 'Clay',
  },
  preview: {
    title: 'Live preview',
    emptyTitle: 'Your framed export will appear here',
    emptyBody: 'Upload an image to compare formats, styling, and export details before downloading.',
    updating: 'Updating preview...',
  },
}
```

- [ ] **Step 4: Re-run the view test to keep it red for layout reasons only**

Run: `npm test -- --run src/views/__tests__/MatteGeneratorView.test.ts`
Expected: FAIL with assertions about missing step labels or missing preset content, but no i18n key warnings in the output.

- [ ] **Step 5: Commit**

```bash
git add src/views/__tests__/MatteGeneratorView.test.ts src/i18n/en.ts src/i18n/fr.ts
git commit -m "test: define guided matte generator flow"
```

## Task 3: Implement the Guided Two-Step Workspace

**Files:**
- Modify: `src/views/MatteGeneratorView.vue`
- Modify: `src/i18n/en.ts`
- Modify: `src/i18n/fr.ts`
- Modify: `src/composables/__tests__/useMatteGenerator.test.ts`

- [ ] **Step 1: Implement the new view state and computed helpers**

```ts
import { computed, ref, watch } from 'vue'
import {
  MATTE_COLOR_SWATCHES,
  MATTE_FORMAT_OPTIONS,
  MATTE_PATTERN_OPTIONS,
  getMatteSummary,
  getTargetSizeByKey,
  type MatteFormatKey,
  type MattePatternKey,
} from '../composables/useMatteGeneratorConfig'

const image = ref<string | null>(null)
const previewResult = ref<string | null>(null)
const error = ref<string | null>(null)
const isGenerating = ref(false)

const targetKey = ref<MatteFormatKey>('auto')
const padding = ref(50)
const color = ref('#191919')
const pattern = ref<MattePatternKey>('none')

const summaryItems = computed(() =>
  getMatteSummary({
    formatKey: targetKey.value,
    padding: padding.value,
    color: color.value,
    pattern: pattern.value,
  }),
)

watch([image, targetKey, padding, color, pattern], async () => {
  if (!image.value) {
    previewResult.value = null
    return
  }

  isGenerating.value = true
  error.value = null

  try {
    previewResult.value = await applyMatte(image.value, {
      padding: padding.value,
      color: color.value,
      pattern: pattern.value,
      targetSize: getTargetSizeByKey(targetKey.value),
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Preview generation failed'
  } finally {
    isGenerating.value = false
  }
}, { immediate: true })
```

- [ ] **Step 2: Replace the raw editor markup with the two-step workspace**

```vue
<div class="matte-workspace" :class="{ 'matte-workspace--active': image }">
  <section class="matte-preview-panel">
    <header class="matte-preview-panel__header">
      <div>
        <p class="matte-kicker">{{ t('matteGenerator.preview.title') }}</p>
        <h2 class="matte-preview-panel__title">{{ image ? t('matteGenerator.preview.title') : t('matteGenerator.preview.emptyTitle') }}</h2>
      </div>
      <div v-if="image" class="matte-summary" role="list">
        <div v-for="item in summaryItems" :key="item.labelKey" class="matte-summary__item" role="listitem">
          <span>{{ t(item.labelKey) }}</span>
          <strong>{{ item.valueKey ? t(item.valueKey) : item.value }}</strong>
        </div>
      </div>
    </header>

    <div class="matte-artboard">
      <img v-if="previewResult" :src="previewResult" alt="" class="matte-artboard__image" />
      <div v-else-if="isGenerating" class="matte-artboard__status">{{ t('matteGenerator.preview.updating') }}</div>
      <div v-else class="matte-artboard__empty">
        <p>{{ t('matteGenerator.preview.emptyBody') }}</p>
        <ol class="matte-empty-steps">
          <li>{{ t('matteGenerator.steps.format') }}</li>
          <li>{{ t('matteGenerator.steps.style') }}</li>
        </ol>
      </div>
    </div>
  </section>

  <section class="matte-controls-panel">
    <div class="matte-stepper">
      <div class="matte-stepper__item">
        <span class="matte-stepper__index">1.</span>
        <span>{{ t('matteGenerator.steps.format') }}</span>
      </div>
      <div class="matte-stepper__item">
        <span class="matte-stepper__index">2.</span>
        <span>{{ t('matteGenerator.steps.style') }}</span>
      </div>
    </div>

    <div class="matte-format-grid">
      <button
        v-for="option in MATTE_FORMAT_OPTIONS"
        :key="option.key"
        type="button"
        class="matte-format-card"
        :class="{ 'is-active': targetKey === option.key }"
        @click="targetKey = option.key"
      >
        <span class="matte-format-card__ratio" :style="{ aspectRatio: option.ratio }" />
        <strong>{{ t(option.labelKey) }}</strong>
        <span>{{ option.sizeLabel }}</span>
        <p>{{ t(option.hintKey) }}</p>
      </button>
    </div>

    <div class="matte-style-card">
      <GiFormField :label="t('matteGenerator.styleSections.paddingTitle')">
        <template #input>
          <input v-model.number="padding" class="gi-input" type="number" min="0" step="2" />
        </template>
      </GiFormField>
      <p class="matte-field-hint">{{ t('matteGenerator.styleSections.paddingHint') }}</p>
    </div>
  </section>
</div>
```

- [ ] **Step 3: Finish the style modules, actions, and reset behavior**

```vue
<div class="matte-style-card">
  <div class="matte-swatch-row" role="list">
    <button
      v-for="swatch in MATTE_COLOR_SWATCHES"
      :key="swatch.value"
      type="button"
      class="matte-swatch"
      :aria-label="t(swatch.labelKey)"
      :style="{ '--swatch-color': swatch.value }"
      :class="{ 'is-active': color.toLowerCase() === swatch.value.toLowerCase() }"
      @click="color = swatch.value"
    />
  </div>
  <div class="matte-color-inputs">
    <input v-model="color" type="color" class="matte-color-picker" />
    <input v-model="color" type="text" class="gi-input" />
  </div>
</div>

<div class="matte-pattern-grid">
  <button
    v-for="option in MATTE_PATTERN_OPTIONS"
    :key="option.key"
    type="button"
    class="matte-pattern-card"
    :class="{ 'is-active': pattern === option.key }"
    @click="pattern = option.key"
  >
    <strong>{{ t(option.labelKey) }}</strong>
    <p>{{ t(option.descriptionKey) }}</p>
  </button>
</div>

<GiStatusBadge v-if="error" variant="error" :showIcon="true">{{ error }}</GiStatusBadge>

<div class="matte-actions">
  <button @click="download" class="gi-btn matte-actions__primary" :disabled="!previewResult || isGenerating">
    {{ t('matteGenerator.apply') }}
  </button>
  <button @click="resetEditor" class="gi-btn-ghost matte-actions__secondary">
    {{ t('common.reset') }}
  </button>
</div>
```

- [ ] **Step 4: Add or update the regression test for rendering helpers**

```ts
it('keeps matte dimensions unchanged for auto mode when only padding is applied', () => {
  const result = getMatteDimensions(
    { w: 240, h: 160 },
    { padding: 40, color: '#191919', pattern: 'grid' },
  )

  expect(result).toEqual({ w: 320, h: 240 })
})
```

- [ ] **Step 5: Run focused tests**

Run: `npm test -- --run src/composables/__tests__/useMatteGeneratorConfig.test.ts src/views/__tests__/MatteGeneratorView.test.ts src/composables/__tests__/useMatteGenerator.test.ts`
Expected: PASS with all matte-generator tests green.

- [ ] **Step 6: Run build verification**

Run: `npm run build`
Expected: PASS with `vue-tsc` and Vite build completing successfully.

- [ ] **Step 7: Commit**

```bash
git add src/views/MatteGeneratorView.vue src/i18n/en.ts src/i18n/fr.ts src/composables/__tests__/useMatteGenerator.test.ts
git commit -m "feat: redesign matte generator workflow"
```

## Task 4: Final Verification and Cleanup

**Files:**
- Modify: `src/views/MatteGeneratorView.vue`
- Modify: `src/views/__tests__/MatteGeneratorView.test.ts`

- [ ] **Step 1: Manually verify the desktop flow**

Run: `npm run dev`
Expected: Vite dev server starts and the Matte Generator shows:
- preview-first layout with artboard styling
- visible stepper
- tappable format cards with clear active state
- grouped style modules and summary chips

- [ ] **Step 2: Manually verify the mobile layout**

Run: `npm run dev`
Expected: At a mobile viewport, the page stacks preview before controls, format cards remain legible, and the primary CTA is easy to find without horizontal scrolling.

- [ ] **Step 3: Tighten any test selectors or copy mismatches found during manual verification**

```ts
expect(wrapper.find('.matte-format-grid').exists()).toBe(true)
expect(wrapper.find('.matte-summary').exists()).toBe(true)
expect(wrapper.get('.matte-actions__primary').text()).toContain('Generate & Download')
```

- [ ] **Step 4: Re-run the full verification set**

Run: `npm test -- --run src/composables/__tests__/useMatteGeneratorConfig.test.ts src/views/__tests__/MatteGeneratorView.test.ts src/composables/__tests__/useMatteGenerator.test.ts && npm run build`
Expected: PASS for tests and production build.

- [ ] **Step 5: Commit**

```bash
git add src/views/MatteGeneratorView.vue src/views/__tests__/MatteGeneratorView.test.ts
git commit -m "test: verify matte generator redesign"
```

## Self-Review

- Spec coverage check:
  - two-step flow: Task 2 + Task 3
  - stronger preview/artboard treatment: Task 3
  - clearer format guidance: Task 1 + Task 3 + i18n additions
  - stronger visual polish and grouped styling modules: Task 3
  - mobile adaptation: Task 4
  - verification: Task 3 + Task 4
- Placeholder scan:
  - no `TODO`, `TBD`, or “handle later” language remains
- Type consistency:
  - `MatteFormatKey` and `MattePatternKey` are introduced once in Task 1 and reused consistently in later tasks
