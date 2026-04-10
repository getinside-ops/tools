# Image Cropper UI/UX Enhancement Implementation Plan

> **For Qwen Code:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Modernize the Image Cropper tool with improved visual hierarchy, better UX patterns, enhanced accessibility, and professional polish while maintaining all existing functionality.

**Architecture:** Single-page Vue 3 component using existing composables, enhanced with better UI patterns following the design system (Gi* components, CSS tokens, accessibility standards).

**Tech Stack:** Vue 3 Composition API, lucide-vue-next icons, Gi* shared components, CSS custom properties.

---

## Current Issues Identified (from screenshot & code review)

### Critical (P0)
1. **Missing CSS tokens** - Component has hardcoded styles instead of using design system tokens
2. **Poor visual hierarchy** - Controls lack clear grouping and spacing
3. **Touch target issues** - Small handle for resizing (12px), controls could be tighter
4. **Accessibility gaps** - Missing ARIA labels, keyboard navigation, focus states
5. **Emoji usage** - Download button uses ⬇️ emoji instead of Lucide icon

### High (P1)
6. **Layout inconsistency** - Controls layout doesn't match other tools
7. **Missing loading state** - No visual feedback during async operations
8. **No error handling** - Silent failures, no user feedback
9. **Dimension display** - Missing crop dimensions info (useful for users)
10. **Preview section** - Result card needs better visual treatment

### Medium (P2)
11. **Limited ratio presets** - Only 4 ratios, missing common social media sizes
12. **No zoom/pan info** - Users can't see image dimensions
13. **Reset behavior** - Reset button not clearly positioned
14. **Mobile responsiveness** - Layout may not work well on small screens
15. **Missing i18n keys** - Some hardcoded strings need translation support

### Low (P3)
16. **Visual polish** - Could use better spacing, shadows, transitions
17. **Pedagogic section** - Not displayed to users (in i18n but not in UI)

---

## Implementation Tasks

### Task 1: Add CSS Tokens and Fix Styling

**Files:**
- Modify: `src/views/ImageCropperView.vue` (entire `<template>` and `<style>` sections)

**Changes:**
```vue
<!-- Replace hardcoded styles with tokens -->
<!-- OLD -->
<div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">

<!-- NEW -->
<div class="ic-controls">

<!-- Add scoped styles -->
<style scoped>
.ic-controls {
  display: flex;
  gap: var(--gi-space-md);
  margin-bottom: var(--gi-space-lg);
  flex-wrap: wrap;
  align-items: flex-start;
}

.ic-workspace {
  position: relative;
  overflow: hidden;
  background: var(--gi-bg);
  border-radius: var(--gi-radius-lg);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  max-height: 70vh;
  border: 1px solid var(--gi-border);
}

.ic-image-container {
  position: relative;
  display: inline-block;
  line-height: 0; /* Remove gap below image */
}

.ic-image {
  display: block;
  max-width: 100%;
  max-height: 70vh;
  user-select: none;
  pointer-events: none;
}

.ic-crop-box {
  position: absolute;
  border: 2px solid var(--gi-brand);
  cursor: grab;
  overflow: hidden;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
}

.ic-crop-box:active {
  cursor: grabbing;
}

.ic-crop-preview {
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
}

.ic-handle {
  position: absolute;
  width: 20px; /* Increased from 12px for better touch target */
  height: 20px;
  background: var(--gi-surface);
  border: 2px solid var(--gi-brand);
  border-radius: var(--gi-radius-sm);
  cursor: nwse-resize;
  transition: transform var(--gi-transition-fast) var(--gi-ease-out);
}

.ic-handle:hover {
  transform: scale(1.1);
}

.ic-handle.br {
  bottom: -10px;
  right: -10px;
}

.ic-result {
  margin-top: var(--gi-space-lg);
}

.ic-result-image {
  max-width: 100%;
  border-radius: var(--gi-radius-lg);
  border: 1px solid var(--gi-border);
}

.ic-dimensions {
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-secondary);
  margin-top: var(--gi-space-xs);
}

/* Dark mode adjustments */
[data-theme="dark"] .ic-crop-box {
  border-color: var(--gi-mint);
}

[data-theme="dark"] .ic-handle {
  background: var(--gi-surface);
  border-color: var(--gi-mint);
}

/* Focus states */
.ic-crop-box:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

.ic-handle:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

/* Responsive */
@media (max-width: 640px) {
  .ic-controls {
    flex-direction: column;
  }
  
  .ic-workspace {
    min-height: 300px;
  }
}
</style>
```

