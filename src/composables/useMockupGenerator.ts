import type { DeviceConfig } from './mockupDevices'

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

function coverCrop(
  imgW: number,
  imgH: number,
  targetW: number,
  targetH: number
): { sx: number; sy: number; sw: number; sh: number } {
  const imgRatio = imgW / imgH
  const targetRatio = targetW / targetH
  if (imgRatio > targetRatio) {
    const sw = imgH * targetRatio
    return { sx: (imgW - sw) / 2, sy: 0, sw, sh: imgH }
  } else {
    const sh = imgW / targetRatio
    return { sx: 0, sy: (imgH - sh) / 2, sw: imgW, sh }
  }
}

export async function generateMockup(
  userImage: HTMLImageElement,
  device: DeviceConfig
): Promise<HTMLCanvasElement> {
  const { screenRect, cornerRadius } = device
  const frame = await loadImage(device.imageSrc)

  const canvas = document.createElement('canvas')
  canvas.width = frame.naturalWidth
  canvas.height = frame.naturalHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not acquire 2D canvas context')

  // Clear canvas first (transparent)
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Create rounded rect path for clipping
  if (cornerRadius > 0) {
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(screenRect.x, screenRect.y, screenRect.w, screenRect.h, cornerRadius)
    ctx.clip()
  }

  // Draw user image cover-cropped into the screen area
  const { sx, sy, sw, sh } = coverCrop(
    userImage.naturalWidth,
    userImage.naturalHeight,
    screenRect.w,
    screenRect.h
  )
  ctx.drawImage(userImage, sx, sy, sw, sh, screenRect.x, screenRect.y, screenRect.w, screenRect.h)

  // Remove clipping before drawing frame
  if (cornerRadius > 0) {
    ctx.restore()
  }

  // Draw the device frame on top (covers edges)
  ctx.drawImage(frame, 0, 0)

  return canvas
}