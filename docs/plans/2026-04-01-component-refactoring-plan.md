# Component Refactoring & Standardization Plan

> **For Qwen Code:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Create reusable components (GiFormField, GiResultCard, GiStatusBadge) and migrate all views to use ToolPageLayout and GiImageUpload consistently.

**Architecture:** Extract repeated UI patterns into composable, slot-based components. Migrate views incrementally, testing each tool after migration. Maintain backward compatibility during transition.

**Tech Stack:** Vue 3.5.13 Composition API, `<script setup>`, vue-i18n v9, TypeScript strict mode

---

## Phase 1: Create New Components

### Task 1: Create GiFormField Component

**Files:**
- Create: `src/components/GiFormField.vue`
- Test: `src/components/__tests__/GiFormField.test.ts`

**Step 1: Write the failing test**
```typescript
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import GiFormField from '../GiFormField.vue'

describe('GiFormField', () => {
  it('renders label and input correctly', () => {
    const wrapper = mount(GiFormField, {
      props: {
        label: 'Test Label',
        modelValue: 'test'
      }
    })
    expect(wrapper.text()).toContain('Test Label')
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(GiFormField, {
      props: {
        label: 'Test',
        modelValue: 'initial'
      }
    })
    await wrapper.find('input').setValue('new value')
    expect(wrapper.emitted('update:modelValue')).toEqual([['new value']])
  })

  it('supports different input types', () => {
    const wrapper = mount(GiFormField, {
      props: {
        label: 'Number',
        modelValue: '42',
        type: 'number'
      }
    })
    expect(wrapper.find('input').attributes('type')).toBe('number')
  })

  it('displays error message when provided', () => {
    const wrapper = mount(GiFormField, {
      props: {
        label: 'Email',
        modelValue: 'invalid',
        error: 'Invalid email format'
      }
    })
    expect(wrapper.text()).toContain('Invalid email format')
    expect(wrapper.classes()).toContain('gi-field--error')
  })
})
```

**Step 2: Run test to verify it fails**
```bash
npm test -- src/components/__tests__/GiFormField.test.ts
```
Expected: FAIL with "Cannot find module '../GiFormField.vue'"

**Step 3: Write minimal implementation**
```vue
<template>
  <div class="gi-field" :class="{ 'gi-field--error': error }">
    <label v-if="label" class="gi-label" :for="inputId">
      {{ label }}
      <span v-if="required" class="gi-label-required">*</span>
    </label>
    <slot name="input">
      <input
        v-if="type !== 'textarea'"
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        class="gi-input"
        :class="{ 'gi-input--error': error }"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <textarea
        v-else
        :id="inputId"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        class="gi-input gi-input--textarea"
        :class="{ 'gi-input--error': error }"
        @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      />
    </slot>
    <span v-if="error" class="gi-field-error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface GiFormFieldProps {
  label?: string
  modelValue?: string | number
  type?: 'text' | 'number' | 'email' | 'url' | 'password' | 'textarea' | 'search'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
}

const props = withDefaults(defineProps<GiFormFieldProps>(), {
  type: 'text'
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = computed(() => `gi-field-${Math.random().toString(36).slice(2, 9)}`)

defineOptions({
  name: 'GiFormField'
})
</script>

<style scoped>
.gi-field {
  margin-bottom: var(--gi-space-md);
}

.gi-label {
  display: block;
  font-size: var(--gi-font-size-sm);
  font-weight: 500;
  color: var(--gi-text);
  margin-bottom: var(--gi-space-xs);
}

.gi-label-required {
  color: var(--gi-brand);
  margin-left: 2px;
}

.gi-input {
  width: 100%;
  padding: var(--gi-space-sm) var(--gi-space-md);
  font-size: var(--gi-font-size-base);
  color: var(--gi-text);
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
}

.gi-input:focus {
  outline: none;
  border-color: var(--gi-brand);
  box-shadow: 0 0 0 3px rgba(10, 170, 142, 0.1);
}

.gi-input--error {
  border-color: var(--gi-error);
}

.gi-input--textarea {
  min-height: 100px;
  resize: vertical;
}

.gi-field-error {
  display: block;
  font-size: var(--gi-font-size-xs);
  color: var(--gi-error);
  margin-top: var(--gi-space-xs);
}

.gi-field--error .gi-input {
  border-color: var(--gi-error);
}
</style>
```

