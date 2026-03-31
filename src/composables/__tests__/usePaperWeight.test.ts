import { describe, it, expect } from 'vitest'
import { calculatePaperWeight, FORMATS } from '../usePaperWeight'

describe('calculatePaperWeight', () => {
  describe('standard formats', () => {
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

    it('calculates weight for DL format (110x220mm)', () => {
      const { width, height } = FORMATS.DL
      // Surface: 0.11 × 0.22 = 0.0242 m²
      // 1000 units × 0.0242 m² × 300 g/m² = 7260 g
      const result = calculatePaperWeight(1000, width, height, 300)
      expect(result.grams).toBe(7260)
      expect(result.kg).toBe(7.26)
    })

    it('calculates weight for A4 format (210x297mm)', () => {
      const { width, height } = FORMATS.A4
      // Surface: 0.21 × 0.297 = 0.06237 m²
      // 1000 units × 0.06237 m² × 300 g/m² = 18711 g
      const result = calculatePaperWeight(1000, width, height, 300)
      expect(result.grams).toBe(18711)
      expect(result.kg).toBe(18.71)
    })

    it('calculates weight for Carte format (105x148mm)', () => {
      const { width, height } = FORMATS.Carte
      const result = calculatePaperWeight(1000, width, height, 350)
      // Surface: 0.105 × 0.148 = 0.01554 m²
      // 1000 × 0.01554 × 350 = 5439 g
      expect(result.grams).toBe(5439)
      expect(result.kg).toBe(5.44)
    })
  })

  describe('large quantity calculations', () => {
    it('calculates weight for 100 000 A6 flyers at 300 g/m²', () => {
      const { width, height } = FORMATS.A6
      const result = calculatePaperWeight(100000, width, height, 300)
      // 0.01554 m² × 300 × 100000 = 466200 g
      expect(result.grams).toBe(466200)
      expect(result.kg).toBe(466.2)
    })

    it('calculates weight for 500 000 A6 flyers at 300 g/m²', () => {
      const { width, height } = FORMATS.A6
      const result = calculatePaperWeight(500000, width, height, 300)
      // 0.01554 m² × 300 × 500000 = 2331000 g
      expect(result.grams).toBe(2331000)
      expect(result.kg).toBe(2331)
    })

    it('calculates weight for 1 000 000 A6 flyers at 300 g/m²', () => {
      const { width, height } = FORMATS.A6
      const result = calculatePaperWeight(1000000, width, height, 300)
      // 0.01554 m² × 300 × 1000000 = 4662000 g
      expect(result.grams).toBe(4662000)
      expect(result.kg).toBe(4662)
    })

    it('calculates weight for 1 000 000 A4 flyers at 135 g/m²', () => {
      const { width, height } = FORMATS.A4
      const result = calculatePaperWeight(1000000, width, height, 135)
      // 0.06237 m² × 135 × 1000000 = 8419950 g
      expect(result.grams).toBe(8419950)
      expect(result.kg).toBe(8419.95)
    })

    it('calculates weight for 500 000 A5 flyers at 250 g/m²', () => {
      const { width, height } = FORMATS.A5
      const result = calculatePaperWeight(500000, width, height, 250)
      // 0.03108 m² × 250 × 500000 = 3885000 g
      expect(result.grams).toBe(3885000)
      expect(result.kg).toBe(3885)
    })

    it('calculates weight for 100 000 DL flyers at 170 g/m²', () => {
      const { width, height } = FORMATS.DL
      const result = calculatePaperWeight(100000, width, height, 170)
      // 0.0242 m² × 170 × 100000 = 411400 g
      expect(result.grams).toBe(411400)
      expect(result.kg).toBe(411.4)
    })
  })

  describe('edge cases', () => {
    it('calculates weight for minimum quantity (5 000 units)', () => {
      const { width, height } = FORMATS.A6
      const result = calculatePaperWeight(5000, width, height, 300)
      // 0.01554 m² × 300 × 5000 = 23310 g
      expect(result.grams).toBe(23310)
      expect(result.kg).toBe(23.31)
    })

    it('returns zero weight for zero quantity', () => {
      const result = calculatePaperWeight(0, 148, 210, 300)
      expect(result.grams).toBe(0)
      expect(result.kg).toBe(0)
    })

    it('returns zero weight for zero grammage', () => {
      const { width, height } = FORMATS.A6
      const result = calculatePaperWeight(10000, width, height, 0)
      expect(result.grams).toBe(0)
      expect(result.kg).toBe(0)
    })

    it('returns zero weight for zero dimensions', () => {
      const result = calculatePaperWeight(10000, 0, 210, 300)
      expect(result.grams).toBe(0)
      expect(result.kg).toBe(0)
    })

    it('handles custom format with large quantities', () => {
      // Custom format: 200x300mm
      const result = calculatePaperWeight(500000, 200, 300, 250)
      // 0.2 × 0.3 = 0.06 m²
      // 0.06 × 250 × 500000 = 7500000 g
      expect(result.grams).toBe(7500000)
      expect(result.kg).toBe(7500)
    })
  })

  describe('calculation accuracy', () => {
    it('works with custom dimensions (100x100mm, 300g/m², 100 flyers)', () => {
      const result = calculatePaperWeight(100, 100, 100, 300)
      expect(result.grams).toBe(300)
      expect(result.kg).toBe(0.3)
    })

    it('maintains precision for large numbers', () => {
      const { width, height } = FORMATS.A5
      const result = calculatePaperWeight(999999, width, height, 90)
      // 0.148 × 0.21 = 0.03108 m²
      // 0.03108 × 90 × 999999 = 2797197.192 g, rounded to 2797197
      expect(result.grams).toBe(2797197)
      expect(result.kg).toBe(2797.2)
    })

    it('rounds kg to 2 decimal places', () => {
      const result = calculatePaperWeight(1234, 150, 200, 175)
      // 0.15 × 0.2 = 0.03 m²
      // 0.03 × 175 × 1234 = 6478.5 g, rounded to 6479
      // 6479 / 1000 = 6.479, rounded to 6.48
      expect(result.grams).toBe(6479)
      expect(result.kg).toBe(6.48)
    })
  })
})
