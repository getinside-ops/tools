<template>
  <ToolPageLayout
    :title="t('colorPalette.title')"
    :subtitle="t('colorPalette.desc')"
    category="design"
  >
    <template #icon>
      <Palette />
    </template>

    <!-- Action bar -->
    <div class="cp-actions">
      <div class="cp-actions-left">
        <button class="cp-generate-btn" @click="generate" :aria-label="t('colorPalette.generate')">
          <Shuffle :size="18" />
          {{ t('colorPalette.generate') }}
          <kbd class="cp-shortcut">Space</kbd>
        </button>
        <button class="cp-reset-btn" @click="resetPalette" :aria-label="t('colorPalette.full.reset')">
          <RefreshCw :size="16" />
        </button>

        <!-- Harmony selector -->
        <div class="cp-harmony-selector">
          <button
            class="cp-harmony-btn"
            @click="showHarmonyMenu = !showHarmonyMenu"
            :aria-expanded="showHarmonyMenu"
            :aria-label="t('colorPalette.full.harmony.label')"
          >
            <Sparkles :size="16" />
            <span>{{ harmonyLabel }}</span>
            <ChevronDown :size="14" class="cp-chevron" :class="{ 'cp-chevron--open': showHarmonyMenu }" />
          </button>
          <div v-if="showHarmonyMenu" class="cp-harmony-menu" role="listbox">
            <button
              v-for="type in harmonyTypes"
              :key="type.value"
              class="cp-harmony-option"
              :class="{ 'cp-harmony-option--active': harmonyType === type.value }"
              role="option"
              :aria-selected="harmonyType === type.value"
              @click="selectHarmony(type.value)"
            >
              {{ type.label }}
            </button>
          </div>
        </div>
      </div>
      <div class="cp-actions-right">
        <label class="cp-upload-btn" :aria-label="t('colorPalette.full.extract')" tabindex="0">
          <ImageUp :size="16" />
          <input type="file" accept="image/*" @change="handleImageUpload" />
        </label>
        <button class="cp-action-btn" @click="showGradientModal = true" :aria-label="t('colorPalette.full.gradient.label')">
          <Palette :size="16" />
        </button>
        <button class="cp-action-btn" @click="showExportModal = true" :aria-label="t('colorPalette.full.export.label')">
          <Download :size="16" />
        </button>
        <button class="cp-fullscreen-btn" @click="openFullscreen" :aria-label="t('colorPalette.full.screen')">
          <Maximize2 :size="16" />
        </button>
      </div>
    </div>

    <!-- Color swatches -->
    <div class="cp-palette-wrapper">
      <div class="cp-palette" role="group" :aria-label="t('colorPalette.title')">
        <template v-for="(color, i) in palette" :key="i">
          <!-- Add strip before each swatch -->
          <div
            v-if="palette.length < 8"
            class="cp-add-strip"
            @click="addColorAt(i)"
            :aria-label="t('colorPalette.full.addColor')"
            role="button"
            tabindex="0"
            @keydown.enter="addColorAt(i)"
          >
            <Plus :size="12" />
          </div>
          <!-- Swatch -->
          <div
            class="cp-swatch"
            :class="{
              'cp-swatch--locked': color.locked,
              'cp-swatch--flash': flashIndex === i,
              'cp-swatch--drag-over': dragOverIndex === i,
            }"
            :style="{ background: color.hex }"
            draggable="true"
            @dragstart="onDragStart($event, i)"
            @dragover.prevent="onDragOver(i)"
            @drop.prevent="onDrop(i)"
            @dragend="onDragEnd"
          >
            <!-- Hover overlay -->
            <div class="cp-swatch-overlay">
              <div class="cp-drag-handle"><GripVertical :size="16" /></div>
              <button
                class="cp-swatch-btn"
                @click.stop="toggleLockAt(i)"
                :aria-label="color.locked ? t('colorPalette.unlock') : t('colorPalette.lock')"
              >
                <Lock v-if="color.locked" :size="17" />
                <Unlock v-else :size="17" />
              </button>
              <div class="cp-swatch-action-row">
                <button class="cp-swatch-btn cp-swatch-btn--sm" @click.stop="copyColor(color.hex, i)" :aria-label="t('colorPalette.copied')">
                  <Copy :size="15" />
                </button>
                <button class="cp-swatch-btn cp-swatch-btn--sm" @click.stop="openDetail(i)" :aria-label="t('colorPalette.selectedColor')">
                  <Info :size="15" />
                </button>
                <button
                  v-if="palette.length > 3"
                  class="cp-swatch-btn cp-swatch-btn--sm cp-swatch-btn--delete"
                  @click.stop="removeColor(i)"
                  :aria-label="t('colorPalette.full.deleteColor')"
                >
                  <Trash2 :size="15" />
                </button>
              </div>
            </div>
            <!-- Always-visible hex badge -->
            <div class="cp-swatch-hex" @click.stop="openPicker(i)">
              <span>{{ copiedIndex === i ? '✓' : color.hex }}</span>
              <input
                type="color"
                class="cp-picker-input"
                :ref="(el) => { pickerRefs[i] = el as HTMLInputElement }"
                :value="color.hex"
                @input="onPickerInput($event, i)"
                tabindex="-1"
                aria-hidden="true"
              />
            </div>
          </div>
        </template>
        <!-- Trailing add strip -->
        <div
          v-if="palette.length < 8"
          class="cp-add-strip"
          @click="addColorAt(palette.length)"
          :aria-label="t('colorPalette.full.addColor')"
          role="button"
          tabindex="0"
          @keydown.enter="addColorAt(palette.length)"
        >
          <Plus :size="12" />
        </div>
      </div>

      <!-- Detail panel — right-side overlay -->
      <Transition name="cp-detail-slide">
        <div v-if="selectedIndex !== null && selectedIndex < palette.length" class="cp-detail-overlay" role="dialog">
          <button class="cp-detail-close" @click="selectedIndex = null" :aria-label="t('colorPalette.full.keyboard.esc')">
            <X :size="16" />
          </button>
          <div class="cp-detail-header">
            <div class="cp-detail-swatch" :style="{ background: palette[selectedIndex].hex }"></div>
            <div class="cp-detail-info">
              <h3 class="cp-detail-title">{{ t('colorPalette.selectedColor') }}</h3>
              <div class="cp-format-row" @click="copyColor(formats.hex, selectedIndex)">
                <span class="cp-format-label">HEX</span>
                <code class="cp-format-value">{{ formats.hex }}</code>
                <Copy :size="14" class="cp-format-copy" />
              </div>
              <div class="cp-format-row" @click="copyColor(formats.rgb, selectedIndex)">
                <span class="cp-format-label">RGB</span>
                <code class="cp-format-value">{{ formats.rgb }}</code>
                <Copy :size="14" class="cp-format-copy" />
              </div>
              <div class="cp-format-row" @click="copyColor(formats.hsl, selectedIndex)">
                <span class="cp-format-label">HSL</span>
                <code class="cp-format-value">{{ formats.hsl }}</code>
                <Copy :size="14" class="cp-format-copy" />
              </div>
            </div>
          </div>
          <div class="cp-adjust">
            <h4 class="cp-adjust-title">{{ t('colorPalette.adjust') }}</h4>
            <div class="cp-slider-group">
              <label class="cp-slider-label">{{ t('colorPalette.hue') }}<span class="cp-slider-value">{{ adjustments.hue }}°</span></label>
              <input type="range" v-model.number="adjustments.hue" min="-180" max="180" step="1" class="cp-slider cp-slider--hue" />
            </div>
            <div class="cp-slider-group">
              <label class="cp-slider-label">{{ t('colorPalette.saturation') }}<span class="cp-slider-value">{{ adjustments.saturation > 0 ? '+' : '' }}{{ adjustments.saturation }}%</span></label>
              <input type="range" v-model.number="adjustments.saturation" min="-50" max="50" step="1" class="cp-slider" />
            </div>
            <div class="cp-slider-group">
              <label class="cp-slider-label">{{ t('colorPalette.lightness') }}<span class="cp-slider-value">{{ adjustments.lightness > 0 ? '+' : '' }}{{ adjustments.lightness }}%</span></label>
              <input type="range" v-model.number="adjustments.lightness" min="-50" max="50" step="1" class="cp-slider" />
            </div>
            <div class="cp-adjust-actions">
              <button class="cp-reset-btn" @click="resetAdjustments"><RotateCcw :size="14" />{{ t('colorPalette.reset') }}</button>
              <button class="cp-apply-btn" @click="applyAdjustments">{{ t('colorPalette.apply') }}</button>
            </div>
          </div>
          <div class="cp-contrast-section">
            <span class="cp-adjust-title" style="margin: 0;">Contraste WCAG</span>
            <div class="cp-contrast-row">
              <div class="cp-contrast-item" style="background: #FFFFFF;">
                <span class="cp-contrast-text" :style="{ color: palette[selectedIndex].hex }">Aa</span>
                <span class="cp-contrast-ratio">{{ contrastOnWhite.toFixed(1) }}:1</span>
                <span class="cp-contrast-badge" :class="contrastOnWhite >= 4.5 ? 'cp-contrast-badge--pass' : 'cp-contrast-badge--fail'">{{ contrastOnWhite >= 4.5 ? 'AA ✓' : '—' }}</span>
              </div>
              <div class="cp-contrast-item" style="background: #000000;">
                <span class="cp-contrast-text" :style="{ color: palette[selectedIndex].hex }">Aa</span>
                <span class="cp-contrast-ratio">{{ contrastOnBlack.toFixed(1) }}:1</span>
                <span class="cp-contrast-badge" :class="contrastOnBlack >= 4.5 ? 'cp-contrast-badge--pass' : 'cp-contrast-badge--fail'">{{ contrastOnBlack >= 4.5 ? 'AA ✓' : '—' }}</span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- UI Preview -->
    <div class="cp-preview">
      <h3 class="cp-preview-title">{{ t('colorPalette.uiPreview') }}</h3>
      <div class="cp-preview-card" :style="{ borderColor: palette[0].hex }">
        <div class="cp-preview-header" :style="{ background: palette[0].hex }">
          <div class="cp-preview-dots"><span></span><span></span><span></span></div>
        </div>
        <div class="cp-preview-body" :style="{ background: palette[4].hex + '12' }">
          <div class="cp-preview-text" :style="{ color: getContrastingColor(palette[1].hex, palette[4].hex + '12') }">Title text</div>
          <div class="cp-preview-text-sm" :style="{ color: getContrastingColor(palette[2].hex, palette[4].hex + '12') }">Secondary text with some content.</div>
          <button class="cp-preview-cta" :style="{ background: palette[3].hex, color: getContrastColor(palette[3].hex) }">
            Call to action
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <Transition name="cp-toast-anim">
      <div v-if="toastMessage" class="cp-toast" role="status" aria-live="polite">
        <CheckCircle :size="16" />
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>

    <!-- Export Modal -->
    <Teleport to="body">
      <Transition name="cp-fade-anim">
        <div v-if="showExportModal" class="cp-modal-overlay" @click.self="showExportModal = false">
          <div class="cp-modal" role="dialog">
            <div class="cp-modal-header">
              <h2 class="cp-modal-title">{{ t('colorPalette.full.export.label') }}</h2>
              <button class="cp-close-btn" @click="showExportModal = false"><X :size="20" /></button>
            </div>
            <div class="cp-modal-body">
              <div class="cp-export-grid">
                <button class="cp-export-card" @click="doExport('css')"><Code :size="20" /><span>CSS</span></button>
                <button class="cp-export-card" @click="doExport('scss')"><Code :size="20" /><span>SCSS</span></button>
                <button class="cp-export-card" @click="doExport('json')"><Braces :size="20" /><span>JSON</span></button>
                <button class="cp-export-card" @click="doExport('tailwind')"><Wind :size="20" /><span>Tailwind</span></button>
                <button class="cp-export-card" @click="doExport('url')"><LinkIcon :size="20" /><span>URL</span></button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Gradient Modal -->
    <Teleport to="body">
      <Transition name="cp-fade-anim">
        <div v-if="showGradientModal" class="cp-modal-overlay" @click.self="showGradientModal = false">
          <div class="cp-modal cp-modal--gradient" role="dialog">
            <div class="cp-modal-header">
              <h2 class="cp-modal-title">{{ t('colorPalette.full.gradient.label') }}</h2>
              <button class="cp-close-btn" @click="showGradientModal = false"><X :size="20" /></button>
            </div>
            <div class="cp-modal-body">
              <div class="cp-gradient-toggle">
                <button class="cp-gradient-btn" :class="{ 'cp-gradient-btn--active': gradientType === 'linear' }" @click="gradientType = 'linear'">
                  {{ t('colorPalette.full.gradient.linear') }}
                </button>
                <button class="cp-gradient-btn" :class="{ 'cp-gradient-btn--active': gradientType === 'radial' }" @click="gradientType = 'radial'">
                  {{ t('colorPalette.full.gradient.radial') }}
                </button>
              </div>
              <div class="cp-gradient-preview" :style="{ background: gradientCss }"></div>
              <div class="cp-gradient-code">
                <code>{{ gradientCss }}</code>
                <button class="cp-copy-btn" @click="copyGradient"><Copy :size="16" /></button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <template #about>{{ t('colorPalette.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  Palette, Shuffle, Sparkles, ChevronDown, Copy, Lock, Unlock,
  RotateCcw, CheckCircle, Code, Braces, Wind, X, ImageUp,
  Maximize2, Download, Link as LinkIcon, RefreshCw,
  GripVertical, Info, Trash2, Plus,
} from 'lucide-vue-next'
import ToolPageLayout from '../components/ToolPageLayout.vue'
import { toggleLock as paletteToggleLock, usePaletteState, getContrastRatio, getColorFormats, adjustColor, updateColor, initPalette, generateWithHarmony } from '../composables/useColorPalette'
import type { HarmonyType } from '../composables/useColorHarmony'
import type { ColorFormats } from '../composables/useColorPalette'

