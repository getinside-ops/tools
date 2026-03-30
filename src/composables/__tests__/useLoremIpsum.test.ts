import { describe, it, expect } from 'vitest'
import { generateLorem } from '../useLoremIpsum'

describe('useLoremIpsum - generateLorem', () => {
  it('should generate the requested number of paragraphs', () => {
    const text = generateLorem({ paragraphs: 3 })
    const paragraphs = text.split('\n\n')
    expect(paragraphs.length).toBe(3)
  })

  it('should start with Lorem ipsum by default', () => {
    const text = generateLorem()
    expect(text.startsWith('Lorem ipsum dolor sit amet')).toBe(true)
  })

  it('should generate a specific number of words', () => {
    const text = generateLorem({ words: 10 })
    const words = text.split(' ')
    expect(words.length).toBe(10)
  })
})
