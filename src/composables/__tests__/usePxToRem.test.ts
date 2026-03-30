import { describe, it, expect } from 'vitest'
import { pxToRem, remToPx } from '../usePxToRem'

describe('pxToRem', () => {
  it('converts px to rem with default base of 16', () => {
    expect(pxToRem(16)).toBe(1)
    expect(pxToRem(32)).toBe(2)
    expect(pxToRem(24)).toBe(1.5)
  })

  it('converts px to rem with custom base', () => {
    expect(pxToRem(20, 10)).toBe(2)
    expect(pxToRem(12, 12)).toBe(1)
  })

  it('handles base 0 correctly (prevents division by zero)', () => {
    expect(pxToRem(16, 0)).toBe(0)
  })
})

describe('remToPx', () => {
  it('converts rem to px with default base of 16', () => {
    expect(remToPx(1)).toBe(16)
    expect(remToPx(2.5)).toBe(40)
  })

  it('converts rem to px with custom base', () => {
    expect(remToPx(2, 10)).toBe(20)
  })
})
