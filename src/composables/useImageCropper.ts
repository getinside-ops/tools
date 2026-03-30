export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Clamps a crop rectangle to the image bounds.
 */
export function calculateCropRect(imgWidth: number, imgHeight: number, crop: Rect): Rect {
  const x = Math.max(0, Math.min(imgWidth, crop.x))
  const y = Math.max(0, Math.min(imgHeight, crop.y))
  const width = Math.max(0, Math.min(imgWidth - x, crop.width))
  const height = Math.max(0, Math.min(imgHeight - y, crop.height))

  return { 
    x: Math.round(x), 
    y: Math.round(y), 
    width: Math.round(width), 
    height: Math.round(height) 
  }
}

/**
 * Crops an image data URL using HTML5 Canvas.
 * 100% client-side.
 */
export function cropImage(dataUrl: string, cropRect: Rect): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const finalRect = calculateCropRect(img.width, img.height, cropRect)
      
      // If result area is zero, reject
      if (finalRect.width === 0 || finalRect.height === 0) {
        return reject(new Error('Invalid crop area'))
      }

      const canvas = document.createElement('canvas')
      canvas.width = finalRect.width
      canvas.height = finalRect.height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        return reject(new Error('Failed to get canvas context'))
      }
      
      ctx.drawImage(
        img, 
        finalRect.x, finalRect.y, finalRect.width, finalRect.height, 
        0, 0, finalRect.width, finalRect.height
      )
      
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = (e) => reject(new Error('Failed to load image: ' + e))
    img.src = dataUrl
  })
}
