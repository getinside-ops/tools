import { describe, it, expect } from 'vitest'
import { extractBasicMetadata, extractDimensions } from '../useMetadata'

describe('useMetadata - Logic', () => {
  it('should return basic info for a mock image file', () => {
    // Mock File object
    const file = new File([''], 'test.png', { type: 'image/png' })
    // Ensure lastModified is a number
    Object.defineProperty(file, 'lastModified', { value: 12345 })

    const meta = extractBasicMetadata(file)
    expect(meta.name).toBe('test.png')
    expect(meta.type).toBe('image/png')
    expect(meta.size).toBe(0)
    expect(meta.lastModified).toBe(12345)
  })

  describe('extractDimensions', () => {
    it('should return null for non-image files', async () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const result = await extractDimensions(file)
      expect(result).toBeNull()
    })

    // Note: Testing actual image dimension extraction is canvas/DOM-dependent
    // and hard to unit test reliably in jsdom. This is tested manually in browser.
    // See QWEN.md: "Canvas-based composables — Skip unit tests, Manual Test required"
  })
})
