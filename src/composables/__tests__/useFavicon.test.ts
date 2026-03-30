import { describe, it, expect } from 'vitest'
import { getFaviconSizes } from '../useFavicon'

describe('useFavicon - getFaviconSizes', () => {
  it('should return the standard favicon sizes', () => {
    const sizes = getFaviconSizes()
    expect(sizes).toEqual([16, 32, 48, 180])
  })

  it('should generate multiple data URLs for a given image', async () => {
    // In JSDOM, we test the flow. Actual canvas rendering is basic.
    const fakeDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
    // ... we'll implement generateFavicons(url, sizes)
  })
})
