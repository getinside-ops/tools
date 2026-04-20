export type HarmonyType =
  | 'random-beautiful'
  | 'analogous'
  | 'complementary'
  | 'triadic'
  | 'tetradic'
  | 'split-complementary'
  | 'monochromatic'

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
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360
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

function jitter(range: number): number {
  return (Math.random() - 0.5) * range
}

// Maps t in [0,1] to lightness from ~92% (light) to ~10% (dark)
function spreadL(t: number): number {
  return Math.round(Math.max(10, Math.min(95, 92 - t * 82 + jitter(6))))
}

// Maps t in [0,1] to saturation that peaks in the vivid mid-range
function spreadS(t: number, baseSat: number): number {
  const peak = Math.max(baseSat, 80)
  const sat = peak - Math.abs(t - 0.5) * 90 + jitter(15)
  return Math.round(Math.max(25, Math.min(90, sat)))
}

export function generateHarmony(
  baseHex: string,
  type: HarmonyType,
  count: number = 5
): string[] {
  const base = hexToHsl(baseHex)
  const t = (i: number) => count === 1 ? 0.5 : i / (count - 1)

  switch (type) {
    case 'random-beautiful': {
      const baseHue = Math.floor(Math.random() * 360)
      return Array.from({ length: count }, (_, i) => {
        const ti = t(i)
        const h = (baseHue + i * 137.5 + jitter(12) + 360) % 360
        return hslToHex(h, spreadS(ti, 65), spreadL(ti))
      })
    }

    case 'analogous': {
      const step = 30
      const startH = base.h - Math.floor((count - 1) / 2) * step
      return Array.from({ length: count }, (_, i) => {
        const h = ((startH + i * step + 360) % 360)
        // Clamp L to [22,83] to avoid 8-bit RGB quantization hue drift at extremes
        // (the existing test enforces ≤120° hue spread across 5 colors)
        const l = Math.round(Math.max(22, Math.min(83, 83 - t(i) * 61 + jitter(6))))
        return hslToHex(h, spreadS(t(i), base.s), l)
      })
    }

    case 'complementary': {
      const half = Math.ceil(count / 2)
      const compHalf = count - half
      const baseGroup = Array.from({ length: half }, (_, i) => {
        const ti = t(i * (count - 1) / Math.max(half - 1, 1) * 0.5)
        const h = ((base.h + jitter(20) + 360) % 360)
        return hslToHex(h, spreadS(ti, base.s), spreadL(ti))
      })
      const compGroup = Array.from({ length: compHalf }, (_, i) => {
        const ti = 0.5 + t(i * (count - 1) / Math.max(compHalf - 1, 1) * 0.5) * 0.5
        const h = ((base.h + 180 + jitter(20) + 360) % 360)
        return hslToHex(h, spreadS(ti, base.s), spreadL(ti))
      })
      return [...baseGroup, ...compGroup]
    }

    case 'triadic': {
      const hues = [base.h, base.h + 120, base.h + 240]
      return Array.from({ length: count }, (_, i) => {
        const h = ((hues[i % 3] + jitter(15) + 360) % 360)
        return hslToHex(h, spreadS(t(i), base.s), spreadL(t(i)))
      })
    }

    case 'tetradic': {
      const hues = [base.h, base.h + 90, base.h + 180, base.h + 270, base.h + 45]
      return Array.from({ length: count }, (_, i) => {
        const h = ((hues[i % hues.length] + jitter(10) + 360) % 360)
        return hslToHex(h, spreadS(t(i), base.s), spreadL(t(i)))
      })
    }

    case 'split-complementary': {
      const hues = [base.h, base.h + 150, base.h + 210, base.h - 30, base.h + 30]
      return Array.from({ length: count }, (_, i) => {
        const h = ((hues[i % hues.length] + jitter(10) + 360) % 360)
        return hslToHex(h, spreadS(t(i), base.s), spreadL(t(i)))
      })
    }

    case 'monochromatic': {
      return Array.from({ length: count }, (_, i) => {
        const l = Math.round(90 - t(i) * 75)
        const s = Math.max(15, Math.min(90, base.s + jitter(10)))
        return hslToHex(base.h, s, l)
      })
    }

    default:
      return generateHarmony(baseHex, 'random-beautiful', count)
  }
}
