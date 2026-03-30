import { describe, it, expect } from 'vitest'
import { generateTypeScale, TYPE_SCALE_RATIOS } from '../useTypeScale'

describe('generateTypeScale', () => {
  it('generates a scale with default settings', () => {
    const scale = generateTypeScale(16, TYPE_SCALE_RATIOS.majorSecond)
    // -2, -1, 0, 1, 2, 3, 4, 5, 6 = 9 steps
    expect(scale.length).toBe(9)
    const baseEntry = scale.find(s => s.step === 0)
    expect(baseEntry?.px).toBe(16)
    expect(baseEntry?.rem).toBe(1)
    
    const nextEntry = scale.find(s => s.step === 1)
    expect(nextEntry?.px).toBe(18) // 16 * 1.125
  })

  it('respects stepsDown and stepsUp', () => {
    const scale = generateTypeScale(16, 1.5, 0, 2)
    expect(scale.map(s => s.step)).toEqual([0, 1, 2])
  })

  it('calculates rem correctly with custom baseFontSize', () => {
    const scale = generateTypeScale(20, 1, 0, 0, 10)
    expect(scale[0].rem).toBe(2)
  })
})