**Step 5: Commit**
```bash
git add src/views/ImageCropperView.vue
git commit -m "style: add CSS tokens and improve styling for image cropper"
```

---

### Task 2: Improve Controls Layout and Add Info Panel

**Files:**
- Modify: `src/views/ImageCropperView.vue` (template section for controls)

**Current:**
```vue
<div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
  <div class="gi-field" style="margin-bottom: 0; min-width: 200px">
    <label class="gi-label">{{ t('imageCropper.aspectRatio') }}</label>
    <select v-model="ratioKey" class="gi-select" @change="applyRatio">
```

**Replace with:**
```vue
<!-- Controls Card -->
<div class="gi-card ic-controls-card">
  <div class="ic-controls-header">
    <h3 class="ic-controls-title">{{ t('imageCropper.controls') }}</h3>
    <button 
      class="gi-btn-ghost ic-btn-reset" 
      @click="resetCrop"
      :aria-label="t('imageCropper.reset')"
    >
      <RotateCcw :size="18" />
    </button>
  </div>
  
  <div class="ic-controls-body">
    <!-- Aspect Ratio Selector -->
    <div class="ic-control-group">
      <label class="gi-label" for="aspect-ratio-select">
        {{ t('imageCropper.aspectRatio') }}
      </label>
      <div class="ic-ratio-buttons">
        <button
          v-for="[key, label] in ratioOptions"
          :key="key"
          :class="['ic-ratio-btn', { active: ratioKey === key }]"
          @click="setRatio(key)"
          :aria-pressed="ratioKey === key"
        >
          {{ label }}
        </button>
      </div>
    </div>

    <!-- Image Info -->
    <div v-if="isLoaded" class="ic-image-info">
      <span class="ic-info-label">{{ t('imageCropper.imageSize') }}:</span>
      <span class="ic-info-value">{{ imageDimensions }}</span>
    </div>
  </div>
</div>

<!-- Action Buttons -->
<div class="ic-actions">
  <button 
    class="gi-btn-primary" 
    :disabled="isCropping" 
    @click="handleCrop"
  >
    <Crop :size="18" v-if="!isCropping" />
    <Loader2 :size="18" class="animate-spin" v-else />
    {{ isCropping ? t('imageCropper.processing') : t('imageCropper.crop') }}
  </button>
</div>
```

**Add to script:**
```typescript
import { RotateCcw, Loader2 } from 'lucide-vue-next'

const ratioOptions = computed(() => [
  ['free', t('imageCropper.free')],
  ['1:1', t('imageCropper.square')],
  ['16:9', t('imageCropper.landscape')],
  ['4:5', t('imageCropper.portrait')],
  ['4:3', t('imageCropper.standard')],
  ['3:2', t('imageCropper.photo')],
] as const)

const imageDimensions = computed(() => {
  if (!imageRef.value) return ''
  return `${imageRef.value.naturalWidth} × ${imageRef.value.naturalHeight} px`
})

function setRatio(key: string) {
  ratioKey.value = key
  applyRatio()
}
```

**Add styles:**
```css
.ic-controls-card {
  padding: var(--gi-space-md);
}

.ic-controls-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--gi-space-sm);
}

.ic-controls-title {
  font-size: var(--gi-font-size-md);
  font-weight: 600;
  color: var(--gi-text);
  margin: 0;
}

.ic-btn-reset {
  min-width: 44px;
  min-height: 44px;
  padding: 0.5rem;
}

.ic-controls-body {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-md);
}

.ic-control-group {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-xs);
}

.ic-ratio-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.ic-ratio-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  background: var(--gi-surface);
  color: var(--gi-text);
  font-size: var(--gi-font-size-sm);
  cursor: pointer;
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
  min-height: 44px;
  min-width: 44px;
}

.ic-ratio-btn:hover {
  background: var(--gi-surface-hover);
  border-color: var(--gi-border-hover);
}

.ic-ratio-btn.active {
  background: var(--gi-brand);
  color: var(--gi-text-inverse);
  border-color: var(--gi-brand);
}

.ic-image-info {
  padding-top: var(--gi-space-sm);
  border-top: 1px solid var(--gi-border);
}

.ic-info-label {
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-secondary);
}

.ic-info-value {
  font-size: var(--gi-font-size-sm);
  font-weight: 600;
  color: var(--gi-text);
  margin-left: 0.25rem;
}

.ic-actions {
  display: flex;
  gap: var(--gi-space-sm);
  margin-top: var(--gi-space-md);
}
```