**Step 4: Run test to verify it passes**
```bash
npm test -- src/components/__tests__/GiFormField.test.ts
```
Expected: PASS (4 tests)

**Step 5: Commit**
```bash
git add src/components/GiFormField.vue src/components/__tests__/GiFormField.test.ts
git commit -m "feat: add GiFormField component for reusable form fields"
```

---

### Task 2: Create GiResultCard Component

**Files:**
- Create: `src/components/GiResultCard.vue`
- Test: `src/components/__tests__/GiResultCard.test.ts`

**Step 1: Write the failing test**
```typescript
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import GiResultCard from '../GiResultCard.vue'

describe('GiResultCard', () => {
  it('renders title and content slots', () => {
    const wrapper = mount(GiResultCard, {
      slots: {
        header: 'Result Title',
        default: 'Result content here'
      }
    })
    expect(wrapper.text()).toContain('Result Title')
    expect(wrapper.text()).toContain('Result content here')
  })

  it('renders actions slot', () => {
    const wrapper = mount(GiResultCard, {
      slots: {
        header: 'Title',
        default: 'Content',
        actions: '<button>Download</button>'
      }
    })
    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.find('button').text()).toBe('Download')
  })

  it('applies variant classes', () => {
    const wrapper = mount(GiResultCard, {
      props: { variant: 'success' },
      slots: { default: 'Content' }
    })
    expect(wrapper.classes()).toContain('gi-result-card--success')
  })

  it('is collapsible when collapsible prop is true', async () => {
    const wrapper = mount(GiResultCard, {
      props: { collapsible: true, collapsed: false },
      slots: { header: 'Title', default: 'Content' }
    })
    expect(wrapper.find('button[aria-expanded]').exists()).toBe(true)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('update:collapsed')).toEqual([[true]])
  })
})
```

**Step 2: Run test to verify it fails**
```bash
npm test -- src/components/__tests__/GiResultCard.test.ts
```
Expected: FAIL

**Step 3: Write minimal implementation**
```vue
<template>
  <div class="gi-result-card" :class="[`gi-result-card--${variant}`]">
    <div class="gi-result-card-header">
      <slot name="header">
        <h3 class="gi-result-card-title">{{ title }}</h3>
      </slot>
      <button
        v-if="collapsible"
        class="gi-result-card-toggle"
        :aria-expanded="!collapsed"
        @click="$emit('update:collapsed', !collapsed)"
      >
        <ChevronDown :class="{ 'is-collapsed': collapsed }" />
      </button>
    </div>
    <div v-show="!collapsed" class="gi-result-card-content">
      <slot />
      <div v-if="$slots.actions" class="gi-result-card-actions">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

export interface GiResultCardProps {
  title?: string
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
  collapsible?: boolean
  collapsed?: boolean
}

withDefaults(defineProps<GiResultCardProps>(), {
  variant: 'default',
  collapsible: false,
  collapsed: false
})

defineEmits<{
  'update:collapsed': [value: boolean]
}>()

defineOptions({
  name: 'GiResultCard'
})
</script>

<style scoped>
.gi-result-card {
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  padding: var(--gi-space-md);
  margin-bottom: var(--gi-space-md);
  box-shadow: var(--gi-shadow-sm);
}

.gi-result-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--gi-space-sm);
}

.gi-result-card-title {
  font-size: var(--gi-font-size-md);
  font-weight: 600;
  color: var(--gi-text);
  margin: 0;
}

.gi-result-card-toggle {
  background: none;
  border: none;
  padding: var(--gi-space-xs);
  cursor: pointer;
  color: var(--gi-text-muted);
  transition: transform var(--gi-transition-fast) var(--gi-ease-out);
}

.gi-result-card-toggle:hover {
  color: var(--gi-text);
}

.gi-result-card-toggle .is-collapsed {
  transform: rotate(-90deg);
}

.gi-result-card-content {
  color: var(--gi-text);
}

.gi-result-card-actions {
  display: flex;
  gap: var(--gi-space-sm);
  margin-top: var(--gi-space-md);
  padding-top: var(--gi-space-sm);
  border-top: 1px solid var(--gi-border);
}

/* Variants */
.gi-result-card--success {
  border-left: 4px solid var(--gi-success);
}

.gi-result-card--error {
  border-left: 4px solid var(--gi-error);
}

.gi-result-card--warning {
  border-left: 4px solid var(--gi-warning);
}

.gi-result-card--info {
  border-left: 4px solid var(--gi-brand);
}
</style>
```

