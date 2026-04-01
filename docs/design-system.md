# getinside Tools Design System

> Inspired by Zerokit with getinside brand identity

## Overview

- **Framework:** Vue 3.5.13 (Composition API)
- **Build:** Vite 6.2.0
- **Theme System:** Light/Dark with CSS variables
- **Typography:** Golden ratio-based modular scale

## Theme System

### Light Theme (Default)

**Brand Colors:**
- `--gi-brand: #0aaa8e` (primary teal)
- `--gi-brand-dark: #08937b` (hover state)
- `--gi-mint: #6AE7C8`
- `--gi-yellow: #FCF758`
- `--gi-violet: #C990FC`

**Backgrounds:**
- `--gi-bg: #F7F6F3`
- `--gi-surface: #FFFFFF`
- `--gi-border: #E0DDD9`

**Text:**
- `--gi-text: #1a1a1a`
- `--gi-text-muted: #6b7280`

### Dark Theme

**Backgrounds:**
- `--gi-bg: #0a0a0c`
- `--gi-surface: #15151a`
- `--gi-border: #2a2a35`

**Text:**
- `--gi-text: #f5f5f7`
- `--gi-text-muted: #9ca3af`

## New Components

### GiFormField

Form field wrapper with label, input, and error handling. Supports all standard input types including textarea.

**Usage:**
```vue
<template>
  <GiFormField
    v-model="formData.email"
    label="Email Address"
    type="email"
    placeholder="you@example.com"
    required
  />

  <GiFormField
    v-model="formData.message"
    label="Message"
    type="textarea"
    placeholder="Type your message..."
    :error="errors.message"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GiFormField from '@/components/GiFormField.vue'

const formData = ref({ email: '', message: '' })
const errors = ref({ message: '' })
</script>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `undefined` | Field label text |
| `modelValue` | `string \| number` | `undefined` | v-model binding value |
| `type` | `'text' \| 'number' \| 'email' \| 'url' \| 'password' \| 'textarea' \| 'search'` | `'text'` | Input type |
| `placeholder` | `string` | `undefined` | Placeholder text |
| `required` | `boolean` | `false` | Shows required asterisk |
| `disabled` | `boolean` | `false` | Disables the input |
| `error` | `string` | `undefined` | Error message to display |

**Slots:**
| Slot | Description |
|------|-------------|
| `input` | Custom input element (overrides default input/textarea) |

**Events:**
| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `(value: string)` | Emitted on input change |

**Interface:**
```typescript
export interface GiFormFieldProps {
  label?: string
  modelValue?: string | number
  type?: 'text' | 'number' | 'email' | 'url' | 'password' | 'textarea' | 'search'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
}
```

### GiResultCard

Card component for displaying results with optional collapsible behavior and variant styling.

**Usage:**
```vue
<template>
  <!-- Basic result card -->
  <GiResultCard title="Analysis Results">
    <p>The color contrast ratio is 4.5:1</p>
  </GiResultCard>

  <!-- Success variant with actions -->
  <GiResultCard title="Success!" variant="success">
    <p>Your image has been compressed successfully.</p>
    <template #actions>
      <button class="gi-btn">Download</button>
      <button class="gi-btn-ghost">Try Another</button>
    </template>
  </GiResultCard>

  <!-- Collapsible card -->
  <GiResultCard
    title="Advanced Settings"
    variant="info"
    collapsible
    v-model:collapsed="isCollapsed"
  >
    <p>These settings are optional...</p>
  </GiResultCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GiResultCard from '@/components/GiResultCard.vue'

const isCollapsed = ref(false)
</script>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `undefined` | Card title (shown in header) |
| `variant` | `'default' \| 'success' \| 'error' \| 'warning' \| 'info'` | `'default'` | Visual variant with colored left border |
| `collapsible` | `boolean` | `false` | Enables collapse/expand toggle |
| `collapsed` | `boolean` | `false` | Controls collapsed state |

**Slots:**
| Slot | Description |
|------|-------------|
| `default` | Main card content |
| `header` | Custom header content (overrides title and toggle) |
| `actions` | Action buttons area (border-top separator) |

