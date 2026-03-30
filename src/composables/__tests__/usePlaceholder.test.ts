import { describe, it, expect } from 'vitest'
import { generatePlaceholderSvg } from '../usePlaceholder'

describe('usePlaceholder - generatePlaceholderSvg', () => {
  it('should generate a valid SVG string with dimensions', () => {
    const options = { width: 300, height: 200 }
    const result = generatePlaceholderSvg(options)
    expect(result).toContain('width="300"')
    expect(result).toContain('height="200"')
    expect(result).toContain('<rect')
  })

  it('should include custom text', () => {
    const options = { width: 300, height: 200, text: 'Hello World' }
    const result = generatePlaceholderSvg(options)
    expect(result).toContain('Hello World')
  })

  it('should use custom colors', () => {
    const options = { 
      width: 300, 
      height: 200, 
      bgColor: '#ff0000', 
      textColor: '#00ff00' 
    }
    const result = generatePlaceholderSvg(options)
    expect(result).toContain('fill="#ff0000"')
    expect(result).toContain('fill="#00ff00"')
  })
})
