import { describe, it, expect } from 'vitest'
import { 
  hexToRgb, rgbToHex, rgbToHsl, hslToRgb, rgbToCmyk, cmykToRgb 
} from '../useColorConverter'

describe('useColorConverter', () => {
  it('converts HEX to RGB correctly', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 })
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
    expect(hexToRgb('#0aaa8e')).toEqual({ r: 10, g: 170, b: 142 })
  })

  it('converts RGB to HEX correctly', () => {
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff')
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000')
    expect(rgbToHex({ r: 10, g: 170, b: 142 })).toBe('#0aaa8e')
  })

  it('converts RGB to HSL correctly', () => {
    const result = rgbToHsl({ r: 255, g: 0, b: 0 })
    expect(result).toEqual({ h: 0, s: 100, l: 50 })
  })

  it('converts HSL to RGB correctly', () => {
    const result = hslToRgb({ h: 0, s: 100, l: 50 })
    expect(result).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('converts RGB to CMYK correctly', () => {
    const result = rgbToCmyk({ r: 255, g: 255, b: 0 })
    expect(result).toEqual({ c: 0, m: 0, y: 100, k: 0 })
    
    expect(rgbToCmyk({ r: 0, g: 0, b: 0 })).toEqual({ c: 0, m: 0, y: 0, k: 100 })
  })

  it('converts CMYK to RGB correctly', () => {
    const result = cmykToRgb({ c: 0, m: 0, y: 100, k: 0 })
    expect(result).toEqual({ r: 255, g: 255, b: 0 })
  })
})