**Events:**
| Event | Payload | Description |
|-------|---------|-------------|
| `update:collapsed` | `(value: boolean)` | Emitted when toggle is clicked |

**Interface:**
```typescript
export interface GiResultCardProps {
  title?: string
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
  collapsible?: boolean
  collapsed?: boolean
}
```

**Variant Styling:**
Each variant adds a colored left border:
- `success` — Green (`--gi-tint-green-text`)
- `error` — Red (`--gi-tint-red-text`)
- `warning` — Yellow (`--gi-tint-yellow-text`)
- `info` — Brand teal (`--gi-brand`)

### GiStatusBadge

Inline badge for displaying status with optional icons.

**Usage:**
```vue
<template>
  <!-- Basic badges -->
  <GiStatusBadge variant="ok">Success</GiStatusBadge>
  <GiStatusBadge variant="error">Error</GiStatusBadge>
  <GiStatusBadge variant="warning">Warning</GiStatusBadge>
  <GiStatusBadge variant="info">Info</GiStatusBadge>

  <!-- With icons -->
  <GiStatusBadge variant="ok" :show-icon="true">Completed</GiStatusBadge>
  <GiStatusBadge variant="error" :show-icon="true">Failed</GiStatusBadge>

  <!-- In context -->
  <p>
    Status: <GiStatusBadge variant="ok">Active</GiStatusBadge>
  </p>
</template>

<script setup lang="ts">
import GiStatusBadge from '@/components/GiStatusBadge.vue'
</script>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'ok' \| 'error' \| 'warning' \| 'info'` | `'info'` | Status variant |
| `showIcon` | `boolean` | `false` | Shows status icon (CheckCircle, AlertCircle, etc.) |

**Slots:**
| Slot | Description |
|------|-------------|
| `default` | Badge text content |

**Interface:**
```typescript
export interface GiStatusBadgeProps {
  variant?: 'ok' | 'error' | 'warning' | 'info'
  showIcon?: boolean
}
```

**Variant Styling:**
| Variant | Icon (when enabled) | Background | Border | Text Color |
|---------|---------------------|------------|--------|------------|
| `ok` | CheckCircle | Green tint | Green | `--gi-tint-green-text` |
| `error` | AlertCircle | Red tint | Red | `--gi-tint-red-text` |
| `warning` | AlertTriangle | Yellow tint | Yellow | `--gi-tint-yellow-text` |
| `info` | Info | Brand tint | Brand | `--gi-brand` |

### GiComparison

Side-by-side comparison component for displaying multiple items.

**Usage:**
```vue
<GiComparison :items="[
  { label: 'Original', value: '#FF0000' },
  { label: 'Simulated', value: '#9B9A43' }
]">
  <template #item-0="{ item }">
    <div :style="{ color: item.value }">{{ item.value }}</div>
  </template>
</GiComparison>
```

**Props:**
- `items: ComparisonItem[]` - Array of items to display

**Slots:**
- `item-{index}` - Custom rendering for each item

### GiDataDisplay

Structured data display with label/value rows.

**Usage:**
```vue
<GiDataDisplay :data="[
  { label: 'Hex', value: '#0aaa8e', code: true },
  { label: 'RGB', value: '10, 170, 142', code: true },
  { label: 'Contrast', value: '4.5:1', color: '#059669' }
]" />
```

**Props:**
- `data: DataRow[]` - Array of data rows
  - `label: string` - Row label
  - `value: string | number` - Row value
  - `color?: string` - Optional text color
  - `code?: boolean` - Display in code styling

### GiInfoBox

Contextual help component for tips, info, and warnings.

**Usage:**
```vue
<GiInfoBox variant="tip" title="Pro Tip">
  You can use keyboard shortcuts to navigate faster.
</GiInfoBox>

<GiInfoBox variant="info">
  This tool processes images locally. No data is sent to a server.
</GiInfoBox>
```

