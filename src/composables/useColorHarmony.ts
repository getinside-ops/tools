export type HarmonyType =
  | 'random-beautiful'
  | 'analogous'
  | 'complementary'
  | 'triadic'
  | 'tetradic'
  | 'split-complementary'
  | 'monochromatic'

// --- Internal color conversion utilities ---

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const cleaned = hex.replace('#', '')
  const r = parseInt(cleaned.substring(0, 2), 16) / 255
  const g = parseInt(cleaned.substring(2, 4), 16) / 255
  const b = parseInt(cleaned.substring(4, 6), 16) / 255
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

function hslToHex(h: number, s: number, l: number): string {
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

/** Clamp HSL values to a "pleasant" range so generated colors are always usable */
function clampHsl(h: number, s: number, l: number): { h: number; s: number; l: number } {
  return {
    h: ((h % 360) + 360) % 360,
    s: Math.max(15, Math.min(90, s)),
    l: Math.max(25, Math.min(80, l)),
  }
}

// --- Public API ---

export function generateHarmony(
  baseHex: string,
  type: HarmonyType,
  count: number = 5
): string[] {
  const base = hexToHsl(baseHex)

  switch (type) {
    case 'analogous': {
      const step = 30
      const startH = base.h - Math.floor((count - 1) / 2) * step
      return Array.from({ length: count }, (_, i) => {
        const { h, s, l } = clampHsl(
          startH + i * step,
          base.s,
          base.l + (i - Math.floor(count / 2)) * 5
        )
        return hslToHex(h, s, l)
      })
    }

    case 'complementary': {
      const colors: string[] = []
      // 3 analogous around base
      for (let i = 0; i < 3; i++) {
        const { h, s, l } = clampHsl(base.h + (i - 1) * 25, base.s, base.l + (i - 1) * 5)
        colors.push(hslToHex(h, s, l))
      }
      // Complement
      const comp = clampHsl(base.h + 180, base.s, base.l)
      colors.push(hslToHex(comp.h, comp.s, comp.l))
      // Slightly lighter variant of complement
      const compVar = clampHsl(base.h + 180, Math.min(base.s + 10, 90), Math.max(base.l - 10, 25))
      colors.push(hslToHex(compVar.h, compVar.s, compVar.l))
      return colors
    }

    case 'triadic': {
      const colors: string[] = []
      for (let i = 0; i < 3; i++) {
        const { h, s, l } = clampHsl(base.h + i * 120, base.s, base.l)
        colors.push(hslToHex(h, s, l))
      }
      // 2 lighter variants of first two
      for (let i = 0; i < 2; i++) {
        const { h, s, l } = clampHsl(base.h + i * 120, Math.max(base.s - 15, 15), base.l + 20)
        colors.push(hslToHex(h, s, l))
      }
      return colors
    }

    case 'tetradic': {
      const offsets = [0, 90, 180, 270]
      return offsets.map((offset, i) => {
        const { h, s, l } = clampHsl(
          base.h + offset,
          base.s,
          base.l + (offset === 0 ? 0 : offset === 180 ? -5 : 5)
        )
        return hslToHex(h, s, l)
      }).concat([hslToHex(
        clampHsl(base.h + 45, Math.max(base.s - 10, 15), base.l + 15).h,
        clampHsl(base.h + 45, Math.max(base.s - 10, 15), base.l + 15).s,
        clampHsl(base.h + 45, Math.max(base.s - 10, 15), base.l + 15).l
      )])
    }

    case 'split-complementary': {
      const colors: string[] = []
      const { h, s, l } = clampHsl(base.h, base.s, base.l)
      colors.push(hslToHex(h, s, l))
      for (const offset of [-30, 30] as const) {
        const c = clampHsl(base.h + 180 + offset, base.s, base.l + (offset > 0 ? 5 : -5))
        colors.push(hslToHex(c.h, c.s, c.l))
      }
      for (let i = 0; i < 2; i++) {
        const c = clampHsl(base.h + (i === 0 ? -15 : 15), Math.max(base.s - 20, 15), base.l + 20)
        colors.push(hslToHex(c.h, c.s, c.l))
      }
      return colors
    }

    case 'monochromatic': {
      return Array.from({ length: count }, (_, i) => {
        const step = 60 / (count - 1 || 1)
        const { h, s, l } = clampHsl(base.h, base.s, 30 + i * step)
        return hslToHex(h, s, l)
      })
    }

    case 'random-beautiful': {
      const hue = Math.floor(Math.random() * 360)
      const sat = 40 + Math.floor(Math.random() * 40)  // 40–80%
      const light = 35 + Math.floor(Math.random() * 30) // 35–65%
      return Array.from({ length: count }, (_, i) => {
        const hueOffset = (i - Math.floor(count / 2)) * (20 + Math.floor(Math.random() * 20))
        const satVar = sat + Math.floor(Math.random() * 20 - 10)
        const lightVar = light + (i - Math.floor(count / 2)) * 8
        const { h, s, l } = clampHsl(hue + hueOffset, satVar, lightVar)
        return hslToHex(h, s, l)
      })
    }

    default:
      return generateHarmony(baseHex, 'random-beautiful', count)
  }
}
