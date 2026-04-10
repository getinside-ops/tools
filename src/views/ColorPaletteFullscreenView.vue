<template>
  <div class="cpf-fullscreen">
    <!-- Top toolbar -->
    <div class="cpf-toolbar" :class="{ 'cpf-toolbar--visible': toolbarVisible || hoverToolbar }">
      <div class="cpf-toolbar-left">
        <router-link to="/" class="cpf-back-btn" :aria-label="t('nav.back')">
          <ChevronLeft :size="18" />
        </router-link>
        <div class="cpf-harmony-selector">
          <button
            class="cpf-harmony-btn"
            @click="showHarmonyMenu = !showHarmonyMenu"
            :aria-expanded="showHarmonyMenu"
            :aria-label="t('colorPalette.full.harmony.label')"
          >
            <Sparkles :size="16" />
            <span>{{ harmonyLabel }}</span>
            <ChevronDown :size="14" class="cpf-chevron" :class="{ 'cpf-chevron--open': showHarmonyMenu }" />
          </button>
          <div v-if="showHarmonyMenu" class="cpf-harmony-menu" role="listbox">
            <button
              v-for="type in harmonyTypes"
              :key="type.value"
              class="cpf-harmony-option"
              :class="{ 'cpf-harmony-option--active': harmonyType === type.value }"
              role="option"
              :aria-selected="harmonyType === type.value"
              @click="selectHarmony(type.value)"
            >
              {{ type.label }}
            </button>
          </div>
        </div>
      </div>
      <div class="cpf-toolbar-right">
        <label class="cpf-tool-btn" :aria-label="t('colorPalette.full.extract')" tabindex="0">
          <ImageUp :size="16" />
          <input type="file" accept="image/*" class="cpf-upload-input" @change="handleImageUpload" />
        </label>
        <button class="cpf-tool-btn" @click="showGradientModal = true" :aria-label="t('colorPalette.full.gradient.label')">
          <Palette :size="16" />
        </button>
        <button class="cpf-tool-btn" @click="showExportModal = true" :aria-label="t('colorPalette.full.export.label')">
          <Download :size="16" />
        </button>
        <button class="cpf-generate-btn" @click="generate" :aria-label="t('colorPalette.full.generate')">
          <Shuffle :size="18" />
          <span class="cpf-generate-text">{{ t('colorPalette.full.generate') }}</span>
        </button>
      </div>
    </div>

    <!-- Color columns -->
    <div class="cpf-columns" role="group" :aria-label="t('colorPalette.title')">
      <div
        v-for="(color, i) in palette"
        :key="i"
        class="cpf-column"
        :class="{
          'cpf-column--locked': color.locked,
          'cpf-column--flash': flashIndex === i,
        }"
        :style="{ background: color.hex }"
        @click="lockToggle(i)"
      >
        <div class="cpf-column-icon">
          <Lock v-if="color.locked" :size="24" />
        </div>
        <div class="cpf-column-info">
          <button
            class="cpf-color-value"
            @click.stop="copyColor(color.hex, i)"
            :aria-label="`${color.hex} — ${t('colorPalette.full.copied')}`"
          >
            {{ copiedIndex === i ? '✓' : color.hex.toUpperCase() }}
          </button>
          <div class="cpf-color-actions">
            <button
              class="cpf-action-btn"
              @click.stop="openShades(i)"
              :aria-label="t('colorPalette.full.shades')"
            >
              <Layers :size="16" />
            </button>
            <button
              class="cpf-action-btn"
              @click.stop="copyColor(color.hex, i)"
              :aria-label="t('colorPalette.full.copied')"
            >
              <Copy :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Shades/Tints Panel -->
    <Transition name="cpf-slide-up">
      <div v-if="showShadesPanel" class="cpf-shades-panel" role="dialog" :aria-label="t('colorPalette.full.shades')">
        <div class="cpf-shades-header">
          <h3 class="cpf-shades-title">
            <span class="cpf-shades-swatch" :style="{ background: selectedColor?.hex }"></span>
            {{ selectedColor?.hex }} — {{ t('colorPalette.full.shades') }}
          </h3>
          <button class="cpf-close-btn" @click="showShadesPanel = false" :aria-label="t('colorPalette.full.keyboard.esc')">
            <X :size="20" />
          </button>
        </div>
        <div class="cpf-shades-grid">
          <div class="cpf-shades-section">
            <span class="cpf-shades-label">{{ t('colorPalette.full.tint') }}</span>
            <div class="cpf-shades-row">
              <div
                v-for="(shade, j) in tints"
                :key="'tint-' + j"
                class="cpf-shade-cell"
                :style="{ background: shade }"
                @click="copyColor(shade, -1)"
                :aria-label="shade"
              >
                <span class="cpf-shade-label" :style="{ color: getContrastColor(shade) }">{{ shade }}</span>
              </div>
            </div>
          </div>
          <div class="cpf-shades-section">
            <span class="cpf-shades-label">{{ t('colorPalette.full.tone') }}</span>
            <div class="cpf-shades-row">
              <div
                v-for="(shade, j) in tones"
                :key="'tone-' + j"
                class="cpf-shade-cell"
                :style="{ background: shade }"
                @click="copyColor(shade, -1)"
                :aria-label="shade"
              >
                <span class="cpf-shade-label" :style="{ color: getContrastColor(shade) }">{{ shade }}</span>
              </div>
            </div>
          </div>
          <div class="cpf-shades-section">
            <span class="cpf-shades-label">{{ t('colorPalette.full.shade') }}</span>
            <div class="cpf-shades-row">
              <div
                v-for="(shade, j) in shades"
                :key="'shade-' + j"
                class="cpf-shade-cell"
                :style="{ background: shade }"
                @click="copyColor(shade, -1)"
                :aria-label="shade"
              >
                <span class="cpf-shade-label" :style="{ color: getContrastColor(shade) }">{{ shade }}</span>
              </div>
            </div>
          </div>
          <!-- Contrast section -->
          <div class="cpf-contrast-section">
            <span class="cpf-shades-label">Contraste</span>
            <div class="cpf-contrast-row">
              <div class="cpf-contrast-item" style="background: #FFFFFF; border-color: #e0e0e0;">
                <span class="cpf-contrast-text" :style="{ color: selectedColor?.hex }">Aa</span>
                <span class="cpf-contrast-ratio">{{ contrastOnWhite.toFixed(1) }}:1</span>
                <span class="cpf-contrast-badge" :class="contrastOnWhite >= 4.5 ? 'cpf-contrast-badge--pass' : 'cpf-contrast-badge--fail'">
                  {{ contrastOnWhite >= 4.5 ? 'AA' : '—' }}
                </span>
              </div>
              <div class="cpf-contrast-item" style="background: #000000;">
                <span class="cpf-contrast-text" :style="{ color: selectedColor?.hex }">Aa</span>
                <span class="cpf-contrast-ratio">{{ contrastOnBlack.toFixed(1) }}:1</span>
                <span class="cpf-contrast-badge" :class="contrastOnBlack >= 4.5 ? 'cpf-contrast-badge--pass' : 'cpf-contrast-badge--fail'">
                  {{ contrastOnBlack >= 4.5 ? 'AA' : '—' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Export Modal -->
    <Teleport to="body">
      <Transition name="cpf-fade">
        <div v-if="showExportModal" class="cpf-modal-overlay" @click.self="showExportModal = false">
          <div class="cpf-modal" role="dialog" :aria-label="t('colorPalette.full.export.label')">
            <div class="cpf-modal-header">
              <h2 class="cpf-modal-title">{{ t('colorPalette.full.export.label') }}</h2>
              <button class="cpf-close-btn" @click="showExportModal = false" :aria-label="t('colorPalette.full.keyboard.esc')">
                <X :size="20" />
              </button>
            </div>
            <div class="cpf-modal-body">
              <div class="cpf-export-grid">
                <button class="cpf-export-card" @click="exportFormat('css')">
                  <Code :size="20" />
                  <span>{{ t('colorPalette.full.export.css') }}</span>
                </button>
                <button class="cpf-export-card" @click="exportFormat('scss')">
                  <Code :size="20" />
                  <span>{{ t('colorPalette.full.export.scss') }}</span>
                </button>
                <button class="cpf-export-card" @click="exportFormat('json')">
                  <Braces :size="20" />
                  <span>{{ t('colorPalette.full.export.json') }}</span>
                </button>
                <button class="cpf-export-card" @click="exportFormat('tailwind')">
                  <Wind :size="20" />
                  <span>{{ t('colorPalette.full.export.tailwind') }}</span>
                </button>
                <button class="cpf-export-card" @click="exportFormat('url')">
                  <LinkIcon :size="20" />
                  <span>{{ t('colorPalette.full.export.url') }}</span>
                </button>
                <button class="cpf-export-card" @click="exportFormat('png')">
                  <ImageIcon :size="20" />
                  <span>{{ t('colorPalette.full.export.png') }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Gradient Modal -->
    <Teleport to="body">
      <Transition name="cpf-fade">
        <div v-if="showGradientModal" class="cpf-modal-overlay" @click.self="showGradientModal = false">
          <div class="cpf-modal cpf-modal--gradient" role="dialog" :aria-label="t('colorPalette.full.gradient.label')">
            <div class="cpf-modal-header">
              <h2 class="cpf-modal-title">{{ t('colorPalette.full.gradient.label') }}</h2>
              <button class="cpf-close-btn" @click="showGradientModal = false" :aria-label="t('colorPalette.full.keyboard.esc')">
                <X :size="20" />
              </button>
            </div>
            <div class="cpf-modal-body">
              <div class="cpf-gradient-type-toggle">
                <button
                  class="cpf-gradient-type-btn"
                  :class="{ 'cpf-gradient-type-btn--active': gradientType === 'linear' }"
                  @click="gradientType = 'linear'"
                >{{ t('colorPalette.full.gradient.linear') }}</button>
                <button
                  class="cpf-gradient-type-btn"
                  :class="{ 'cpf-gradient-type-btn--active': gradientType === 'radial' }"
                  @click="gradientType = 'radial'"
                >{{ t('colorPalette.full.gradient.radial') }}</button>
              </div>
              <div class="cpf-gradient-preview" :style="{ background: gradientCss }"></div>
              <div class="cpf-gradient-code">
                <code>{{ gradientCss }}</code>
                <button class="cpf-copy-code-btn" @click="copyGradient" :aria-label="t('colorPalette.full.gradient.copy')">
                  <Copy :size="16" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Toast -->
    <Transition name="cpf-toast">
      <div v-if="toastMessage" class="cpf-toast" role="status" aria-live="polite">
        <CheckCircle :size="16" />
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>

    <!-- Keyboard shortcuts hint -->
    <div class="cpf-shortcuts-hint">
      <kbd>Space</kbd> {{ t('colorPalette.full.keyboard.space') }}
      <span class="cpf-shortcuts-divider">·</span>
      <kbd>C</kbd> {{ t('colorPalette.full.keyboard.c') }}
      <span class="cpf-shortcuts-divider">·</span>
      <kbd>L</kbd> {{ t('colorPalette.full.keyboard.l') }}
      <span class="cpf-shortcuts-divider">·</span>
      <kbd>G</kbd> {{ t('colorPalette.full.keyboard.g') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ChevronLeft, ChevronDown, Shuffle, Sparkles, Download,
  Lock, Copy, Layers, X, CheckCircle, Code, Braces,
  Wind, Link as LinkIcon, ImageIcon, Palette, ImageUp,
} from 'lucide-vue-next'
import {
  toggleLock as paletteToggleLock,
  usePaletteState,
  getContrastRatio,
} from '../composables/useColorPalette'
import { generateHarmony, type HarmonyType } from '../composables/useColorHarmony'

const { t } = useI18n()
const { palette, harmonyType, syncToUrl } = usePaletteState()

// UI state
const toolbarVisible = ref(true)
const hoverToolbar = ref(false)
const showHarmonyMenu = ref(false)
const showExportModal = ref(false)
const showGradientModal = ref(false)
const showShadesPanel = ref(false)
const flashIndex = ref<number | null>(null)
const toastMessage = ref<string | null>(null)
const gradientType = ref<'linear' | 'radial'>('linear')
const selectedColorIndex = ref<number | null>(null)
const copiedIndex = ref<number | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null
let hideToolbarTimer: ReturnType<typeof setTimeout> | null = null

// Harmony types
const harmonyTypes = [
  { value: 'random-beautiful' as HarmonyType, label: t('colorPalette.full.harmony.randomBeautiful') },
  { value: 'analogous' as HarmonyType, label: t('colorPalette.full.harmony.analogous') },
  { value: 'complementary' as HarmonyType, label: t('colorPalette.full.harmony.complementary') },
  { value: 'triadic' as HarmonyType, label: t('colorPalette.full.harmony.triadic') },
  { value: 'tetradic' as HarmonyType, label: t('colorPalette.full.harmony.tetradic') },
  { value: 'split-complementary' as HarmonyType, label: t('colorPalette.full.harmony.splitComplementary') },
  { value: 'monochromatic' as HarmonyType, label: t('colorPalette.full.harmony.monochromatic') },
]

const harmonyLabel = computed(() => {
  return harmonyTypes.find(h => h.value === harmonyType.value)?.label || ''
})

const selectedColor = computed(() => {
  if (selectedColorIndex.value === null) return null
  return palette.value[selectedColorIndex.value]
})

const tints = computed(() => {
  if (!selectedColor.value) return []
  return genTints(selectedColor.value.hex, 6)
})

const tones = computed(() => {
  if (!selectedColor.value) return []
  return genTones(selectedColor.value.hex, 6)
})

const shades = computed(() => {
  if (!selectedColor.value) return []
  return genShades(selectedColor.value.hex, 6)
})

const contrastOnWhite = computed(() => {
  if (!selectedColor.value) return 1
  return getContrastRatio(selectedColor.value.hex, '#FFFFFF')
})

const contrastOnBlack = computed(() => {
  if (!selectedColor.value) return 1
  return getContrastRatio(selectedColor.value.hex, '#000000')
})

const gradientCss = computed(() => {
  const colors = palette.value.map(c => c.hex)
  if (gradientType.value === 'linear') {
    return `linear-gradient(135deg, ${colors.join(', ')})`
  }
  return `radial-gradient(circle, ${colors.join(', ')})`
})

// --- Actions ---

function generate() {
  const unlocked = palette.value.filter(c => !c.locked)
  if (unlocked.length === 0) {
    const base = palette.value[0].hex
    const newColors = generateHarmony(base, harmonyType.value as HarmonyType, palette.value.length)
    palette.value = palette.value.map((c, i) => ({ ...c, hex: newColors[i] }))
  } else {
    const base = unlocked[0].hex
    const newColors = generateHarmony(base, harmonyType.value as HarmonyType, palette.value.length)
    let colorIdx = 0
    palette.value = palette.value.map(c => {
      if (c.locked) return c
      return { ...c, hex: newColors[colorIdx++] }
    })
  }
  syncToUrl()
}

function lockToggle(index: number) {
  palette.value = paletteToggleLock(palette.value, index)
  syncToUrl()
}

function selectHarmony(type: HarmonyType) {
  harmonyType.value = type
  showHarmonyMenu.value = false
  generate()
}

function openShades(index: number) {
  selectedColorIndex.value = index
  showShadesPanel.value = true
}

async function copyColor(hex: string, index: number) {
  try {
    await navigator.clipboard.writeText(hex)
    if (index >= 0) {
      flashIndex.value = index
      copiedIndex.value = index
      setTimeout(() => { flashIndex.value = null }, 300)
      setTimeout(() => { copiedIndex.value = null }, 2000)
    }
    showToast(t('colorPalette.full.toast.copied'))
  } catch { /* silent */ }
}

function exportFormat(format: string) {
  let text = ''
  switch (format) {
    case 'css':
      text = ':root {\n' + palette.value.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n') + '\n}'
      break
    case 'scss':
      text = palette.value.map((c, i) => `$color-${i + 1}: ${c.hex};`).join('\n')
      break
    case 'json':
      text = JSON.stringify(palette.value.map(c => ({ hex: c.hex, locked: c.locked })), null, 2)
      break
    case 'tailwind':
      text = 'colors: {\n' + palette.value.map((c, i) => `  'brand-${i + 1}': '${c.hex}',`).join('\n') + '\n}'
      break
    case 'url':
      syncToUrl()
      text = window.location.href
      showToast(t('colorPalette.full.toast.urlCopied'))
      break
    case 'png':
      showToast('PNG export — coming soon')
      return
  }
  if (text) {
    navigator.clipboard.writeText(text)
    showToast(t('colorPalette.full.toast.cssCopied'))
  }
  showExportModal.value = false
}

async function copyGradient() {
  try {
    await navigator.clipboard.writeText(gradientCss.value)
    showToast(t('colorPalette.full.toast.cssCopied'))
  } catch { /* silent */ }
}

async function handleImageUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = Math.min(img.width, 500)
    canvas.height = Math.min(img.height, 500)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const colors = extractColors(canvas, 5)
    if (colors.length > 0) {
      palette.value = colors.map(hex => ({ hex, locked: false }))
      syncToUrl()
      showToast(t('colorPalette.full.toast.extracted'))
    }
  }
  img.src = URL.createObjectURL(file)
  ;(e.target as HTMLInputElement).value = ''
}

function showToast(msg: string) {
  if (toastTimer) clearTimeout(toastTimer)
  toastMessage.value = msg
  toastTimer = setTimeout(() => { toastMessage.value = null }, 2500)
}

// --- Color utilities ---

function toHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function toHex(h: number, s: number, l: number): string {
  s = Math.max(0, Math.min(100, s)) / 100
  l = Math.max(0, Math.min(100, l)) / 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase()
}

function genTints(hex: string, count: number): string[] {
  const { h, s, l } = toHsl(hex)
  return Array.from({ length: count }, (_, i) => {
    const nl = l + ((95 - l) / count) * (i + 1)
    return toHex(h, s * 0.8, nl)
  })
}

function genShades(hex: string, count: number): string[] {
  const { h, s, l } = toHsl(hex)
  return Array.from({ length: count }, (_, i) => {
    const nl = l - (l / count) * (i + 1)
    return toHex(h, Math.min(s + 10, 90), nl)
  })
}

function genTones(hex: string, count: number): string[] {
  const { h, s, l } = toHsl(hex)
  return Array.from({ length: count }, (_, i) => {
    const ns = s - (s / count) * (i + 1)
    return toHex(h, Math.max(ns, 5), l)
  })
}

function getContrastColor(hex: string): string {
  return toHsl(hex).l > 50 ? '#000000' : '#FFFFFF'
}

function extractColors(canvas: HTMLCanvasElement, count: number): string[] {
  const ctx = canvas.getContext('2d')
  if (!ctx) return []
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  const map = new Map<string, number>()
  const step = Math.max(1, Math.floor(Math.sqrt(data.length / 4 / 5000)))
  for (let i = 0; i < data.length; i += step * 4) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]]
    if (a < 128) continue
    const key = `${Math.round(r / 16) * 16},${Math.round(g / 16) * 16},${Math.round(b / 16) * 16}`
    map.set(key, (map.get(key) || 0) + 1)
  }
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([k]) => {
      const [r, g, b] = k.split(',').map(Number)
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`
    })
}

// --- Keyboard shortcuts ---

function handleKeydown(e: KeyboardEvent) {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
  if (e.code === 'Space') { e.preventDefault(); generate() }
  else if (e.key === 'c' && !e.metaKey && !e.ctrlKey) {
    navigator.clipboard.writeText(palette.value.map(c => c.hex).join(' '))
    showToast(t('colorPalette.full.toast.copied'))
  }
  else if (e.key === 'l') {
    const idx = palette.value.findIndex(c => !c.locked)
    if (idx >= 0) lockToggle(idx)
  }
  else if (e.key === 'g') { showGradientModal.value = !showGradientModal.value }
  else if (e.key === 'e') { showExportModal.value = !showExportModal.value }
  else if (e.key === 'Escape') {
    showExportModal.value = false
    showGradientModal.value = false
    showShadesPanel.value = false
    showHarmonyMenu.value = false
  }
}

// --- Toolbar auto-hide ---

function resetHideTimer() {
  toolbarVisible.value = true
  if (hideToolbarTimer) clearTimeout(hideToolbarTimer)
  hideToolbarTimer = setTimeout(() => {
    if (!hoverToolbar.value) toolbarVisible.value = false
  }, 3000)
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('mousemove', resetHideTimer)
  document.addEventListener('click', (e) => {
    if (showHarmonyMenu.value) {
      const menu = document.querySelector('.cpf-harmony-selector')
      if (menu && !menu.contains(e.target as Node)) showHarmonyMenu.value = false
    }
  })
  // Prevent body scroll while fullscreen
  document.body.style.overflow = 'hidden'
  resetHideTimer()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('mousemove', resetHideTimer)
  if (hideToolbarTimer) clearTimeout(hideToolbarTimer)
  if (toastTimer) clearTimeout(toastTimer)
  // Restore body scroll
  document.body.style.overflow = ''
})
</script>

<style scoped>
.cpf-fullscreen {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: var(--gi-bg);
  overflow: hidden;
}

/* Toolbar */
.cpf-toolbar {
  position: absolute;
  top: 0; left: 0; right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  background: var(--gi-surface);
  border-bottom: 1px solid var(--gi-border);
  box-shadow: var(--gi-shadow-sm);
  transform: translateY(-100%);
  transition: transform 0.3s var(--gi-ease-out);
}
.cpf-toolbar--visible { transform: translateY(0); }

.cpf-toolbar-left { display: flex; align-items: center; gap: 0.75rem; }
.cpf-toolbar-right { display: flex; align-items: center; gap: 0.5rem; }

.cpf-back-btn {
  display: flex; align-items: center; padding: 0.375rem;
  color: var(--gi-text-muted); border-radius: var(--gi-radius-md);
  transition: color 0.15s, background 0.15s;
}
.cpf-back-btn:hover { color: var(--gi-text); background: var(--gi-bg); }

/* Harmony selector */
.cpf-harmony-selector { position: relative; }
.cpf-harmony-btn {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 0.875rem; background: var(--gi-bg);
  border: 1px solid var(--gi-border); border-radius: var(--gi-radius-md);
  font-size: var(--gi-font-size-sm); font-weight: 500; color: var(--gi-text);
  cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s;
}
.cpf-harmony-btn:hover { border-color: var(--gi-brand); box-shadow: var(--gi-shadow-sm); }
.cpf-chevron { transition: transform 0.2s var(--gi-ease-out); }
.cpf-chevron--open { transform: rotate(180deg); }

.cpf-harmony-menu {
  position: absolute; top: calc(100% + 0.5rem); left: 0;
  background: var(--gi-surface); border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg); box-shadow: var(--gi-shadow-lg);
  min-width: 200px; overflow: hidden; z-index: 200;
}
.cpf-harmony-option {
  display: block; width: 100%; padding: 0.625rem 1rem; text-align: left;
  background: none; border: none; font-size: var(--gi-font-size-sm);
  color: var(--gi-text); cursor: pointer; transition: background 0.1s;
}
.cpf-harmony-option:hover { background: var(--gi-bg); }
.cpf-harmony-option--active { background: var(--gi-brand-fade); color: var(--gi-brand); font-weight: 600; }

/* Tool buttons */
.cpf-tool-btn {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; background: var(--gi-bg);
  border: 1px solid var(--gi-border); border-radius: var(--gi-radius-md);
  color: var(--gi-text-muted); cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.cpf-tool-btn:hover { color: var(--gi-text); border-color: var(--gi-brand); }
.cpf-upload-input { display: none; }

.cpf-generate-btn {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 1.25rem; background: var(--gi-brand); color: #fff;
  border: none; border-radius: var(--gi-radius-md);
  font-weight: 600; font-size: var(--gi-font-size-sm); cursor: pointer;
  min-height: 44px; transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
  box-shadow: 0 1px 3px rgba(10, 170, 142, 0.3);
}
.cpf-generate-btn:hover { background: #089678; box-shadow: 0 2px 6px rgba(10, 170, 142, 0.4); }
.cpf-generate-btn:active { transform: scale(0.97); }
.cpf-generate-text { display: none; }
@media (min-width: 640px) { .cpf-generate-text { display: inline; } }

/* Columns */
.cpf-columns { display: flex; flex: 1; min-height: 0; }
.cpf-column {
  flex: 1; display: flex; flex-direction: column;
  justify-content: space-between; align-items: center;
  position: relative; cursor: pointer;
  transition: flex 0.3s var(--gi-ease-out);
}
.cpf-column:hover { flex: 1.2; }
.cpf-column--flash { animation: cpf-flash 0.3s ease-out; }
@keyframes cpf-flash { 0% { filter: brightness(1.5); } 100% { filter: brightness(1); } }

.cpf-column-icon {
  padding-top: 1.5rem; opacity: 0; transition: opacity 0.2s;
  color: white; text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}
.cpf-column--locked .cpf-column-icon { opacity: 1; }
.cpf-column:hover .cpf-column-icon { opacity: 0.7; }

.cpf-column-info {
  padding: 1rem; display: flex; flex-direction: column;
  align-items: center; gap: 0.5rem;
}
.cpf-color-value {
  background: rgba(0, 0, 0, 0.2); backdrop-filter: blur(4px);
  border: none; border-radius: var(--gi-radius-md);
  padding: 0.375rem 0.75rem; font-size: 0.85rem; font-weight: 700;
  color: white; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  cursor: pointer; transition: background 0.15s;
}
.cpf-color-value:hover { background: rgba(0, 0, 0, 0.35); }

.cpf-color-actions {
  display: flex; gap: 0.375rem; opacity: 0; transition: opacity 0.2s;
}
.cpf-column:hover .cpf-color-actions { opacity: 1; }
.cpf-action-btn {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px); border: none; border-radius: var(--gi-radius-sm);
  color: white; cursor: pointer; transition: background 0.15s;
}
.cpf-action-btn:hover { background: rgba(0, 0, 0, 0.4); }

/* Shades panel */
.cpf-shades-panel {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: var(--gi-surface); border-top: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-xl) var(--gi-radius-xl) 0 0;
  box-shadow: var(--gi-shadow-lg); z-index: 150; padding: 1.25rem;
}
.cpf-shades-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.cpf-shades-title {
  display: flex; align-items: center; gap: 0.75rem;
  font-size: var(--gi-font-size-sm); font-weight: 600; color: var(--gi-text); margin: 0;
}
.cpf-shades-swatch { width: 32px; height: 32px; border-radius: var(--gi-radius-md); box-shadow: var(--gi-shadow-sm); }
.cpf-close-btn {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; background: none;
  border: 1px solid var(--gi-border); border-radius: var(--gi-radius-md);
  color: var(--gi-text-muted); cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.cpf-close-btn:hover { color: var(--gi-text); border-color: var(--gi-text-muted); }

.cpf-shades-grid { display: flex; flex-direction: column; gap: 0.75rem; }
.cpf-shades-section { display: flex; align-items: center; gap: 0.75rem; }
.cpf-shades-label {
  font-size: 0.7rem; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.05em; color: var(--gi-text-muted); min-width: 3rem;
}
.cpf-shades-row { display: flex; gap: 0.375rem; flex: 1; }
.cpf-shade-cell {
  flex: 1; height: 48px; border-radius: var(--gi-radius-sm);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: transform 0.1s;
}
.cpf-shade-cell:hover { transform: scale(1.05); }
.cpf-shade-label {
  font-size: 0.6rem; font-weight: 600; font-family: monospace;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Contrast section */
.cpf-contrast-section {
  display: flex; align-items: center; gap: 0.75rem;
  margin-top: 0.75rem; padding-top: 0.75rem;
  border-top: 1px solid var(--gi-border);
}
.cpf-contrast-row { display: flex; gap: 0.5rem; flex: 1; }
.cpf-contrast-item {
  flex: 1; padding: 0.5rem; border-radius: var(--gi-radius-md);
  display: flex; align-items: center; gap: 0.5rem; border: 1px solid var(--gi-border);
}
.cpf-contrast-text { font-size: 1.25rem; font-weight: 700; }
.cpf-contrast-ratio { font-size: 0.75rem; font-family: monospace; color: var(--gi-text-muted); }
.cpf-contrast-badge {
  font-size: 0.65rem; font-weight: 700; padding: 0.125rem 0.375rem;
  border-radius: var(--gi-radius-sm);
}
.cpf-contrast-badge--pass { background: var(--gi-brand-fade); color: var(--gi-brand); }
.cpf-contrast-badge--fail { background: var(--gi-tint-red-bg); color: var(--gi-tint-red-text); }

/* Modals */
.cpf-modal-overlay {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px); display: flex;
  align-items: center; justify-content: center; z-index: 300;
}
.cpf-modal {
  background: var(--gi-surface); border-radius: var(--gi-radius-xl);
  box-shadow: var(--gi-shadow-xl); min-width: 320px; max-width: 480px;
  width: 90%; max-height: 80vh; overflow: auto;
}
.cpf-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.25rem 1.25rem 0.75rem; border-bottom: 1px solid var(--gi-border);
}
.cpf-modal-title { font-size: var(--gi-font-size-lg); font-weight: 700; color: var(--gi-text); margin: 0; }
.cpf-modal-body { padding: 1.25rem; }

.cpf-export-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
.cpf-export-card {
  display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
  padding: 1rem; background: var(--gi-bg); border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg); font-size: var(--gi-font-size-sm);
  font-weight: 500; color: var(--gi-text); cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s;
}
.cpf-export-card:hover { border-color: var(--gi-brand); box-shadow: var(--gi-shadow-sm); transform: translateY(-1px); }

.cpf-modal--gradient { min-width: 400px; }
.cpf-gradient-type-toggle { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
.cpf-gradient-type-btn {
  flex: 1; padding: 0.5rem; background: var(--gi-bg);
  border: 1px solid var(--gi-border); border-radius: var(--gi-radius-md);
  font-size: var(--gi-font-size-sm); color: var(--gi-text); cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.cpf-gradient-type-btn--active { background: var(--gi-brand-fade); border-color: var(--gi-brand); color: var(--gi-brand); font-weight: 600; }
.cpf-gradient-preview { width: 100%; height: 120px; border-radius: var(--gi-radius-lg); margin-bottom: 1rem; }
.cpf-gradient-code {
  display: flex; align-items: center; gap: 0.75rem;
  background: var(--gi-bg); border-radius: var(--gi-radius-md); padding: 0.75rem 1rem;
}
.cpf-gradient-code code {
  flex: 1; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.8rem; color: var(--gi-text); word-break: break-all;
}
.cpf-copy-code-btn {
  display: flex; align-items: center; padding: 0.375rem;
  background: none; border: none; color: var(--gi-text-muted);
  cursor: pointer; transition: color 0.15s;
}
.cpf-copy-code-btn:hover { color: var(--gi-brand); }

/* Toast */
.cpf-toast {
  position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.75rem 1.25rem; background: var(--gi-surface); color: var(--gi-text);
  border-radius: var(--gi-radius-pill); box-shadow: var(--gi-shadow-lg);
  font-size: var(--gi-font-size-sm); font-weight: 500; z-index: 500;
  border: 1px solid var(--gi-border);
}

/* Shortcuts hint */
.cpf-shortcuts-hint {
  position: fixed; bottom: 0.75rem; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 0.375rem;
  padding: 0.375rem 0.75rem; background: var(--gi-surface);
  border: 1px solid var(--gi-border); border-radius: var(--gi-radius-pill);
  font-size: 0.7rem; color: var(--gi-text-muted); z-index: 50; white-space: nowrap;
}
.cpf-shortcuts-hint kbd {
  display: inline-block; padding: 0.125rem 0.375rem;
  background: var(--gi-bg); border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-sm); font-family: monospace;
  font-size: 0.65rem; font-weight: 600;
}
.cpf-shortcuts-divider { color: var(--gi-border); }

/* Transitions */
.cpf-slide-up-enter-active, .cpf-slide-up-leave-active { transition: transform 0.3s var(--gi-ease-out), opacity 0.3s; }
.cpf-slide-up-enter-from, .cpf-slide-up-leave-to { transform: translateY(100%); opacity: 0; }
.cpf-fade-enter-active, .cpf-fade-leave-active { transition: opacity 0.2s var(--gi-ease-out); }
.cpf-fade-enter-from, .cpf-fade-leave-to { opacity: 0; }
.cpf-toast-enter-active, .cpf-toast-leave-active { transition: opacity 0.2s, transform 0.2s var(--gi-ease-out); }
.cpf-toast-enter-from, .cpf-toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(10px); }

/* Responsive */
@media (max-width: 640px) {
  .cpf-columns { flex-direction: column; }
  .cpf-column { min-height: 120px; }
  .cpf-shades-row { flex-wrap: wrap; }
  .cpf-shade-cell { min-height: 36px; flex: 1 1 calc(33.333% - 0.25rem); }
  .cpf-export-grid { grid-template-columns: 1fr; }
  .cpf-modal { min-width: auto; width: 95%; margin: 1rem; }
  .cpf-shortcuts-hint { display: none; }
}

/* Dark mode */
[data-theme="dark"] .cpf-color-value { text-shadow: 0 1px 4px rgba(0, 0, 0, 0.7); }
[data-theme="dark"] .cpf-shade-label { text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6); }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .cpf-column, .cpf-shade-cell, .cpf-export-card { transition: none; }
  .cpf-slide-up-enter-active, .cpf-slide-up-leave-active,
  .cpf-fade-enter-active, .cpf-fade-leave-active,
  .cpf-toast-enter-active, .cpf-toast-leave-active { transition: opacity 0.1s; }
}
</style>
