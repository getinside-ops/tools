/**
 * EAN Barcode Exporter
 * Export barcodes as SVG, PNG, and JPG formats with configurable scale and transparency.
 */

export interface ExportOptions {
  scale?: number
  transparent?: boolean
  quality?: number
  backgroundColor?: string
}

export function useBarcodeExporter() {
  /**
   * Convert SVG string to canvas element
   */
  function svgToCanvas(svgString: string, scale: number = 1): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      const img = new Image()
      
      // Use SVG blob URL for better compatibility
      const blob = new Blob([svgString], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      
      img.onload = () => {
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        URL.revokeObjectURL(url)
        resolve(canvas)
      }
      img.onerror = (e) => {
        URL.revokeObjectURL(url)
        reject(new Error(`Failed to load image: ${e}`))
      }
      
      img.src = url
    })
  }

  /**
   * Export SVG as Blob
   */
  async function exportSvg(svgString: string): Promise<Blob> {
    return new Blob([svgString], { type: 'image/svg+xml' })
  }

  /**
   * Export PNG as Blob with optional transparency
   */
  async function exportPng(
    svgString: string,
    options: ExportOptions = {}
  ): Promise<Blob> {
    const { scale = 1, transparent = false } = options
    const canvas = await svgToCanvas(svgString, scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')

    if (!transparent) {
      // Create white background
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = canvas.width
      tempCanvas.height = canvas.height
      const tempCtx = tempCanvas.getContext('2d')
      if (!tempCtx) throw new Error('Could not get canvas context')
      tempCtx.fillStyle = 'white'
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
      tempCtx.drawImage(canvas, 0, 0)
      canvas.width = tempCanvas.width
      canvas.height = tempCanvas.height
      ctx.drawImage(tempCanvas, 0, 0)
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!)
      }, 'image/png')
    })
  }

  /**
   * Export JPEG as Blob with configurable quality
   */
  async function exportJpeg(
    svgString: string,
    options: ExportOptions = {}
  ): Promise<Blob> {
    const { scale = 1, quality = 0.9 } = options
    const canvas = await svgToCanvas(svgString, scale)

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!)
      }, 'image/jpeg', quality)
    })
  }

  /**
   * Download a Blob as a file
   */
  function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  return {
    exportSvg,
    exportPng,
    exportJpeg,
    downloadBlob,
  }
}
