const DPIS = [72, 150, 300] as const

export interface DpiEntry {
  dpi: number
  widthCm: number
  heightCm: number
}

export interface FormatStatusMap {
  A6: 'ok' | 'warning' | 'error'
  A5: 'ok' | 'warning' | 'error'
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
  }
}
