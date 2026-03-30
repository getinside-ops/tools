import { describe, it, expect } from 'vitest'
import { calculateCropRect } from '../useImageCropper'

describe('useImageCropper - calculateCropRect', () => {
  it('should return valid crop coordinates within bounds', () => {
    const original = { width: 1000, height: 1000 }
    const crop = { x: 100, y: 100, width: 500, height: 500 }
    const result = calculateCropRect(original.width, original.height, crop)
    
    expect(result).toEqual({ x: 100, y: 100, width: 500, height: 500 })
  })

  it('should clamp crop coordinates to original bounds', () => {
    const original = { width: 1000, height: 1000 }
    const crop = { x: -10, y: -10, width: 1200, height: 1200 }
    const result = calculateCropRect(original.width, original.height, crop)
    
    expect(result.x).toBe(0)
    expect(result.y).toBe(0)
    expect(result.width).toBe(1000)
    expect(result.height).toBe(1000)
  })
})
