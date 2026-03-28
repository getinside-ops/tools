import { describe, it, expect } from 'vitest'
import { calculatePaperWeight, FORMATS } from '../usePaperWeight'

describe('calculatePaperWeight', () => {
  it('calculates weight for 1000 A6 flyers at 300 g/m²', () => {
    const { width, height } = FORMATS.A6
    const result = calculatePaperWeight(1000, width, height, 300)
    expect(result.grams).toBe(4662)
    expect(result.kg).toBe(4.66)
  })

  it('calculates weight for 500 A5 flyers at 250 g/m²', () => {
    const { width, height } = FORMATS.A5
    const result = calculatePaperWeight(500, width, height, 250)
    expect(result.grams).toBe(3885)
    expect(result.kg).toBe(3.89)
  })

  it('returns zero weight for zero quantity', () => {
    const result = calculatePaperWeight(0, 148, 210, 300)
    expect(result.grams).toBe(0)
    expect(result.kg).toBe(0)
  })

  it('works with custom dimensions (100x100mm, 300g/m², 100 flyers)', () => {
    const result = calculatePaperWeight(100, 100, 100, 300)
    expect(result.grams).toBe(300)
    expect(result.kg).toBe(0.3)
  })
})
