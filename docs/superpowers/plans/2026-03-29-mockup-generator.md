# Mockup Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a client-side mockup generator tool that composites a user screenshot onto an iPhone 15 frame and exports it as PNG (download + clipboard).

**Architecture:** HTML5 Canvas compositing — user image drawn cover-cropped to the screen rect, device frame drawn on top. The frame PNG must have a transparent screen area. All logic lives in `useMockupGenerator.ts`; `MockupGeneratorView.vue` handles reactivity and UX.

**Tech Stack:** Vue 3 + TypeScript + HTML5 Canvas API — no new dependencies.

---

### Task 1: Prepare the transparent-screen frame PNG

**Files:**
- Modify: `public/apple-iphone-15-black-portrait.png`

- [ ] **Step 1: Measure PNG dimensions**

```bash
rtk npm run dev
# Leave dev server running, then open a new terminal:
sips -g pixelWidth -g pixelHeight "public/apple-iphone-15-black-portrait.png"
```

Note the exact `pixelWidth` and `pixelHeight` values. You'll need them to calibrate the screen rect.

- [ ] **Step 2: Find the screen rect via browser console**

With the dev server running, open `http://localhost:5173/tools/apple-iphone-15-black-portrait.png` in Chrome/Safari. Open DevTools console and run:

```js
// Scan for white pixel bounds to identify screen rect
const img = document.querySelector('img');
const c = document.createElement('canvas');
c.width = img.naturalWidth; c.height = img.naturalHeight;
const ctx = c.getContext('2d');
ctx.drawImage(img, 0, 0);
const data = ctx.getImageData(0, 0, c.width, c.height).data;
let minX = c.width, maxX = 0, minY = c.height, maxY = 0;
for (let y = 0; y < c.height; y++) {
  for (let x = 0; x < c.width; x++) {
    const i = (y * c.width + x) * 4;
    if (data[i] > 240 && data[i+1] > 240 && data[i+2] > 240 && data[i+3] > 200) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
console.log(`SCREEN = { x: ${minX}, y: ${minY}, w: ${maxX - minX + 1}, h: ${maxY - minY + 1} }`);
```

Note the printed `SCREEN` object — you'll use these values in Task 2 and below.

- [ ] **Step 3: Generate the transparent-screen PNG via browser console**

Still in the DevTools console on the same page, run (substituting the `SCREEN` values from Step 2):

```js
const SCREEN = { x: /* minX */, y: /* minY */, w: /* maxX-minX+1 */, h: /* maxY-minY+1 */ };
const img = document.querySelector('img');
const c = document.createElement('canvas');
c.width = img.naturalWidth; c.height = img.naturalHeight;
const ctx = c.getContext('2d');
ctx.drawImage(img, 0, 0);
const region = ctx.getImageData(SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h);
for (let i = 0; i < region.data.length; i += 4) {
  if (region.data[i] > 200 && region.data[i+1] > 200 && region.data[i+2] > 200) {
    region.data[i+3] = 0; // make transparent
  }
}
ctx.putImageData(region, SCREEN.x, SCREEN.y);
c.toBlob(blob => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'apple-iphone-15-black-portrait.png';
  a.click();
}, 'image/png');
```

- [ ] **Step 4: Replace the public PNG**

Move the downloaded `apple-iphone-15-black-portrait.png` into `public/`, overwriting the original.

- [ ] **Step 5: Verify transparency**

Open `http://localhost:5173/tools/apple-iphone-15-black-portrait.png`. The screen area should be transparent (you'll see the browser's checkerboard pattern or the page background through it). The black bezel and dynamic island must still be fully opaque.

- [ ] **Step 6: Commit**

```bash
rtk git add public/apple-iphone-15-black-portrait.png
rtk git commit -m "feat: make iPhone 15 frame screen area transparent for canvas compositing"
```

---

### Task 2: Implement `useMockupGenerator.ts`

**Files:**
- Create: `src/composables/useMockupGenerator.ts`

> No Vitest tests — canvas is a stub in jsdom. Verification is manual in Task 4.

- [ ] **Step 1: Create the composable**

Create `src/composables/useMockupGenerator.ts` with the following content. **Replace the `SCREEN` values with the numbers you measured in Task 1 Step 2.**

