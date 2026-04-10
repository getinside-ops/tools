# Image Cropper - Advanced Improvements Plan

> **For Qwen Code:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Add manual dimension inputs, crop position display, zoom level indicator, and improve overall UX with better feedback and controls.

**Architecture:** Vue 3 component enhancements with reactive dimension tracking, input fields for precise control, and improved visual feedback.

**Tech Stack:** Vue 3 Composition API, lucide-vue-next icons, CSS custom properties.

---

## Improvements to Implement

### 1. Manual Dimension Inputs (HIGH PRIORITY)
**User can type exact width/height for crop area**
- Two number inputs: Width (px) and Height (px)
- Auto-calculates based on selected ratio
- Maintains ratio when one dimension changes (if ratio locked)
- Validates against image bounds
- Shows current dimensions in real-time

### 2. Crop Position Display
**Show current crop box coordinates**
- Display X, Y position of crop box
- Updates in real-time as user drags
- Helps with precise positioning

### 3. Zoom Level Indicator
**Show how much the image is zoomed**
- Display zoom percentage (e.g., "75%")
- Helps users understand scale

### 4. Reset Dimensions Button
**Quick reset to full image size**
- One-click to reset crop to full image
- Respects selected ratio

### 5. Crop Preview Tooltip
**Show dimensions while dragging**
- Floating badge showing W × H
- Appears during drag/resize operations
- Disappears after interaction ends

### 6. Improved Ratio Buttons
**Add more common ratios**
- Add 9:16 (vertical video)
- Add 3:4 (Facebook post)
- Show ratio description on hover

### 7. Better Empty State
**Guidance when no image uploaded**
- Illustration or icon
- Clear instructions
- "Supported formats: JPG, PNG, WebP"

---

## Implementation Tasks

### Task 1: Add Manual Dimension Inputs
- Create width/height input fields in controls card
- Bind to cropBox dimensions with validation
- Auto-adjust based on selected ratio
- Add i18n keys for labels

### Task 2: Add Crop Position Display  
- Show X, Y coordinates in info section
- Update reactively as crop box moves
- Add i18n translations

### Task 3: Add Zoom Level & Reset Button
- Calculate zoom percentage
- Add reset button in controls header
- Add i18n keys

### Task 4: Add Crop Preview Tooltip
- Floating badge during drag/resize
- Shows W × H dimensions
- Smooth fade in/out animation

### Task 5: Improve Ratio Buttons
- Add 9:16 and 3:4 ratios
- Add tooltip descriptions
- Update i18n

### Task 6: Final Polish
- Review all interactions
- Verify dark mode
- Test responsive behavior
- Build verification

---

## Files to Modify

- `src/views/ImageCropperView.vue` - Main implementation
- `src/i18n/fr.ts` - French translations
- `src/i18n/en.ts` - English translations
