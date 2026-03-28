import { describe, it, expect } from 'vitest'
import { calculatePrintDimensions, getFormatStatus } from '../useDpiChecker'

describe('calculatePrintDimensions', () => {
  it('returns entries for 72, 150, and 300 dpi', () => {
    const result = calculatePrintDimensions(1287, 1795)
    expect(result.map(r => r.dpi)).toEqual([72, 150, 300])
  })

  it('calculates cm correctly at 300 dpi for A6 minimum (1287×1795px)', () => {
    const result = calculatePrintDimensions(1287, 1795)
    const at300 = result.find(r => r.dpi === 300)!
    expect(at300.widthCm).toBe(10.9)
    expect(at300.heightCm).toBe(15.2)
  })

  it('calculates cm correctly at 72 dpi for a 720×720 image', () => {
    const result = calculatePrintDimensions(720, 720)
    const at72 = result.find(r => r.dpi === 72)!
    expect(at72.widthCm).toBe(25.4)
    expect(at72.heightCm).toBe(25.4)
  })
})

describe('getFormatStatus', () => {
  it('returns ok for A6 at minimum resolution (1287×1795)', () => {
    const status = getFormatStatus(1287, 1795)
    expect(status.A6).toBe('ok')
  })

  it('returns ok for A5 at minimum resolution (1795×2528)', () => {
    const status = getFormatStatus(1795, 2528)
    expect(status.A5).toBe('ok')
  })

  it('returns error for very low resolution (400×400)', () => {
    const status = getFormatStatus(400, 400)
    expect(status.A6).toBe('error')
    expect(status.A5).toBe('error')
  })
})