const { t } = useI18n()
const router = useRouter()
const { palette, harmonyType, syncToUrl } = usePaletteState()

const selectedIndex = ref<number | null>(null)
const copiedIndex = ref<number | null>(null)
const flashIndex = ref<number | null>(null)
const toastMessage = ref<string | null>(null)
const showHarmonyMenu = ref(false)
const showExportModal = ref(false)
const showGradientModal = ref(false)
const gradientType = ref<'linear' | 'radial'>('linear')
const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)
const pickerRefs = ref<(HTMLInputElement | null)[]>([])
let toastTimer: ReturnType<typeof setTimeout> | null = null

const adjustments = ref({ hue: 0, saturation: 0, lightness: 0 })
watch(selectedIndex, () => { adjustments.value = { hue: 0, saturation: 0, lightness: 0 } })

const formats = computed<ColorFormats>(() => {
  if (selectedIndex.value === null || selectedIndex.value >= palette.value.length) return { hex: '', rgb: '', hsl: '' }
  return getColorFormats(palette.value[selectedIndex.value].hex)
})

const selectedColor = computed(() => selectedIndex.value !== null ? palette.value[selectedIndex.value] : null)
const contrastOnWhite = computed(() => selectedColor.value ? getContrastRatio(selectedColor.value.hex, '#FFFFFF') : 1)
const contrastOnBlack = computed(() => selectedColor.value ? getContrastRatio(selectedColor.value.hex, '#000000') : 1)

