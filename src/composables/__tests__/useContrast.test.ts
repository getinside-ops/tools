import { describe, it, expect } from 'vitest'
import { getWcagContrast, getApcaContrast, meetsWcagLevel } from '../useContrast'

describe('useContrast', () => {
  it('calculates WCAG 2.1 contrast correctly for black and white', () => {
    // Black on White is 21:1
    expect(getWcagContrast('#000000', '#ffffff')).toBeCloseTo(21, 1)
    
    // White on Black is 21:1
    expect(getWcagContrast('#ffffff', '#000000')).toBeCloseTo(21, 1)
  })

  it('calculates WCAG 2.1 contrast correctly for same colors', () => {
    // White on White is 1:1
    expect(getWcagContrast('#ffffff', '#ffffff')).toBeCloseTo(1, 1)
  })

  it('evaluates WCAG passing levels correctly', () => {
    // 21:1 passes everything
    expect(meetsWcagLevel(21, 'AA_Normal')).toBe(true)
    expect(meetsWcagLevel(21, 'AAA_Normal')).toBe(true)

    // 1:1 fails everything
    expect(meetsWcagLevel(1, 'AA_Large')).toBe(false)
  })

  it('calculates basic APCA (Advanced Perceptual Contrast Algorithm) values', () => {
    // APCA for black text on white bg is around Lc 106
    const apca1 = getApcaContrast('#000000', '#ffffff')
    expect(Math.abs(apca1)).toBeGreaterThan(100)
    
    // APCA for white text on black bg is around Lc -106
    const apca2 = getApcaContrast('#ffffff', '#000000')
    expect(Math.abs(apca2)).toBeGreaterThan(100)
    
    // APCA for same colors should be 0
    expect(getApcaContrast('#ffffff', '#ffffff')).toBeCloseTo(0, 1)
  })
})