**Step 4: Run test to verify it passes**
```bash
npm test -- src/components/__tests__/GiResultCard.test.ts
```
Expected: PASS (4 tests)

**Step 5: Commit**
```bash
git add src/components/GiResultCard.vue src/components/__tests__/GiResultCard.test.ts
git commit -m "feat: add GiResultCard component for standardized result displays"
```

---

### Task 3: Create GiStatusBadge Component

**Files:**
- Create: `src/components/GiStatusBadge.vue`
- Test: `src/components/__tests__/GiStatusBadge.test.ts`

**Step 1: Write the failing test**
```typescript
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import GiStatusBadge from '../GiStatusBadge.vue'

describe('GiStatusBadge', () => {
  it('renders text content', () => {
    const wrapper = mount(GiStatusBadge, {
      props: { variant: 'ok' },
      slots: { default: 'Success' }
    })
    expect(wrapper.text()).toBe('Success')
  })

  it('applies variant classes', () => {
    const variants = ['ok', 'error', 'warning', 'info'] as const
    variants.forEach(variant => {
      const wrapper = mount(GiStatusBadge, {
        props: { variant },
        slots: { default: 'Status' }
      })
      expect(wrapper.classes()).toContain(`gi-status--${variant}`)
    })
  })

  it('supports icon display', () => {
    const wrapper = mount(GiStatusBadge, {
      props: { variant: 'ok', showIcon: true },
      slots: { default: 'OK' }
    })
    expect(wrapper.find('svg').exists()).toBe(true)
  })
})
```

**Step 2: Run test to verify it fails**
```bash
npm test -- src/components/__tests__/GiStatusBadge.test.ts
```
Expected: FAIL

**Step 3: Write minimal implementation**
```vue
<template>
  <span class="gi-status-badge" :class="[`gi-status-badge--${variant}`]">
    <CheckCircle v-if="showIcon && variant === 'ok'" class="gi-status-badge-icon" size="14" />
    <AlertCircle v-if="showIcon && variant === 'error'" class="gi-status-badge-icon" size="14" />
    <AlertTriangle v-if="showIcon && variant === 'warning'" class="gi-status-badge-icon" size="14" />
    <Info v-if="showIcon && variant === 'info'" class="gi-status-badge-icon" size="14" />
    <slot />
  </span>
</template>

<script setup lang="ts">
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-vue-next'

export interface GiStatusBadgeProps {
  variant?: 'ok' | 'error' | 'warning' | 'info'
  showIcon?: boolean
}

withDefaults(defineProps<GiStatusBadgeProps>(), {
  variant: 'info',
  showIcon: false
})

defineOptions({
  name: 'GiStatusBadge'
})
</script>

<style scoped>
.gi-status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--gi-space-xs);
  padding: var(--gi-space-xs) var(--gi-space-sm);
  font-size: var(--gi-font-size-xs);
  font-weight: 500;
  border-radius: var(--gi-radius-pill);
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
}

.gi-status-badge-icon {
  flex-shrink: 0;
}

.gi-status-badge--ok {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.2);
  color: var(--gi-success);
}

.gi-status-badge--error {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
  color: var(--gi-error);
}

.gi-status-badge--warning {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.2);
  color: var(--gi-warning);
}

.gi-status-badge--info {
  background: rgba(10, 170, 142, 0.1);
  border-color: rgba(10, 170, 142, 0.2);
  color: var(--gi-brand);
}
</style>
```