const gradientCss = computed(() => {
  const colors = palette.value.map(c => c.hex)
  return gradientType.value === 'linear'
    ? `linear-gradient(135deg, ${colors.join(', ')})`
    : `radial-gradient(circle, ${colors.join(', ')})`
})

const harmonyTypes = [
  { value: 'random-beautiful' as HarmonyType, label: t('colorPalette.full.harmony.randomBeautiful') },
  { value: 'analogous' as HarmonyType, label: t('colorPalette.full.harmony.analogous') },
  { value: 'complementary' as HarmonyType, label: t('colorPalette.full.harmony.complementary') },
  { value: 'triadic' as HarmonyType, label: t('colorPalette.full.harmony.triadic') },
  { value: 'tetradic' as HarmonyType, label: t('colorPalette.full.harmony.tetradic') },
  { value: 'split-complementary' as HarmonyType, label: t('colorPalette.full.harmony.splitComplementary') },
  { value: 'monochromatic' as HarmonyType, label: t('colorPalette.full.harmony.monochromatic') },
]
const harmonyLabel = computed(() => harmonyTypes.find(h => h.value === harmonyType.value)?.label || '')

// --- Actions ---

function generate() {
  palette.value = generateWithHarmony(palette.value, harmonyType.value as HarmonyType)
  syncToUrl()
}

