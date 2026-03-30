/**
 * Image Metadata extraction logic
 * 100% client-side.
 */

export interface ImageMetadata {
  name: string
  size: number
  type: string
  lastModified: number
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
