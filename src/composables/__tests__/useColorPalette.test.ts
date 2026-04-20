import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { generatePalette, toggleLock, initPalette, usePaletteState, generateWithHarmony } from '../useColorPalette'
import type { PaletteColor } from '../useColorPalette'

describe('initPalette', () => {
  it('returns 5 colors', () => {
    expect(initPalette()).toHaveLength(5)
  })

  it('all colors start unlocked', () => {
    expect(initPalette().every(c => !c.locked)).toBe(true)
  })

  it('each hex is a valid 7-char hex string', () => {
    initPalette().forEach(c => {
      expect(c.hex).toMatch(/^#[0-9A-F]{6}$/)
    })
  })
})

describe('generatePalette', () => {
  it('keeps locked colors unchanged', () => {
    const palette: PaletteColor[] = [
      { hex: '#AAAAAA', locked: true },
      { hex: '#BBBBBB', locked: false },
      { hex: '#CCCCCC', locked: true },
      { hex: '#DDDDDD', locked: false },
      { hex: '#EEEEEE', locked: false },
    ]
    const result = generatePalette(palette)
    expect(result[0].hex).toBe('#AAAAAA')
    expect(result[2].hex).toBe('#CCCCCC')
  })

  it('regenerates unlocked colors', () => {
    const palette: PaletteColor[] = Array(5).fill(null).map(() => ({ hex: '#123456', locked: false }))
    const results = Array(20).fill(null).map(() => generatePalette(palette))
    const anyChanged = results.some(r => r.some(c => c.hex !== '#123456'))
    expect(anyChanged).toBe(true)
  })

  it('all generated hex values are valid', () => {
    const palette: PaletteColor[] = Array(5).fill(null).map(() => ({ hex: '#000000', locked: false }))
    generatePalette(palette).forEach(c => {
      expect(c.hex).toMatch(/^#[0-9A-F]{6}$/)
    })
  })

  it('all regenerated colors are unlocked', () => {
    const palette: PaletteColor[] = Array(5).fill(null).map(() => ({ hex: '#000000', locked: false }))
    generatePalette(palette).forEach(c => {
      expect(c.locked).toBe(false)
    })
  })
})

describe('toggleLock', () => {
  it('locks an unlocked color', () => {
    const palette: PaletteColor[] = [{ hex: '#AAAAAA', locked: false }]
    expect(toggleLock(palette, 0)[0].locked).toBe(true)
  })

  it('unlocks a locked color', () => {
    const palette: PaletteColor[] = [{ hex: '#AAAAAA', locked: true }]
    expect(toggleLock(palette, 0)[0].locked).toBe(false)
  })

  it('does not mutate other colors', () => {
    const palette: PaletteColor[] = [
      { hex: '#AAAAAA', locked: false },
      { hex: '#BBBBBB', locked: false },
    ]
    const result = toggleLock(palette, 0)
    expect(result[1].locked).toBe(false)
    expect(result[1].hex).toBe('#BBBBBB')
  })
})

describe('usePaletteState', () => {
  beforeEach(() => {
    window.location.hash = ''
  })

  afterEach(() => {
    window.location.hash = ''
  })

  it('initializes with default palette when no URL params', () => {
    const { palette } = usePaletteState()
    expect(palette.value).toHaveLength(5)
  })

  it('restores palette from URL hash query params', () => {
    window.location.hash = '#/color-palette?p=0aaa8e-b8d5b8-d7b49e-dc602e-bc412b'
    const { palette } = usePaletteState()
    expect(palette.value.map(c => c.hex.toLowerCase())).toEqual([
      '#0aaa8e', '#b8d5b8', '#d7b49e', '#dc602e', '#bc412b'
    ])
  })

  it('restores harmony type from URL', () => {
    window.location.hash = '#/color-palette?p=0aaa8e-b8d5b8-d7b49e-dc602e-bc412b&t=analogous'
    const { harmonyType } = usePaletteState()
    expect(harmonyType.value).toBe('analogous')
  })

  it('handles malformed URL gracefully', () => {
    window.location.hash = '#/color-palette?p=not-a-color'
    const { palette } = usePaletteState()
    expect(palette.value).toHaveLength(5) // Falls back to default
  })

  it('syncToUrl writes palette to hash without breaking route', () => {
    window.location.hash = '#/color-palette'
    const { palette, syncToUrl } = usePaletteState()
    palette.value = [
      { hex: '#FF0000', locked: false },
      { hex: '#00FF00', locked: false },
      { hex: '#0000FF', locked: false },
      { hex: '#FFFF00', locked: false },
      { hex: '#FF00FF', locked: false },
    ]
    syncToUrl()
    // Route should be preserved
    expect(window.location.hash).toContain('#/color-palette')
    expect(window.location.hash).toContain('ff0000')
    expect(window.location.hash).toContain('00ff00')
  })
})

describe('generateWithHarmony', () => {
  it('returns palette unchanged when all colors are locked', () => {
    const palette: PaletteColor[] = [
      { hex: '#AAAAAA', locked: true },
      { hex: '#BBBBBB', locked: true },
      { hex: '#CCCCCC', locked: true },
    ]
    const result = generateWithHarmony(palette, 'random-beautiful')
    expect(result[0].hex).toBe('#AAAAAA')
    expect(result[1].hex).toBe('#BBBBBB')
    expect(result[2].hex).toBe('#CCCCCC')
  })

  it('preserves locked colors and changes unlocked ones', () => {
    const palette: PaletteColor[] = [
      { hex: '#AAAAAA', locked: true },
      { hex: '#BBBBBB', locked: false },
      { hex: '#CCCCCC', locked: true },
      { hex: '#DDDDDD', locked: false },
      { hex: '#EEEEEE', locked: false },
    ]
    const result = generateWithHarmony(palette, 'analogous')
    expect(result[0].hex).toBe('#AAAAAA')
    expect(result[2].hex).toBe('#CCCCCC')
    expect(result[0].locked).toBe(true)
    expect(result[2].locked).toBe(true)
  })

  it('returns valid uppercase hex for all positions', () => {
    const palette: PaletteColor[] = Array(5).fill(null).map(() => ({ hex: '#123456', locked: false }))
    generateWithHarmony(palette, 'analogous').forEach(c => {
      expect(c.hex).toMatch(/^#[0-9A-F]{6}$/)
    })
  })

  it('works for palette counts other than 5', () => {
    const palette3: PaletteColor[] = Array(3).fill(null).map(() => ({ hex: '#FF0000', locked: false }))
    expect(generateWithHarmony(palette3, 'analogous')).toHaveLength(3)

    const palette7: PaletteColor[] = Array(7).fill(null).map(() => ({ hex: '#FF0000', locked: false }))
    expect(generateWithHarmony(palette7, 'triadic')).toHaveLength(7)
  })
})