function resetPalette() {
  palette.value = initPalette()
  selectedIndex.value = null
  adjustments.value = { hue: 0, saturation: 0, lightness: 0 }
  syncToUrl()
  showToast(t('colorPalette.full.toast.paletteReset'))
}

function toggleLockAt(i: number) {
  palette.value = paletteToggleLock(palette.value, i)
  if (selectedIndex.value === i && palette.value[i].locked) selectedIndex.value = null
  syncToUrl()
}

function openDetail(i: number) {
  selectedIndex.value = selectedIndex.value === i ? null : i
  adjustments.value = { hue: 0, saturation: 0, lightness: 0 }
}

function addColorAt(i: number) {
  if (palette.value.length >= 8) return
  const neighbor = palette.value[Math.min(i, palette.value.length - 1)].hex
  const newColors = generateWithHarmony(
    [{ hex: neighbor, locked: false }],
    harmonyType.value as HarmonyType
  )
  const newPalette = [...palette.value]
  newPalette.splice(i, 0, { hex: newColors[0].hex, locked: false })
  palette.value = newPalette
  syncToUrl()
}

function removeColor(i: number) {
  if (palette.value.length <= 3) return
  selectedIndex.value = null
  palette.value = palette.value.filter((_, idx) => idx !== i)
  syncToUrl()
}

function openPicker(i: number) {
  pickerRefs.value[i]?.click()
}

function onPickerInput(e: Event, i: number) {
  const hex = (e.target as HTMLInputElement).value.toUpperCase()
  palette.value = updateColor(palette.value, i, hex)
}

function onDragStart(e: DragEvent, i: number) {
  dragIndex.value = i
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(i))
  }
}

function onDragOver(i: number) {
  if (dragIndex.value !== null && dragIndex.value !== i) dragOverIndex.value = i
}

function onDrop(i: number) {
  if (dragIndex.value === null || dragIndex.value === i) return
  const newPalette = [...palette.value]
  const [dragged] = newPalette.splice(dragIndex.value, 1)
  newPalette.splice(i, 0, dragged)
  palette.value = newPalette
  dragIndex.value = null
  dragOverIndex.value = null
  syncToUrl()
}

function onDragEnd() {
  dragIndex.value = null
  dragOverIndex.value = null
}

function selectHarmony(type: HarmonyType) {
  harmonyType.value = type
  showHarmonyMenu.value = false
  generate()
}

async function copyColor(hex: string, index: number) {
  try {
    await navigator.clipboard.writeText(hex)
    if (index >= 0) { flashIndex.value = index; copiedIndex.value = index; setTimeout(() => { flashIndex.value = null }, 300); setTimeout(() => { copiedIndex.value = null }, 2000) }
    showToast(t('colorPalette.full.toast.copied'))
  } catch { /* silent */ }
}

function doExport(format: string) {
  let text = ''
  switch (format) {
    case 'css': text = ':root {\n' + palette.value.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n') + '\n}'; break
    case 'scss': text = palette.value.map((c, i) => `$color-${i + 1}: ${c.hex};`).join('\n'); break
    case 'json': text = JSON.stringify(palette.value.map(c => ({ hex: c.hex, locked: c.locked })), null, 2); break
    case 'tailwind': text = 'colors: {\n' + palette.value.map((c, i) => `  'brand-${i + 1}': '${c.hex}',`).join('\n') + '\n}'; break
    case 'url': syncToUrl(); text = window.location.href; showToast(t('colorPalette.full.toast.urlCopied')); break
  }
  if (text) { navigator.clipboard.writeText(text); showToast(t('colorPalette.full.toast.cssCopied')) }
  showExportModal.value = false
}

async function copyGradient() {
  try { await navigator.clipboard.writeText(gradientCss.value); showToast(t('colorPalette.full.toast.cssCopied')) } catch { /* */ }
}

async function handleImageUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = Math.min(img.width, 500); canvas.height = Math.min(img.height, 500)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const colors = extractColors(canvas, 5)
    if (colors.length > 0) { palette.value = colors.map(hex => ({ hex, locked: false })); syncToUrl(); showToast(t('colorPalette.full.toast.extracted')) }
  }
  img.src = URL.createObjectURL(file)
  ;(e.target as HTMLInputElement).value = ''
}

