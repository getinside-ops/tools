/**
 * QR Code Decoding logic
 * Uses jsQR library for robust client-side decoding.
 */

import jsQR from 'jsqr'

/**
 * Decodes QR code content from raw pixel data.
 */
export function decodeQrFromImageData(data: Uint8ClampedArray, width: number, height: number): string | null {
  if (!data || width <= 0 || height <= 0) return null
  
  const code = jsQR(data, width, height)
  return code ? code.data : null
}
