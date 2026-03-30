/**
 * QR Code Decoding logic
 * Uses jsQR library for robust client-side decoding.
 */

import jsQR from 'jsqr'

export interface QrDecodeResult {
  success: boolean
  data: string | null
  error?: string
}

/**
 * Decodes QR code content from raw pixel data.
 */
export function decodeQrFromImageData(data: Uint8ClampedArray, width: number, height: number): string | null {
  if (!data || width <= 0 || height <= 0) return null

  const code = jsQR(data, width, height)
  return code ? code.data : null
}

/**
 * Decodes a QR code from an HTMLImageElement
 */
export function decodeQrFromImage(img: HTMLImageElement): QrDecodeResult {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    return {
      success: false,
      data: null,
      error: 'Canvas context not available',
    }
  }
  
  canvas.width = img.naturalWidth || img.width
  canvas.height = img.naturalHeight || img.height
  ctx.drawImage(img, 0, 0)
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = decodeQrFromImageData(imageData.data, imageData.width, imageData.height)
  
  if (data) {
    return {
      success: true,
      data,
    }
  }
  
  return {
    success: false,
    data: null,
    error: 'No QR code detected',
  }
}

/**
 * Decodes a QR code from a Blob (e.g., from file input or clipboard)
 */
export function decodeQrFromBlob(blob: Blob): Promise<QrDecodeResult> {
  return new Promise((resolve) => {
    const img = new Image()
    
    img.onload = () => {
      const result = decodeQrFromImage(img)
      resolve(result)
    }
    
    img.onerror = () => {
      resolve({
        success: false,
        data: null,
        error: 'Failed to load image',
      })
    }
    
    const url = URL.createObjectURL(blob)
    img.src = url
  })
}

/**
 * Handles paste events and attempts to decode QR codes from pasted images
 */
export function decodeQrFromPasteEvent(e: ClipboardEvent): Promise<QrDecodeResult> {
  return new Promise((resolve) => {
    const items = e.clipboardData?.items
    
    if (!items) {
      resolve({
        success: false,
        data: null,
        error: 'No clipboard data',
      })
      return
    }
    
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const blob = item.getAsFile()
        if (blob) {
          resolve(decodeQrFromBlob(blob))
          return
        }
      }
    }
    
    resolve({
      success: false,
      data: null,
      error: 'No image found in clipboard',
    })
  })
}