function openFullscreen() {
  router.push('/color-palette-fullscreen')
}

function showToast(msg: string) {
  if (toastTimer) clearTimeout(toastTimer)
  toastMessage.value = msg
  toastTimer = setTimeout(() => { toastMessage.value = null }, 2500)
}

function resetAdjustments() { adjustments.value = { hue: 0, saturation: 0, lightness: 0 } }
function applyAdjustments() {
  if (selectedIndex.value === null) return
  const newHex = adjustColor(palette.value[selectedIndex.value].hex, adjustments.value.hue, adjustments.value.saturation, adjustments.value.lightness)
  palette.value = updateColor(palette.value, selectedIndex.value, newHex)
  adjustments.value = { hue: 0, saturation: 0, lightness: 0 }
}

// Color utilities
function toHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0; const l = (max + min) / 2
  if (max !== min) { const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min); switch (max) { case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break; case g: h = ((b - r) / d + 2) / 6; break; case b: h = ((r - g) / d + 4) / 6; break } }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}
function getContrastColor(hex: string): string { return toHsl(hex).l > 50 ? '#000000' : '#FFFFFF' }
function getContrastingColor(_t: string, bg: string): string { const l = parseInt(bg.slice(1, 3), 16) || 0; return l > 128 ? '#1a1a1a' : '#f0f0f0' }

