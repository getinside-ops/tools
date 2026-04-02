import { describe, it, expect } from 'vitest'
import { useBarcodeValidator } from '../useBarcodeValidator'

describe('useBarcodeValidator', () => {
  it('should validate EAN-13 format (13 digits)', () => {
    const { validate, state } = useBarcodeValidator()
    validate('4006381333931')
    expect(state.value.isValid).toBe(true)
    expect(state.value.error).toBeNull()
  })

  it('should reject non-numeric input', () => {
    const { validate, state } = useBarcodeValidator()
    validate('400abc1333931')
    // Non-digits are stripped, resulting in '4001333931' (10 digits)
    expect(state.value.isValid).toBe(false)
    expect(state.value.error).toBe('13 chiffres requis')
  })

  it('should detect country from first digits', () => {
    const { validate, state } = useBarcodeValidator()
    validate('4006381333931')
    expect(state.value.country).toBe('France')
    expect(state.value.countryCode).toBe('400-440')
  })

  it('should calculate and verify checksum', () => {
    const { validate, state } = useBarcodeValidator()
    validate('4006381333931')
    expect(state.value.checksum).toBe(1)
    expect(state.value.checksumValid).toBe(true)
  })

  it('should handle 12-digit input (calculating state)', () => {
    const { validate, state } = useBarcodeValidator()
    validate('400638133393')
    expect(state.value.isCalculating).toBe(false)
    expect(state.value.checksum).toBe(1)
  })

  it('should reject wrong length', () => {
    const { validate, state } = useBarcodeValidator()
    validate('40063813339')
    expect(state.value.isValid).toBe(false)
    expect(state.value.error).toBe('13 chiffres requis')
  })

  it('should handle empty input', () => {
    const { validate, state } = useBarcodeValidator()
    validate('')
    expect(state.value.isValid).toBe(false)
    expect(state.value.error).toBeNull()
    expect(state.value.formatted).toBe('')
  })

  it('should detect invalid checksum', () => {
    const { validate, state } = useBarcodeValidator()
    validate('4006381333932') // Wrong checksum (should be 1)
    expect(state.value.isValid).toBe(true)
    expect(state.value.checksumValid).toBe(false)
    expect(state.value.checksum).toBe(1)
  })

  it('should strip non-digit characters', () => {
    const { validate, state } = useBarcodeValidator()
    validate('400-638-133-3931')
    expect(state.value.isValid).toBe(true)
    expect(state.value.formatted).toBe('4 006381 333931')
  })

  it('should detect Bulgaria (single range 380)', () => {
    const { validate, state } = useBarcodeValidator()
    validate('3801234567890')
    expect(state.value.country).toBe('Bulgarie')
    expect(state.value.countryCode).toBe('380')
  })

  it('should handle codes longer than 13 digits', () => {
    const { validate, state } = useBarcodeValidator()
    validate('40063813339315')
    expect(state.value.error).toBe('13 chiffres maximum')
  })
})