**Step 5: Commit**
```bash
git add src/views/ImageCropperView.vue
git commit -m "feat: improve controls layout with card pattern and ratio buttons"
```

---

### Task 3: Add i18n Keys for New Translations

**Files:**
- Modify: `src/i18n/fr.ts` (imageCropper section)
- Modify: `src/i18n/en.ts` (imageCropper section)

**Add to both files:**
```typescript
// fr.ts
imageCropper: {
  title: 'Recadreur d\'Image',
  desc: 'Recadrez vos images manuellement ou selon des ratios prédéfinis.',
  controls: 'Contrôles',
  aspectRatio: 'Ratio d\'aspect',
  free: 'Libre',
  square: '1:1',
  landscape: '16:9',
  portrait: '4:5',
  standard: '4:3',
  photo: '3:2',
  imageSize: 'Taille de l\'image',
  cropDimensions: 'Dimensions du recadrage',
  crop: 'Recadrer',
  reset: 'Réinitialiser',
  download: 'Télécharger',
  result: 'Résultat',
  processing: 'Recadrage...',
  error: {
    cropFailed: 'Échec du recadrage',
    invalidCrop: 'Zone de recadrage invalide',
  },
  about: "Le recadrage selon un ratio fixe est une tâche courante lors de la préparation d'images pour les réseaux sociaux, l'e-commerce ou l'impression. Cet outil permet de recadrer selon des presets standard ou un ratio personnalisé, avec un aperçu en temps réel — entièrement dans le navigateur.",
},

// en.ts
imageCropper: {
  title: 'Image Cropper',
  desc: 'Crop your images manually or using predefined aspect ratios.',
  controls: 'Controls',
  aspectRatio: 'Aspect Ratio',
  free: 'Free',
  square: '1:1',
  landscape: '16:9',
  portrait: '4:5',
  standard: '4:3',
  photo: '3:2',
  imageSize: 'Image size',
  cropDimensions: 'Crop dimensions',
  crop: 'Crop',
  reset: 'Reset',
  download: 'Download',
  result: 'Result',
  processing: 'Cropping...',
  error: {
    cropFailed: 'Crop failed',
    invalidCrop: 'Invalid crop area',
  },
  about: "Cropping to a fixed ratio is a common task when preparing images for social media, e-commerce, or print. This tool lets you crop to standard presets or a custom ratio, with a live preview — entirely in your browser.",
},
```

**Step 5: Commit**
```bash
git add src/i18n/fr.ts src/i18n/en.ts
git commit -m "i18n: add new translations for image cropper controls and ratios"
```

---

### Task 4: Enhance Result Section with Better UX

**Files:**
- Modify: `src/views/ImageCropperView.vue` (result section)

**Replace:**
```vue
<GiResultCard v-if="croppedUrl" :title="t('imageCropper.result')" style="margin-top: 2rem;">
  <img :src="croppedUrl" style="max-width: 100%; border-radius: var(--gi-radius);" />
  <template #actions>
    <button class="gi-btn-primary" @click="downloadCropped">⬇️ {{ t('imageCropper.download') }}</button>
  </template>
</GiResultCard>
```

