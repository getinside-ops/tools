export interface PaletteColor {
  hex: string
  locked: boolean
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
  return Array.from({ length: 5 }, () => ({ hex: randomColor(), locked: false }))
}

export function generatePalette(current: PaletteColor[]): PaletteColor[] {
  return current.map(color => color.locked ? color : { hex: randomColor(), locked: false })
}

export function toggleLock(palette: PaletteColor[], index: number): PaletteColor[] {
  return palette.map((color, i) => i === index ? { ...color, locked: !color.locked } : color)
}
