export interface MatteOptions {
  padding: number
  color: string
  pattern?: 'none' | 'dots' | 'grid' | 'stripes'
  targetSize?: { w: number; h: number } | null
}

/**
 * Calculates final dimensions for the output image.
 */
export function getMatteDimensions(
  original: { w: number; h: number }, 
  options: MatteOptions
): { w: number; h: number } {
  if (options.targetSize) {
    return { w: options.targetSize.w, h: options.targetSize.h }
  }
  return {
    w: original.w + options.padding * 2,
    h: original.h + options.padding * 2
  }
}

/**
 * Calculates position and size to draw the original image inside the target frame.
 * Mimics object-fit: contain (with padding optional constraints).
 */
export function getFitBox(
  original: { w: number; h: number },
  target: { w: number; h: number },
  padding: number
) {
  const availableW = target.w - padding * 2
  const availableH = target.h - padding * 2
  
  if (availableW <= 0 || availableH <= 0) {
    return { x: padding, y: padding, w: 0, h: 0 }
  }

  const ratioX = availableW / original.w
  const ratioY = availableH / original.h
  const scale = Math.min(ratioX, ratioY)

  const finalW = original.w * scale
  const finalH = original.h * scale

  return {
    x: (target.w - finalW) / 2,
    y: (target.h - finalH) / 2,
    w: finalW,
    h: finalH
  }
}

/**
 * Draws a seamless pattern on the context.
 */
function drawPattern(ctx: CanvasRenderingContext2D, w: number, h: number, patternType: string, baseColor: string) {
  // Simplified pattern implementations
  ctx.fillStyle = baseColor
  ctx.fillRect(0, 0, w, h)
  
  if (patternType === 'none') return

  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)' // Soft overlay pattern color
  
  const pSize = 20
  if (patternType === 'dots') {
    for (let x = 0; x < w; x += pSize) {
      for (let y = 0; y < h; y += pSize) {
        ctx.beginPath()
        ctx.arc(x + pSize/2, y + pSize/2, 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  } else if (patternType === 'grid') {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    for (let x = 0; x < w; x += pSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
    }
    for (let y = 0; y < h; y += pSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
    }
  } else if (patternType === 'stripes') {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 4
    for (let i = -h; i < w + h; i += pSize) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i - h, h)
      ctx.stroke()
    }
  }
}

/**
 * Adds a colored matte or pattern and scales the image into a target output.
 */
export function applyMatte(dataUrl: string, options: MatteOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const outputDim = getMatteDimensions({ w: img.width, h: img.height }, options)
      
      const canvas = document.createElement('canvas')
      canvas.width = outputDim.w
      canvas.height = outputDim.h
      
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Failed to get canvas context'))
      
      // Draw background + optional pattern
      drawPattern(ctx, outputDim.w, outputDim.h, options.pattern || 'none', options.color)
      
      // Draw image
      if (options.targetSize) {
        // Fit inside target size
        const box = getFitBox({ w: img.width, h: img.height }, outputDim, options.padding)
        ctx.drawImage(img, box.x, box.y, box.w, box.h)
      } else {
        // Simple padding around original
        ctx.drawImage(img, options.padding, options.padding)
      }
      
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = dataUrl
  })
}