**Props:**
- `variant?: 'info' | 'tip' | 'warning'` (default: 'info')
- `title?: string` - Optional title

**Slots:**
- `default` - Main content
- `icon` - Custom icon (overrides default)

## Pedagogical Patterns

Inspired by Delphi.tools, the design system includes patterns for educational content:

### About Sections
Use `GiPedagogic` component to add educational context to tools:
- Title with emoji icon
- Brief description
- Tips list (💡)
- Resources list (🔗)

### Comparison Views
Use `GiComparison` for side-by-side comparisons:
- Original vs Simulated
- Before vs After
- Multiple variants

### Data Display
Use `GiDataDisplay` for structured technical data:
- Color values (HEX, RGB, HSL)
- Measurements (DPI, dimensions)
- Ratios (contrast, scale)

### Contextual Help
Use `GiInfoBox` for inline guidance:
- Tips for best results
- Warnings about limitations
- Info about privacy/processing

## Typography Scale

| Token | Size | Use Case |
|-------|------|----------|
| `--gi-font-size-3xl` | 2.618rem | Hero H1 |
| `--gi-font-size-2xl` | 2rem | Section H2 |
| `--gi-font-size-xl` | 1.618rem | Tool H1 |
| `--gi-font-size-lg` | 1.25rem | Card titles |
| `--gi-font-size-md` | 1rem | Body text |
| `--gi-font-size-sm` | 0.875rem | Labels, buttons |
| `--gi-font-size-xs` | 0.75rem | Captions, badges |

## Spacing System

| Token | Size | Use Case |
|-------|------|----------|
| `--gi-space-3xl` | 3.5rem | Hero padding |
| `--gi-space-2xl` | 2.5rem | Section margins |
| `--gi-space-xl` | 1.75rem | Card padding |
| `--gi-space-lg` | 1.25rem | Section gaps |
| `--gi-space-md` | 0.75rem | Field gaps |
| `--gi-space-sm` | 0.5rem | Small gaps |
| `--gi-space-xs` | 0.375rem | Tight spacing |

## Component Patterns

### Tool Cards (Homepage)

```vue
<router-link to="/tool" class="home-card">
  <div class="home-card-top">
    <div class="home-icon-box">
      <component :is="Icon" :size="20" />
    </div>
    <span class="gi-badge-new">New</span>
  </div>
  <strong class="home-card-title">Tool Name</strong>
  <p class="home-card-desc">Short description...</p>
  <span class="home-card-cta">Try it now →</span>
</router-link>
```

**Hover effects:**
- Lift: `translateY(-4px)`
- Shadow: Enhanced with glow in dark mode
- Icon box: Fills with brand color

### Tool Page Layout

```vue
<ToolPageLayout
  :title="t('tool.title')"
  :description="t('tool.desc')"
>
  <template #icon>
    <ToolIcon :size="24" />
  </template>

  <!-- Tool content -->

  <template #pedagogic>
    <GiPedagogic
      :title="t('tool.pedagogic.title')"
      :description="t('tool.pedagogic.description')"
      :tips="[t('tool.pedagogic.tip1'), ...]"
    />
  </template>
</ToolPageLayout>
```

### Pedagogic Section

**Structure:**
- Title with emoji (📚)
- Description (1-2 sentences)
- Tips section (💡, 2-4 bullet points)
- Resources section (🔗, optional links)

**Example content:**
```typescript
pedagogic: {
  title: 'About QR Codes',
  description: 'QR Codes are 2D barcodes readable by smartphone.',
  tips: [
    'Ensure the QR code is well-lit and clear',
    'QR codes can be read even when partially damaged',
  ],
}
```

### Using New Components

**Comparison with Data Display:**
```vue
<GiComparison :items="[
  { label: 'Original', value: '#FF0000' },
  { label: 'Simulated', value: '#9B9A43' }
]">
  <template #item-0="{ item }">
    <div :style="{ color: item.value }">{{ item.value }}</div>
  </template>
  <template #item-1="{ item }">
    <div :style="{ color: item.value }">{{ item.value }}</div>
  </template>
</GiComparison>

<GiDataDisplay :data="[
  { label: 'Hex', value: '#0aaa8e', code: true },
  { label: 'RGB', value: '10, 170, 142', code: true },
  { label: 'Contrast', value: '4.5:1', color: '#059669' }
]" />
```

