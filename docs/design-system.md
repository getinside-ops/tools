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