**Step 4: Run test to verify it passes**
```bash
npm test -- src/components/__tests__/GiStatusBadge.test.ts
```
Expected: PASS (3 tests)

**Step 5: Commit**
```bash
git add src/components/GiStatusBadge.vue src/components/__tests__/GiStatusBadge.test.ts
git commit -m "feat: add GiStatusBadge component for consistent status indicators"
```

---

## Phase 2: Migrate Views to ToolPageLayout

### Task 4: Audit ToolPageLayout Usage

**Files:**
- Read: `src/components/ToolPageLayout.vue`
- Read: `src/views/QrDecoderView.vue` (uses ToolPageLayout correctly)
- Grep: Find all views NOT using ToolPageLayout

**Step 1: Read ToolPageLayout to understand its API**
```bash
# Read the component to understand props/slots
```

**Step 2: List all views that need migration**
Views to migrate (not using ToolPageLayout):
- HomeView.vue
- PaperWeightView.vue
- ImageCompressorView.vue
- ImageCropperView.vue
- ImageResizerView.vue
- ImageFiltersView.vue
- ImageConverterView.vue
- DpiCheckerView.vue
- UtmBuilderView.vue
- ContrastCheckerView.vue
- ColorConverterView.vue
- UrlParserView.vue
- FaviconView.vue
- MetadataView.vue
- PaletteView.vue
- ColorblindView.vue
- TypeScaleView.vue
- PromoCodeView.vue
- LoremIpsumView.vue
- PlaceholderView.vue
- PdfXView.vue
- SafetyMarginView.vue
- MatteGeneratorView.vue
- MockupGeneratorView.vue
- BarcodeView.vue
- RedirectCheckerView.vue

**Step 3: Create migration checklist document**
Document which views have custom header patterns vs standard patterns

---

### Task 5: Migrate DpiCheckerView to ToolPageLayout

**Files:**
- Modify: `src/views/DpiCheckerView.vue`
- Test: Manual browser test

**Step 1: Read current DpiCheckerView**
Identify header/back-link pattern to replace

**Step 2: Replace with ToolPageLayout**
```vue
<template>
  <ToolPageLayout :title="t('dpiChecker.title')" :description="t('dpiChecker.desc')">
    <!-- Existing content -->
  </ToolPageLayout>
</template>
```

**Step 3: Remove duplicate header markup**

**Step 4: Test manually**
```bash
npm run dev
# Navigate to DPI Checker tool
# Verify back link works
# Verify header displays correctly
# Verify all functionality still works
```

**Step 5: Commit**
```bash
git add src/views/DpiCheckerView.vue
git commit -m "refactor: migrate DpiCheckerView to ToolPageLayout"
```

---

### Task 6: Migrate ImageCompressorView to ToolPageLayout

**Files:**
- Modify: `src/views/ImageCompressorView.vue`

**Step 1: Read current view**

**Step 2: Wrap with ToolPageLayout**

**Step 3: Remove duplicate header**

**Step 4: Test manually**

**Step 5: Commit**

---

### Task 7: Migrate ImageCropperView to ToolPageLayout

**Files:**
- Modify: `src/views/ImageCropperView.vue`

**Steps:** Same as Task 6

---

### Task 8: Migrate ImageResizerView to ToolPageLayout

**Files:**
- Modify: `src/views/ImageResizerView.vue`

**Steps:** Same as Task 6

---

### Task 9: Migrate ImageFiltersView to ToolPageLayout

**Files:**
- Modify: `src/views/ImageFiltersView.vue`

**Steps:** Same as Task 6

---

### Task 10: Migrate ImageConverterView to ToolPageLayout

**Files:**
- Modify: `src/views/ImageConverterView.vue`

**Steps:** Same as Task 6

---

### Task 11: Migrate UtmBuilderView to ToolPageLayout

**Files:**
- Modify: `src/views/UtmBuilderView.vue`

**Steps:** Same as Task 6

---

