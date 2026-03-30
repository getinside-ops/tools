import { describe, it, expect } from 'vitest'
import { calculateAspectRatio } from '../useImageCompressor'

describe('useImageCompressor - calculateAspectRatio', () => {
  it('should return the same dimensions when no constraints are provided', () => {
    const result = calculateAspectRatio(1000, 500)
    expect(result).toEqual({ width: 1000, height: 500 })
  })

  it('should scale down based on maxWidth', () => {
    const result = calculateAspectRatio(2000, 1000, 1000)
    expect(result).toEqual({ width: 1000, height: 500 })
  })

  it('should scale down based on maxHeight', () => {
    const result = calculateAspectRatio(1000, 2000, undefined, 1000)
    expect(result).toEqual({ width: 500, height: 1000 })
  })

  it('should handle both constraints (maxWidth wins)', () => {
    const result = calculateAspectRatio(2000, 2000, 500, 1000)
    expect(result).toEqual({ width: 500, height: 500 })
  })

  it('should handle both constraints (maxHeight wins)', () => {
    const result = calculateAspectRatio(2000, 2000, 1000, 500)
    expect(result).toEqual({ width: 500, height: 500 })
  })
})
