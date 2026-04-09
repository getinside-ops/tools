/**
 * Image Metadata extraction logic
 * 100% client-side.
 */

export interface ImageMetadata {
  name: string
  size: number
  type: string
  lastModified: number
  width?: number
  height?: number
}

export interface ImageDimensions {
  width: number
  height: number
}

/**
 * Extracts basic file properties from a File object.
 */
export function extractBasicMetadata(file: File): ImageMetadata {
  return {
    name: file.name,
    size: file.size || 0,
    type: file.type,
    lastModified: file.lastModified
  }
}

/**
 * Extracts image dimensions from a File object by loading it into an Image element.
 * Returns null if the file is not an image or fails to load.
 */
export function extractDimensions(file: File): Promise<ImageDimensions | null> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(null)
      return
    }

    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      const dimensions = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      }
      URL.revokeObjectURL(objectUrl)
      resolve(dimensions)
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(null)
    }

    img.src = objectUrl
  })
}
