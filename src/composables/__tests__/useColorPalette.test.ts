import { describe, it, expect } from 'vitest'
import { generatePalette, toggleLock, initPalette } from '../useColorPalette'
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
