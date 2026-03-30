# Batch 4: Retail & Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 4 advanced image utilities (Metadata, Colorblind, QR Decode, Palette) using 100% client-side logic and a strict TDD approach.

**Architecture:** Each tool consists of a logic-only composable (src/composables) and a presentation view (src/views). QR decoding uses `jsQR`.

**Tech Stack:** Vue 3, Vite, Vitest, Lucide Icons, jsQR.

---

### Task 1: Environment Setup & Metadata Logic
**Files:**
- Create: `src/composables/useMetadata.ts`
- Test: `src/composables/__tests__/useMetadata.test.ts`
- Modify: `package.json` (add `jsqr`)

- [ ] **Step 1: Install jsQR**
Run: `npm install jsqr`
Expected: `jsqr` added to dependencies.

- [ ] **Step 2: Write failing test for Metadata extraction**
```typescript
import { describe, it, expect } from 'vitest'
import { extractBasicMetadata } from '../useMetadata'

describe('useMetadata - Logic', () => {
  it('should return basic info for a mock image file', () => {
    const file = new File([''], 'test.png', { type: 'image/png' })
    const meta = extractBasicMetadata(file)
    expect(meta.name).toBe('test.png')
    expect(meta.type).toBe('image/png')
  })
})
```

- [ ] **Step 3: Run test to verify it fails**
Run: `npx vitest run src/composables/__tests__/useMetadata.test.ts`
Expected: FAIL (missing module/function)

- [ ] **Step 4: Implement minimal Metadata logic**
```typescript
export interface ImageMetadata {
  name: string
  size: number
  type: string
  lastModified: number
}

export function extractBasicMetadata(file: File): ImageMetadata {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified
  }
}
```

- [ ] **Step 5: Run test to verify it passes**
Run: `npx vitest run src/composables/__tests__/useMetadata.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**
`git add . && git commit -m "feat: init Batch 4 and add metadata logic"`

### Task 2: Metadata UI & Translations
**Files:**
- Create: `src/views/MetadataView.vue`
- Modify: `src/i18n/fr.ts`, `src/i18n/en.ts`

- [ ] **Step 1: Add Metadata translations**
Update both `fr.ts` and `en.ts` with `metadata` keys.

- [ ] **Step 2: Create MetadataView UI**
Implement file upload and a table displaying properties (Name, Size, MIME, Date).

- [ ] **Step 3: Manual Verify**
Upload a file and check the table.

### Task 3: Colorblind Simulator Logic (TDD)
**Files:**
- Create: `src/composables/useColorblind.ts`
- Test: `src/composables/__tests__/useColorblind.test.ts`

- [ ] **Step 1: Write failing test for filter calculation**
- [ ] **Step 2: Run test (FAIL)**
- [ ] **Step 3: Implement minimal SVG Matrix logic**
- [ ] **Step 4: Run test (PASS)**
- [ ] **Step 5: Commit**

### Task 4: Colorblind Simulator UI
**Files:**
- Create: `src/views/ColorblindView.vue`

- [ ] **Step 1: Implement UI with type selection (Protanopia, etc.)**
- [ ] **Step 2: Apply SVG filters to a live image preview**

### Task 5: QR Code Decoder Logic (TDD)
**Files:**
- Create: `src/composables/useQrDecoder.ts`
- Test: `src/composables/__tests__/useQrDecoder.test.ts`

- [ ] **Step 1: Write failing test for decoding**
- [ ] **Step 2: Run test (FAIL)**
- [ ] **Step 3: Implement minimal jsQR wrapper**
- [ ] **Step 4: Run test (PASS)**
- [ ] **Step 5: Commit**

### Task 6: QR Code Decoder UI
**Files:**
- Create: `src/views/QrDecoderView.vue`

- [ ] **Step 1: Implement UI with file input and text output area**
- [ ] **Step 2: Add "Copy to clipboard" for the decoded content**

### Task 7: Image Palette Extractor Logic (TDD)
**Files:**
- Create: `src/composables/usePalette.ts`
- Test: `src/composables/__tests__/usePalette.test.ts`

- [ ] **Step 1: Write failing test for sampling**
- [ ] **Step 2: Run test (FAIL)**
- [ ] **Step 3: Implement minimal Canvas sampling logic**
- [ ] **Step 4: Run test (PASS)**
- [ ] **Step 5: Commit**

### Task 8: Image Palette Extractor UI
**Files:**
- Create: `src/views/PaletteView.vue`

- [ ] **Step 1: Implement UI with color swatch display**
- [ ] **Step 2: Add "Click to copy" HEX values**

### Task 9: Final Global Integration
**Files:**
- Modify: `src/router/index.ts`, `src/views/HomeView.vue`

- [ ] **Step 1: Register all 4 new routes**
- [ ] **Step 2: Add cards to dashboard**
- [ ] **Step 3: Final verification**
