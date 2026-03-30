const DPIS = [72, 150, 300] as const

export type Orientation = 'portrait' | 'landscape' | 'square'

export interface DpiEntry {
  dpi: number
  widthCm: number
  heightCm: number
}

export interface FormatDimensions {
  width: number
  height: number
}

export interface FormatStatusMap {
  A6: 'ok' | 'warning' | 'error'
  A5: 'ok' | 'warning' | 'error'
  A4: 'ok' | 'warning' | 'error'
  A3: 'ok' | 'warning' | 'error'
  Letter: 'ok' | 'warning' | 'error'
  Square: 'ok' | 'warning' | 'error'
}

export const FORMATS: Record<string, FormatDimensions> = {
  A6: { width: 105, height: 148 },
  A5: { width: 148, height: 210 },
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  Letter: { width: 216, height: 279 },
  Square: { width: 100, height: 100 },
}

export const FEATURED_FORMATS = ['A6', 'A5'] as const
export const EXTENDED_FORMATS = ['A4', 'A3', 'Letter', 'Square'] as const

export function getOrientation(widthPx: number, heightPx: number): Orientation {
  if (widthPx > heightPx) return 'landscape'
  if (heightPx > widthPx) return 'portrait'
  return 'square'
}

export function calculatePrintDimensions(widthPx: number, heightPx: number): DpiEntry[] {
  return DPIS.map(dpi => ({
    dpi,
    widthCm:  Math.round((widthPx  / dpi) * 2.54 * 10) / 10,
    heightCm: Math.round((heightPx / dpi) * 2.54 * 10) / 10,
  }))
}

export function getFormatStatus(widthPx: number, heightPx: number): FormatStatusMap {
  const wCm = (widthPx  / 300) * 2.54
  const hCm = (heightPx / 300) * 2.54

  function status(reqW: number, reqH: number): 'ok' | 'warning' | 'error' {
    if (wCm >= reqW && hCm >= reqH) return 'ok'
    if (wCm >= reqW * 0.66 && hCm >= reqH * 0.66) return 'warning'
    return 'error'
  }

  return {
    A6: status(10.5, 14.8),
    A5: status(14.8, 21.0),
    A4: status(21.0, 29.7),
    A3: status(29.7, 42.0),
    Letter: status(21.6, 27.9),
    Square: status(10.0, 10.0),
  }
}

export interface RecommendedUses {
  suitable: string[]
  notSuitable: string[]
}

export function getRecommendedUses(widthPx: number, heightPx: number): RecommendedUses {
  const statusMap = getFormatStatus(widthPx, heightPx)
  const suitable: string[] = []
  const notSuitable: string[] = []

  const allFormats = [...FEATURED_FORMATS, ...EXTENDED_FORMATS] as string[]
  
  for (const format of allFormats) {
    const fmt = format as keyof FormatStatusMap
    if (statusMap[fmt] === 'ok') {
      suitable.push(format)
    } else {
      notSuitable.push(format)
    }
  }

  return { suitable, notSuitable }
}

export function getDpiColor(dpi: number): string {
  if (dpi >= 300) return 'ok'
  if (dpi >= 150) return 'warning'
  return 'error'
}

export function getDpiLabel(dpi: number): string {
  if (dpi >= 300) return 'Excellent'
  if (dpi >= 150) return 'Good'
  return 'Low'
}
