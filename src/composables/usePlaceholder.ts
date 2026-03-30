export interface PlaceholderOptions {
  width: number
  height: number
  text?: string
  bgColor?: string
  textColor?: string
}

/**
 * Generates a placeholder SVG string.
 * 100% client-side.
 */
export function generatePlaceholderSvg(options: PlaceholderOptions): string {
  const { 
    width, 
    height, 
    text, 
    bgColor = '#cccccc', 
    textColor = '#333333' 
  } = options
  
  const label = text || `${Math.round(width)} x ${Math.round(height)}`
  
  // Calculate a reasonable font size
  const fontSize = Math.max(12, Math.floor(Math.min(width / (label.length * 0.6), height * 0.2)))

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${bgColor}" />
  <text 
    x="50%" 
    y="50%" 
    font-family="sans-serif" 
    font-size="${fontSize}" 
    fill="${textColor}" 
    text-anchor="middle" 
    dominant-baseline="middle"
  >
    ${label}
  </text>
</svg>
  `.trim()
}

/**
 * Converts placeholder SVG to a Data URL (base64).
 */
export function getPlaceholderDataUrl(options: PlaceholderOptions): string {
  const svg = generatePlaceholderSvg(options)
  // Use btoa for a simple data URL
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
}
