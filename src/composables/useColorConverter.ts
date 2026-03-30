import { 
  converter, 
  formatHex, 
  type Rgb, 
  type Oklch, 
  type Lab, 
  type Lch 
} from 'culori'

export interface RGB { r: number; g: number; b: number }
export interface HSL { h: number; s: number; l: number }
export interface CMYK { c: number; m: number; y: number; k: number }
export interface OKLCH { l: number; c: number; h: number }
export interface LAB { l: number; a: number; b: number }
export interface LCH { l: number; c: number; h: number }

const toRgb = converter('rgb')
const toOklch = converter('oklch')
const toLab = converter('lab')
const toLch = converter('lch')
const toHsl = converter('hsl')

/**
 * Basic HEX to RGB
 */
export function hexToRgb(hex: string): RGB | null {
  const c = toRgb(hex)
  if (!c) return null
  return { r: Math.round(c.r * 255), g: Math.round(c.g * 255), b: Math.round(c.b * 255) }
}

/**
 * RGB to HEX
 */
export function rgbToHex(rgb: RGB): string {
  return formatHex({ mode: 'rgb', r: rgb.r / 255, g: rgb.g / 255, b: rgb.b / 255 })
}

/**
 * RGB to HSL
 */
export function rgbToHsl(rgb: RGB): HSL {
  const c = toHsl({ mode: 'rgb', r: rgb.r / 255, g: rgb.g / 255, b: rgb.b / 255 }) as any
  return { 
    h: Math.round(c.h || 0), 
    s: Math.round(c.s * 100), 
    l: Math.round(c.l * 100) 
  }
}

/**
 * HSL to RGB
 */
export function hslToRgb(hsl: HSL): RGB {
  const c = toRgb({ mode: 'hsl', h: hsl.h, s: hsl.s / 100, l: hsl.l / 100 }) as Rgb
  return { 
    r: Math.round(c.r * 255), 
    g: Math.round(c.g * 255), 
    b: Math.round(c.b * 255) 
  }
}

/**
 * Extended Color Conversions (Delphi Standards)
 */
export function rgbToOklch(rgb: RGB): OKLCH {
  const c = toOklch({ mode: 'rgb', r: rgb.r / 255, g: rgb.g / 255, b: rgb.b / 255 }) as Oklch
  return { l: c.l, c: c.c, h: c.h || 0 }
}

export function rgbToLab(rgb: RGB): LAB {
  const c = toLab({ mode: 'rgb', r: rgb.r / 255, g: rgb.g / 255, b: rgb.b / 255 }) as Lab
  return { l: c.l, a: c.a, b: c.b }
}

export function rgbToLch(rgb: RGB): LCH {
  const c = toLch({ mode: 'rgb', r: rgb.r / 255, g: rgb.g / 255, b: rgb.b / 255 }) as Lch
  return { l: c.l, c: c.c, h: c.h || 0 }
}

/**
 * CMYK Support (Legacy)
 */
export function rgbToCmyk(rgb: RGB): CMYK {
  let r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255
  let k = 1 - Math.max(r, g, b)
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 }
  return { 
    c: Math.round((1 - r - k) / (1 - k) * 100), 
    m: Math.round((1 - g - k) / (1 - k) * 100), 
    y: Math.round((1 - b - k) / (1 - k) * 100), 
    k: Math.round(k * 100) 
  }
}

export function cmykToRgb(cmyk: CMYK): RGB {
  const c = cmyk.c / 100, m = cmyk.m / 100, y = cmyk.y / 100, k = cmyk.k / 100
  return { 
    r: Math.round(255 * (1 - c) * (1 - k)), 
    g: Math.round(255 * (1 - m) * (1 - k)), 
    b: Math.round(255 * (1 - y) * (1 - k)) 
  }
}
