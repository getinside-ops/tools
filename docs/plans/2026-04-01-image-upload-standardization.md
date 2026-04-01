# Image Upload Standardization Implementation Plan

> **For Qwen Code:** REQUIRED SUB-SKILL: Use `subagent-driven-development` to implement this plan task-by-task.

**Goal:** Standardize image upload across all 13 tools to match the QR Decoder's clean implementation (paste zone + drag-drop + click upload).

**Architecture:** Create a reusable `<GiImageUpload>` component that encapsulates all three input methods (paste, drag-drop, click), with optional preview support for Phase 2. Tools will import this component instead of implementing upload logic individually.

**Tech Stack:** Vue 3 Composition API, TypeScript, Vitest for testing

---

## Phase 1: Core Component & Composable (Tasks 1-8)

### Task 1: Create `useImageUpload` Composable

**Files:**
- Create: `src/composables/useImageUpload.ts`
- Test: `src/composables/__tests__/useImageUpload.test.ts`

**Purpose:** Pure logic for handling file uploads from multiple sources (paste, drag-drop, file input).

**Step 1: Write the failing test**
```typescript
import { describe, it, expect } from 'vitest'
import { useImageUpload } from '../useImageUpload'

describe('useImageUpload', () => {
  it('should handle file validation', () => {
    const { isValidFile } = useImageUpload({ accept: ['image/*'] })
    const imageFile = new File(['test'], 'test.png', { type: 'image/png' })
    expect(isValidFile(imageFile)).toBe(true)
  })
})
```

**Step 2: Run test to verify it fails**
```bash
npm test -- src/composables/__tests__/useImageUpload.test.ts
```
Expected: FAIL with "useImageUpload not defined"

**Step 3: Write minimal implementation**
```typescript
import { ref, type Ref } from 'vue'

export interface UseImageUploadOptions {
  accept?: string[]
  multiple?: boolean
  maxSizeMB?: number
}

export interface UseImageUploadReturn {
  file: Ref<File | null>
  error: Ref<string | null>
  isProcessing: Ref<boolean>
  isValidFile: (file: File) => boolean
  processFile: (file: File) => Promise<void>
  reset: () => void
}

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
  const { accept = ['image/*'], multiple = false, maxSizeMB } = options
  
  const file = ref<File | null>(null)
  const error = ref<string | null>(null)
  const isProcessing = ref(false)

  function isValidFile(file: File): boolean {
    // Check file type
    if (accept.length > 0) {
      const isAccepted = accept.some(type => {
        if (type === 'image/*') return file.type.startsWith('image/')
        if (type === '.pdf') return file.type === 'application/pdf'
        return file.type === type || file.name.endsWith(type)
      })
      if (!isAccepted) return false
    }
    
    // Check file size
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      return false
    }
    
    return true
  }

  async function processFile(file: File): Promise<void> {
    isProcessing.value = true
    error.value = null
    
    if (!isValidFile(file)) {
      error.value = 'Invalid file type or size'
      isProcessing.value = false
      return
    }
    
    file.value = file
    isProcessing.value = false
  }

  function reset() {
    file.value = null
    error.value = null
    isProcessing.value = false
  }

  return {
    file,
    error,
    isProcessing,
    isValidFile,
    processFile,
    reset,
  }
}
```

**Step 4: Run test to verify it passes**
```bash
npm test -- src/composables/__tests__/useImageUpload.test.ts
```
Expected: PASS

**Step 5: Commit**
```bash
git add src/composables/useImageUpload.ts src/composables/__tests__/useImageUpload.test.ts
git commit -m "feat: add useImageUpload composable with file validation"
```

---

### Task 2: Expand Composable Tests

**Files:**
- Modify: `src/composables/__tests__/useImageUpload.test.ts`

