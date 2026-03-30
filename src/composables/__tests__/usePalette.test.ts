import { describe, it, expect } from 'vitest'
import { extractDominantColors } from '../usePalette'

describe('usePalette - Logic', () => {
  it('should extract dominant colors from a simple pixel buffer', () => {
    // 2x2 buffer, 2 pixels of Red (#FF0000), 2 pixels of Blue (#0000FF)
    const data = new Uint8ClampedArray([
      255, 0, 0, 255, 255, 0, 0, 255,
      0, 0, 255, 255, 0, 0, 255, 255
    ])
    
    const palette = extractDominantColors(data, 2, 2, 2) // Request 2 colors
    expect(palette).toContain('#FF0000')
    expect(palette).toContain('#0000FF')
  })

  it('should return black for empty input', () => {
    const palette = extractDominantColors(new Uint8ClampedArray(0), 0, 0)
    expect(palette.length).toBe(0)
  })
})
