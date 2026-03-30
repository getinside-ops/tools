import { describe, it, expect } from 'vitest'
import { getMatteDimensions } from '../useMatteGenerator'

describe('useMatteGenerator - getMatteDimensions', () => {
  it('should increase dimensions by 2x padding', () => {
    const original = { w: 100, h: 100 }
    const result = getMatteDimensions(original, 20)
    expect(result).toEqual({ w: 140, h: 140 })
  })

  it('should return original dimensions if padding is 0', () => {
    const original = { w: 500, h: 300 }
    const result = getMatteDimensions(original, 0)
    expect(result).toEqual({ w: 500, h: 300 })
  })
})
