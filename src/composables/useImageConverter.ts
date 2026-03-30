/**
 * Universal Image Converter (VERT Style)
 * 100% client-side.
 */

export const SUPPORTED_INPUTS = [
  'image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif'
] as const

export const FORMAT_MAP: Record<string, string[]> = {
  'image/png': ['image/jpeg', 'image/webp'],
  'image/jpeg': ['image/png', 'image/webp'],
  'image/webp': ['image/png', 'image/jpeg'],
  'image/svg+xml': ['image/png', 'image/jpeg', 'image/webp'],
  'image/gif': ['image/png', 'image/jpeg', 'image/webp']
}

export function getAvailableFormats(mimeType: string): string[] {
  return FORMAT_MAP[mimeType] || []
}

export interface ConvertOptions {
  quality?: number // 0 to 1
  scale?: number   // e.g. 2 for 2x
}

/**
 * Converts an image file to a new format using Canvas.
 */
export function convertImage(
  sourceUrl: string,
  targetMime: string,
  options: ConvertOptions = {}
): Promise<string> {
  const { quality = 0.9, scale = 1 } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas context failed'))

      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height)
      
      const result = canvas.toDataURL(targetMime, quality)
      resolve(result)
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = sourceUrl
  })
}
