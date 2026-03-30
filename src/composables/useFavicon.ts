/**
 * Generates favicons in standard sizes.
 * 100% client-side.
 */

export const FAVICON_SIZES = [16, 32, 48, 180] as const

export function getFaviconSizes(): number[] {
  return [...FAVICON_SIZES]
}

export interface FaviconResult {
  size: number
  dataUrl: string
}

/**
 * Generates multiple icons from a single source image.
 */
export function generateFavicons(
  sourceUrl: string,
  sizes: number[] = getFaviconSizes()
): Promise<FaviconResult[]> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const results: FaviconResult[] = []
      
      sizes.forEach(size => {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        
        // Simple scale to fit (square center crop logic could be added)
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, size, size)
        
        results.push({
          size,
          dataUrl: canvas.toDataURL('image/png')
        })
      })
      
      resolve(results)
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = sourceUrl
  })
}