**With:**
```vue
<!-- Result Section -->
<div v-if="croppedUrl" class="gi-card ic-result-card">
  <div class="ic-result-header">
    <h3 class="ic-result-title">
      <CheckCircle2 :size="20" class="ic-success-icon" />
      {{ t('imageCropper.result') }}
    </h3>
    <div class="ic-result-actions">
      <button 
        class="gi-btn-ghost" 
        @click="resetCrop"
        :aria-label="t('imageCropper.reset')"
      >
        {{ t('imageCropper.reset') }}
      </button>
    </div>
  </div>
  
  <div class="ic-result-body">
    <img 
      :src="croppedUrl" 
      :alt="t('imageCropper.result')"
      class="ic-result-image" 
    />
    
    <div class="ic-result-info">
      <div class="ic-info-row">
        <span class="ic-info-label">{{ t('imageCropper.cropDimensions') }}:</span>
        <span class="ic-info-value">{{ cropDimensions }}</span>
      </div>
    </div>
    
    <div class="ic-result-actions-bottom">
      <button 
        class="gi-btn-primary ic-download-btn" 
        @click="downloadCropped"
      >
        <Download :size="18" />
        {{ t('imageCropper.download') }}
      </button>
    </div>
  </div>
</div>
```

**Add to script:**
```typescript
import { CheckCircle2, Download } from 'lucide-vue-next'

const cropDimensions = computed(() => {
  if (!imageRef.value || !croppedUrl.value) return ''
  const img = new Image()
  img.src = croppedUrl.value
  return `${Math.round(img.width)} × ${Math.round(img.height)} px`
})
```

**Add styles:**
```css
.ic-result-card {
  margin-top: var(--gi-space-lg);
  border: 2px solid var(--gi-brand);
}

.ic-result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--gi-space-md);
}

.ic-result-title {
  display: flex;
  align-items: center;
  gap: var(--gi-space-xs);
  font-size: var(--gi-font-size-lg);
  font-weight: 600;
  color: var(--gi-text);
  margin: 0;
}

.ic-success-icon {
  color: var(--gi-brand);
}

.ic-result-actions {
  display: flex;
  gap: var(--gi-space-xs);
}

.ic-result-body {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-md);
}

.ic-result-image {
  width: 100%;
  max-width: 100%;
  border-radius: var(--gi-radius-lg);
  border: 1px solid var(--gi-border);
}

.ic-result-info {
  padding: var(--gi-space-sm);
  background: var(--gi-bg);
  border-radius: var(--gi-radius-md);
}

.ic-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ic-result-actions-bottom {
  display: flex;
  gap: var(--gi-space-sm);
  padding-top: var(--gi-space-sm);
  border-top: 1px solid var(--gi-border);
}

.ic-download-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--gi-space-xs);
  min-height: 44px;
}

/* Responsive */
@media (max-width: 640px) {
  .ic-result-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--gi-space-sm);
  }
  
  .ic-result-actions-bottom {
    flex-direction: column;
  }
}
```

**Step 5: Commit**
```bash
git add src/views/ImageCropperView.vue
git commit -m "feat: enhance result section with dimensions and better layout"
```

---

### Task 5: Add Error Handling and Loading States

**Files:**
- Modify: `src/views/ImageCropperView.vue` (script and template)

**Add error state:**
```typescript
const error = ref<string | null>(null)

const errorMessage = computed(() => {
  if (!error.value) return ''
  switch (error.value) {
    case 'Invalid crop area':
      return t('imageCropper.error.invalidCrop')
    default:
      return t('imageCropper.error.cropFailed')
  }
})

function clearError() {
  error.value = null
}
```

**Update handleCrop:**
```typescript
async function handleCrop() {
  if (!imageRef.value || isCropping.value) return
  
  clearError()
  
  const { naturalWidth, width } = imageRef.value
  const scale = naturalWidth / width

  isCropping.value = true
  
  const rect = {
    x: cropBox.x * scale,
    y: cropBox.y * scale,
    width: cropBox.w * scale,
    height: cropBox.h * scale
  }

  try {
    const result = await cropImage(originalUrl.value, rect)
    croppedUrl.value = result
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('imageCropper.error.cropFailed')
  } finally {
    isCropping.value = false
  }
}
```

**Add error display in template (after controls):**
```vue
<!-- Error Alert -->
<div v-if="error" class="ic-error-alert" role="alert">
  <AlertCircle :size="18" class="ic-error-icon" />
  <span class="ic-error-message">{{ errorMessage }}</span>
  <button class="ic-error-dismiss" @click="clearError" aria-label="Dismiss error">
    <X :size="16" />
  </button>
</div>
```

