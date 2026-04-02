/**
 * Barcode Customization State Management
 * Manages barcode appearance settings (colors, dimensions, export options)
 * 
 * @returns Reactive settings and manipulation functions
 * 
 * @example
 * ```typescript
 * const { settings, setBarColor, reset } = useBarcodeCustomization()
 * setBarColor('#ff0000')
 * setDimensions({ width: 300, height: 60 })
 * reset()
 * ```
 */

import { ref } from 'vue'

/**
 * Barcode customization settings
 */
export interface BarcodeSettings {
  /** Bar color in hex format (e.g., '#ff0000') */
  barColor: string
  /** Barcode width in pixels (default: 200) */
  width: number
  /** Barcode height in pixels (default: 50) */
  height: number
  /** Whether to show human-readable text below barcode (default: true) */
  showText: boolean
  /** Whether to use transparent background for PNG export (default: false) */
  transparentBackground: boolean
  /** Export format for download (default: 'svg') */
  exportFormat: 'svg' | 'png' | 'jpg'
}

const DEFAULT_SETTINGS: BarcodeSettings = {
  barColor: '#000000',
  width: 200,
  height: 50,
  showText: true,
  transparentBackground: false,
  exportFormat: 'svg',
}

export function useBarcodeCustomization() {
  const settings = ref<BarcodeSettings>({ ...DEFAULT_SETTINGS })

  /**
   * Update barcode bar color
   * @param color - Hex color string
   */
  function setBarColor(color: string): void {
    settings.value.barColor = color
  }

  /**
   * Update barcode dimensions
   * @param dimensions - Width and height in pixels
   */
  function setDimensions(dimensions: { width: number; height: number }): void {
    settings.value.width = dimensions.width
    settings.value.height = dimensions.height
  }

  /**
   * Toggle human-readable text visibility
   */
  function toggleShowText(): void {
    settings.value.showText = !settings.value.showText
  }

  /**
   * Toggle transparent background for PNG export
   */
  function toggleTransparentBackground(): void {
    settings.value.transparentBackground = !settings.value.transparentBackground
  }

  /**
   * Set export format
   * @param format - Export format ('svg', 'png', or 'jpg')
   */
  function setExportFormat(format: 'svg' | 'png' | 'jpg'): void {
    settings.value.exportFormat = format
  }

  /**
   * Reset all settings to defaults
   */
  function reset(): void {
    settings.value = { ...DEFAULT_SETTINGS }
  }

  return {
    settings,
    setBarColor,
    setDimensions,
    toggleShowText,
    toggleTransparentBackground,
    setExportFormat,
    reset,
  } as const
}
