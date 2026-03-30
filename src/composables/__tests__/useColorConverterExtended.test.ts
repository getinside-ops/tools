import { describe, it, expect } from 'vitest'
import { 
  rgbToOklch, rgbToLab, rgbToLch 
} from '../useColorConverter'

describe('useColorConverter - Extended (Delphic UI)', () => {
  const red = { r: 255, g: 0, b: 0 }
  
  it('converts RGB to OKLCH correctly', () => {
    const result = rgbToOklch(red)
    // OKLCH for pure red is roughly L: 0.627, C: 0.257, H: 29.2
    expect(result.l).toBeCloseTo(0.627, 2)
    expect(result.c).toBeCloseTo(0.257, 2)
  })

  it('converts RGB to LAB correctly', () => {
    const result = rgbToLab(red)
    // LAB (D65) for pure red is roughly L: 54.29, a: 80.80, b: 69.89
    expect(result.l).toBeCloseTo(54.29, 2)
  })

  it('converts RGB to LCH correctly', () => {
    const result = rgbToLch(red)
    // LCH (D65) for pure red: L: 54.29, C: 106.8, H: 40.8
    expect(result.l).toBeCloseTo(54.29, 2)
  })
})
