import { describe, it, expect } from 'vitest'
import { decodeQrFromImageData } from '../useQrDecoder'

describe('useQrDecoder - Logic', () => {
  it('should return null if no QR code is found in empty data', () => {
    // Mock ImageData structure (rgba: 1x1 = 4 bytes)
    const mockData = new Uint8ClampedArray(4).fill(0)
    const result = decodeQrFromImageData(mockData, 1, 1)
    expect(result).toBeNull()
  })

  it('should handle invalid dimensions gracefully', () => {
    const result = decodeQrFromImageData(new Uint8ClampedArray(0), 0, 0)
    expect(result).toBeNull()
  })
})
