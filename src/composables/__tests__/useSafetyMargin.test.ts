import { describe, it, expect } from 'vitest'
import { mmToPx, getMarginOffsets } from '../useSafetyMargin'

describe('useSafetyMargin - Logic', () => {
  it('should convert mm to pixels correctly at 300 DPI', () => {
    // 25.4 mm = 1 inch = 300 px
    expect(Math.round(mmToPx(25.4, 300))).toBe(300)
    // 3 mm at 300 DPI ~= 35.43 px
    expect(Math.round(mmToPx(3, 300))).toBe(35)
  })

  it('should calculate correct offsets for a 300 DPI image', () => {
    const offsets = getMarginOffsets(300)
    expect(Math.round(offsets.bleed)).toBe(35)   // 3mm
    expect(Math.round(offsets.safety)).toBe(59)  // 5mm
  })
})
