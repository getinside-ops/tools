import { describe, it, expect } from 'vitest'
import { getAvailableFormats } from '../useImageConverter'

describe('useImageConverter - getAvailableFormats', () => {
  it('should return PNG, JPG, WebP for an SVG input', () => {
    const formats = getAvailableFormats('image/svg+xml')
    expect(formats).toContain('image/png')
    expect(formats).toContain('image/jpeg')
    expect(formats).toContain('image/webp')
  })

  it('should return JPG, WebP for a PNG input', () => {
    const formats = getAvailableFormats('image/png')
    expect(formats).toContain('image/jpeg')
    expect(formats).toContain('image/webp')
  })

  it('should return empty for unknown formats', () => {
    const formats = getAvailableFormats('application/pdf')
    expect(formats.length).toBe(0)
  })
})
