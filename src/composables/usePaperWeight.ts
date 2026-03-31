export const FORMATS = {
  A5:    { width: 148, height: 210 },
  A6:    { width: 105, height: 148 },
  Carte: { width: 105, height: 148 },
  DL:    { width: 110, height: 220 },
  A4:    { width: 210, height: 297 },
} as const

export type FormatKey = keyof typeof FORMATS | 'Custom'

/**
 * Default quantity for paper weight calculations
 */
export const DEFAULT_QUANTITY = 50000

/**
 * Preset quantity values for paper weight calculations
 */
export const QUANTITY_PRESETS = [10000, 25000, 50000, 100000, 500000, 1000000] as const

export interface WeightResult {
  grams: number
  kg: number
}

export function calculatePaperWeight(
  quantity: number,
  widthMm: number,
  heightMm: number,
  grammage: number,
): WeightResult {
  const surfaceM2 = (widthMm / 1000) * (heightMm / 1000)
  const grams = Math.round(surfaceM2 * grammage * quantity)
  const kg = Math.round(grams / 1000 * 100) / 100
  return { grams, kg }
}