**Contextual Help:**
```vue
<GiInfoBox variant="tip" title="Pro Tip">
  For best results, ensure high contrast between foreground and background.
</GiInfoBox>

<GiInfoBox variant="warning">
  This operation cannot be undone. Make sure to save your work first.
</GiInfoBox>
```

### Form Fields with GiFormField

**Basic form with multiple fields:**
```vue
<GiFormField
  v-model="form.name"
  label="Full Name"
  type="text"
  placeholder="John Doe"
  required
/>

<GiFormField
  v-model="form.email"
  label="Email"
  type="email"
  placeholder="john@example.com"
  :error="errors.email"
/>

<GiFormField
  v-model="form.bio"
  label="Bio"
  type="textarea"
  placeholder="Tell us about yourself..."
/>
```

### Results with GiResultCard

**Display tool results:**
```vue
<GiResultCard title="Compression Results" variant="success">
  <p>File size reduced by 45%</p>
  <template #actions>
    <button class="gi-btn">Download</button>
  </template>
</GiResultCard>

<GiResultCard title="Error Details" variant="error">
  <p>Failed to process image. Please try again.</p>
</GiResultCard>
```

### Status Indicators with GiStatusBadge

**Inline status display:**
```vue
<p>
  Upload status: <GiStatusBadge variant="ok" :show-icon="true">Complete</GiStatusBadge>
</p>

<div>
  <GiStatusBadge variant="info">Processing...</GiStatusBadge>
  <GiStatusBadge variant="warning" :show-icon="true">Low contrast</GiStatusBadge>
</div>
```

## Migration Guide

This guide helps you migrate from inline form fields and ad-hoc result displays to the new standardized components.

### GiFormField Migration

**Before (inline markup):**
```vue
<template>
  <div class="form-group">
    <label for="email" class="label">Email Address</label>
    <input
      id="email"
      v-model="email"
      type="email"
      class="input"
      placeholder="you@example.com"
    />
    <span v-if="error" class="error-message">{{ error }}</span>
  </div>
</template>

<style scoped>
.form-group {
  margin-bottom: var(--gi-space-md);
}
.label {
  display: block;
  font-size: var(--gi-font-size-sm);
  font-weight: 500;
  margin-bottom: var(--gi-space-xs);
}
.input {
  width: 100%;
  padding: var(--gi-space-sm) var(--gi-space-md);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
}
.error-message {
  display: block;
  font-size: var(--gi-font-size-xs);
  color: var(--gi-error);
  margin-top: var(--gi-space-xs);
}
</style>
```

**After (GiFormField component):**
```vue
<template>
  <GiFormField
    v-model="email"
    label="Email Address"
    type="email"
    placeholder="you@example.com"
    :error="error"
  />
</template>

<script setup lang="ts">
import GiFormField from '@/components/GiFormField.vue'
</script>
```

**Benefits:**
- ✅ 80% less code
- ✅ Consistent styling across all tools
- ✅ Built-in error handling
- ✅ Automatic label-input association (accessibility)
- ✅ Dark mode support out of the box

### GiResultCard Migration

**Before (custom result card):**
```vue
<template>
  <div class="result-box">
    <h3 class="result-title">Analysis Results</h3>
    <div class="result-content">
      <p>The contrast ratio is 4.5:1</p>
    </div>
    <div class="result-actions">
      <button class="btn">Download</button>
    </div>
  </div>
</template>

<style scoped>
.result-box {
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  padding: var(--gi-space-md);
  margin-bottom: var(--gi-space-md);
}
.result-title {
  font-size: var(--gi-font-size-md);
  font-weight: 600;
  margin-bottom: var(--gi-space-sm);
}
.result-actions {
  display: flex;
  gap: var(--gi-space-sm);
  margin-top: var(--gi-space-md);
  padding-top: var(--gi-space-sm);
  border-top: 1px solid var(--gi-border);
}
</style>
```

