export const FORMATS = {
  A5:    { width: 148, height: 210 },
  A6:    { width: 105, height: 148 },
  Carte: { width: 105, height: 148 },
} as const

export type FormatKey = keyof typeof FORMATS | 'Custom'

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
