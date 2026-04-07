export interface WatermarkRemovalResult {
  success: boolean
  dataUrl: string | null
  error?: string
}

/**
 * Gemini watermark configuration.
 *
 * The watermark is a four-pointed star symbol (✦) placed in the
 * bottom-right corner with a 32px margin from the edges.
 *
 * - 48×48px for images ≤1024px on either side
 * - 96×96px for larger images
 *
 * Reference: https://gpt-watermark-remover.com/blog/how-to-remove-gemini-image-watermarks
 */
interface WatermarkConfig {
  margin: number
  smallSize: number
  largeSize: number
  sizeThreshold: number
}

const CONFIG: WatermarkConfig = {
  margin: 32,
  smallSize: 48,
  largeSize: 96,
  sizeThreshold: 1024,
}

/**
 * Removes the Gemini watermark from an image.
 *
 * Strategy: Detect the watermark region in the bottom-right corner,
 * then reconstruct it using directional inpainting from surrounding pixels.
 *
 * 100% client-side — image never leaves the browser.
 */
export function removeGeminiWatermark(dataUrl: string): Promise<WatermarkRemovalResult> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve({ success: false, dataUrl: null, error: 'Failed to get canvas context' })
          return
        }

        // Draw original image
        ctx.drawImage(img, 0, 0)

        // Detect watermark region
        const region = detectWatermarkRegion(img.width, img.height)
        if (!region) {
          // No watermark region found — return original
          resolve({ success: true, dataUrl: canvas.toDataURL('image/png') })
          return
        }

        // Apply inpainting to reconstruct the region
        inpaintRegion(ctx, region)

        // Export
        resolve({ success: true, dataUrl: canvas.toDataURL('image/png') })
      } catch (error) {
        resolve({
          success: false,
          dataUrl: null,
          error: error instanceof Error ? error.message : 'Unknown error during watermark removal',
        })
      }
    }
    img.onerror = () => {
      resolve({ success: false, dataUrl: null, error: 'Failed to load image' })
    }
    img.src = dataUrl
  })
}

/**
 * Calculates the expected watermark region based on image dimensions.
 */
function detectWatermarkRegion(width: number, height: number): { x: number; y: number; w: number; h: number } | null {
  const isSmall = width <= CONFIG.sizeThreshold || height <= CONFIG.sizeThreshold
  const size = isSmall ? CONFIG.smallSize : CONFIG.largeSize

  const x = width - size - CONFIG.margin
  const y = height - size - CONFIG.margin

  // Validate region is within image bounds
  if (x < 0 || y < 0 || x + size > width || y + size > height) return null

  return { x, y, w: size, h: size }
}

/**
 * Reconstructs the watermark region using multi-directional inpainting.
 *
 * For each pixel in the watermark region, samples pixels from the
 * surrounding area (above, left, and diagonally) and blends them
 * to produce a natural-looking reconstruction.
 */
function inpaintRegion(
  ctx: CanvasRenderingContext2D,
  region: { x: number; y: number; w: number; h: number }
): void {
  const { x, y, w, h } = region
  const canvas = ctx.canvas

  // Get a larger context area around the watermark for sampling
  const contextMargin = 32
  const contextX = Math.max(0, x - contextMargin)
  const contextY = Math.max(0, y - contextMargin)
  const contextW = Math.min(canvas.width - contextX, w + contextMargin * 2)
  const contextH = Math.min(canvas.height - contextY, h + contextMargin * 2)

  const contextImageData = ctx.getImageData(contextX, contextY, contextW, contextH)
  const contextData = contextImageData.data

  // Create a new image data for the watermark region
  const regionImageData = ctx.getImageData(x, y, w, h)
  const regionData = regionImageData.data

  // For each pixel in the watermark region, inpaint from surroundings
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const idx = (py * w + px) * 4

      // Get inpainted color from surrounding pixels
      const color = inpaintPixel(contextData, contextX, contextY, contextW, contextH, x + px, y + py, canvas.width)

      regionData[idx] = color.r
      regionData[idx + 1] = color.g
      regionData[idx + 2] = color.b
      // Keep original alpha
    }
  }

  // Put the inpainted region back
  ctx.putImageData(regionImageData, x, y)

  // Apply a subtle blur to smooth the transition between inpainted and original areas
  smoothTransition(ctx, x, y, w, h)
}

/**
 * Inpaints a single pixel by sampling from surrounding clean pixels.
 * Uses weighted averaging based on distance and direction.
 */
