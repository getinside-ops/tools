import { describe, it, expect } from 'vitest'
import {
  calculatePrintDimensions,
  getFormatStatus,
  getOrientation,
  FORMATS,
  FEATURED_FORMATS,
  EXTENDED_FORMATS,
  getRecommendedUses,
  getDpiColor,
  getDpiLabel,
} from '../useDpiChecker'

describe('FORMATS', () => {
  it('contains all expected formats with dimensions in mm', () => {
    expect(FORMATS.A6).toEqual({ width: 105, height: 148 })
    expect(FORMATS.A5).toEqual({ width: 148, height: 210 })
    expect(FORMATS.A4).toEqual({ width: 210, height: 297 })
    expect(FORMATS.A3).toEqual({ width: 297, height: 420 })
    expect(FORMATS.Letter).toEqual({ width: 216, height: 279 })
    expect(FORMATS.Square).toEqual({ width: 100, height: 100 })
  })
})

describe('FEATURED_FORMATS and EXTENDED_FORMATS', () => {
  it('FEATURED_FORMATS contains A6 and A5', () => {
    expect(FEATURED_FORMATS).toEqual(['A6', 'A5'])
  })

  it('EXTENDED_FORMATS contains A4, A3, Letter, Square', () => {
    expect(EXTENDED_FORMATS).toEqual(['A4', 'A3', 'Letter', 'Square'])
  })
})

describe('getOrientation', () => {
  it('returns landscape when width > height', () => {
    expect(getOrientation(1920, 1080)).toBe('landscape')
  })

  it('returns portrait when height > width', () => {
    expect(getOrientation(1080, 1920)).toBe('portrait')
  })

  it('returns square when width === height', () => {
    expect(getOrientation(1000, 1000)).toBe('square')
  })
})

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

  it('returns ok for A4 at minimum resolution (2528×3579)', () => {
    const status = getFormatStatus(2528, 3579)
    expect(status.A4).toBe('ok')
  })

  it('returns ok for A3 at minimum resolution (3579×5071)', () => {
    const status = getFormatStatus(3579, 5071)
    expect(status.A3).toBe('ok')
  })

  it('returns ok for Letter at minimum resolution (2598×3378)', () => {
    const status = getFormatStatus(2598, 3378)
    expect(status.Letter).toBe('ok')
  })

  it('returns ok for Square at minimum resolution (1205×1205)', () => {
    const status = getFormatStatus(1205, 1205)
    expect(status.Square).toBe('ok')
  })

  it('returns all ok for high resolution image (5000×5000)', () => {
    const status = getFormatStatus(5000, 5000)
    expect(status.A6).toBe('ok')
    expect(status.A5).toBe('ok')
    expect(status.A4).toBe('ok')
    expect(status.A3).toBe('ok')
    expect(status.Letter).toBe('ok')
    expect(status.Square).toBe('ok')
  })
})

describe('getRecommendedUses', () => {
  it('returns suitable formats for high resolution image (5000×5000)', () => {
    const result = getRecommendedUses(5000, 5000)
    expect(result.suitable).toEqual(['A6', 'A5', 'A4', 'A3', 'Letter', 'Square'])
    expect(result.notSuitable).toEqual([])
  })

  it('returns only small formats suitable for low resolution image (400×400)', () => {
    const result = getRecommendedUses(400, 400)
    expect(result.suitable).toEqual([])
    expect(result.notSuitable).toEqual(['A6', 'A5', 'A4', 'A3', 'Letter', 'Square'])
  })

  it('returns mixed suitable/notSuitable for medium resolution (1500×2000)', () => {
    const result = getRecommendedUses(1500, 2000)
    expect(result.suitable.length).toBeGreaterThan(0)
    expect(result.notSuitable.length).toBeGreaterThan(0)
  })
})

describe('getDpiColor', () => {
  it('returns ok for dpi >= 300', () => {
    expect(getDpiColor(300)).toBe('ok')
    expect(getDpiColor(600)).toBe('ok')
  })

  it('returns warning for dpi >= 150 and < 300', () => {
    expect(getDpiColor(150)).toBe('warning')
    expect(getDpiColor(200)).toBe('warning')
    expect(getDpiColor(299)).toBe('warning')
  })

  it('returns error for dpi < 150', () => {
    expect(getDpiColor(72)).toBe('error')
    expect(getDpiColor(100)).toBe('error')
    expect(getDpiColor(149)).toBe('error')
  })
})

describe('getDpiLabel', () => {
  it('returns Excellent for dpi >= 300', () => {
    expect(getDpiLabel(300)).toBe('Excellent')
    expect(getDpiLabel(600)).toBe('Excellent')
  })

  it('returns Good for dpi >= 150 and < 300', () => {
    expect(getDpiLabel(150)).toBe('Good')
    expect(getDpiLabel(200)).toBe('Good')
    expect(getDpiLabel(299)).toBe('Good')
  })

  it('returns Low for dpi < 150', () => {
    expect(getDpiLabel(72)).toBe('Low')
    expect(getDpiLabel(100)).toBe('Low')
    expect(getDpiLabel(149)).toBe('Low')
  })
})
