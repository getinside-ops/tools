/**
 * Image Palette Extraction logic
 * Extract dominant colors from raw pixel data.
 */

/**
 * Extracts a list of HEX dominant colors from raw pixel data.
 * @param data Pixel buffer (Uint8ClampedArray)
 * @param width Image width
 * @param height Image height
 * @param count Number of colors to return
 */
export function extractDominantColors(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  count: number = 5
): string[] {
  if (!data || width <= 0 || height <= 0) return []

  const counts: Record<string, number> = {}
  
  // Sample every few pixels for performance on large images
  const step = Math.max(1, Math.floor((width * height) / 10000))

  for (let i = 0; i < data.length; i += 4 * step) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]

    // Skip transparent
    if (a < 128) continue

    const hex = rgbToHex(r, g, b)
    counts[hex] = (counts[hex] || 0) + 1
  }

  // Sort by frequency
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([hex]) => hex)
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase()
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