function extractColors(canvas: HTMLCanvasElement, count: number): string[] {
  const ctx = canvas.getContext('2d'); if (!ctx) return []
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  const map = new Map<string, number>()
  const step = Math.max(1, Math.floor(Math.sqrt(data.length / 4 / 5000)))
  for (let i = 0; i < data.length; i += step * 4) {
    if (data[i + 3] < 128) continue
    map.set(`${Math.round(data[i] / 16) * 16},${Math.round(data[i + 1] / 16) * 16},${Math.round(data[i + 2] / 16) * 16}`, (map.get(`${Math.round(data[i] / 16) * 16},${Math.round(data[i + 1] / 16) * 16},${Math.round(data[i + 2] / 16) * 16}`) || 0) + 1)
  }
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, count).map(([k]) => { const [r, g, b] = k.split(',').map(Number); return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}` })
}

// Keyboard shortcuts
function handleKeydown(e: KeyboardEvent) {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
  if (e.code === 'Space') { e.preventDefault(); generate() }
  else if (e.key === 'c' && !e.metaKey && !e.ctrlKey) { navigator.clipboard.writeText(palette.value.map(c => c.hex).join(' ')); showToast(t('colorPalette.full.toast.copied')) }
  else if (e.key === 'e') { showExportModal.value = !showExportModal.value }
  else if (e.key === 'g') { showGradientModal.value = !showGradientModal.value }
  else if (e.key === 'Escape') { showExportModal.value = false; showGradientModal.value = false; selectedIndex.value = null; showHarmonyMenu.value = false }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', (e) => { if (showHarmonyMenu.value && !document.querySelector('.cp-harmony-selector')?.contains(e.target as Node)) showHarmonyMenu.value = false })
})
onUnmounted(() => { document.removeEventListener('keydown', handleKeydown); if (toastTimer) clearTimeout(toastTimer) })
</script>

<style scoped>
/* Actions */
.cp-actions { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.cp-actions-left { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.cp-actions-right { display: flex; align-items: center; gap: 0.5rem; }

.cp-generate-btn {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.625rem 1.25rem; background: var(--gi-brand); color: #fff;
  border: none; border-radius: var(--gi-radius-md); font-weight: 600;
  font-size: var(--gi-font-size-sm); cursor: pointer; min-height: 44px;
  transition: background 0.15s var(--gi-ease-out), transform 0.1s var(--gi-ease-out), box-shadow 0.15s var(--gi-ease-out);
  box-shadow: 0 1px 3px rgba(10, 170, 142, 0.3);
}
.cp-generate-btn:hover { background: #089678; box-shadow: 0 2px 6px rgba(10, 170, 142, 0.4); }
.cp-generate-btn:active { transform: scale(0.97); }
.cp-shortcut { display: inline-block; padding: 0.125rem 0.375rem; background: rgba(255,255,255,0.2); border-radius: var(--gi-radius-sm); font-size: 0.65rem; font-weight: 600; font-family: inherit; letter-spacing: 0.02em; opacity: 0.85; }

.cp-harmony-selector { position: relative; }
.cp-harmony-btn {
  display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.875rem;
  background: var(--gi-surface); border: 1px solid var(--gi-border); border-radius: var(--gi-radius-md);
  font-size: var(--gi-font-size-sm); font-weight: 500; color: var(--gi-text); cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s; min-height: 44px;
}
.cp-harmony-btn:hover { border-color: var(--gi-brand); box-shadow: var(--gi-shadow-sm); }
.cp-chevron { transition: transform 0.2s var(--gi-ease-out); }
.cp-chevron--open { transform: rotate(180deg); }
.cp-harmony-menu {
  position: absolute; top: calc(100% + 0.5rem); left: 0; z-index: 50;
  background: var(--gi-surface); border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg); box-shadow: var(--gi-shadow-lg); min-width: 180px; overflow: hidden;
}
.cp-harmony-option {
  display: block; width: 100%; padding: 0.625rem 1rem; text-align: left;
  background: none; border: none; font-size: var(--gi-font-size-sm); color: var(--gi-text); cursor: pointer; transition: background 0.1s;
}
.cp-harmony-option:hover { background: var(--gi-bg); }
.cp-harmony-option--active { background: var(--gi-brand-fade); color: var(--gi-brand); font-weight: 600; }

.cp-upload-btn, .cp-action-btn, .cp-fullscreen-btn, .cp-reset-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 44px; height: 44px; background: var(--gi-surface);
  border: 1px solid var(--gi-border); border-radius: var(--gi-radius-md);
  color: var(--gi-text-muted); cursor: pointer;
  transition: color 0.15s, border-color 0.15s, box-shadow 0.15s;
}
.cp-upload-btn:hover, .cp-action-btn:hover, .cp-fullscreen-btn:hover, .cp-reset-btn:hover {
  color: var(--gi-text); border-color: var(--gi-brand); box-shadow: var(--gi-shadow-sm); }
.cp-upload-btn input { display: none; }

/* Palette wrapper + overlay */
.cp-palette-wrapper { position: relative; margin-bottom: 1.5rem; }
.cp-detail-overlay {
  position: absolute; top: 0; right: 0; bottom: 0; width: 280px;
  background: var(--gi-surface); border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-xl); box-shadow: var(--gi-shadow-lg);
  overflow-y: auto; padding: 1.25rem; z-index: 10;
}
.cp-detail-close {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; background: var(--gi-bg); border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-sm); color: var(--gi-text-muted); cursor: pointer;
  margin-bottom: 0.75rem; transition: color 0.15s, border-color 0.15s;
}
.cp-detail-close:hover { color: var(--gi-text); border-color: var(--gi-text-muted); }
.cp-detail-slide-enter-active, .cp-detail-slide-leave-active {
  transition: transform 0.22s var(--gi-ease-out), opacity 0.22s;
}
.cp-detail-slide-enter-from, .cp-detail-slide-leave-to { transform: translateX(16px); opacity: 0; }

/* Palette row */
.cp-palette { display: flex; align-items: stretch; gap: 0; height: 400px; }

/* Add strip */
.cp-add-strip {
  display: flex; align-items: center; justify-content: center;
  width: 8px; flex-shrink: 0; cursor: pointer;
  color: var(--gi-text-muted); opacity: 0;
  border: 1px dashed transparent; border-radius: var(--gi-radius-sm);
  transition: width 0.18s var(--gi-ease-out), opacity 0.18s, border-color 0.18s;
}
.cp-palette:hover .cp-add-strip { opacity: 1; }
.cp-add-strip:hover {
  width: 36px; border-color: var(--gi-border); color: var(--gi-brand);
  background: var(--gi-brand-fade);
}

/* Swatch */
.cp-swatch {
  flex: 1; position: relative; border-radius: var(--gi-radius-lg); overflow: hidden;
  display: flex; flex-direction: column; justify-content: space-between;
  box-shadow: var(--gi-shadow-sm);
  transition: flex 0.22s var(--gi-ease-out), box-shadow 0.2s, transform 0.12s;
  cursor: default;
}
.cp-swatch:hover { flex: 1.3; box-shadow: var(--gi-shadow-md); transform: translateY(-2px); }
.cp-swatch:focus-visible { outline: 3px solid var(--gi-brand); outline-offset: 2px; z-index: 1; }
.cp-swatch--locked { outline: 2px solid rgba(255, 255, 255, 0.85); outline-offset: -2px; }
.cp-swatch--flash { animation: cp-flash 0.3s ease-out; }
.cp-swatch--drag-over { outline: 2px dashed rgba(255,255,255,0.8); outline-offset: -2px; }
@keyframes cp-flash { 0% { filter: brightness(1.8); } 100% { filter: brightness(1); } }

/* Hover overlay */
.cp-swatch-overlay {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: space-between;
  padding: 0.625rem 0.5rem;
  opacity: 0; transition: opacity 0.15s;
}
.cp-swatch:hover .cp-swatch-overlay { opacity: 1; }

.cp-drag-handle {
  color: white; cursor: grab; opacity: 0.8;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
}
.cp-drag-handle:active { cursor: grabbing; }

.cp-swatch-btn {
  display: flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; background: rgba(0,0,0,0.25); backdrop-filter: blur(6px);
  border: none; border-radius: var(--gi-radius-md); color: white; cursor: pointer;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  transition: background 0.12s;
}
.cp-swatch-btn:hover { background: rgba(0,0,0,0.45); }
.cp-swatch-btn--sm { width: 28px; height: 28px; border-radius: var(--gi-radius-sm); }
.cp-swatch-btn--delete:hover { background: rgba(200,30,30,0.5); }

.cp-swatch-action-row { display: flex; gap: 0.3rem; }

/* Hex badge (always visible) */
.cp-swatch-hex {
  padding: 0.5rem; text-align: center;
  background: rgba(0,0,0,0.3); backdrop-filter: blur(6px);
  cursor: pointer; position: relative;
  transition: background 0.15s;
}
.cp-swatch-hex:hover { background: rgba(0,0,0,0.45); }
.cp-swatch-hex span { font-size: 0.72rem; font-weight: 700; color: white; text-shadow: 0 1px 3px rgba(0,0,0,0.5); letter-spacing: 0.05em; font-family: monospace; }
.cp-picker-input { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }

/* Detail panel (inside overlay) */
.cp-detail-header { display: flex; gap: 1rem; align-items: flex-start; margin-bottom: 0.75rem; }
.cp-detail-swatch { width: 48px; height: 48px; border-radius: var(--gi-radius-md); flex-shrink: 0; box-shadow: var(--gi-shadow-sm); }
.cp-detail-info { flex: 1; min-width: 0; }
.cp-detail-title { font-size: var(--gi-font-size-xs); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--gi-text-muted); margin: 0 0 0.625rem; }

.cp-format-row { display: flex; align-items: center; gap: 0.625rem; padding: 0.375rem 0.625rem; background: var(--gi-bg); border-radius: var(--gi-radius-sm); cursor: pointer; transition: background 0.15s; }
.cp-format-row + .cp-format-row { margin-top: 0.375rem; }
.cp-format-row:hover { background: var(--gi-surface); box-shadow: var(--gi-shadow-sm); }
.cp-format-row:active { transform: scale(0.99); }
.cp-format-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--gi-text-muted); min-width: 2rem; }
.cp-format-value { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.8rem; color: var(--gi-text); flex: 1; background: none; padding: 0; border: none; }
.cp-format-copy { color: var(--gi-text-muted); opacity: 0; transition: opacity 0.15s; flex-shrink: 0; }
.cp-format-row:hover .cp-format-copy { opacity: 1; }

/* Sliders */
.cp-adjust { padding-top: 1rem; margin-top: 1rem; border-top: 1px solid var(--gi-border); }
.cp-adjust-title { font-size: var(--gi-font-size-xs); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--gi-text-muted); margin: 0 0 0.875rem; }
.cp-slider-group { margin-bottom: 0.875rem; }
.cp-slider-group:last-of-type { margin-bottom: 0; }
.cp-slider-label { display: flex; justify-content: space-between; align-items: center; font-size: var(--gi-font-size-sm); color: var(--gi-text); margin-bottom: 0.375rem; font-weight: 500; }
.cp-slider-value { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.75rem; color: var(--gi-text-muted); font-weight: 500; }
.cp-slider { width: 100%; height: 6px; border-radius: var(--gi-radius-pill); background: var(--gi-bg); appearance: none; cursor: pointer; }
.cp-slider--hue { background: linear-gradient(to right, hsl(0,70%,55%), hsl(60,70%,55%), hsl(120,70%,55%), hsl(180,70%,55%), hsl(240,70%,55%), hsl(300,70%,55%), hsl(360,70%,55%)); }
.cp-slider::-webkit-slider-thumb { appearance: none; width: 18px; height: 18px; border-radius: 50%; background: var(--gi-brand); cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.2); border: 2px solid #fff; transition: transform 0.15s; }
.cp-slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
.cp-slider::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: var(--gi-brand); cursor: pointer; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.cp-slider:focus-visible { outline: 2px solid var(--gi-brand); outline-offset: 2px; }

.cp-adjust-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
.cp-reset-btn { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.5rem 0.875rem; background: var(--gi-surface); color: var(--gi-text); border: 1px solid var(--gi-border); border-radius: var(--gi-radius-md); font-size: var(--gi-font-size-sm); font-weight: 500; cursor: pointer; min-height: 44px; transition: border-color 0.15s, transform 0.1s; }
.cp-reset-btn:hover { border-color: var(--gi-text-muted); }
.cp-reset-btn:active { transform: scale(0.97); }
.cp-apply-btn { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.5rem 1.125rem; background: var(--gi-brand); color: #fff; border: none; border-radius: var(--gi-radius-md); font-size: var(--gi-font-size-sm); font-weight: 600; cursor: pointer; min-height: 44px; transition: background 0.15s, transform 0.1s, box-shadow 0.15s; box-shadow: 0 1px 3px rgba(10,170,142,0.3); }
.cp-apply-btn:hover { background: #089678; box-shadow: 0 2px 6px rgba(10,170,142,0.4); }
.cp-apply-btn:active { transform: scale(0.97); }
.cp-apply-btn:focus-visible, .cp-reset-btn:focus-visible { outline: 2px solid var(--gi-brand); outline-offset: 2px; }

/* Contrast */
.cp-contrast-section { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--gi-border); }
.cp-contrast-row { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
.cp-contrast-item { flex: 1; padding: 0.5rem; border-radius: var(--gi-radius-md); display: flex; align-items: center; gap: 0.5rem; border: 1px solid var(--gi-border); }
.cp-contrast-text { font-size: 1.25rem; font-weight: 700; }
.cp-contrast-ratio { font-size: 0.75rem; font-family: monospace; color: var(--gi-text-muted); }
.cp-contrast-badge { font-size: 0.65rem; font-weight: 700; padding: 0.125rem 0.375rem; border-radius: var(--gi-radius-sm); }
.cp-contrast-badge--pass { background: var(--gi-brand-fade); color: var(--gi-brand); }
.cp-contrast-badge--fail { background: var(--gi-tint-red-bg); color: var(--gi-tint-red-text); }

/* Preview */
.cp-preview { margin-top: 1.5rem; }
.cp-preview-title { font-size: var(--gi-font-size-xs); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--gi-text-muted); margin: 0 0 0.75rem; }
.cp-preview-card { background: var(--gi-surface); border-radius: var(--gi-radius-lg); overflow: hidden; box-shadow: var(--gi-shadow); border: 2px solid; }
.cp-preview-header { padding: 0.625rem 0.875rem; display: flex; align-items: center; }
.cp-preview-dots { display: flex; gap: 0.375rem; }
.cp-preview-dots span { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.45); }
.cp-preview-body { padding: 1.25rem; }
.cp-preview-text { font-size: var(--gi-font-size-lg); font-weight: 700; margin-bottom: 0.375rem; }
.cp-preview-text-sm { font-size: var(--gi-font-size-sm); opacity: 0.65; margin-bottom: 1rem; }
.cp-preview-cta { display: inline-flex; align-items: center; justify-content: center; padding: 0.625rem 1.25rem; border-radius: var(--gi-radius-md); font-size: var(--gi-font-size-sm); font-weight: 600; border: none; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; }
.cp-preview-cta:hover { transform: translateY(-1px); box-shadow: var(--gi-shadow-sm); }
.cp-preview-cta:active { transform: scale(0.97); }

/* Modals */
.cp-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 300; }
.cp-modal { background: var(--gi-surface); border-radius: var(--gi-radius-xl); box-shadow: var(--gi-shadow-xl); min-width: 320px; max-width: 480px; width: 90%; max-height: 80vh; overflow: auto; }
.cp-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.25rem 0.75rem; border-bottom: 1px solid var(--gi-border); }
.cp-modal-title { font-size: var(--gi-font-size-lg); font-weight: 700; color: var(--gi-text); margin: 0; }
.cp-modal-body { padding: 1.25rem; }
.cp-close-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: none; border: 1px solid var(--gi-border); border-radius: var(--gi-radius-md); color: var(--gi-text-muted); cursor: pointer; transition: color 0.15s, border-color 0.15s; }
.cp-close-btn:hover { color: var(--gi-text); border-color: var(--gi-text-muted); }

.cp-export-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
.cp-export-card { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem; background: var(--gi-bg); border: 1px solid var(--gi-border); border-radius: var(--gi-radius-lg); font-size: var(--gi-font-size-sm); font-weight: 500; color: var(--gi-text); cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s; }
.cp-export-card:hover { border-color: var(--gi-brand); box-shadow: var(--gi-shadow-sm); transform: translateY(-1px); }

.cp-modal--gradient { min-width: 400px; }
.cp-gradient-toggle { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
.cp-gradient-btn { flex: 1; padding: 0.5rem; background: var(--gi-bg); border: 1px solid var(--gi-border); border-radius: var(--gi-radius-md); font-size: var(--gi-font-size-sm); color: var(--gi-text); cursor: pointer; transition: border-color 0.15s, background 0.15s; }
.cp-gradient-btn--active { background: var(--gi-brand-fade); border-color: var(--gi-brand); color: var(--gi-brand); font-weight: 600; }
.cp-gradient-preview { width: 100%; height: 120px; border-radius: var(--gi-radius-lg); margin-bottom: 1rem; }
.cp-gradient-code { display: flex; align-items: center; gap: 0.75rem; background: var(--gi-bg); border-radius: var(--gi-radius-md); padding: 0.75rem 1rem; }
.cp-gradient-code code { flex: 1; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.8rem; color: var(--gi-text); word-break: break-all; }
.cp-copy-btn { display: flex; align-items: center; padding: 0.375rem; background: none; border: none; color: var(--gi-text-muted); cursor: pointer; transition: color 0.15s; }
.cp-copy-btn:hover { color: var(--gi-brand); }

/* Toast */
.cp-toast { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; background: var(--gi-surface); color: var(--gi-text); border-radius: var(--gi-radius-pill); box-shadow: var(--gi-shadow-lg); font-size: var(--gi-font-size-sm); font-weight: 500; z-index: 500; border: 1px solid var(--gi-border); }

/* Transitions */
.cp-toast-anim-enter-active, .cp-toast-anim-leave-active { transition: opacity 0.2s, transform 0.2s var(--gi-ease-out); }
.cp-toast-anim-enter-from, .cp-toast-anim-leave-to { opacity: 0; transform: translateX(-50%) translateY(10px); }
.cp-fade-anim-enter-active, .cp-fade-anim-leave-active { transition: opacity 0.2s var(--gi-ease-out); }
.cp-fade-anim-enter-from, .cp-fade-anim-leave-to { opacity: 0; }

/* Responsive */
@media (max-width: 640px) {
  .cp-palette { flex-wrap: wrap; height: auto; }
  .cp-swatch { min-height: 120px; flex: 1 1 calc(50% - 0.375rem); }
  .cp-detail-overlay { position: static; width: 100%; border-radius: var(--gi-radius-xl); margin-top: 0.75rem; }
  .cp-add-strip { display: none; }
  .cp-actions { flex-direction: column; align-items: stretch; }
  .cp-actions-right { justify-content: center; }
  .cp-export-grid { grid-template-columns: 1fr; }
}
</style>