**After (GiResultCard component):**
```vue
<template>
  <GiResultCard title="Analysis Results">
    <p>The contrast ratio is 4.5:1</p>
    <template #actions>
      <button class="gi-btn">Download</button>
    </template>
  </GiResultCard>
</template>

<script setup lang="ts">
import GiResultCard from '@/components/GiResultCard.vue'
</script>
```

**Benefits:**
- ✅ 70% less code
- ✅ Built-in variant support (success, error, warning, info)
- ✅ Collapsible option available
- ✅ Consistent spacing and styling
- ✅ Accessible toggle button

### GiStatusBadge Migration

**Before (inline badge):**
```vue
<template>
  <span
    class="status-badge"
    :class="{
      'status-badge--ok': status === 'ok',
      'status-badge--error': status === 'error'
    }"
  >
    {{ status === 'ok' ? '✓' : '✗' }} {{ label }}
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--gi-space-xs);
  padding: var(--gi-space-xs) var(--gi-space-sm);
  font-size: var(--gi-font-size-xs);
  font-weight: 500;
  border-radius: var(--gi-radius-pill);
}
.status-badge--ok {
  background: rgba(16, 185, 129, 0.1);
  color: var(--gi-tint-green-text);
}
.status-badge--error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--gi-tint-red-text);
}
</style>
```

**After (GiStatusBadge component):**
```vue
<template>
  <GiStatusBadge :variant="status" :show-icon="true">
    {{ label }}
  </GiStatusBadge>
</template>

<script setup lang="ts">
import GiStatusBadge from '@/components/GiStatusBadge.vue'
</script>
```

**Benefits:**
- ✅ 85% less code
- ✅ Four variants out of the box
- ✅ Lucide icons included
- ✅ Consistent color system
- ✅ ARIA role="status" for accessibility

## Component Inventory

| Component | Location | Purpose | Props | Slots | Events |
|-----------|----------|---------|-------|-------|--------|
| **GiFormField** | `src/components/GiFormField.vue` | Form field with label, input, error | 7 | 1 (`input`) | 1 (`update:modelValue`) |
| **GiResultCard** | `src/components/GiResultCard.vue` | Result display card with variants | 4 | 3 (`default`, `header`, `actions`) | 1 (`update:collapsed`) |
| **GiStatusBadge** | `src/components/GiStatusBadge.vue` | Inline status indicator | 2 | 1 (`default`) | — |
| **GiComparison** | `src/components/GiComparison.vue` | Side-by-side comparison | 1 | 1+ (`item-{index}`) | — |
| **GiDataDisplay** | `src/components/GiDataDisplay.vue` | Structured data rows | 1 | — | — |
| **GiInfoBox** | `src/components/GiInfoBox.vue` | Contextual help/tips | 2 | 2 (`default`, `icon`) | — |
| **GiPedagogic** | `src/components/GiPedagogic.vue` | Educational content section | 3 | — | — |
| **GiPedagogicSection** | `src/components/GiPedagogicSection.vue` | About/resources section | 4 | — | — |
| **ToolPageLayout** | `src/components/ToolPageLayout.vue` | Standard tool page wrapper | 2 | 3 (`default`, `icon`, `pedagogic`) | — |

## Usage Guidelines

### Adding a New Tool

1. Create composable: `src/composables/useNewTool.ts` + tests
2. Create view: Use `ToolPageLayout` component
3. Add translations: `fr.ts` and `en.ts` (include pedagogic section)
4. Add to HomeView: Entry in `allTools` array
5. Test in both themes

### CSS Best Practices

- Always use CSS variables (`--gi-*`)
- No hardcoded colors
- Use utility classes when available
- Test in both light and dark modes

## Accessibility

- **Reduced motion:** `@media (prefers-reduced-motion: reduce)`
- **Contrast:** WCAG AA compliant in both themes
- **Focus states:** Visible focus rings on all interactive elements
