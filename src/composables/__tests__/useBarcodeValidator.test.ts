import { describe, it, expect } from 'vitest'
import { useBarcodeValidator } from '../useBarcodeValidator'

describe('useBarcodeValidator', () => {
  it('returns maxDigits error code for >13 digits', () => {
    const { state, validate } = useBarcodeValidator()
    validate('12345678901234')
    expect(state.value.errorCode).toBe('maxDigits')
    expect(state.value.isValid).toBe(false)
  })

  it('returns requiredDigits error code for <13 digits (not 12)', () => {
    const { state, validate } = useBarcodeValidator()
    validate('12345')
    expect(state.value.errorCode).toBe('requiredDigits')
    expect(state.value.isValid).toBe(false)
  })

  it('returns null error for 12 digits (calculating checksum)', () => {
    const { state, validate } = useBarcodeValidator()
    validate('400638133393')
    expect(state.value.errorCode).toBeNull()
    expect(state.value.checksum).toBe(1)
  })

  it('returns null error for empty input', () => {
    const { state, validate } = useBarcodeValidator()
    validate('')
    expect(state.value.errorCode).toBeNull()
    expect(state.value.isValid).toBe(false)
  })

  it('returns null error and valid state for correct 13-digit code', () => {
    const { state, validate } = useBarcodeValidator()
    validate('4006381333931')
    expect(state.value.errorCode).toBeNull()
    expect(state.value.isValid).toBe(true)
    expect(state.value.checksumValid).toBe(true)
  })

  it('detects country from first digits', () => {
    const { state, validate } = useBarcodeValidator()
    validate('4006381333931')
    expect(state.value.errorCode).toBeNull()
    expect(state.value.country).toBe('France')
  })

  it('detects invalid checksum', () => {
    const { state, validate } = useBarcodeValidator()
    validate('4006381333932')
    expect(state.value.errorCode).toBeNull()
    expect(state.value.checksumValid).toBe(false)
  })

  it('strips non-digit characters', () => {
    const { state, validate } = useBarcodeValidator()
    validate('400-638-133-3931')
    expect(state.value.errorCode).toBeNull()
    expect(state.value.isValid).toBe(true)
  })

  it('detects Bulgaria (single range 380)', () => {
    const { state, validate } = useBarcodeValidator()
    validate('3800000000007')
    expect(state.value.errorCode).toBeNull()
    expect(state.value.country).toBe('Bulgarie')
  })
})
