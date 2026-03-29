const FRAME_SRC = '/tools/apple-iphone-15-black-portrait.png'

// Screen rect measured from the frame PNG (pixel coordinates).
type ScreenRect = { x: number; y: number; w: number; h: number }

const SCREEN: ScreenRect = { x: 120, y: 265, w: 1179, h: 2411 }

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

export async function generateMockup(userImage: HTMLImageElement): Promise<HTMLCanvasElement> {
  const frame = await loadImage(FRAME_SRC)

  const canvas = document.createElement('canvas')
  canvas.width = frame.naturalWidth
  canvas.height = frame.naturalHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not acquire 2D canvas context')

  // Draw user image cover-cropped into the screen area
  const { sx, sy, sw, sh } = coverCrop(
    userImage.naturalWidth,
    userImage.naturalHeight,
    SCREEN.w,
    SCREEN.h
  )
  ctx.drawImage(userImage, sx, sy, sw, sh, SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h)

  // Draw transparent frame on top — bezel covers everything outside screen
  ctx.drawImage(frame, 0, 0)

  return canvas
}
