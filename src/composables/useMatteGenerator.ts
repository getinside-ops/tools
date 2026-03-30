export interface MatteOptions {
  padding: number
  color: string
}

/**
 * Calculates final dimensions with matte.
 * 100% client-side.
 */
export function getMatteDimensions(
  original: { w: number; h: number }, 
  padding: number
): { w: number; h: number } {
  return {
    w: original.w + padding * 2,
    h: original.h + padding * 2
  }
}

/**
 * Adds a colored matte (padding/background) to an image.
 */
export function applyMatte(dataUrl: string, options: MatteOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const { w, h } = getMatteDimensions({ w: img.width, h: img.height }, options.padding)
      
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        return reject(new Error('Failed to get canvas context'))
      }
      
      // Fill background color
      ctx.fillStyle = options.color
      ctx.fillRect(0, 0, w, h)
      
      // Draw image centered
      ctx.drawImage(img, options.padding, options.padding)
      
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = dataUrl
  })
}
