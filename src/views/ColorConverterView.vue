<template>
  <ToolPageLayout
    :title="t('colorConverter.title')"
    :description="t('colorConverter.desc')"
    category="design"
  >
    <template #icon>
      <Palette />
    </template>

    <!-- Input Section -->
    <div class="cc-input-card gi-card" style="margin-bottom: var(--gi-space-xl);">
      <div class="cc-input-row">
        <!-- Color Swatch Button -->
        <button
          class="cc-swatch-btn"
          :style="{ backgroundColor: hex }"
          :aria-label="t('colorConverter.inputLabel')"
          @click="openColorPicker"
        >
          <input ref="colorPickerRef" type="color" class="cc-native-picker" :value="hex" @input="onNativePick" />
        </button>

        <!-- HEX Text Input -->
        <div class="cc-hex-input-wrap">
          <GiFormField :label="t('colorConverter.hex')" style="margin-bottom: 0;">
            <template #input>
              <input
                v-model="hexInput"
                type="text"
                class="gi-input cc-hex-input"
                :placeholder="t('colorConverter.hexPlaceholder')"
                @input="onHexInput"
                @blur="onHexBlur"
              />
            </template>
          </GiFormField>
        </div>

        <!-- Random Button -->
        <button
          class="gi-btn-ghost cc-random-btn"
          :aria-label="t('colorConverter.randomColor')"
          @click="randomColor"
        >
          <Shuffle :size="16" />
          <span class="cc-random-label">{{ t('colorConverter.randomColor') }}</span>
        </button>
      </div>

      <!-- RGB + HSL Quick Adjust -->
      <div class="cc-adjust-row">
        <!-- RGB -->
        <div class="cc-adjust-group">
          <span class="cc-adjust-label">{{ t('colorConverter.rgb') }}</span>
          <div class="cc-adjust-inputs">
            <div class="cc-adjust-field">
              <label :for="rgbRId" class="cc-field-label">{{ t('colorConverter.rLabel') }}</label>
              <input
                :id="rgbRId"
                v-model.number="rgb.r"
                type="number"
                class="gi-input cc-field-input"
                min="0"
                max="255"
                @input="updateFromRgb"
                @blur="clampRgb('r')"
              />
            </div>
            <div class="cc-adjust-field">
              <label :for="rgbGId" class="cc-field-label">{{ t('colorConverter.gLabel') }}</label>
              <input
                :id="rgbGId"
                v-model.number="rgb.g"
                type="number"
                class="gi-input cc-field-input"
                min="0"
                max="255"
                @input="updateFromRgb"
                @blur="clampRgb('g')"
              />
            </div>
            <div class="cc-adjust-field">
              <label :for="rgbBId" class="cc-field-label">{{ t('colorConverter.bLabel') }}</label>
              <input
                :id="rgbBId"
                v-model.number="rgb.b"
                type="number"
                class="gi-input cc-field-input"
                min="0"
                max="255"
                @input="updateFromRgb"
                @blur="clampRgb('b')"
              />
            </div>
          </div>
        </div>

        <!-- HSL -->
        <div class="cc-adjust-group">
          <span class="cc-adjust-label">{{ t('colorConverter.hsl') }}</span>
          <div class="cc-adjust-inputs">
            <div class="cc-adjust-field">
              <label :for="hslHId" class="cc-field-label">{{ t('colorConverter.hLabel') }}</label>
              <input
                :id="hslHId"
                v-model.number="hsl.h"
                type="number"
                class="gi-input cc-field-input"
                min="0"
                max="360"
                @input="updateFromHsl"
                @blur="clampHsl('h')"
              />
            </div>
            <div class="cc-adjust-field">
              <label :for="hslSId" class="cc-field-label">{{ t('colorConverter.sLabel') }}</label>
              <input
                :id="hslSId"
                v-model.number="hsl.s"
                type="number"
                class="gi-input cc-field-input"
                min="0"
                max="100"
                @input="updateFromHsl"
                @blur="clampHsl('s')"
              />
            </div>
            <div class="cc-adjust-field">
              <label :for="hslLId" class="cc-field-label">{{ t('colorConverter.lLabel') }}</label>
              <input
                :id="hslLId"
                v-model.number="hsl.l"
                type="number"
                class="gi-input cc-field-input"
                min="0"
                max="100"
                @input="updateFromHsl"
                @blur="clampHsl('l')"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Readability / Contrast Preview -->
    <div class="cc-contrast-card gi-card" style="margin-bottom: var(--gi-space-xl);">
      <h3 class="cc-section-title">{{ t('colorConverter.contrast') }}</h3>
      <div class="cc-contrast-row">
        <div class="cc-contrast-swatch" style="background: #fff;">
          <span :style="{ color: hex }">Aa</span>
          <span class="cc-contrast-label">{{ t('colorConverter.onWhite') }}</span>
        </div>
        <div class="cc-contrast-swatch" style="background: #000;">
          <span :style="{ color: hex }">Aa</span>
          <span class="cc-contrast-label">{{ t('colorConverter.onBlack') }}</span>
        </div>
      </div>
    </div>

    <!-- Results: Web & Screen -->
    <div class="cc-results-section">
      <h3 class="cc-section-title">{{ t('colorConverter.webSection') }}</h3>
      <div class="gi-grid">
        <div
          v-for="fmt in webFormats"
          :key="fmt.label"
          class="cc-result-card gi-card"
          :class="{ 'cc-result-card--flash': flashLabel === fmt.label }"
          :tabindex="0"
          role="button"
          :aria-label="`${fmt.value} — ${t('colorConverter.clickToCopy')}`"
          @click="copy(fmt.value, fmt.label)"
          @keydown.enter="copy(fmt.value, fmt.label)"
          @keydown.space.prevent="copy(fmt.value, fmt.label)"
        >
          <div class="cc-result-header">
            <div class="cc-result-swatch" :style="{ backgroundColor: fmt.swatchColor || hex }"></div>
            <span class="cc-result-label">{{ fmt.label }}</span>
          </div>
          <div class="cc-result-value">{{ fmt.value }}</div>
          <div class="cc-result-action">
            {{ flashLabel === fmt.label ? t('colorConverter.copied') : t('colorConverter.copy') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Results: Print -->
    <div class="cc-results-section">
      <h3 class="cc-section-title">{{ t('colorConverter.printSection') }}</h3>
      <div class="gi-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
        <div
          class="cc-result-card gi-card"
          :class="{ 'cc-result-card--flash': flashLabel === 'CMYK' }"
          :tabindex="0"
          role="button"
          :aria-label="`${cmykFormat.value} — ${t('colorConverter.clickToCopy')}`"
          @click="copy(cmykFormat.value, 'CMYK')"
          @keydown.enter="copy(cmykFormat.value, 'CMYK')"
          @keydown.space.prevent="copy(cmykFormat.value, 'CMYK')"
        >
          <div class="cc-result-header">
            <div class="cc-result-swatch" :style="{ backgroundColor: hex }"></div>
            <span class="cc-result-label">{{ cmykFormat.label }}</span>
          </div>
          <div class="cc-result-value">{{ cmykFormat.value }}</div>
          <div class="cc-result-action">
            {{ flashLabel === 'CMYK' ? t('colorConverter.copied') : t('colorConverter.copy') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Results: Advanced -->
    <div class="cc-results-section">
      <h3 class="cc-section-title">{{ t('colorConverter.advancedSection') }}</h3>
      <div class="gi-grid">
        <div
          v-for="fmt in advancedFormats"
          :key="fmt.label"
          class="cc-result-card gi-card"
          :class="{ 'cc-result-card--flash': flashLabel === fmt.label }"
          :tabindex="0"
          role="button"
          :aria-label="`${fmt.value} — ${t('colorConverter.clickToCopy')}`"
          @click="copy(fmt.value, fmt.label)"
          @keydown.enter="copy(fmt.value, fmt.label)"
          @keydown.space.prevent="copy(fmt.value, fmt.label)"
        >
          <div class="cc-result-header">
            <div class="cc-result-swatch" :style="{ backgroundColor: hex }"></div>
            <span class="cc-result-label">{{ fmt.label }}</span>
          </div>
          <div class="cc-result-value">{{ fmt.value }}</div>
          <div class="cc-result-action">
            {{ flashLabel === fmt.label ? t('colorConverter.copied') : t('colorConverter.copy') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Harmony Palette -->
    <div class="cc-harmony-section" style="margin-top: var(--gi-space-xl);">
      <h3 class="cc-section-title">{{ t('colorConverter.harmony') }}</h3>
      <div class="cc-harmony-row">
        <div class="cc-harmony-group">
          <span class="cc-harmony-label">{{ t('colorConverter.complementary') }}</span>
          <div class="cc-harmony-swatches">
            <button
              v-for="(c, i) in complementaryColors"
              :key="'comp-' + i"
              class="cc-harmony-swatch"
              :style="{ backgroundColor: c }"
              :aria-label="c"
              @click="hex = c; syncFromHex()"
            ></button>
          </div>
        </div>
        <div class="cc-harmony-group">
          <span class="cc-harmony-label">{{ t('colorConverter.analogous') }}</span>
          <div class="cc-harmony-swatches">
            <button
              v-for="(c, i) in analogousColors"
              :key="'ana-' + i"
              class="cc-harmony-swatch"
              :style="{ backgroundColor: c }"
              :aria-label="c"
              @click="hex = c; syncFromHex()"
            ></button>
          </div>
        </div>
      </div>
    </div>

    <template #about>{{ t('colorConverter.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Palette, Shuffle } from 'lucide-vue-next'
import ToolPageLayout from '../components/ToolPageLayout.vue'
import GiFormField from '../components/GiFormField.vue'
import {
  hexToRgb, rgbToHex, rgbToHsl, hslToRgb, rgbToCmyk,
  rgbToOklch, rgbToLab, rgbToLch
} from '../composables/useColorConverter'

const { t } = useI18n()

// Unique IDs for labels
const rgbRId = `cc-rgb-r-${Math.random().toString(36).slice(2, 9)}`
const rgbGId = `cc-rgb-g-${Math.random().toString(36).slice(2, 9)}`
const rgbBId = `cc-rgb-b-${Math.random().toString(36).slice(2, 9)}`
const hslHId = `cc-hsl-h-${Math.random().toString(36).slice(2, 9)}`
const hslSId = `cc-hsl-s-${Math.random().toString(36).slice(2, 9)}`
const hslLId = `cc-hsl-l-${Math.random().toString(36).slice(2, 9)}`

const colorPickerRef = ref<HTMLInputElement | null>(null)
const hex = ref('#0aaa8e')
const hexInput = ref('#0aaa8e')
const rgb = ref({ r: 10, g: 170, b: 142 })
const hsl = ref({ h: 169, s: 89, l: 35 })
const flashLabel = ref('')

function syncFromHex() {
  const converted = hexToRgb(hex.value)
  if (converted) {
    rgb.value = converted
    hsl.value = rgbToHsl(rgb.value)
    hexInput.value = hex.value
  }
}

function openColorPicker() {
  colorPickerRef.value?.click()
}

function onNativePick(e: Event) {
  const target = e.target as HTMLInputElement
  hex.value = target.value
  hexInput.value = target.value
  syncFromHex()
}

function onHexInput() {
  if (hexInput.value.length < 4) return
  const converted = hexToRgb(hexInput.value)
  if (converted) {
    hex.value = hexInput.value
    rgb.value = converted
    hsl.value = rgbToHsl(rgb.value)
  }
}

function onHexBlur() {
  const converted = hexToRgb(hexInput.value)
  if (converted) {
    hex.value = hexInput.value
    rgb.value = converted
    hsl.value = rgbToHsl(rgb.value)
  } else {
    hexInput.value = hex.value
  }
}

function updateFromRgb() {
  hex.value = rgbToHex(rgb.value)
  hexInput.value = hex.value
  hsl.value = rgbToHsl(rgb.value)
}

function updateFromHsl() {
  rgb.value = hslToRgb(hsl.value)
  hex.value = rgbToHex(rgb.value)
  hexInput.value = hex.value
}

function clampRgb(channel: 'r' | 'g' | 'b') {
  rgb.value[channel] = Math.max(0, Math.min(255, rgb.value[channel]))
  updateFromRgb()
}

function clampHsl(channel: 'h' | 's' | 'l') {
  const max = channel === 'h' ? 360 : 100
  hsl.value[channel] = Math.max(0, Math.min(max, hsl.value[channel]))
  updateFromHsl()
}

function randomColor() {
  const r = Math.floor(Math.random() * 256)
  const g = Math.floor(Math.random() * 256)
  const b = Math.floor(Math.random() * 256)
  rgb.value = { r, g, b }
  hex.value = rgbToHex(rgb.value)
  hexInput.value = hex.value
  hsl.value = rgbToHsl(rgb.value)
}

// Computed formats
const cmykFormat = computed(() => {
  const cmyk = rgbToCmyk(rgb.value)
  return {
    label: 'CMYK',
    value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
  }
})

const webFormats = computed(() => [
  { label: 'HEX', value: hex.value.toUpperCase(), swatchColor: hex.value },
  { label: 'RGB', value: `rgb(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b})` },
  { label: 'HSL', value: `hsl(${hsl.value.h}, ${hsl.value.s}%, ${hsl.value.l}%)` },
])

const advancedFormats = computed(() => {
  const oklch = rgbToOklch(rgb.value)
  const lab = rgbToLab(rgb.value)
  const lch = rgbToLch(rgb.value)
  return [
    { label: 'OKLCH', value: `oklch(${oklch.l.toFixed(2)} ${oklch.c.toFixed(3)} ${oklch.h.toFixed(1)})` },
    { label: 'LAB', value: `lab(${lab.l.toFixed(2)} ${lab.a.toFixed(2)} ${lab.b.toFixed(2)})` },
    { label: 'LCH', value: `lch(${lch.l.toFixed(2)} ${lch.c.toFixed(2)} ${lch.h.toFixed(1)})` },
  ]
})

// Harmony colors
function hslToHex(h: number, s: number, l: number): string {
  const rgbVal = hslToRgb({ h, s, l })
  return rgbToHex(rgbVal)
}

const complementaryColors = computed(() => {
  const h = (hsl.value.h + 180) % 360
  return [hslToHex(h, hsl.value.s, hsl.value.l)]
})

const analogousColors = computed(() => {
  const h = hsl.value.h
  return [
    hslToHex((h - 30 + 360) % 360, hsl.value.s, hsl.value.l),
    hslToHex((h + 30) % 360, hsl.value.s, hsl.value.l),
  ]
})

async function copy(val: string, label: string) {
  await navigator.clipboard.writeText(val)
  flashLabel.value = label
  setTimeout(() => { flashLabel.value = '' }, 300)
}

// Init
syncFromHex()
</script>

<style scoped>
/* Input Section */
.cc-input-row {
  display: flex;
  align-items: flex-end;
  gap: var(--gi-space-md);
  flex-wrap: wrap;
}

.cc-swatch-btn {
  width: 52px;
  height: 52px;
  border-radius: var(--gi-radius-lg);
  border: 2px solid var(--gi-border);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color var(--gi-transition-fast) var(--gi-ease-out), transform var(--gi-transition-fast) var(--gi-ease-bounce);
  flex-shrink: 0;
}

.cc-swatch-btn:hover {
  border-color: var(--gi-brand);
  transform: scale(1.05);
}

.cc-swatch-btn:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

.cc-native-picker {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  opacity: 0;
  cursor: pointer;
}

.cc-hex-input-wrap {
  flex: 1;
  min-width: 180px;
}

.cc-hex-input {
  font-family: ui-monospace, 'SF Mono', 'Menlo', 'Monaco', 'Cascadia Code', 'Consolas', monospace;
  font-size: var(--gi-font-size-lg);
  font-weight: 600;
  letter-spacing: 0.05em;
}

.cc-random-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--gi-space-xs);
  white-space: nowrap;
}

.cc-random-label {
  display: none;
}

@media (min-width: 480px) {
  .cc-random-label { display: inline; }
}

/* Adjust Row (RGB + HSL) */
.cc-adjust-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--gi-space-md);
  margin-top: var(--gi-space-md);
}

@media (max-width: 640px) {
  .cc-adjust-row {
    grid-template-columns: 1fr;
  }
}

.cc-adjust-group {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-xs);
}

.cc-adjust-label {
  font-size: var(--gi-font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gi-text-muted);
}

.cc-adjust-inputs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--gi-space-xs);
}