function inpaintPixel(
  contextData: Uint8ClampedArray,
  contextX: number,
  contextY: number,
  contextW: number,
  contextH: number,
  targetX: number,
  targetY: number,
  canvasWidth: number
): { r: number; g: number; b: number } {
  const maxRadius = 24
  let sumR = 0, sumG = 0, sumB = 0
  let totalWeight = 0

  // Sample in all directions, giving more weight to closer pixels
  for (let dy = -maxRadius; dy <= maxRadius; dy++) {
    for (let dx = -maxRadius; dx <= maxRadius; dx++) {
      if (dx === 0 && dy === 0) continue

      const sampleX = targetX + dx
      const sampleY = targetY + dy

      // Skip if out of bounds
      if (sampleX < 0 || sampleX >= canvasWidth || sampleY < 0) continue

      // Convert to context-local coordinates
      const ctxLocalX = sampleX - contextX
      const ctxLocalY = sampleY - contextY

      if (ctxLocalX < 0 || ctxLocalX >= contextW || ctxLocalY < 0 || ctxLocalY >= contextH) continue

      const idx = (ctxLocalY * contextW + ctxLocalX) * 4
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Weight: inverse distance with directional bias
      // Prefer pixels from above and left (more likely to be "clean" content)
      let weight = 1 / (distance + 1)

      // Extra weight for pixels above the watermark (same column, different row)
      if (dy < 0 && dx === 0) weight *= 2

      // Extra weight for pixels to the left of the watermark
      if (dx < 0 && dy === 0) weight *= 1.5

      sumR += contextData[idx] * weight
      sumG += contextData[idx + 1] * weight
      sumB += contextData[idx + 2] * weight
      totalWeight += weight
    }
  }

  if (totalWeight === 0) {
    // Fallback: just use the pixel above
    const aboveY = Math.max(0, targetY - 1)
    const ctxLocalX = targetX - contextX
    const ctxLocalY = aboveY - contextY
    const safeIdx = (ctxLocalY * contextW + ctxLocalX) * 4
    return {
      r: contextData[safeIdx],
      g: contextData[safeIdx + 1],
      b: contextData[safeIdx + 2],
    }
  }

  return {
    r: Math.round(sumR / totalWeight),
    g: Math.round(sumG / totalWeight),
    b: Math.round(sumB / totalWeight),
  }
}

/**
 * Applies a subtle Gaussian-like blur at the edges of the inpainted region
 * to smooth the transition between reconstructed and original pixels.
 */
function smoothTransition(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  const blendWidth = 4

  // Get a slightly larger area to blend the edges
  const areaX = Math.max(0, x - blendWidth)
  const areaY = Math.max(0, y - blendWidth)
  const areaW = w + blendWidth * 2
  const areaH = h + blendWidth * 2

  const imageData = ctx.getImageData(areaX, areaY, areaW, areaH)
  const data = imageData.data

  // Apply a light blur only at the edges
  for (let py = 0; py < areaH; py++) {
    for (let px = 0; px < areaW; px++) {
      const idx = (py * areaW + px) * 4

      // Calculate distance from the watermark region edge
      const regionLocalX = px - blendWidth
      const regionLocalY = py - blendWidth

      let edgeDistance = Infinity

      if (regionLocalX >= 0 && regionLocalX < w && regionLocalY >= 0 && regionLocalY < h) {
        // Inside the watermark region — no edge distance
        continue
      }

      // Distance from nearest edge
      if (regionLocalX < 0) edgeDistance = Math.min(edgeDistance, -regionLocalX)
      if (regionLocalX >= w) edgeDistance = Math.min(edgeDistance, regionLocalX - w + 1)
      if (regionLocalY < 0) edgeDistance = Math.min(edgeDistance, -regionLocalY)
      if (regionLocalY >= h) edgeDistance = Math.min(edgeDistance, regionLocalY - h + 1)

      // Apply smoothing near edges
      if (edgeDistance <= blendWidth && edgeDistance >= 0) {
        const blendFactor = 1 - (edgeDistance / blendWidth)

        // Average with neighbors
        let sumR = 0, sumG = 0, sumB = 0
        let count = 0

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = px + dx
            const ny = py + dy
            if (nx >= 0 && nx < areaW && ny >= 0 && ny < areaH) {
              const nIdx = (ny * areaW + nx) * 4
              sumR += data[nIdx]
              sumG += data[nIdx + 1]
              sumB += data[nIdx + 2]
              count++
            }
          }
        }

        if (count > 0) {
          const avgR = sumR / count
          const avgG = sumG / count
          const avgB = sumB / count

          data[idx] = Math.round(data[idx] * (1 - blendFactor * 0.3) + avgR * blendFactor * 0.3)
          data[idx + 1] = Math.round(data[idx + 1] * (1 - blendFactor * 0.3) + avgG * blendFactor * 0.3)
          data[idx + 2] = Math.round(data[idx + 2] * (1 - blendFactor * 0.3) + avgB * blendFactor * 0.3)
        }
      }
    }
  }

  ctx.putImageData(imageData, areaX, areaY)
}
