import { ref } from 'vue'

export interface BarcodeSettings {
  barColor: string
  width: number
  height: number
  showText: boolean
  transparentBackground: boolean
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

  function setBarColor(color: string): void {
    settings.value.barColor = color
  }

  function setDimensions(dimensions: { width: number; height: number }): void {
    settings.value.width = dimensions.width
    settings.value.height = dimensions.height
  }

  function toggleShowText(): void {
    settings.value.showText = !settings.value.showText
  }

  function toggleTransparentBackground(): void {
    settings.value.transparentBackground = !settings.value.transparentBackground
  }

  function setExportFormat(format: 'svg' | 'png' | 'jpg'): void {
    settings.value.exportFormat = format
  }

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
  }
}