**Step 1: Add comprehensive test coverage**
```typescript
describe('useImageUpload', () => {
  // ... existing tests

  it('should reject non-image files when accept is image/*', () => {
    const { isValidFile } = useImageUpload({ accept: ['image/*'] })
    const pdfFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    expect(isValidFile(pdfFile)).toBe(false)
  })

  it('should reject files exceeding maxSizeMB', () => {
    const { isValidFile } = useImageUpload({ accept: ['image/*'], maxSizeMB: 1 })
    const largeFile = new File([new ArrayBuffer(2 * 1024 * 1024)], 'test.png', { type: 'image/png' })
    expect(isValidFile(largeFile)).toBe(false)
  })

  it('should handle paste events', async () => {
    const { processFile } = useImageUpload()
    const imageFile = new File(['test'], 'test.png', { type: 'image/png' })
    await processFile(imageFile)
    // Add assertions
  })

  it('should reset state correctly', () => {
    const { processFile, reset, file, error } = useImageUpload()
    const imageFile = new File(['test'], 'test.png', { type: 'image/png' })
    processFile(imageFile)
    reset()
    expect(file.value).toBeNull()
    expect(error.value).toBeNull()
  })
})
```

**Step 2: Run tests**
```bash
npm test -- src/composables/__tests__/useImageUpload.test.ts
```
Expected: All tests pass

**Step 3: Commit**
```bash
git add src/composables/__tests__/useImageUpload.test.ts
git commit -m "test: add comprehensive tests for useImageUpload"
```

---

### Task 3: Create `<GiImageUpload>` Component

**Files:**
- Create: `src/components/GiImageUpload.vue`
- Test: `src/components/__tests__/GiImageUpload.test.ts`

**Step 1: Create component structure**
```vue
<template>
  <div class="gi-image-upload-wrapper">
    <!-- Paste Zone -->
    <div
      v-if="pasteZone"
      ref="pasteZoneRef"
      class="gi-paste-zone"
      :class="{ 'gi-paste-zone-focus': isFocused }"
      tabindex="0"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @paste="handlePaste"
      @click="focusPasteZone"
    >
      <div class="gi-paste-zone-content">
        <div class="gi-paste-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
          </svg>
        </div>
        <p class="gi-paste-title">{{ pasteTitle }}</p>
        <p class="gi-paste-hint">{{ pasteHint }}</p>
      </div>
    </div>

    <!-- Upload Zone -->
    <div
      class="gi-upload-zone"
      @click="fileInput?.click()"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInputRef"
        type="file"
        hidden
        :accept="computedAccept"
        :multiple="multiple"
        @change="handleFileInput"
      />
      <span>{{ uploadText }}</span>
    </div>

    <!-- Error State -->
    <div v-if="localError" class="gi-result gi-result-error">
      <div class="gi-status gi-status-error">{{ localError }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useImageUpload } from '../composables/useImageUpload'

const props = withDefaults(defineProps<{
  accept?: string[]
  multiple?: boolean
  pasteZone?: boolean
  pasteTitle?: string
  pasteHint?: string
  uploadText?: string
  maxSizeMB?: number
}>(), {
  accept: () => ['image/*'],
  multiple: false,
  pasteZone: true,
  pasteTitle: 'Paste an image',
  pasteHint: 'Click here and press Ctrl+V / Cmd+V',
  uploadText: 'or click to upload from your device',
  maxSizeMB: undefined,
})

const emit = defineEmits<{
  upload: [file: File]
  error: [error: string]
}>()

const { t } = useI18n()

const { file, error, isProcessing, isValidFile, processFile, reset } = useImageUpload({
  accept: props.accept,
  multiple: props.multiple,
  maxSizeMB: props.maxSizeMB,
})

const pasteZoneRef = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)
const localError = ref<string | null>(null)

const computedAccept = computed(() => props.accept.join(','))

function focusPasteZone() {
  pasteZoneRef.value?.focus()
}

async function handlePaste(e: ClipboardEvent) {
  e.preventDefault()
  localError.value = null
  
  const items = e.clipboardData?.items
  if (!items) {
    localError.value = 'No clipboard data available'
    emit('error', localError.value)
    return
  }

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const blob = item.getAsFile()
      if (blob) {
        const file = new File([blob], 'pasted-image.png', { type: blob.type })
        await handleFile(file)
      }
      break
    }
  }
}

function handleDrop(e: DragEvent) {
  localError.value = null
  const file = e.dataTransfer?.files?.[0]
  if (file) {
    handleFile(file)
  }
}

function handleFileInput(e: Event) {
  localError.value = null
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    handleFile(file)
  }
}

async function handleFile(file: File) {
  if (!isValidFile(file)) {
    localError.value = 'Invalid file type or size'
    emit('error', localError.value)
    return
  }

  await processFile(file)
  emit('upload', file)
}

defineExpose({
  reset,
})
</script>

<style scoped>
/* Paste Zone */
.gi-paste-zone {
  border: 2px dashed var(--gi-border);
  border-radius: var(--gi-radius-lg);
  padding: 2.5rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s, box-shadow 0.15s;
  margin-bottom: 1rem;
  outline: none;
}

.gi-paste-zone:hover {
  border-color: var(--gi-brand);
  background-color: var(--gi-tint-green-bg);
}

.gi-paste-zone-focus {
  border-color: var(--gi-brand);
  box-shadow: 0 0 0 3px rgba(10, 170, 142, 0.15);
}

.gi-paste-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.gi-paste-icon {
  color: var(--gi-brand);
  opacity: 0.8;
}

.gi-paste-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gi-text);
  margin: 0;
}

.gi-paste-hint {
  font-size: 0.85rem;
  color: var(--gi-text-muted);
  margin: 0;
}

/* Upload Zone */
.gi-upload-zone {
  border: 2px dashed var(--gi-border);
  border-radius: var(--gi-radius-lg);
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  color: var(--gi-text-muted);
  font-size: 0.9rem;
  transition: border-color 0.15s;
  margin-bottom: 1rem;
}

.gi-upload-zone:hover {
  border-color: var(--gi-brand);
  color: var(--gi-brand);
}

/* Error State */
.gi-result {
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.gi-status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--gi-radius);
  font-size: 0.85rem;
  font-weight: 500;
}

.gi-status-error {
  background: var(--gi-tint-red-bg);
  color: var(--gi-tint-red-text);
}
</style>
```