### Task 12: Migrate ContrastCheckerView to ToolPageLayout

**Files:**
- Modify: `src/views/ContrastCheckerView.vue`

**Steps:** Same as Task 6

---

### Task 13: Migrate ColorConverterView to ToolPageLayout

**Files:**
- Modify: `src/views/ColorConverterView.vue`

**Steps:** Same as Task 6

---

### Task 14: Migrate UrlParserView to ToolPageLayout

**Files:**
- Modify: `src/views/UrlParserView.vue`

**Steps:** Same as Task 6

---

### Task 15: Migrate FaviconView to ToolPageLayout

**Files:**
- Modify: `src/views/FaviconView.vue`

**Steps:** Same as Task 6

---

### Task 16: Migrate MetadataView to ToolPageLayout

**Files:**
- Modify: `src/views/MetadataView.vue`

**Steps:** Same as Task 6

---

### Task 17: Migrate PaletteView to ToolPageLayout

**Files:**
- Modify: `src/views/PaletteView.vue`

**Steps:** Same as Task 6

---

### Task 18: Migrate ColorblindView to ToolPageLayout

**Files:**
- Modify: `src/views/ColorblindView.vue`

**Steps:** Same as Task 6

---

### Task 19: Migrate TypeScaleView to ToolPageLayout

**Files:**
- Modify: `src/views/TypeScaleView.vue`

**Steps:** Same as Task 6

---

### Task 20: Migrate PromoCodeView to ToolPageLayout

**Files:**
- Modify: `src/views/PromoCodeView.vue`

**Steps:** Same as Task 6

---

### Task 21: Migrate LoremIpsumView to ToolPageLayout

**Files:**
- Modify: `src/views/LoremIpsumView.vue`

**Steps:** Same as Task 6

---

### Task 22: Migrate PlaceholderView to ToolPageLayout

**Files:**
- Modify: `src/views/PlaceholderView.vue`

**Steps:** Same as Task 6

---

### Task 23: Migrate PdfXView to ToolPageLayout

**Files:**
- Modify: `src/views/PdfXView.vue`

**Steps:** Same as Task 6

---

### Task 24: Migrate SafetyMarginView to ToolPageLayout

**Files:**
- Modify: `src/views/SafetyMarginView.vue`

**Steps:** Same as Task 6

---

### Task 25: Migrate MatteGeneratorView to ToolPageLayout

**Files:**
- Modify: `src/views/MatteGeneratorView.vue`

**Steps:** Same as Task 6

---

### Task 26: Migrate MockupGeneratorView to ToolPageLayout

**Files:**
- Modify: `src/views/MockupGeneratorView.vue`

**Steps:** Same as Task 6

---

### Task 27: Migrate BarcodeView to ToolPageLayout

**Files:**
- Modify: `src/views/BarcodeView.vue`

**Steps:** Same as Task 6

---

### Task 28: Migrate RedirectCheckerView to ToolPageLayout

**Files:**
- Modify: `src/views/RedirectCheckerView.vue`

**Steps:** Same as Task 6

---

### Task 29: Migrate PaperWeightView to ToolPageLayout

**Files:**
- Modify: `src/views/PaperWeightView.vue`

**Steps:** Same as Task 6

---

### Task 30: Migrate HomeView (special case)

**Files:**
- Modify: `src/views/HomeView.vue`

**Note:** HomeView may need custom treatment as it's the landing page

**Steps:** Evaluate if ToolPageLayout is appropriate or if custom header should remain

---

## Phase 3: Migrate to GiImageUpload

### Task 31: Audit GiImageUpload API

**Files:**
- Read: `src/components/GiImageUpload.vue`
- Read: `docs/plans/2026-04-01-image-upload-standardization.md`

**Step 1: Understand GiImageUpload props/events**

**Step 2: List views using inline upload logic**
- ImageCompressorView
- ImageCropperView
- ImageResizerView
- ImageFiltersView
- ImageConverterView
- PaletteView
- ColorblindView
- MetadataView
- DpiCheckerView (already uses it, verify)

**Step 3: Create migration checklist**

