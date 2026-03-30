import { describe, it, expect } from 'vitest'
import { getMatteDimensions, getFitBox } from '../useMatteGenerator'

describe('useMatteGenerator', () => {
  it('calculates dimensions with simple padding', () => {
    const result = getMatteDimensions({ w: 100, h: 200 }, { padding: 50, color: '#000', pattern: 'none' })
    expect(result.w).toBe(200)
    expect(result.h).toBe(300)
  })

  it('calculates dimensions targeting a specific social media size', () => {
    const result = getMatteDimensions({ w: 100, h: 200 }, { 
      padding: 0, 
      color: '#000',
      pattern: 'none',
      targetSize: { w: 1080, h: 1080 }
    })
    
    expect(result.w).toBe(1080)
    expect(result.h).toBe(1080)
  })
  
  it('calculates the correct scaled box for object-fit: contain', () => {
    const box = getFitBox({ w: 100, h: 200 }, { w: 1080, h: 1080 }, 0)
    
    // Scale is constrained by height (200 -> 1080 scale is 5.4)
    // w is 100 * 5.4 = 540
    expect(box.w).toBe(540)
    expect(box.h).toBe(1080)
    
    // x should be centered: (1080 - 540) / 2 = 270
    expect(box.x).toBe(270)
    expect(box.y).toBe(0)
  })
})