**Step 2: Create basic component test**
```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GiImageUpload from '../GiImageUpload.vue'

describe('GiImageUpload', () => {
  it('should render paste zone by default', () => {
    const wrapper = mount(GiImageUpload)
    expect(wrapper.find('.gi-paste-zone').exists()).toBe(true)
  })

  it('should emit upload event when file is selected', async () => {
    const wrapper = mount(GiImageUpload)
    const file = new File(['test'], 'test.png', { type: 'image/png' })
    
    // Simulate file input
    const input = wrapper.find('input[type="file"]')
    await input.trigger('change')
    
    expect(wrapper.emitted('upload')).toBeDefined()
  })
})
```

**Step 3: Run tests**
```bash
npm test -- src/components/__tests__/GiImageUpload.test.ts
```

**Step 4: Commit**
```bash
git add src/components/GiImageUpload.vue src/components/__tests__/GiImageUpload.test.ts
git commit -m "feat: add GiImageUpload component with paste, drag-drop, and click upload"
```

---

### Task 4: Add Component Tests for Drag-Drop and Paste

**Files:**
- Modify: `src/components/__tests__/GiImageUpload.test.ts`

**Step 1: Add drag-drop test**
```typescript
it('should handle drag and drop', async () => {
  const wrapper = mount(GiImageUpload)
  const file = new File(['test'], 'test.png', { type: 'image/png' })
  
  const dropZone = wrapper.find('.gi-upload-zone')
  await dropZone.trigger('drop', {
    dataTransfer: {
      files: [file],
    },
  })
  
  expect(wrapper.emitted('upload')).toBeDefined()
})

it('should handle paste event', async () => {
  const wrapper = mount(GiImageUpload)
  const file = new File(['test'], 'test.png', { type: 'image/png' })
  
  const pasteZone = wrapper.find('.gi-paste-zone')
  await pasteZone.trigger('paste', {
    clipboardData: {
      items: [{
        type: 'image/png',
        getAsFile: () => file,
      }],
    },
  })
  
  expect(wrapper.emitted('upload')).toBeDefined()
})

it('should show error for invalid file type', async () => {
  const wrapper = mount(GiImageUpload, {
    props: {
      accept: ['image/*'],
    },
  })
  
  const input = wrapper.find('input[type="file"]')
  const pdfFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
  
  // This would require mocking the file input change
  // For now, test the composable directly
})
```

