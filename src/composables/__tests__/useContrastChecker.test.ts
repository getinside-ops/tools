import { describe, it, expect } from 'vitest'
import { checkContrast, getRelativeLuminance, hexToRgb } from '../useContrastChecker'

describe('hexToRgb', () => {
  it('converts hex to rgb correctly', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 })
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('handles short hex', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 })
    expect(hexToRgb('000')).toEqual({ r: 0, g: 0, b: 0 })
  })

  it('returns null on invalid hex', () => {
    expect(hexToRgb('not-a-color')).toBeNull()
  })
})

describe('getRelativeLuminance', () => {
  it('calculates relative luminance for white and black', () => {
    expect(getRelativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1)
    expect(getRelativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0)
  })
})

describe('checkContrast', () => {
  it('calculates contrast ratio for white and black', () => {
    const result = checkContrast('#ffffff', '#000000')
    expect(result?.ratio).toBeCloseTo(21)
    expect(result?.aa).toBe(true)
    expect(result?.aaa).toBe(true)
  })

  it('calculates contrast ratio for grey on white', () => {
    const result = checkContrast('#ffffff', '#767676') // standard AA grey
    expect(result?.ratio).toBeGreaterThanOrEqual(4.5)
    expect(result?.aa).toBe(true)
    expect(result?.aaa).toBe(false)
  })

  it('returns null if either hex is invalid', () => {
    expect(checkContrast('#fff', 'notacolor')).toBeNull()
  })
})