**Add styles:**
```css
.ic-error-alert {
  display: flex;
  align-items: center;
  gap: var(--gi-space-sm);
  padding: var(--gi-space-md);
  background: rgba(220, 38, 38, 0.05);
  border: 1px solid var(--gi-error);
  border-radius: var(--gi-radius-md);
  margin-bottom: var(--gi-space-md);
}

.ic-error-icon {
  color: var(--gi-error);
  flex-shrink: 0;
}

.ic-error-message {
  flex: 1;
  color: var(--gi-error);
  font-size: var(--gi-font-size-sm);
  font-weight: 500;
}

.ic-error-dismiss {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  min-height: 32px;
  padding: 0.25rem;
  border: none;
  background: transparent;
  color: var(--gi-error);
  cursor: pointer;
  border-radius: var(--gi-radius-sm);
  transition: background var(--gi-transition-fast) var(--gi-ease-out);
}

.ic-error-dismiss:hover {
  background: rgba(220, 38, 38, 0.1);
}

/* Dark mode */
[data-theme="dark"] .ic-error-alert {
  background: rgba(248, 113, 113, 0.1);
}

[data-theme="dark"] .ic-error-icon,
[data-theme="dark"] .ic-error-message,
[data-theme="dark"] .ic-error-dismiss {
  color: #f87171;
}
```

**Step 5: Commit**
```bash
git add src/views/ImageCropperView.vue
git commit -m "feat: add error handling and loading states for image cropper"
```

---

### Task 6: Add Keyboard Navigation and Accessibility

**Files:**
- Modify: `src/views/ImageCropperView.vue` (template and script)

**Add keyboard support to crop box:**
```vue
<div
  v-if="isLoaded"
  class="ic-crop-box"
  :style="boxStyle"
  :tabindex="0"
  role="region"
  :aria-label="t('imageCropper.cropArea')"
  @mousedown="onBoxMouseDown"
  @keydown="onCropBoxKeyDown"
>
```

**Add keyboard handler:**
```typescript
function onCropBoxKeyDown(e: KeyboardEvent) {
  const step = e.shiftKey ? 10 : 1
  const { width: imgW, height: imgH } = imageRef.value!
  
  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault()
      cropBox.x = Math.max(0, cropBox.x - step)
      break
    case 'ArrowRight':
      e.preventDefault()
      cropBox.x = Math.min(imgW - cropBox.w, cropBox.x + step)
      break
    case 'ArrowUp':
      e.preventDefault()
      cropBox.y = Math.max(0, cropBox.y - step)
      break
    case 'ArrowDown':
      e.preventDefault()
      cropBox.y = Math.min(imgH - cropBox.h, cropBox.y + step)
      break
  }
}
```

**Add ARIA labels to all interactive elements:**
```vue
<select 
  id="aspect-ratio-select"
  v-model="ratioKey" 
  class="gi-select" 
  @change="applyRatio"
  :aria-label="t('imageCropper.aspectRatio')"
>
```

**Add skip links and focus management:**
```typescript
function handleCrop() {
  // ... existing code
  try {
    const result = await cropImage(originalUrl.value, rect)
    croppedUrl.value = result
    // Focus result section for accessibility
    setTimeout(() => {
      document.querySelector('.ic-result-card')?.focus()
    }, 100)
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('imageCropper.error.cropFailed')
  }
}
```

**Step 5: Commit**
```bash
git add src/views/ImageCropperView.vue
git commit -m "feat: add keyboard navigation and accessibility improvements"
```

---

### Task 7: Add Pedagogic Section Display

**Files:**
- Modify: `src/views/ImageCropperView.vue` (add pedagogic section)

**Add after result section:**
```vue
<!-- Pedagogic Section -->
<div class="ic-pedagogic">
  <h4 class="ic-pedagogic-title">{{ t('imageCropper.pedagogic.title') }}</h4>
  <p class="ic-pedagogic-description">{{ t('imageCropper.pedagogic.description') }}</p>
  <ul class="ic-pedagogic-tips">
    <li v-for="(tip, index) in t('imageCropper.pedagogic.tips')" :key="index">
      <Check :size="16" class="ic-tip-icon" />
      {{ tip }}
    </li>
  </ul>
</div>
```