---

### Task 32: Migrate ImageCompressorView to GiImageUpload

**Files:**
- Modify: `src/views/ImageCompressorView.vue`

**Step 1: Read current inline upload implementation**

**Step 2: Replace with GiImageUpload component**
```vue
<GiImageUpload
  @upload="handleUpload"
  :accept="'image/*'"
/>
```

**Step 3: Remove duplicate upload logic**

**Step 4: Test manually**
- Test file selection
- Test drag-drop
- Test paste
- Verify image preview works
- Verify compression still works

**Step 5: Commit**

---

### Task 33: Migrate ImageCropperView to GiImageUpload

**Files:**
- Modify: `src/views/ImageCropperView.vue`

**Steps:** Same as Task 32

---

### Task 34: Migrate ImageResizerView to GiImageUpload

**Files:**
- Modify: `src/views/ImageResizerView.vue`

**Steps:** Same as Task 32

---

### Task 35: Migrate ImageFiltersView to GiImageUpload

**Files:**
- Modify: `src/views/ImageFiltersView.vue`

**Steps:** Same as Task 32

---

### Task 36: Migrate ImageConverterView to GiImageUpload

**Files:**
- Modify: `src/views/ImageConverterView.vue`

**Steps:** Same as Task 32

---

### Task 37: Migrate PaletteView to GiImageUpload

**Files:**
- Modify: `src/views/PaletteView.vue`

**Steps:** Same as Task 32

---

### Task 38: Migrate ColorblindView to GiImageUpload

**Files:**
- Modify: `src/views/ColorblindView.vue`

**Steps:** Same as Task 32

---

### Task 39: Migrate MetadataView to GiImageUpload

**Files:**
- Modify: `src/views/MetadataView.vue`

**Steps:** Same as Task 32

---

## Phase 4: Migrate to GiFormField

### Task 40: Audit Form Field Usage

**Files:**
- Grep: Find all `.gi-field` patterns in views

**Step 1: Search for form field patterns**
```bash
grep -r "class=\"gi-field\"" src/views/
grep -r "class=\"gi-label\"" src/views/
grep -r "class=\"gi-input\"" src/views/
```

**Step 2: List views with form fields**
Identify which views have simple text/number inputs vs complex custom inputs

---

### Task 41: Migrate DpiCheckerView to GiFormField

**Files:**
- Modify: `src/views/DpiCheckerView.vue`

**Step 1: Identify form fields in view**

**Step 2: Replace with GiFormField**
```vue
<GiFormField
  :label="t('dpiChecker.widthLabel')"
  v-model="width"
  type="number"
/>
```

**Step 3: Remove duplicate markup**

**Step 4: Test**

**Step 5: Commit**

---

### Task 42: Migrate UtmBuilderView to GiFormField

**Files:**
- Modify: `src/views/UtmBuilderView.vue`

**Steps:** Same as Task 41

---

### Task 43: Migrate UrlParserView to GiFormField

**Files:**
- Modify: `src/views/UrlParserView.vue`

**Steps:** Same as Task 41

---

### Task 44: Migrate FaviconView to GiFormField

**Files:**
- Modify: `src/views/FaviconView.vue`

**Steps:** Same as Task 41

---

### Task 45: Migrate PlaceholderView to GiFormField

**Files:**
- Modify: `src/views/PlaceholderView.vue`

**Steps:** Same as Task 41

---

### Task 46: Migrate MatteGeneratorView to GiFormField

**Files:**
- Modify: `src/views/MatteGeneratorView.vue`

**Steps:** Same as Task 41

---

### Task 47: Migrate MockupGeneratorView to GiFormField

**Files:**
- Modify: `src/views/MockupGeneratorView.vue`

**Steps:** Same as Task 41

---

### Task 48: Migrate BarcodeView to GiFormField

**Files:**
- Modify: `src/views/BarcodeView.vue`

**Steps:** Same as Task 41

---

## Phase 5: Migrate to GiResultCard

### Task 49: Audit Result Card Usage

**Files:**
- Grep: Find all `.gi-result` patterns

