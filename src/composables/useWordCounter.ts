export interface TextStats {
  words: number
  charsWithSpaces: number
  charsWithoutSpaces: number
  sentences: number
  paragraphs: number
  readingTimeMin: number
}

export function analyzeText(text: string): TextStats {
  if (!text.trim()) {
    return { words: 0, charsWithSpaces: 0, charsWithoutSpaces: 0, sentences: 0, paragraphs: 0, readingTimeMin: 0 }
  }
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length
  const charsWithSpaces = text.length
  const charsWithoutSpaces = text.replace(/\s/g, '').length
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0).length
  const readingTimeMin = Math.ceil(words / 200)
  return { words, charsWithSpaces, charsWithoutSpaces, sentences, paragraphs, readingTimeMin }
}
