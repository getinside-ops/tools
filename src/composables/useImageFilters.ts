export interface FilterOptions {
  grayscale?: number
  sepia?: number
  invert?: number
  blur?: number
  brightness?: number
  contrast?: number
}

/**
 * Builds a CSS filter string for Canvas 2D context.
 */
export function constructFilterString(options: FilterOptions): string {
  const parts: string[] = []

  if (options.grayscale !== undefined) parts.push(`grayscale(${options.grayscale}%)`)
  if (options.sepia !== undefined) parts.push(`sepia(${options.sepia}%)`)
  if (options.invert !== undefined) parts.push(`invert(${options.invert}%)`)
  if (options.blur !== undefined) parts.push(`blur(${options.blur}px)`)
  if (options.brightness !== undefined) parts.push(`brightness(${options.brightness}%)`)
  if (options.contrast !== undefined) parts.push(`contrast(${options.contrast}%)`)

  return parts.join(' ')
}

/**
 * Applies filters to an image data URL using HTML5 Canvas filter property.
 * 100% client-side.
 */
export function applyFilters(dataUrl: string, options: FilterOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        return reject(new Error('Failed to get canvas context'))
      }
      
      // Clear previous filters (important if reusing canvas)
      ctx.filter = constructFilterString(options) || 'none'
      ctx.drawImage(img, 0, 0)
      
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = dataUrl
  })
}
