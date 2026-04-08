<template>
  <ToolPageLayout
    :title="t('contrastChecker.title')"
    :description="t('contrastChecker.desc')"
    category="design"
  >
    <template #icon>
      <Contrast :size="24" />
    </template>

    <!-- Main Card with Preview & Controls -->
    <div class="contrast-card gi-card">
      <!-- Interactive Preview Area -->
      <div
        class="contrast-preview"
        :style="{ backgroundColor: bgHex, color: textHex }"
        role="img"
        :aria-label="t('contrastChecker.previewAria', { text: textHex, bg: bgHex, ratio: wcagRatio.toFixed(2) })"
      >
        <div class="contrast-preview-header">
          <div class="contrast-preview-label">
            {{ t('contrastChecker.preview') }}
            <select v-model="previewSize" class="contrast-preview-size-select" :aria-label="t('contrastChecker.previewSize')">
              <option value="small">{{ t('contrastChecker.sizes.small') }}</option>
              <option value="medium">{{ t('contrastChecker.sizes.medium') }}</option>
              <option value="large" selected>{{ t('contrastChecker.sizes.large') }}</option>
            </select>
          </div>
          <div class="contrast-ratio-badge" :class="{ 'contrast-ratio-pass': allWcagPass }">
            <span class="contrast-ratio-value">{{ wcagRatio.toFixed(2) }}:1</span>
          </div>
        </div>
        
        <div class="contrast-preview-content" :class="`contrast-preview-${previewSize}`">
          <div class="contrast-preview-heading">
            {{ t('contrastChecker.previewHeading') }}
          </div>
          <div class="contrast-preview-body">
            {{ t('contrastChecker.previewBody') }}
          </div>
          <div class="contrast-preview-small">
            {{ t('contrastChecker.previewSmall') }}
          </div>
        </div>
      </div>

      <!-- Color Controls -->
      <div class="contrast-controls">
        <!-- Text Color -->
        <div class="contrast-color-field">
          <label class="contrast-color-label" :for="'text-color-' + componentId">
            {{ t('contrastChecker.textColor') }}
          </label>
          <div class="contrast-color-input-group">
            <div class="contrast-color-swatch-wrapper">
              <button
                class="contrast-color-swatch-display"
                type="button"
                :style="{ backgroundColor: textHex }"
                :aria-label="t('contrastChecker.pickColor', { type: t('contrastChecker.text') })"
                @click="openNativeColorPicker('text')"
              >
                <Pipette v-if="hasEyeDropper" :size="16" class="contrast-eyedropper-icon" />
              </button>
              <input
                :id="'text-color-swatch-' + componentId"
                ref="textColorPicker"
                v-model="textHex"
                type="color"
                class="contrast-color-swatch-hidden"
              />
            </div>
            <input
              :id="'text-color-' + componentId"
              v-model="textHex"
              v-mask="'#HHHHHH'"
              type="text"
              class="gi-input contrast-hex-input"
              :placeholder="'#000000'"
              :aria-label="t('contrastChecker.textColorHex')"
              @input="validateTextHex"
            />
          </div>
          <span v-if="!textHexValid && textHex" class="contrast-color-error" role="alert">
            {{ t('contrastChecker.error.invalidHex') }}
          </span>
          
          <!-- Text color presets -->
          <div class="contrast-presets" role="group" :aria-label="t('contrastChecker.textPresets')">
            <div v-for="group in textColorPresetGroups" :key="group.label" class="contrast-preset-group">
              <span class="contrast-preset-group-label">{{ group.label }}</span>
              <div class="contrast-preset-row">
                <button
                  v-for="color in group.colors"
                  :key="color"
                  class="contrast-preset-btn"
                  :style="{ backgroundColor: color }"
                  :aria-label="t('contrastChecker.selectColor', { color })"
                  @click="textHex = color"
                ></button>
              </div>
            </div>
          </div>
        </div>

        <!-- Swap Button -->
        <button
          class="gi-btn-ghost contrast-swap-btn"
          :title="t('contrastChecker.swapColors')"
          :aria-label="t('contrastChecker.swapColors')"
          @click="swapColors"
        >
          <ArrowLeftRight :size="20" aria-hidden="true" />
        </button>

        <!-- Background Color -->
        <div class="contrast-color-field">
          <label class="contrast-color-label" :for="'bg-color-' + componentId">
            {{ t('contrastChecker.bgColor') }}
          </label>
          <div class="contrast-color-input-group">
            <div class="contrast-color-swatch-wrapper">
              <button
                class="contrast-color-swatch-display"
                type="button"
                :style="{ backgroundColor: bgHex }"
                :aria-label="t('contrastChecker.pickColor', { type: t('contrastChecker.background') })"
                @click="openNativeColorPicker('bg')"
              >
                <Pipette v-if="hasEyeDropper" :size="16" class="contrast-eyedropper-icon" />
              </button>
              <input
                :id="'bg-color-swatch-' + componentId"
                ref="bgColorPicker"
                v-model="bgHex"
                type="color"
                class="contrast-color-swatch-hidden"
              />
            </div>
            <input
              :id="'bg-color-' + componentId"
              v-model="bgHex"
              type="text"
              class="gi-input contrast-hex-input"
              :placeholder="'#FFFFFF'"
              :aria-label="t('contrastChecker.bgColorHex')"
              @input="validateBgHex"
            />
          </div>
          <span v-if="!bgHexValid && bgHex" class="contrast-color-error" role="alert">
            {{ t('contrastChecker.error.invalidHex') }}
          </span>
          
          <!-- Background color presets -->
          <div class="contrast-presets" role="group" :aria-label="t('contrastChecker.bgPresets')">
            <div v-for="group in bgColorPresetGroups" :key="group.label" class="contrast-preset-group">
              <span class="contrast-preset-group-label">{{ group.label }}</span>
              <div class="contrast-preset-row">
                <button
                  v-for="color in group.colors"
                  :key="color"
                  class="contrast-preset-btn"
                  :style="{ backgroundColor: color }"
                  :aria-label="t('contrastChecker.selectColor', { color })"
                  @click="bgHex = color"
                ></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Luminance Bar -->
      <div class="contrast-luminance">
        <div class="contrast-luminance-item">
          <span class="contrast-luminance-label">{{ t('contrastChecker.luminance.text') }}</span>
          <span class="contrast-luminance-value">{{ (textLuminance * 100).toFixed(1) }}%</span>
        </div>
        <div class="contrast-luminance-divider" aria-hidden="true"></div>
        <div class="contrast-luminance-item">
          <span class="contrast-luminance-label">{{ t('contrastChecker.luminance.background') }}</span>
          <span class="contrast-luminance-value">{{ (bgLuminance * 100).toFixed(1) }}%</span>
        </div>
      </div>

      <!-- Copy Actions -->
      <div class="contrast-actions">
        <button
          class="gi-btn gi-btn-secondary contrast-action-btn"
          :aria-label="t('contrastChecker.copyColors')"
          @click="copyColors"
        >
          <Copy :size="16" aria-hidden="true" />
          {{ t('contrastChecker.copyColors') }}
        </button>
        <button
          class="gi-btn gi-btn-secondary contrast-action-btn"
          :aria-label="t('contrastChecker.copyRatio')"
          @click="copyRatio"
        >
          <Copy :size="16" aria-hidden="true" />
          {{ t('contrastChecker.copyRatio') }}
        </button>
        <span v-if="copySuccess" class="contrast-copy-success" role="status">
          {{ t('contrastChecker.copied') }}
        </span>
      </div>
    </div>

    <!-- Results Section -->
    <div class="gi-grid contrast-results">
      <!-- WCAG 2.1 Results -->
      <div class="gi-card contrast-result-card" :class="{ 'contrast-result-pass': allWcagPass, 'contrast-result-fail': !allWcagPass }">
        <div class="contrast-result-header">
          <h3 class="gi-result-card-title">
            <CheckCircle2 v-if="allWcagPass" :size="20" class="contrast-result-icon" aria-hidden="true" />
            <AlertCircle v-else :size="20" class="contrast-result-icon" aria-hidden="true" />
            WCAG 2.1
            <span class="contrast-ratio-large">{{ wcagRatio.toFixed(2) }}:1</span>
          </h3>
        </div>

        <div class="contrast-checks">
          <div v-for="(level, key) in wcagChecks" :key="key" class="contrast-check-row">
            <span class="contrast-check-label">{{ level.label }}</span>
            <GiStatusBadge :variant="level.pass ? 'ok' : 'error'" showIcon>
              {{ level.pass ? t('contrastChecker.pass') : t('contrastChecker.fail') }}
            </GiStatusBadge>
          </div>
        </div>
        
        <!-- Pass summary -->
        <div class="contrast-result-summary" :class="{ 'contrast-summary-pass': allWcagPass }">
          <p v-if="allWcagPass" class="contrast-summary-text">
            <Check :size="16" aria-hidden="true" />
            {{ t('contrastChecker.summary.passAll') }}
          </p>
          <p v-else class="contrast-summary-text">
            <X :size="16" aria-hidden="true" />
            {{ t('contrastChecker.summary.someFail') }}
          </p>
        </div>
      </div>

      <!-- APCA Results -->
      <div class="gi-card contrast-result-card contrast-apca-card">
        <div class="contrast-result-header">
          <h3 class="gi-result-card-title">
            <Info :size="20" class="contrast-result-icon" aria-hidden="true" />
            APCA (WCAG 3.0)
            <span 
              class="contrast-ratio-large" 
              :class="{ 'contrast-ratio-pass': Math.abs(apcaScore) > 60 }"
            >
              Lc {{ Math.round(Math.abs(apcaScore)) }}
            </span>
          </h3>
        </div>

        <p class="contrast-apca-note">{{ t('contrastChecker.apca.note') }}</p>

        <!-- Contextual APCA guidance -->
        <div class="contrast-apca-guidance">
          <div class="contrast-apca-level" :class="{ 'contrast-apca-active': Math.abs(apcaScore) >= 90 }">
            <div class="contrast-apca-indicator">
              <span class="contrast-apca-score">Lc 90+</span>
              <Check v-if="Math.abs(apcaScore) >= 90" :size="16" aria-hidden="true" />
            </div>
            <span>{{ t('contrastChecker.apca.bodyPreferred') }}</span>
          </div>
          <div class="contrast-apca-level" :class="{ 'contrast-apca-active': Math.abs(apcaScore) >= 75 && Math.abs(apcaScore) < 90 }">
            <div class="contrast-apca-indicator">
              <span class="contrast-apca-score">Lc 75+</span>
              <Check v-if="Math.abs(apcaScore) >= 75 && Math.abs(apcaScore) < 90" :size="16" aria-hidden="true" />
            </div>
            <span>{{ t('contrastChecker.apca.bodyMinimum') }}</span>
          </div>
          <div class="contrast-apca-level" :class="{ 'contrast-apca-active': Math.abs(apcaScore) >= 60 && Math.abs(apcaScore) < 75 }">
            <div class="contrast-apca-indicator">
              <span class="contrast-apca-score">Lc 60+</span>
              <Check v-if="Math.abs(apcaScore) >= 60 && Math.abs(apcaScore) < 75" :size="16" aria-hidden="true" />
            </div>
            <span>{{ t('contrastChecker.apca.largeMinimum') }}</span>
          </div>
          <div class="contrast-apca-level" :class="{ 'contrast-apca-active': Math.abs(apcaScore) >= 45 && Math.abs(apcaScore) < 60 }">
            <div class="contrast-apca-indicator">
              <span class="contrast-apca-score">Lc 45+</span>
              <Check v-if="Math.abs(apcaScore) >= 45 && Math.abs(apcaScore) < 60" :size="16" aria-hidden="true" />
            </div>
            <span>{{ t('contrastChecker.apca.uiMinimum') }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #about>{{ t('contrastChecker.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ToolPageLayout from '../components/ToolPageLayout.vue'
import GiStatusBadge from '../components/GiStatusBadge.vue'
import {
  Contrast,
  ArrowLeftRight,
  Copy,
  CheckCircle2,
  AlertCircle,
  Check,
  X,
  Info,
  Pipette
} from 'lucide-vue-next'
import { getWcagContrast, getApcaContrast, meetsWcagLevel, getRelativeLuminance } from '../composables/useContrast'

const { t } = useI18n()

// Component ID for unique element IDs
const componentId = Math.random().toString(36).slice(2, 9)

// Color inputs
const textHex = ref('#0aaa8e')
const bgHex = ref('#ffffff')

// Preview size selection
const previewSize = ref<'small' | 'medium' | 'large'>('large')

// Color pickers refs
const textColorPicker = ref<HTMLInputElement | null>(null)
const bgColorPicker = ref<HTMLInputElement | null>(null)

// Validation
const textHexValid = computed(() => {
  return !textHex.value || /^#[0-9A-Fa-f]{6}$/.test(textHex.value)
})

const bgHexValid = computed(() => {
  return !bgHex.value || /^#[0-9A-Fa-f]{6}$/.test(bgHex.value)
})

// Contrast calculations
const wcagRatio = computed(() => {
  try {
    return getWcagContrast(textHex.value, bgHex.value)
  } catch {
    return 1
  }
})

const apcaScore = computed(() => {
  try {
    return getApcaContrast(textHex.value, bgHex.value)
  } catch {
    return 0
  }
})

const textLuminance = computed(() => getRelativeLuminance(textHex.value))
const bgLuminance = computed(() => getRelativeLuminance(bgHex.value))

// WCAG checks
const wcagChecks = computed(() => [
  { label: t('contrastChecker.levels.aaNormal'), pass: meetsWcagLevel(wcagRatio.value, 'AA_Normal') },
  { label: t('contrastChecker.levels.aaaNormal'), pass: meetsWcagLevel(wcagRatio.value, 'AAA_Normal') },
  { label: t('contrastChecker.levels.aaLarge'), pass: meetsWcagLevel(wcagRatio.value, 'AA_Large') },
  { label: t('contrastChecker.levels.aaaLarge'), pass: meetsWcagLevel(wcagRatio.value, 'AAA_Large') },
  { label: t('contrastChecker.levels.uiComponent'), pass: meetsWcagLevel(wcagRatio.value, 'UI_Component') },
])

const allWcagPass = computed(() => wcagChecks.value.every(check => check.pass))

// Copy functionality
const copySuccess = ref(false)

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    copySuccess.value = true
    setTimeout(() => { copySuccess.value = false }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

function copyColors() {
  const text = `Text: ${textHex.value}\nBackground: ${bgHex.value}`
  copyToClipboard(text)
}

function copyRatio() {
  const text = `WCAG 2.1 Contrast Ratio: ${wcagRatio.value.toFixed(2)}:1\nAPCA Lc: ${Math.round(Math.abs(apcaScore.value))}`
  copyToClipboard(text)
}

// Swap colors
function swapColors() {
  const temp = textHex.value
  textHex.value = bgHex.value
  bgHex.value = temp
}

// Validation handlers
function validateTextHex() {
  // Auto-format: add # if missing
  if (textHex.value && !textHex.value.startsWith('#')) {
    textHex.value = '#' + textHex.value
  }
}

function validateBgHex() {
  // Auto-format: add # if missing
  if (bgHex.value && !bgHex.value.startsWith('#')) {
    bgHex.value = '#' + bgHex.value
  }
}

// Open color picker
function openColorPicker(type: 'text' | 'bg') {
  if (type === 'text' && textColorPicker.value) {
    textColorPicker.value.click()
  } else if (type === 'bg' && bgColorPicker.value) {
    bgColorPicker.value.click()
  }
}

// Open native color picker with EyeDropper API
async function openNativeColorPicker(type: 'text' | 'bg') {
  // Try EyeDropper API first (Chrome/Edge)
  if (typeof window !== 'undefined' && 'EyeDropper' in window) {
    try {
      // @ts-ignore - EyeDropper is not in TypeScript DOM types yet
      const eyeDropper = new window.EyeDropper()
      const result = await eyeDropper.open()
      if (type === 'text') {
        textHex.value = result.sRGBHex
      } else {
        bgHex.value = result.sRGBHex
      }
      return
    } catch {
      // User cancelled, fall through to native picker
    }
  }

  // Fallback: trigger native color input
  openColorPicker(type)
}

// Check if EyeDropper API is available
const hasEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window

// Common color presets
interface ColorPresetGroup {
  label: string
  colors: string[]
}

const textColorPresetGroups: ColorPresetGroup[] = [
  { label: t('contrastChecker.presets.neutral'), colors: ['#000000', '#1a1a1a', '#333333', '#4a4a4a'] },
  { label: t('contrastChecker.presets.brand'), colors: ['#0aaa8e', '#2563eb', '#7c3aed'] },
  { label: t('contrastChecker.presets.alert'), colors: ['#dc2626', '#ea580c', '#ca8a04'] },
]

const bgColorPresetGroups: ColorPresetGroup[] = [
  { label: t('contrastChecker.presets.light'), colors: ['#ffffff', '#f8f9fa', '#f1f3f5', '#e9ecef'] },
  { label: t('contrastChecker.presets.neutral'), colors: ['#dee2e6', '#adb5bd', '#6c757d', '#495057'] },
  { label: t('contrastChecker.presets.dark'), colors: ['#1a1a1a', '#0aaa8e', '#2563eb'] },
]
</script>

<style scoped>
.contrast-card {
  margin-bottom: 2rem;
  padding: 0;
  overflow: hidden;
}

/* Preview Area */
.contrast-preview {
  padding: 2rem;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  transition: background 0.2s ease, color 0.2s ease;
  position: relative;
}

.contrast-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.contrast-preview-label {
  font-size: var(--gi-font-size-sm);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.contrast-preview-size-select {
  font-size: var(--gi-font-size-xs);
  padding: 0.25rem 0.5rem;
  border: 1px solid currentColor;
  border-radius: var(--gi-radius-sm);
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0.8;
}

.contrast-preview-size-select:hover {
  opacity: 1;
}

.contrast-ratio-badge {
  padding: 0.5rem 1rem;
  border-radius: var(--gi-radius-pill);
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  font-weight: 700;
  font-size: var(--gi-font-size-lg);
}

.contrast-ratio-value {
  font-family: 'SF Mono', 'Fira Code', monospace;
  letter-spacing: -0.02em;
}

.contrast-preview-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
}

.contrast-preview-large .contrast-preview-heading {
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.contrast-preview-large .contrast-preview-body {
  font-size: 1.125rem;
  line-height: 1.5;
  max-width: 600px;
}

.contrast-preview-large .contrast-preview-small {
  font-size: 0.875rem;
  opacity: 0.8;
}

.contrast-preview-medium .contrast-preview-heading {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 600;
}

.contrast-preview-medium .contrast-preview-body {
  font-size: 1rem;
}

.contrast-preview-medium .contrast-preview-small {
  font-size: 0.75rem;
}

.contrast-preview-small .contrast-preview-heading {
  font-size: clamp(1.25rem, 2.5vw, 1.5rem);
  font-weight: 600;
}

.contrast-preview-small .contrast-preview-body {
  font-size: 0.875rem;
}

.contrast-preview-small .contrast-preview-small {
  font-size: 0.75rem;
}

/* Controls */
.contrast-controls {
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  background: var(--gi-surface);
  border-top: 1px solid var(--gi-border);
}

.contrast-color-field {
  flex: 1;
  min-width: 0;
}

.contrast-color-label {
  display: block;
  font-size: var(--gi-font-size-sm);
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--gi-text);
}

.contrast-color-input-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.contrast-color-swatch-wrapper {
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
}

.contrast-color-swatch-hidden {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.contrast-color-swatch-display {
  width: 44px;
  height: 44px;
  border-radius: var(--gi-radius-md);
  border: 2px solid var(--gi-border);
  transition: border-color var(--gi-transition-fast);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.contrast-color-swatch-display:hover {
  border-color: var(--gi-brand);
}

.contrast-eyedropper-icon {
  color: white;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
  opacity: 0;
  transition: opacity var(--gi-transition-fast);
}

.contrast-color-swatch-display:hover .contrast-eyedropper-icon {
  opacity: 1;
}

.contrast-hex-input {
  flex: 1;
  min-width: 0;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: var(--gi-font-size-sm);
}

.contrast-swap-btn {
  padding: 0.5rem;
  border-radius: 50%;
  margin-top: 1.5rem;
  min-width: 44px;
  min-height: 44px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
}

.contrast-swap-btn:hover {
  background: var(--gi-tint-green-50);
  transform: rotate(180deg);
}

.contrast-swap-btn:active {
  transform: rotate(180deg) scale(0.95);
}

/* Presets */
.contrast-presets {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.contrast-preset-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.contrast-preset-group-label {
  font-size: var(--gi-font-size-xs);
  color: var(--gi-text-muted);
  font-weight: 500;
}

.contrast-preset-row {
  display: flex;
  gap: 0.375rem;
}

.contrast-preset-btn {
  width: 28px;
  height: 28px;
  border-radius: var(--gi-radius-sm);
  border: 2px solid var(--gi-border);
  cursor: pointer;
  transition: all var(--gi-transition-fast);
  padding: 0;
}

.contrast-preset-btn:hover {
  transform: scale(1.1);
  border-color: var(--gi-brand);
  box-shadow: var(--gi-shadow-sm);
}

.contrast-preset-btn:active {
  transform: scale(0.95);
}

/* Actions */
.contrast-actions {
  padding: 1rem 1.5rem;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  border-top: 1px solid var(--gi-border);
  background: var(--gi-surface);
}

.contrast-action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--gi-font-size-sm);
}

.contrast-copy-success {
  font-size: var(--gi-font-size-sm);
  color: var(--gi-tint-green-text);
  font-weight: 500;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Results */
.contrast-results {
  gap: 1rem;
}

.contrast-result-card {
  padding: 1.5rem;
  transition: all var(--gi-transition-base) var(--gi-ease-out);
}

.contrast-result-header {
  margin-bottom: 1.25rem;
}

.contrast-result-icon {
  margin-right: 0.5rem;
  vertical-align: middle;
}

.contrast-result-pass {
  border-left: 3px solid var(--gi-tint-green-text);
}

.contrast-result-fail {
  border-left: 3px solid var(--gi-error);
}

.contrast-ratio-large {
  font-size: 1.25rem;
  font-weight: 700;
  margin-left: 0.5rem;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.contrast-ratio-pass {
  color: var(--gi-tint-green-text);
}

/* WCAG Checks */
.contrast-checks {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.contrast-check-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--gi-border);
}

.contrast-check-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.contrast-check-label {
  font-size: var(--gi-font-size-sm);
}

/* Summary */
.contrast-result-summary {
  margin-top: 1.25rem;
  padding: 0.75rem;
  border-radius: var(--gi-radius-md);
  background: var(--gi-tint-green-50);
}

.contrast-summary-pass {
  background: var(--gi-tint-green-50);
}

.contrast-summary-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--gi-font-size-sm);
  font-weight: 500;
  color: var(--gi-tint-green-text);
  margin: 0;
}

.contrast-result-fail .contrast-result-summary {
  background: var(--gi-tint-red-50);
}

.contrast-result-fail .contrast-summary-text {
  color: var(--gi-error);
}

/* APCA */
.contrast-apca-note {
  font-size: var(--gi-font-size-xs);
  color: var(--gi-text-muted);
  margin-bottom: 1rem;
}

.contrast-apca-guidance {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.contrast-apca-level {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 0.75rem;
  border-radius: var(--gi-radius-md);
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-muted);
  transition: all var(--gi-transition-fast);
}

.contrast-apca-active {
  background: var(--gi-tint-green-50);
  color: var(--gi-tint-green-text);
  font-weight: 500;
}

.contrast-apca-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.contrast-apca-score {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-weight: 600;
}

/* Error States */
.contrast-color-error {
  font-size: var(--gi-font-size-xs);
  color: var(--gi-error);
  margin-top: var(--gi-space-xs);
}

/* Luminance Bar */
.contrast-luminance {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0.625rem 1.5rem;
  background: var(--gi-surface-elevated, var(--gi-surface));
  border-top: 1px solid var(--gi-border);
  border-bottom: 1px solid var(--gi-border);
  font-size: var(--gi-font-size-xs);
}

.contrast-luminance-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.contrast-luminance-label {
  color: var(--gi-text-muted);
}

.contrast-luminance-value {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-weight: 600;
  color: var(--gi-text);
}

.contrast-luminance-divider {
  width: 1px;
  height: 1rem;
  background: var(--gi-border);
}

/* Responsive */
@media (max-width: 640px) {
  .contrast-controls {
    flex-direction: column;
  }
  
  .contrast-swap-btn {
    align-self: center;
    margin: 0.5rem 0;
    transform: rotate(90deg);
  }
  
  .contrast-swap-btn:hover {
    transform: rotate(270deg);
  }
  
  .contrast-preview {
    padding: 1.5rem;
    min-height: 160px;
  }
  
  .contrast-preview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .contrast-actions {
    flex-wrap: wrap;
  }
  
  .contrast-result-card {
    padding: 1.25rem;
  }
}

@media (max-width: 480px) {
  .contrast-presets {
    gap: 0.25rem;
  }
  
  .contrast-preset-btn {
    width: 24px;
    height: 24px;
  }
}

/* Dark mode adjustments */
[data-theme="dark"] .contrast-ratio-badge {
  background: rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .contrast-apca-active {
  background: rgba(10, 170, 142, 0.15);
}
</style>
