import { describe, it, expect } from 'vitest'
import { validatePromoCode } from '../usePromoCode'

describe('validatePromoCode', () => {
  it('passes all checks for a clean code', () => {
    const results = validatePromoCode('SUMMER25FR')
    expect(results.every(r => r.pass)).toBe(true)
  })

  it('fails length check for code longer than 12 chars', () => {
    const results = validatePromoCode('AVERYLONGCODEHERE')
    expect(results.find(r => r.rule === 'length')!.pass).toBe(false)
  })

  it('fails special chars check for code with @', () => {
    const results = validatePromoCode('CODE@2026')
    expect(results.find(r => r.rule === 'no-special-chars')!.pass).toBe(false)
  })

  it('fails spaces check', () => {
    const results = validatePromoCode('CODE 2026')
    expect(results.find(r => r.rule === 'no-spaces')!.pass).toBe(false)
  })

  it('fails ambiguous check for code with 0 and 1', () => {
    const results = validatePromoCode('C0DE1XYZ')
    expect(results.find(r => r.rule === 'no-ambiguous')!.pass).toBe(false)
  })

  it('fails uppercase check for lowercase code', () => {
    const results = validatePromoCode('summer25')
    expect(results.find(r => r.rule === 'uppercase')!.pass).toBe(false)
  })

  it('returns empty array for empty input', () => {
    const results = validatePromoCode('')
    expect(results).toHaveLength(0)
  })
})
