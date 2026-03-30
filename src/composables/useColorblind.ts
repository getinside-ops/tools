/**
 * Colorblind Simulator Logic
 * Uses SVG feColorMatrix redistribution matrices.
 */

export type ColorBlindType = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia'

export const COLORBLIND_MATRICES: Record<ColorBlindType, string> = {
  normal: '1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0',
  protanopia: '0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0',
  deuteranopia: '0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0',
  tritanopia: '0.95 0.05 0 0 0 0 0.433 0.567 0 0 0 0.475 0.525 0 0 0 0 0 1 0',
  achromatopsia: '0.299 0.587 0.114 0 0 0.299 0.587 0.114 0 0 0.299 0.587 0.114 0 0 0 0 0 1 0'
}

/**
 * Returns the SVG feColorMatrix string for a given colorblindness type.
 */
export function getColorMatrix(type: ColorBlindType): string {
  return COLORBLIND_MATRICES[type] || COLORBLIND_MATRICES.normal
}
