import { describe, it, expect } from 'vitest'
import { extractBasicMetadata } from '../useMetadata'

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
})
