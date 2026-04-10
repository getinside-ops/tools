import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { generateHarmony } from './useColorHarmony'

export interface PaletteColor {
  hex: string
  locked: boolean
}

export interface ColorFormats {
  hex: string
  rgb: string
  hsl: string
}

// --- Color conversion utilities ---

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace('#', '')
  const r = parseInt(cleaned.substring(0, 2), 16)
  const g = parseInt(cleaned.substring(2, 4), 16)
  const b = parseInt(cleaned.substring(4, 6), 16)
  return { r, g, b }
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360
  s /= 100
  l /= 100
  let r: number, g: number, b: number

  if (s === 0) {
    r = l
    g = l
    b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`
}

export function getColorFormats(hex: string): ColorFormats {
  const rgb = hexToRgb(hex)
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  return {
    hex: hex.toUpperCase(),
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
  }
}

export function adjustColor(hex: string, hueDelta: number, satDelta: number, lightDelta: number): string {
  const rgb = hexToRgb(hex)
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  let h = (hsl.h + hueDelta + 360) % 360
  let s = Math.max(0, Math.min(100, hsl.s + satDelta))
  let l = Math.max(0, Math.min(100, hsl.l + lightDelta))
  const newRgb = hslToRgb(h, s, l)
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b)
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase()
}

function randomColor(): string {
  const h = Math.floor(Math.random() * 360)
  const s = Math.floor(Math.random() * 41) + 40  // 40–80%
  const l = Math.floor(Math.random() * 31) + 35  // 35–65%
  return hslToHex(h, s, l)
}

export function initPalette(): PaletteColor[] {
  // Generate a beautiful random palette using the harmony engine
  const baseH = Math.floor(Math.random() * 360)
  const baseS = 40 + Math.floor(Math.random() * 40)
  const baseL = 35 + Math.floor(Math.random() * 30)
  const baseHex = hslToHex(baseH, baseS, baseL)
  const types: Array<'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'split-complementary' | 'monochromatic' | 'random-beautiful'> = [
    'random-beautiful', 'analogous', 'complementary', 'triadic', 'split-complementary'
  ]
  const type = types[Math.floor(Math.random() * types.length)]
  const colors = generateHarmony(baseHex, type, 5)
  return colors.map(hex => ({ hex, locked: false }))
}

export function generatePalette(current: PaletteColor[]): PaletteColor[] {
  return current.map(color => color.locked ? color : { hex: randomColor(), locked: false })
}

export function toggleLock(palette: PaletteColor[], index: number): PaletteColor[] {
  return palette.map((color, i) => i === index ? { ...color, locked: !color.locked } : color)
}

export function updateColor(palette: PaletteColor[], index: number, newHex: string): PaletteColor[] {
  return palette.map((color, i) => i === index ? { ...color, hex: newHex.toUpperCase() } : color)
}

// --- URL-synced palette state ---

export interface PaletteState {
  palette: Ref<PaletteColor[]>
  harmonyType: Ref<string>
  syncToUrl: () => void
}

export function usePaletteState(): PaletteState {
  const palette = ref<PaletteColor[]>(initPalette())
  const harmonyType = ref('random-beautiful')

  // Restore from URL query params in hash (e.g., #/color-palette?p=0aaa8e-b8d5b8&t=analogous)
  const hash = window.location.hash || ''
  const queryPart = hash.split('?')[1]
  if (queryPart) {
    const params = new URLSearchParams(queryPart)
    const paletteParam = params.get('p')
    const typeParam = params.get('t')
    if (paletteParam) {
      const colorHexes = paletteParam.split('-').filter((c: string) => /^[0-9A-Fa-f]{6}$/i.test(c))
      if (colorHexes.length >= 2) {
        palette.value = colorHexes.map((hex: string) => ({ hex: '#' + hex.toUpperCase(), locked: false }))
      }
    }
    if (typeParam) {
      const validTypes = ['analogous', 'complementary', 'triadic', 'tetradic', 'split-complementary', 'monochromatic', 'random-beautiful']
      if (validTypes.includes(typeParam)) harmonyType.value = typeParam
    }
  }

  function syncToUrl() {
    const colors = palette.value.map(c => c.hex.replace('#', '').toLowerCase())
    const type = harmonyType.value
    const currentHash = window.location.hash || '#/'
    const routePart = currentHash.split('?')[0]
    const newHash = routePart + '?p=' + colors.join('-') + '&t=' + type
    history.replaceState(null, '', window.location.pathname + newHash)
  }

  // Auto-sync on palette change (debounced)
  let syncTimer: ReturnType<typeof setTimeout> | null = null
  watch(palette, () => {
    if (syncTimer) clearTimeout(syncTimer)
    syncTimer = setTimeout(syncToUrl, 500)
  }, { deep: true })

  watch(harmonyType, syncToUrl)

  return { palette, harmonyType, syncToUrl }
}

// --- WCAG Contrast utilities ---

export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1)
  const l2 = relativeLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}
