import { describe, it, expect } from 'vitest'
import { analyzeText } from '../useWordCounter'

describe('analyzeText', () => {
  it('returns all zeros for empty string', () => {
    const r = analyzeText('')
    expect(r).toEqual({ words: 0, charsWithSpaces: 0, charsWithoutSpaces: 0, sentences: 0, paragraphs: 0, readingTimeMin: 0 })
  })

  it('returns all zeros for whitespace-only string', () => {
    const r = analyzeText('   \n\n  ')
    expect(r).toEqual({ words: 0, charsWithSpaces: 0, charsWithoutSpaces: 0, sentences: 0, paragraphs: 0, readingTimeMin: 0 })
  })

  it('counts words correctly', () => {
    expect(analyzeText('hello world').words).toBe(2)
  })

  it('handles multiple spaces between words', () => {
    expect(analyzeText('hello   world').words).toBe(2)
  })

  it('counts characters with spaces', () => {
    expect(analyzeText('hello world').charsWithSpaces).toBe(11)
  })

  it('counts characters without spaces', () => {
    expect(analyzeText('hello world').charsWithoutSpaces).toBe(10)
  })

  it('counts sentences', () => {
    expect(analyzeText('Hello. World! How are you?').sentences).toBe(3)
  })

  it('counts paragraphs separated by double newline', () => {
    expect(analyzeText('Para one.\n\nPara two.').paragraphs).toBe(2)
  })

  it('reading time is 1 min for 1 word', () => {
    expect(analyzeText('hello').readingTimeMin).toBe(1)
  })

  it('reading time is 1 min for 200 words', () => {
    const text = Array(200).fill('word').join(' ')
    expect(analyzeText(text).readingTimeMin).toBe(1)
  })

  it('reading time is 2 min for 201 words', () => {
    const text = Array(201).fill('word').join(' ')
    expect(analyzeText(text).readingTimeMin).toBe(2)
  })
})
