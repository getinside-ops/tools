import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useBarcodeExporter } from '../useBarcodeExporter'

describe('useBarcodeExporter', () => {
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="95" height="60">
    <rect width="95" height="60" fill="white"/>
    <rect x="0" y="0" width="1" height="50" fill="black"/>
  </svg>`

  beforeEach(() => {
    // Mock canvas methods with proper MIME type handling
    HTMLCanvasElement.prototype.toBlob = vi.fn(function(callback, type, _quality) {
      callback(new Blob(['mocked'], { type: type || 'image/png' }))
    })
    HTMLCanvasElement.prototype.getContext = function(_contextId: string) {
      return {
        drawImage: vi.fn(),
        fillRect: vi.fn(),
      } as any
    }
    
    // Mock Image to immediately trigger onload
    vi.stubGlobal('Image', class MockImage {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      _src: string = ''
      width = 95
      height = 60
      
      set src(value: string) {
        this._src = value
        // Simulate immediate load for testing
        setTimeout(() => this.onload?.(), 0)
      }
      
      get src() {
        return this._src
      }
    })
  })

  it('should export SVG as Blob', async () => {
    const { exportSvg } = useBarcodeExporter()
    const blob = await exportSvg(svgString)
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('image/svg+xml')
  })

  it('should export PNG as Blob', async () => {
    const { exportPng } = useBarcodeExporter()
    const blob = await exportPng(svgString, { scale: 2, transparent: false })
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('image/png')
  })

  it('should export JPG as Blob', async () => {
    const { exportJpeg } = useBarcodeExporter()
    const blob = await exportJpeg(svgString, { scale: 2, quality: 0.9 })
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('image/jpeg')
  })

  it('should handle transparent background for PNG', async () => {
    const { exportPng } = useBarcodeExporter()
    const blob = await exportPng(svgString, { scale: 1, transparent: true })
    expect(blob.type).toBe('image/png')
  })
})
