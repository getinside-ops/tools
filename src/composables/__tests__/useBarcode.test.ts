import { describe, it, expect } from 'vitest'
import { calculateEanChecksum, generateEanBinary } from '../useBarcode'

describe('useBarcode - EAN-13 Logic', () => {
  it('should calculate the correct checksum for 12 digits', () => {
    // 400638133393 -> checksum 1
    expect(calculateEanChecksum('400638133393')).toBe(1)
    // 978020137962 -> checksum 4
    expect(calculateEanChecksum('978020137962')).toBe(4)
  })

  it('should generate a 95-bit binary string for EAN-13', () => {
    const binary = generateEanBinary('4006381333931')
    expect(binary.length).toBe(95)
    expect(binary.startsWith('101')).toBe(true) // Start guard
    expect(binary.endsWith('101')).toBe(true)   // End guard
  })

  it('should throw error for invalid input length', () => {
    expect(() => generateEanBinary('123')).toThrow()
  })
})
