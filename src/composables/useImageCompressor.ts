export interface CompressOptions {
  quality: number
  format?: string
  maxWidth?: number
  maxHeight?: number
}

/**
 * Calculates new dimensions keeping aspect ratio.
 */
export function calculateAspectRatio(width: number, height: number, maxWidth?: number, maxHeight?: number): { width: number; height: number } {
  let newWidth = width
  let newHeight = height

  if (maxWidth && newWidth > maxWidth) {
    newHeight = (maxWidth / newWidth) * newHeight
    newWidth = maxWidth
  }
  if (maxHeight && newHeight > maxHeight) {
    newWidth = (maxHeight / newHeight) * newWidth
    newHeight = maxHeight
  }

  return { width: Math.round(newWidth), height: Math.round(newHeight) }
}

/**
 * Compresses an image data URL using HTML5 Canvas.
 * 100% client-side.
 */
export function compressImage(dataUrl: string, options: CompressOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const { width, height } = calculateAspectRatio(img.width, img.height, options.maxWidth, options.maxHeight)
      
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      
      ctx.drawImage(img, 0, 0, width, height)
      
      const result = canvas.toDataURL(options.format || 'image/jpeg', options.quality)
      resolve(result)
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = dataUrl
  })
}
