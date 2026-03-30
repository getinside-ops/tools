import { describe, it, expect } from 'vitest'
import { getResizedDimensions } from '../useImageResizer'

describe('useImageResizer - getResizedDimensions', () => {
  it('should scale by width and preserve aspect ratio', () => {
    const original = { w: 1000, h: 500 }
    const result = getResizedDimensions(original, { width: 500, preserveAspectRatio: true })
    expect(result).toEqual({ w: 500, h: 250 })
  })

  it('should scale by height and preserve aspect ratio', () => {
    const original = { w: 1000, h: 500 }
    const result = getResizedDimensions(original, { height: 250, preserveAspectRatio: true })
    expect(result).toEqual({ w: 500, h: 250 })
  })

  it('should scale by percentage', () => {
    const original = { w: 1000, h: 500 }
    const result = getResizedDimensions(original, { scale: 0.5 })
    expect(result).toEqual({ w: 500, h: 250 })
  })

  it('should allow non-proportional scaling if requested', () => {
    const original = { w: 1000, h: 500 }
    const result = getResizedDimensions(original, { width: 500, height: 500, preserveAspectRatio: false })
    expect(result).toEqual({ w: 500, h: 500 })
  })
})