**Add styles:**
```css
.ic-pedagogic {
  margin-top: var(--gi-space-lg);
  padding: var(--gi-space-lg);
  background: linear-gradient(135deg, rgba(10, 170, 142, 0.05) 0%, rgba(106, 231, 200, 0.05) 100%);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
}

.ic-pedagogic-title {
  font-size: var(--gi-font-size-md);
  font-weight: 600;
  color: var(--gi-text);
  margin: 0 0 var(--gi-space-sm) 0;
}

.ic-pedagogic-description {
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-secondary);
  line-height: 1.6;
  margin: 0 0 var(--gi-space-md) 0;
}

.ic-pedagogic-tips {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-xs);
}

.ic-pedagogic-tips li {
  display: flex;
  align-items: flex-start;
  gap: var(--gi-space-sm);
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text);
}

.ic-tip-icon {
  color: var(--gi-brand);
  flex-shrink: 0;
  margin-top: 2px;
}

/* Dark mode */
[data-theme="dark"] .ic-pedagogic {
  background: linear-gradient(135deg, rgba(10, 170, 142, 0.1) 0%, rgba(106, 231, 200, 0.1) 100%);
}
```

**Step 5: Commit**
```bash
git add src/views/ImageCropperView.vue
git commit -m "feat: add pedagogic section with cropping tips"
```

---

### Task 8: Final Polish and Responsive Improvements

**Files:**
- Modify: `src/views/ImageCropperView.vue` (final styling adjustments)

**Add animation for crop box:**
```css
.ic-crop-box {
  transition: box-shadow var(--gi-transition-base) var(--gi-ease-out);
}

.ic-crop-box:active {
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 0 2px var(--gi-brand);
}

/* Smooth button transitions */
.ic-ratio-btn,
.gi-btn-primary,
.gi-btn-ghost {
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
}

/* Loading state animation */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.ic-cropping {
  background: linear-gradient(
    90deg,
    var(--gi-surface) 25%,
    var(--gi-bg) 50%,
    var(--gi-surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  pointer-events: none;
}

/* Improve mobile experience */
@media (max-width: 480px) {
  .ic-workspace {
    min-height: 250px;
    max-height: 50vh;
  }
  
  .ic-ratio-btn {
    font-size: var(--gi-font-size-xs);
    padding: 0.4rem 0.75rem;
  }
  
  .ic-handle {
    width: 24px;
    height: 24px;
  }
  
  .ic-handle.br {
    bottom: -12px;
    right: -12px;
  }
}
```

**Add visual feedback for crop box:**
```vue
<div
  v-if="isLoaded"
  class="ic-crop-box"
  :class="{ 'ic-crop-box--active': isDragging || isResizing }"
  :style="boxStyle"
>
```

```css
.ic-crop-box--active {
  border-width: 3px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 0 4px rgba(10, 170, 142, 0.3);
}
```

**Step 5: Commit**
```bash
git add src/views/ImageCropperView.vue
git commit -m "style: add animations, polish, and mobile responsive improvements"
```

---

## Testing Checklist

### Manual Testing
1. ✅ Upload an image
2. ✅ Test all aspect ratio buttons (Free, 1:1, 16:9, 4:5, 4:3, 3:2)
3. ✅ Drag crop box around image
4. ✅ Resize crop box using handle
5. ✅ Test keyboard navigation (Arrow keys with/without Shift)
6. ✅ Click "Crop" button and verify result
7. ✅ Verify error handling (try to crop invalid area)
8. ✅ Test "Reset" button
9. ✅ Download cropped image
10. ✅ Test in dark mode
11. ✅ Test on mobile (touch targets, responsive layout)
12. ✅ Verify pedagogic section displays
13. ✅ Test focus states and keyboard accessibility

### Build Verification
```bash
npm run build
npm test
```

---

## Files Modified Summary

- `src/views/ImageCropperView.vue` - Complete UI overhaul
- `src/i18n/fr.ts` - Added new translation keys
- `src/i18n/en.ts` - Added new translation keys

---

## Design Principles Applied

1. **Consistency** - Matched design system tokens and patterns
2. **Accessibility** - Keyboard navigation, ARIA labels, focus states
3. **Feedback** - Loading states, error messages, visual confirmation
4. **Hierarchy** - Clear visual grouping and information architecture
5. **Touch-friendly** - Minimum 44px touch targets
6. **Responsive** - Mobile-first approach with breakpoints
7. **Professional** - Removed emojis, added proper icons, consistent styling