**Step 1: Search for result patterns**
```bash
grep -r "class=\"gi-result\"" src/views/
```

**Step 2: List views with result displays**

---

### Task 50: Migrate DpiCheckerView to GiResultCard

**Files:**
- Modify: `src/views/DpiCheckerView.vue`

**Step 1: Identify result displays**

**Step 2: Replace with GiResultCard**
```vue
<GiResultCard :title="t('dpiChecker.resultTitle')">
  <p>{{ result }}</p>
</GiResultCard>
```

**Step 3: Test**

**Step 4: Commit**

---

### Task 51: Migrate QrDecoderView to GiResultCard

**Files:**
- Modify: `src/views/QrDecoderView.vue`

**Steps:** Same as Task 50

---

### Task 52: Migrate ImageCompressorView to GiResultCard

**Files:**
- Modify: `src/views/ImageCompressorView.vue`

**Steps:** Same as Task 50

---

### Task 53: Migrate UtmBuilderView to GiResultCard

**Files:**
- Modify: `src/views/UtmBuilderView.vue`

**Steps:** Same as Task 50

---

### Task 54: Migrate UrlParserView to GiResultCard

**Files:**
- Modify: `src/views/UrlParserView.vue`

**Steps:** Same as Task 50

---

### Task 55: Migrate FaviconView to GiResultCard

**Files:**
- Modify: `src/views/FaviconView.vue`

**Steps:** Same as Task 50

---

### Task 56: Migrate MetadataView to GiResultCard

**Files:**
- Modify: `src/views/MetadataView.vue`

**Steps:** Same as Task 50

---

### Task 57: Migrate PaletteView to GiResultCard

**Files:**
- Modify: `src/views/PaletteView.vue`

**Steps:** Same as Task 50

---

### Task 58: Migrate TypeScaleView to GiResultCard

**Files:**
- Modify: `src/views/TypeScaleView.vue`

**Steps:** Same as Task 50

---

### Task 59: Migrate PromoCodeView to GiResultCard

**Files:**
- Modify: `src/views/PromoCodeView.vue`

**Steps:** Same as Task 50

---

### Task 60: Migrate LoremIpsumView to GiResultCard

**Files:**
- Modify: `src/views/LoremIpsumView.vue`

**Steps:** Same as Task 50

---

## Phase 6: Migrate to GiStatusBadge

### Task 61: Audit Status Badge Usage

**Files:**
- Grep: Find all `.gi-status` patterns

**Step 1: Search for status patterns**
```bash
grep -r "class=\"gi-status" src/views/
```

---

### Task 62: Migrate QrDecoderView to GiStatusBadge

**Files:**
- Modify: `src/views/QrDecoderView.vue`

**Step 1: Identify status badges**

**Step 2: Replace with GiStatusBadge**
```vue
<GiStatusBadge variant="ok" :show-icon="true">
  {{ t('status.success') }}
</GiStatusBadge>
```

**Step 3: Test**

**Step 4: Commit**

---

### Task 63: Migrate DpiCheckerView to GiStatusBadge

**Files:**
- Modify: `src/views/DpiCheckerView.vue`

**Steps:** Same as Task 62

---

### Task 64: Migrate ImageCompressorView to GiStatusBadge

**Files:**
- Modify: `src/views/ImageCompressorView.vue`

**Steps:** Same as Task 62

---

### Task 65: Migrate RedirectCheckerView to GiStatusBadge

**Files:**
- Modify: `src/views/RedirectCheckerView.vue`

**Steps:** Same as Task 62

---

### Task 66: Migrate ContrastCheckerView to GiStatusBadge

**Files:**
- Modify: `src/views/ContrastCheckerView.vue`

**Steps:** Same as Task 62

---

## Phase 7: Verification & Documentation

### Task 67: Run Full Test Suite

**Command:**
```bash
npm test
```

**Expected:** All 121+ tests pass (including new component tests)

---

### Task 68: Manual Browser Testing

