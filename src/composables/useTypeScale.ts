export const TYPE_SCALE_RATIOS = {
  minorSecond: 1.067,
  majorSecond: 1.125,
  minorThird: 1.200,
  majorThird: 1.250,
  perfectFourth: 1.333,
  augmentedFourth: 1.414,
  perfectFifth: 1.500,
  goldenRatio: 1.618,
} as const

export type TypeScaleRatioKey = keyof typeof TYPE_SCALE_RATIOS

export interface TypeScaleEntry {
  step: number
  px: number
  rem: number
}

export function generateTypeScale(
  baseSize: number,
  ratio: number,
  stepsDown: number = 2,
  stepsUp: number = 6,
  baseFontSize: number = 16
): TypeScaleEntry[] {
  const result: TypeScaleEntry[] = []

  for (let i = -stepsDown; i <= stepsUp; i++) {
    const px = baseSize * Math.pow(ratio, i)
    result.push({
      step: i === 0 ? 0 : i,
      px: Math.round(px * 100) / 100,
      rem: Math.round((px / baseFontSize) * 1000) / 1000,
    })
  }

  return result
}
