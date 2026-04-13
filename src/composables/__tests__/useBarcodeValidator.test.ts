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
})