**Tools to test (sample of 4-5):**
1. DPI Checker (uses all 4 new patterns)
2. Image Compressor (uses GiImageUpload, ToolPageLayout)
3. UTM Builder (uses GiFormField, GiResultCard)
4. QR Decoder (uses GiStatusBadge, ToolPageLayout)
5. Color Palette (uses GiImageUpload, GiResultCard)

**Checklist:**
- [ ] Back links work
- [ ] Headers display correctly
- [ ] Form inputs work
- [ ] Upload works (file, drag-drop, paste)
- [ ] Results display correctly
- [ ] Status badges show correctly
- [ ] Dark mode works
- [ ] Keyboard navigation works

---

### Task 69: Update Design System Documentation

**Files:**
- Modify: `docs/design-system.md`

**Step 1: Add component API section**
Document:
- GiFormField props/events/slots
- GiResultCard props/events/slots
- GiStatusBadge props/events/slots
- GiImageUpload usage guide
- ToolPageLayout usage guide

**Step 2: Add migration guide**
Show before/after examples

---

### Task 70: Create Migration Summary Document

**Files:**
- Create: `docs/plans/2026-04-01-component-refactoring-results.md`

**Content:**
- Components created
- Views migrated
- Before/after code comparison
- Bundle size impact (if any)
- Lessons learned

---

### Task 71: Final Verification

**Commands:**
```bash
npm run build
npm run preview
# Test in browser
```

**Checklist:**
- [ ] Build succeeds with no errors
- [ ] No TypeScript errors
- [ ] Production preview works
- [ ] All tools accessible from home page

---

### Task 72: Commit All Changes

```bash
git status
git add .
git commit -m "refactor: complete component standardization across all views"
```

---

## Testing Strategy

**Unit Tests:**
- New components: GiFormField, GiResultCard, GiStatusBadge
- Test props, events, slots, variants

**Manual Testing:**
- Canvas-based tools can't be unit tested
- Test upload, drag-drop, paste for image tools
- Verify visual appearance in light/dark mode

**Playwright E2E (Optional):**
- Test 2-3 key tools end-to-end
- Verify no regressions in core workflows

---

## Success Criteria

1. ✅ 3 new components created with tests
2. ✅ 25+ views migrated to ToolPageLayout
3. ✅ 9+ image tools migrated to GiImageUpload
4. ✅ 8+ views migrated to GiFormField
5. ✅ 10+ views migrated to GiResultCard
6. ✅ 5+ views migrated to GiStatusBadge
7. ✅ All 121+ existing tests still pass
8. ✅ New component tests pass
9. ✅ Build succeeds
10. ✅ Manual testing passes for sample tools

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing functionality | Test each view immediately after migration |
| Component API doesn't fit all use cases | Design slots for flexibility |
| Migration takes too long | Batch similar views, use subagents |
| Dark mode regressions | Test both themes after each migration |
| Accessibility regressions | Verify keyboard nav, ARIA attributes |

---

## Estimated Effort

- **Phase 1 (Create components):** 3 tasks × 5 steps = 15 steps (~1 hour)
- **Phase 2 (ToolPageLayout):** 27 tasks × 5 steps = 135 steps (~4-5 hours)
- **Phase 3 (GiImageUpload):** 8 tasks × 5 steps = 40 steps (~1.5 hours)
- **Phase 4 (GiFormField):** 8 tasks × 5 steps = 40 steps (~1.5 hours)
- **Phase 5 (GiResultCard):** 11 tasks × 4 steps = 44 steps (~1.5 hours)
- **Phase 6 (GiStatusBadge):** 5 tasks × 4 steps = 20 steps (~45 min)
- **Phase 7 (Verification):** 6 tasks = 6 steps (~30 min)

**Total:** ~300 steps, ~10-12 hours

**With subagents (parallel):** ~3-4 hours wall clock time

---

Plan complete and saved to `docs/plans/2026-04-01-component-refactoring-plan.md`. Two execution options:

**1. Subagent-Driven (this session)**
- I dispatch fresh subagent per task, review between tasks, fast iteration
- Uses `subagent-driven-development` skill

**2. Parallel Session (separate)**
- Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