.cc-adjust-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cc-field-label {
  font-size: var(--gi-font-size-xs);
  font-weight: 500;
  color: var(--gi-text-muted);
  text-align: center;
}

.cc-field-input {
  text-align: center;
  font-family: ui-monospace, 'SF Mono', 'Menlo', 'Monaco', 'Cascadia Code', 'Consolas', monospace;
  font-size: var(--gi-font-size-md);
  font-weight: 500;
  padding: 0.4rem 0.25rem;
  min-height: 36px;
}

/* Contrast Preview */
.cc-contrast-card {
  padding: var(--gi-space-md) var(--gi-space-lg);
}

.cc-section-title {
  font-size: var(--gi-font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gi-text-muted);
  margin: 0 0 var(--gi-space-sm) 0;
}

.cc-contrast-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--gi-space-md);
}

.cc-contrast-swatch {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--gi-space-xs);
  border-radius: var(--gi-radius-md);
  padding: var(--gi-space-md);
  border: 1px solid var(--gi-border);
}

.cc-contrast-swatch span:first-child {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.cc-contrast-label {
  font-size: var(--gi-font-size-xs);
  color: var(--gi-text-muted);
}

/* Result Cards */
.cc-results-section {
  margin-bottom: var(--gi-space-xl);
}

.cc-result-card {
  cursor: pointer;
  transition: all var(--gi-transition-base) var(--gi-ease-out);
  position: relative;
  overflow: hidden;
}

.cc-result-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--gi-shadow-md);
}

