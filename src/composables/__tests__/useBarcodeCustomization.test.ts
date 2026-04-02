import { describe, it, expect } from 'vitest'
import { useBarcodeCustomization } from '../useBarcodeCustomization'

describe('useBarcodeCustomization', () => {
  it('should initialize with default values', () => {
    const { settings } = useBarcodeCustomization()
    expect(settings.value.barColor).toBe('#000000')
    expect(settings.value.width).toBe(200)
    expect(settings.value.height).toBe(50)
    expect(settings.value.showText).toBe(true)
    expect(settings.value.transparentBackground).toBe(false)
    expect(settings.value.exportFormat).toBe('svg')
  })

  it('should update bar color', () => {
    const { settings, setBarColor } = useBarcodeCustomization()
    setBarColor('#ff0000')
    expect(settings.value.barColor).toBe('#ff0000')
  })

  it('should update dimensions', () => {
    const { settings, setDimensions } = useBarcodeCustomization()
    setDimensions({ width: 300, height: 60 })
    expect(settings.value.width).toBe(300)
    expect(settings.value.height).toBe(60)
  })

  it('should toggle show text', () => {
    const { settings, toggleShowText } = useBarcodeCustomization()
    toggleShowText()
    expect(settings.value.showText).toBe(false)
    toggleShowText()
    expect(settings.value.showText).toBe(true)
  })

  it('should reset to defaults', () => {
    const { settings, setBarColor, reset } = useBarcodeCustomization()
    setBarColor('#ff0000')
    reset()
    expect(settings.value.barColor).toBe('#000000')
  })
})
