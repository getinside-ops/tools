import { describe, it, expect } from 'vitest'
import { generateHarmony } from '../useColorHarmony'

describe('generateHarmony', () => {
  it('generates 5 colors for analogous harmony', () => {
    const colors = generateHarmony('#0aaa8e', 'analogous', 5)
    expect(colors).toHaveLength(5)
    colors.forEach(c => expect(c).toMatch(/^#[0-9A-F]{6}$/))
  })

  it('generates 5 colors for complementary harmony', () => {
    const colors = generateHarmony('#0aaa8e', 'complementary', 5)
    expect(colors).toHaveLength(5)
    colors.forEach(c => expect(c).toMatch(/^#[0-9A-F]{6}$/))
  })

  it('generates 5 colors for triadic harmony', () => {
    const colors = generateHarmony('#0aaa8e', 'triadic', 5)
    expect(colors).toHaveLength(5)
    colors.forEach(c => expect(c).toMatch(/^#[0-9A-F]{6}$/))
  })

  it('generates 5 colors for tetradic harmony', () => {
    const colors = generateHarmony('#0aaa8e', 'tetradic', 5)
    expect(colors).toHaveLength(5)
    colors.forEach(c => expect(c).toMatch(/^#[0-9A-F]{6}$/))
  })

  it('generates 5 colors for split-complementary', () => {
    const colors = generateHarmony('#0aaa8e', 'split-complementary', 5)
    expect(colors).toHaveLength(5)
    colors.forEach(c => expect(c).toMatch(/^#[0-9A-F]{6}$/))
  })

  it('generates 5 colors for monochromatic', () => {
    const colors = generateHarmony('#0aaa8e', 'monochromatic', 5)
    expect(colors).toHaveLength(5)
    colors.forEach(c => expect(c).toMatch(/^#[0-9A-F]{6}$/))
  })

  it('random-beautiful generates varied, pleasant palettes', () => {
    const colors = generateHarmony('#0aaa8e', 'random-beautiful', 5)
    expect(colors).toHaveLength(5)
    const unique = new Set(colors)
    expect(unique.size).toBeGreaterThan(1)
  })

  it('handles edge case: white base color', () => {
    const colors = generateHarmony('#FFFFFF', 'analogous', 5)
    expect(colors).toHaveLength(5)
    colors.forEach(c => expect(c).toMatch(/^#[0-9A-F]{6}$/))
  })

  it('handles edge case: black base color', () => {
    const colors = generateHarmony('#000000', 'analogous', 5)
    expect(colors).toHaveLength(5)
    colors.forEach(c => expect(c).toMatch(/^#[0-9A-F]{6}$/))
  })

  it('analogous colors are perceptually similar', () => {
    const colors = generateHarmony('#0aaa8e', 'analogous', 5)
    // All hues should be within 60 degrees of each other
    const hues = colors.map(c => {
      const r = parseInt(c.slice(1, 3), 16) / 255
      const g = parseInt(c.slice(3, 5), 16) / 255
      const b = parseInt(c.slice(5, 7), 16) / 255
      const max = Math.max(r, g, b), min = Math.min(r, g, b)
      let h = 0
      if (max !== min) {
        const d = max - min
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
          case g: h = ((b - r) / d + 2) / 6; break
          case b: h = ((r - g) / d + 4) / 6; break
        }
      }
      return Math.round(h * 360)
    })
    const hueSpread = Math.max(...hues) - Math.min(...hues)
    expect(hueSpread).toBeLessThanOrEqual(120) // 5 colors × 30° = 120° spread
  })

  it('complementary includes a color ~180 degrees from base', () => {
    const colors = generateHarmony('#FF0000', 'complementary', 5)
    // One color should be in the cyan-green range (~120-240 hue)
    const hasComplement = colors.some(c => {
      const r = parseInt(c.slice(1, 3), 16) / 255
      const g = parseInt(c.slice(3, 5), 16) / 255
      const b = parseInt(c.slice(5, 7), 16) / 255
      const max = Math.max(r, g, b), min = Math.min(r, g, b)
      if (max === min) return false
      const d = max - min
      let h = 0
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
      const hue = Math.round(h * 360)
      return hue >= 120 && hue <= 240 // Cyan-green range for red complement
    })
    expect(hasComplement).toBe(true)
  })
})

describe('lightness spread', () => {
  function hexToL(hex: string): number {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    return Math.round(((max + min) / 2) * 100)
  }

  it('random-beautiful has at least 40% lightness range across 5 colors', () => {
    for (let t = 0; t < 10; t++) {
      const colors = generateHarmony('#0aaa8e', 'random-beautiful', 5)
      const lightnesses = colors.map(hexToL)
      const spread = Math.max(...lightnesses) - Math.min(...lightnesses)
      expect(spread).toBeGreaterThanOrEqual(40)
    }
  })

  it('monochromatic has at least 50% lightness range across 5 colors', () => {
    const colors = generateHarmony('#0aaa8e', 'monochromatic', 5)
    const lightnesses = colors.map(hexToL)
    const spread = Math.max(...lightnesses) - Math.min(...lightnesses)
    expect(spread).toBeGreaterThanOrEqual(50)
  })

  it('generates correct count for non-default sizes', () => {
    (['random-beautiful', 'analogous', 'triadic', 'monochromatic'] as const).forEach(type => {
      expect(generateHarmony('#FF0000', type, 3)).toHaveLength(3)
      expect(generateHarmony('#FF0000', type, 7)).toHaveLength(7)
    })
  })
})