.cc-result-card:active {
  transform: scale(0.98);
}

.cc-result-card:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

.cc-result-card--flash {
  animation: cc-flash 0.3s ease-out;
}

@keyframes cc-flash {
  0% { background: var(--gi-brand-fade); }
  100% { background: var(--gi-surface); }
}

.cc-result-header {
  display: flex;
  align-items: center;
  gap: var(--gi-space-xs);
  margin-bottom: var(--gi-space-xs);
}

.cc-result-swatch {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid var(--gi-border);
  flex-shrink: 0;
}

.cc-result-label {
  font-size: var(--gi-font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gi-text-muted);
}

.cc-result-value {
  font-family: ui-monospace, 'SF Mono', 'Menlo', 'Monaco', 'Cascadia Code', 'Consolas', monospace;
  font-size: var(--gi-font-size-md);
  font-weight: 500;
  color: var(--gi-text);
  word-break: break-all;
  line-height: 1.4;
}

.cc-result-action {
  margin-top: var(--gi-space-xs);
  font-size: var(--gi-font-size-xs);
  color: var(--gi-brand);
  font-weight: 500;
}

/* Harmony Section */
.cc-harmony-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--gi-space-lg);
}

@media (max-width: 640px) {
  .cc-harmony-row {
    grid-template-columns: 1fr;
  }
}

.cc-harmony-group {
  display: flex;
  flex-direction: column;
  gap: var(--gi-space-xs);
}

.cc-harmony-label {
  font-size: var(--gi-font-size-xs);
  font-weight: 500;
  color: var(--gi-text-muted);
}

.cc-harmony-swatches {
  display: flex;
  gap: var(--gi-space-xs);
}

.cc-harmony-swatch {
  width: 44px;
  height: 44px;
  border-radius: var(--gi-radius-md);
  border: 1px solid var(--gi-border);
  cursor: pointer;
  transition: transform var(--gi-transition-fast) var(--gi-ease-bounce), border-color var(--gi-transition-fast) var(--gi-ease-out);
}

.cc-harmony-swatch:hover {
  transform: scale(1.1);
  border-color: var(--gi-brand);
}

.cc-harmony-swatch:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}
</style>
