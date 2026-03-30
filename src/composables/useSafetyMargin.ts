/**
 * Safety Margin & Bleed Logic
 * 100% client-side.
 */

export const DEFAULT_BLEED_MM = 3
export const DEFAULT_SAFETY_MM = 5
export const MM_PER_INCH = 25.4

export function mmToPx(mm: number, dpi: number): number {
  return (mm * dpi) / MM_PER_INCH
}

export interface MarginOffsets {
  bleed: number
  safety: number
}

/**
 * Returns offsets in pixels for a given DPI.
 */
export function getMarginOffsets(
  dpi: number, 
  bleedMm: number = DEFAULT_BLEED_MM, 
  safetyMm: number = DEFAULT_SAFETY_MM
): MarginOffsets {
  return {
    bleed: mmToPx(bleedMm, dpi),
    safety: mmToPx(safetyMm, dpi)
  }
}