**Step 2: Run tests**
```bash
npm test -- src/components/__tests__/GiImageUpload.test.ts
```

**Step 3: Commit**
```bash
git add src/components/__tests__/GiImageUpload.test.ts
git commit -m "test: add drag-drop and paste tests for GiImageUpload"
```

---

### Task 5: Export Composable from Index

**Files:**
- Modify: `src/composables/index.ts` (create if doesn't exist)

**Step 1: Check if index exists**
```bash
ls src/composables/index.ts
```

**Step 2: If exists, add export; if not, create**
```typescript
// If file doesn't exist, create it
export * from './useImageUpload'
// Export other composables as needed
```

**Step 3: Commit**
```bash
git add src/composables/index.ts
git commit -m "chore: export useImageUpload from composables index"
```

---

### Task 6: Run Full Test Suite

**Files:**
- All test files

**Step 1: Run all tests**
```bash
npm test
```

**Step 2: Verify all 166+ tests pass**
Expected: All tests pass, including new useImageUpload and GiImageUpload tests

**Step 3: Commit if tests pass**
```bash
git commit -m "chore: verify all tests pass after adding image upload component"
```

---

### Task 7: Build and Type Check

**Files:**
- All source files

**Step 1: Run build**
```bash
npm run build
```

**Step 2: Verify no TypeScript errors**
Expected: Build succeeds with no errors

**Step 3: Commit**
```bash
git commit -m "chore: verify build passes with new component"
```

---

### Task 8: Document the Component

**Files:**
- Create: `docs/components/gi-image-upload.md`

**Step 1: Create documentation**
```markdown
# GiImageUpload Component

Reusable image upload component with paste, drag-drop, and click-to-upload functionality.

## Usage

```vue
<template>
  <GiImageUpload
    @upload="handleUpload"
    @error="handleError"
    :accept="['image/*']"
    :paste-zone="true"
    :max-size-mb="5"
  />
</template>

<script setup lang="ts">
import GiImageUpload from '@/components/GiImageUpload.vue'

function handleUpload(file: File) {
  console.log('Uploaded:', file.name)
}

function handleError(error: string) {
  console.error('Upload error:', error)
}
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `accept` | `string[]` | `['image/*']` | Accepted file types |
| `multiple` | `boolean` | `false` | Allow multiple files |
| `pasteZone` | `boolean` | `true` | Show paste zone |
| `pasteTitle` | `string` | `'Paste an image'` | Paste zone title |
| `pasteHint` | `string` | `'Click here and press Ctrl+V / Cmd+V'` | Paste zone hint |
| `uploadText` | `string` | `'or click to upload from your device'` | Upload zone text |
| `maxSizeMB` | `number` | `undefined` | Maximum file size in MB |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `upload` | `File` | Emitted when a file is successfully uploaded |
| `error` | `string` | Emitted when an error occurs |

## Exposed Methods

| Method | Description |
|--------|-------------|
| `reset()` | Reset component state |

## Example: PDF Upload

```vue
<GiImageUpload
  @upload="handlePdfUpload"
  :accept="['.pdf', 'application/pdf']"
  :paste-zone="false"
  upload-text="Click to upload PDF"
/>
```
```

**Step 2: Commit**
```bash
git add docs/components/gi-image-upload.md
git commit -m "docs: add GiImageUpload component documentation"
```

---

## Phase 2: Update High Priority Tools (Tasks 9-17)

### Task 9: Update Image Compressor

**Files:**
- Modify: `src/views/ImageCompressorView.vue`
- Test: Manual browser testing

**Step 1: Read current implementation**
```bash
cat src/views/ImageCompressorView.vue
```

**Step 2: Replace upload section with GiImageUpload**
```vue
<template>
  <ToolPageLayout ...>
    <!-- Replace existing upload UI with: -->
    <GiImageUpload
      @upload="handleImageUpload"
      @error="handleError"
    />

    <!-- Keep existing preview and compression UI -->
    ...
  </ToolPageLayout>
</template>

<script setup lang="ts">
import GiImageUpload from '@/components/GiImageUpload.vue'

function handleImageUpload(file: File) {
  // Existing compression logic
}
</script>
```

**Step 3: Remove redundant upload code**
- Remove old file input handlers
- Remove old drag-drop handlers (if any)

**Step 4: Manual browser test**
```bash
npm run dev
```
Navigate to Image Compressor tool and test:
- Paste from clipboard
- Drag and drop
- Click to upload

**Step 5: Commit**
```bash
git add src/views/ImageCompressorView.vue
git commit -m "feat: standardize image upload in Image Compressor"
```

---

### Task 10: Update Image Cropper

**Files:**
- Modify: `src/views/ImageCropperView.vue`

**Steps:** Same as Task 9

**Commit:**
```bash
git add src/views/ImageCropperView.vue
git commit -m "feat: standardize image upload in Image Cropper"
```

---

### Task 11: Update Image Resizer

**Files:**
- Modify: `src/views/ImageResizerView.vue`

**Steps:** Same as Task 9

**Commit:**
```bash
git add src/views/ImageResizerView.vue
git commit -m "feat: standardize image upload in Image Resizer"
```

---

### Task 12: Update Image Filters

**Files:**
- Modify: `src/views/ImageFiltersView.vue`

**Steps:** Same as Task 9

**Commit:**
```bash
git add src/views/ImageFiltersView.vue
git commit -m "feat: standardize image upload in Image Filters"
```

---

### Task 13: Update Image Converter

**Files:**
- Modify: `src/views/ImageConverterView.vue`

**Note:** This tool accepts multiple image formats, may need custom `accept` prop

**Steps:** Same as Task 9, but with custom accept:
```vue
<GiImageUpload
  @upload="handleImageUpload"
  :accept="['image/png', 'image/jpeg', 'image/webp', 'image/gif']"
/>
```

**Commit:**
```bash
git add src/views/ImageConverterView.vue
git commit -m "feat: standardize image upload in Image Converter"
```

---

### Task 14: Update Favicon Generator

**Files:**
- Modify: `src/views/FaviconView.vue`

**Steps:** Same as Task 9

**Commit:**
```bash
git add src/views/FaviconView.vue
git commit -m "feat: standardize image upload in Favicon Generator"
```

---

### Task 15: Update Colorblind Simulator

**Files:**
- Modify: `src/views/ColorblindView.vue`

**Steps:** Same as Task 9

**Commit:**
```bash
git add src/views/ColorblindView.vue
git commit -m "feat: standardize image upload in Colorblind Simulator"
```

---

### Task 16: Update Color Palette Generator

**Files:**
- Modify: `src/views/PaletteView.vue`

**Steps:** Same as Task 9

**Commit:**
```bash
git add src/views/PaletteView.vue
git commit -m "feat: standardize image upload in Color Palette Generator"
```

---

### Task 17: Update Metadata Viewer

**Files:**
- Modify: `src/views/MetadataView.vue`

**Steps:** Same as Task 9

**Commit:**
```bash
git add src/views/MetadataView.vue
git commit -m "feat: standardize image upload in Metadata Viewer"
```

---

## Phase 3: Update Medium/Low Priority Tools (Tasks 18-21)

### Task 18: Update PDF/X Converter

**Files:**
- Modify: `src/views/PdfXView.vue`

**Note:** PDF-only upload, needs custom accept prop

**Steps:**
```vue
<GiImageUpload
  @upload="handlePdfUpload"
  :accept="['.pdf', 'application/pdf']"
  paste-title="Paste a PDF"
  upload-text="or click to upload PDF from your device"
/>
```

**Commit:**
```bash
git add src/views/PdfXView.vue
git commit -m "feat: add paste support to PDF/X Converter"
```

---

### Task 19: Update Matte Generator

**Files:**
- Modify: `src/views/MatteGeneratorView.vue`

**Steps:** Same as Task 9

**Commit:**
```bash
git add src/views/MatteGeneratorView.vue
git commit -m "feat: add paste support to Matte Generator"
```

---

### Task 20: Update Mockup Generator

**Files:**
- Modify: `src/views/MockupGeneratorView.vue`

**Steps:** Same as Task 9

**Commit:**
```bash
git add src/views/MockupGeneratorView.vue
git commit -m "feat: add paste support to Mockup Generator"
```

---

### Task 21: Update DPI Checker (Optional Polish)

**Files:**
- Modify: `src/views/DpiCheckerView.vue`

**Note:** Already has all 3 mechanisms, but uses global paste listener. Consider migrating to zone-based paste for consistency.

**Decision Point:** Evaluate if migration is worth the effort. If current implementation works well, may skip this task.

---

## Phase 4: Verification & Cleanup (Tasks 22-25)

### Task 22: Manual Testing All Tools

**Files:**
- All updated view files

**Step 1: Start dev server**
```bash
npm run dev
```

**Step 2: Test each tool**
Create a checklist:
- [ ] Image Compressor - paste, drag-drop, click
- [ ] Image Cropper - paste, drag-drop, click
- [ ] Image Resizer - paste, drag-drop, click
- [ ] Image Filters - paste, drag-drop, click
- [ ] Image Converter - paste, drag-drop, click
- [ ] Favicon Generator - paste, drag-drop, click
- [ ] Colorblind Simulator - paste, drag-drop, click
- [ ] Color Palette Generator - paste, drag-drop, click
- [ ] Metadata Viewer - paste, drag-drop, click
- [ ] PDF/X Converter - paste, drag-drop, click
- [ ] Matte Generator - paste, drag-drop, click
- [ ] Mockup Generator - paste, drag-drop, click
- [ ] DPI Checker - verify still works
- [ ] QR Decoder - verify still works (reference)

**Step 3: Test in dark mode**
Toggle dark mode and verify upload zones are visible

**Step 4: Test keyboard navigation**
Tab to paste zone, press Enter/Space, paste with Ctrl+V

---

### Task 23: Run Full Test Suite

**Step 1: Run all tests**
```bash
npm test
```

**Step 2: Verify all tests pass**
Expected: 166+ tests passing

---

### Task 24: Build Production

**Step 1: Run build**
```bash
npm run build
```

**Step 2: Verify no errors**
Expected: Build succeeds

---

### Task 25: Final Commit & Documentation Update

**Step 1: Update QWEN.md**
Add GiImageUpload component to project documentation

**Step 2: Final commit**
```bash
git add .
git commit -m "chore: complete image upload standardization across all tools"
```

**Step 3: Push branch (if ready for PR)**
```bash
git push origin feat/image-upload-standardization
```

---

## Testing Checklist

After all tasks are complete, verify:

### Functional Tests
- [ ] All 13 tools accept image uploads via paste
- [ ] All 13 tools accept image uploads via drag-drop
- [ ] All 13 tools accept image uploads via click
- [ ] File validation works correctly (rejects invalid types)
- [ ] Error messages display correctly
- [ ] Keyboard navigation works (Tab, Enter, Ctrl+V)

### Visual Tests
- [ ] Upload zones match QR Decoder styling
- [ ] Focus states are visible (green glow)
- [ ] Hover states work correctly
- [ ] Dark mode compatibility
- [ ] Responsive on mobile

### Code Quality
- [ ] All TypeScript types are correct
- [ ] No console errors in browser
- [ ] All unit tests pass
- [ ] Build succeeds without warnings

---

## Notes

- **Phase 2 (Preview Enhancement)** is intentionally deferred to a future session
- The component is designed to support preview via `v-model:preview` or `@preview` event in the future
- Some tools (QR Decoder, Cropper) have custom preview needs and can implement their own alongside the upload component
