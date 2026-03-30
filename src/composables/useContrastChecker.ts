export interface ColorRGB {
  r: number
  g: number
  b: number
}

export function hexToRgb(hex: string): ColorRGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) {
    // try short hex
    const shortResult = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex)
    return shortResult
      ? {
          r: parseInt(shortResult[1] + shortResult[1], 16),
          g: parseInt(shortResult[2] + shortResult[2], 16),
          b: parseInt(shortResult[3] + shortResult[3], 16),
        }
      : null
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

export function getRelativeLuminance(rgb: ColorRGB): number {
  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map(v => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export interface ContrastResult {
  ratio: number
  aa: boolean
  aaLarge: boolean
  aaa: boolean
  aaaLarge: boolean
}

export function checkContrast(bgHex: string, fgHex: string): ContrastResult | null {
  const bgRgb = hexToRgb(bgHex)
  const fgRgb = hexToRgb(fgHex)
  if (!bgRgb || !fgRgb) return null

  const l1 = getRelativeLuminance(bgRgb)
  const l2 = getRelativeLuminance(fgRgb)
  const ratio = getContrastRatio(l1, l2)

  return {
    ratio,
    aa: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaa: ratio >= 7,
    aaaLarge: ratio >= 4.5,
  }
}