```ts
const FRAME_SRC = '/tools/apple-iphone-15-black-portrait.png'

// Screen rect measured from the frame PNG (pixel coordinates).
// UPDATE these values to match what Task 1 Step 2 printed.
const SCREEN = { x: 0, y: 0, w: 0, h: 0 } // <-- replace with measured values

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function coverCrop(
  imgW: number,
  imgH: number,
  targetW: number,
  targetH: number
): { sx: number; sy: number; sw: number; sh: number } {
  const imgRatio = imgW / imgH
  const targetRatio = targetW / targetH
  if (imgRatio > targetRatio) {
    const sw = imgH * targetRatio
    return { sx: (imgW - sw) / 2, sy: 0, sw, sh: imgH }
  } else {
    const sh = imgW / targetRatio
    return { sx: 0, sy: (imgH - sh) / 2, sw: imgW, sh }
  }
}

export async function generateMockup(userImage: HTMLImageElement): Promise<HTMLCanvasElement> {
  const frame = await loadImage(FRAME_SRC)

  const canvas = document.createElement('canvas')
  canvas.width = frame.naturalWidth
  canvas.height = frame.naturalHeight
  const ctx = canvas.getContext('2d')!

  // Draw user image cover-cropped into the screen area
  const { sx, sy, sw, sh } = coverCrop(
    userImage.naturalWidth,
    userImage.naturalHeight,
    SCREEN.w,
    SCREEN.h
  )
  ctx.drawImage(userImage, sx, sy, sw, sh, SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h)

  // Draw transparent frame on top — bezel covers everything outside screen
  ctx.drawImage(frame, 0, 0)

  return canvas
}
```

- [ ] **Step 2: Commit**

```bash
rtk git add src/composables/useMockupGenerator.ts
rtk git commit -m "feat: add useMockupGenerator composable for canvas compositing"
```

---

### Task 3: Add i18n translations

**Files:**
- Modify: `src/i18n/fr.ts`
- Modify: `src/i18n/en.ts`

- [ ] **Step 1: Add French translations**

In `src/i18n/fr.ts`, add inside the `nav` object:
```ts
mockupGenerator: 'Mockup',
```

Add inside the `home.tools` object (matching the pattern of other tool entries):
```ts
mockupGenerator: { title: 'Mockup iPhone', desc: 'Intégrez votre capture dans un mockup iPhone 15.' },
```

Add a new top-level key alongside the other tool sections:
```ts
mockupGenerator: {
  title: 'Mockup iPhone 15',
  desc: 'Intégrez votre capture d\'écran dans un mockup iPhone 15 en un clic.',
  dropZone: 'Déposez votre capture ici ou cliquez pour importer',
  download: 'Télécharger en PNG',
  copy: 'Copier dans le presse-papiers',
  copied: 'Copié !',
},
```

- [ ] **Step 2: Add English translations**

In `src/i18n/en.ts`, add the matching keys:

```ts
// inside nav:
mockupGenerator: 'Mockup',

// inside home.tools:
mockupGenerator: { title: 'iPhone Mockup', desc: 'Drop your screenshot into an iPhone 15 frame.' },

// top-level:
mockupGenerator: {
  title: 'iPhone 15 Mockup',
  desc: 'Drop your screenshot into an iPhone 15 frame and export it in one click.',
  dropZone: 'Drop your screenshot here or click to upload',
  download: 'Download PNG',
  copy: 'Copy to clipboard',
  copied: 'Copied!',
},
```

- [ ] **Step 3: Verify type check**

```bash
rtk npm run build 2>&1 | head -30
```

Expected: no TypeScript errors about missing keys in `Messages` type.

- [ ] **Step 4: Commit**

```bash
rtk git add src/i18n/fr.ts src/i18n/en.ts
rtk git commit -m "feat: add mockupGenerator i18n keys (FR + EN)"
```

---

### Task 4: Implement `MockupGeneratorView.vue`

**Files:**
- Create: `src/views/MockupGeneratorView.vue`

- [ ] **Step 1: Create the view**

Create `src/views/MockupGeneratorView.vue`:

```vue
<template>
  <div>
    <router-link to="/" class="gi-back-link">{{ t('nav.back') }}</router-link>

    <div class="gi-tool-header">
      <h1>{{ t('mockupGenerator.title') }}</h1>
      <p>{{ t('mockupGenerator.desc') }}</p>
    </div>

    <!-- Drop zone -->
    <div
      class="gi-drop-zone"
      :class="{ 'gi-drop-zone--active': isDragging }"
      @click="triggerFileInput"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="onDrop"
    >
      <span class="gi-drop-icon">📱</span>
      <span class="gi-drop-label">{{ t('mockupGenerator.dropZone') }}</span>
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        class="gi-drop-input"
        @change="onFileChange"
      />
    </div>

    <!-- Preview -->
    <div v-if="canvas" class="gi-mockup-preview">
      <canvas ref="previewRef" />
    </div>

    <!-- Actions -->
    <div v-if="canvas" class="gi-mockup-actions">
      <button class="gi-btn" @click="download">{{ t('mockupGenerator.download') }}</button>
      <button class="gi-btn-ghost" @click="copyToClipboard">
        {{ copied ? t('mockupGenerator.copied') : t('mockupGenerator.copy') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { generateMockup } from '../composables/useMockupGenerator'

const { t } = useI18n()

const fileInputRef = ref<HTMLInputElement | null>(null)
const previewRef = ref<HTMLCanvasElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const isDragging = ref(false)
const copied = ref(false)

function triggerFileInput() {
  fileInputRef.value?.click()
}

async function loadFromFile(file: File) {
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.onload = async () => {
    canvas.value = await generateMockup(img)
    URL.revokeObjectURL(url)
  }
  img.src = url
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) loadFromFile(file)
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) loadFromFile(file)
}

// Mirror composited canvas into the <canvas> preview element
watch(canvas, async (c) => {
  if (!c) return
  await nextTick()
  const el = previewRef.value
  if (!el) return
  el.width = c.width
  el.height = c.height
  el.getContext('2d')!.drawImage(c, 0, 0)
})

function download() {
  if (!canvas.value) return
  canvas.value.toBlob((blob) => {
    if (!blob) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'mockup-iphone15.png'
    a.click()
    URL.revokeObjectURL(a.href)
  })
}

async function copyToClipboard() {
  if (!canvas.value) return
  try {
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.value!.toBlob((b) => (b ? resolve(b) : reject()))
    )
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // clipboard unavailable — silently ignore
  }
}
</script>

<style scoped>
.gi-back-link {
  display: inline-flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0.3rem 0.75rem;
  border: 1.5px solid var(--gi-border);
  border-radius: var(--gi-radius);
  font-size: 0.85rem;
  color: var(--gi-text-muted);
  text-decoration: none;
  transition: border-color 0.12s, color 0.12s;
}
.gi-back-link:hover { border-color: var(--gi-brand); color: var(--gi-brand); }

.gi-drop-zone {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem 2rem;
  border: 2px dashed var(--gi-border);
  border-radius: var(--gi-radius-lg);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.gi-drop-zone:hover,
.gi-drop-zone--active {
  border-color: var(--gi-brand);
  background: color-mix(in srgb, var(--gi-brand) 5%, transparent);
}
.gi-drop-icon { font-size: 2rem; }
.gi-drop-label { font-size: 0.95rem; color: var(--gi-text-muted); text-align: center; }
.gi-drop-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  display: none; /* triggered programmatically */
}

.gi-mockup-preview {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}
.gi-mockup-preview canvas {
  max-width: 320px;
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.gi-mockup-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1.5rem;
}
</style>
```

- [ ] **Step 2: Manual browser test**

With the dev server running, navigate to `http://localhost:5173/tools/#/mockup` (route added in Task 5 — do a quick manual test after Task 5 instead).

- [ ] **Step 3: Commit**

```bash
rtk git add src/views/MockupGeneratorView.vue
rtk git commit -m "feat: add MockupGeneratorView with drop zone, preview, download and clipboard"
```

---

### Task 5: Wire up routing, nav, and home grid

**Files:**
- Modify: `src/router/index.ts`
- Modify: `src/components/AppHeader.vue`
- Modify: `src/views/HomeView.vue`

- [ ] **Step 1: Add route**

In `src/router/index.ts`, add alongside the other tool routes:

```ts
{ path: '/mockup', component: () => import('../views/MockupGeneratorView.vue') },
```

- [ ] **Step 2: Add nav link**

In `src/components/AppHeader.vue`, add a nav link matching the existing pattern (inside the nav links section):

```html
<router-link to="/mockup">{{ t('nav.mockupGenerator') }}</router-link>
```

- [ ] **Step 3: Add to allTools array in HomeView**

In `src/views/HomeView.vue`, add to the `allTools` array:

```ts
{
  route: '/mockup',
  icon: '📱',
  titleKey: 'home.tools.mockupGenerator.title',
  descKey: 'home.tools.mockupGenerator.desc',
  category: 'design',
  isNew: true,
},
```

- [ ] **Step 4: Build to verify no errors**

```bash
rtk npm run build 2>&1 | tail -20
```

Expected: build succeeds with no errors.

- [ ] **Step 5: Manual end-to-end test**

Navigate to `http://localhost:5173/tools/`. Confirm:
- "Mockup" appears in the nav
- "iPhone Mockup" card appears in the Design category with a "New" badge
- Clicking the card opens the tool
- Dropping a screenshot produces a composited preview with the phone frame
- Download saves a PNG file
- Copy to clipboard works (paste into Figma or Slack to verify)

- [ ] **Step 6: Commit**

```bash
rtk git add src/router/index.ts src/components/AppHeader.vue src/views/HomeView.vue
rtk git commit -m "feat: register mockup generator route, nav link and home grid entry"
```

---

### Task 6: Run full test suite

**Files:** none

- [ ] **Step 1: Run tests**

```bash
rtk npm test 2>&1 | tail -20
```

Expected: 42 tests pass, 0 failures. (The new composable has no tests — canvas is a stub in jsdom.)

- [ ] **Step 2: If tests fail, fix before continuing**

Any failure here is a regression introduced during the implementation. Read the error message and fix the affected file before proceeding.
