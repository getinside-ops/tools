import { describe, it, expect } from 'vitest'
import { getColorMatrix, type ColorBlindType } from '../useColorblind'

describe('useColorblind - Matrix Generation', () => {
  it('should return the correct matrix for Protanopia', () => {
    const matrix = getColorMatrix('protanopia')
    // Protanopia matrix starts with specific red redistribution
    expect(matrix).toContain('0.567')
    expect(matrix).toContain('0.433')
  })

  it('should return identity matrix for normal vision', () => {
    const matrix = getColorMatrix('normal')
    expect(matrix).toBe('1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0')
  })

  it('should return empty/default for unknown types', () => {
    const matrix = getColorMatrix('unknown' as any)
    expect(matrix).toContain('1 0 0 0 0')
  })
})
