export interface ResizeOptions {
  width?: number
  height?: number
  scale?: number
  preserveAspectRatio?: boolean
}

/**
 * Calculates resized dimensions based on various options.
 */
export function getResizedDimensions(
  original: { w: number; h: number }, 
  options: ResizeOptions
): { w: number; h: number } {
  let newWidth = original.w
  let newHeight = original.h

  if (options.scale !== undefined) {
    newWidth = original.w * options.scale
    newHeight = original.h * options.scale
  } else {
    const targetW = options.width ?? original.w
    const targetH = options.height ?? original.h

    if (options.preserveAspectRatio) {
      const ratio = original.w / original.h
      
      if (options.width !== undefined && options.height === undefined) {
        newWidth = options.width
        newHeight = options.width / ratio
      } else if (options.height !== undefined && options.width === undefined) {
        newHeight = options.height
        newWidth = options.height * ratio
      } else if (options.width !== undefined && options.height !== undefined) {
        // Both provided, fit into area keeping ratio
        if (targetW / targetH > ratio) {
          newHeight = targetH
          newWidth = targetH * ratio
        } else {
          newWidth = targetW
          newHeight = targetW / ratio
        }
      }
    } else {
      newWidth = targetW
      newHeight = targetH
    }
  }

  return { 
    w: Math.round(newWidth), 
    h: Math.round(newHeight) 
  }
}

/**
 * Resizes an image data URL using HTML5 Canvas.
 * 100% client-side.
 */
export function resizeImage(dataUrl: string, options: ResizeOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const { w, h } = getResizedDimensions({ w: img.width, h: img.height }, options)
      
      if (w <= 0 || h <= 0) {
        return reject(new Error('Invalid dimensions'))
      }

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        return reject(new Error('Failed to get canvas context'))
      }
      
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = dataUrl
  })
}
