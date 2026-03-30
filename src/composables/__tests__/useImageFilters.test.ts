import { describe, it, expect } from 'vitest'
import { constructFilterString } from '../useImageFilters'

describe('useImageFilters - constructFilterString', () => {
  it('should return empty string when no filters are provided', () => {
    const result = constructFilterString({})
    expect(result).toBe('')
  })

  it('should combine multiple filters correctly', () => {
    const result = constructFilterString({
      grayscale: 50,
      blur: 5,
      brightness: 120
    })
    expect(result).toBe('grayscale(50%) blur(5px) brightness(120%)')
  })

  it('should handle zero values correctly', () => {
    const result = constructFilterString({ contrast: 0 })
    expect(result).toBe('contrast(0%)')
  })
})
