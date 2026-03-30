/**
 * Simple Lorem Ipsum Generator
 * 100% client-side logic.
 */

const WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea',
  'commodo', 'consequat', 'duis', 'aute', 'irure', 'dolor', 'in', 'reprehenderit',
  'in', 'voluptate', 'velit', 'esse', 'cillum', 'dolore', 'eu', 'fugiat',
  'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non',
  'proident', 'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollit',
  'anim', 'id', 'est', 'laborum'
]

interface LoremOptions {
  paragraphs?: number
  words?: number
  startWithLorem?: boolean
}

export function generateLorem(options: LoremOptions = {}): string {
  const { paragraphs = 1, words, startWithLorem = true } = options

  if (words) {
    return generateSentence(words, startWithLorem)
  }

  const result: string[] = []
  for (let i = 0; i < paragraphs; i++) {
    const isFirst = i === 0 && startWithLorem
    result.push(generateParagraph(isFirst))
  }

  return result.join('\n\n')
}

function generateParagraph(startWithLorem: boolean): string {
  const sentenceCount = Math.floor(Math.random() * 4) + 3 // 3 to 6 sentences
  const sentences: string[] = []
  for (let i = 0; i < sentenceCount; i++) {
    const isFirst = i === 0 && startWithLorem
    sentences.push(generateSentence(Math.floor(Math.random() * 8) + 8, isFirst))
  }
  return sentences.join(' ')
}

function generateSentence(length: number, startWithLorem: boolean): string {
  const result: string[] = []
  
  if (startWithLorem) {
    const lead = ['lorem', 'ipsum', 'dolor', 'sit', 'amet']
    for (let i = 0; i < length; i++) {
      if (i < lead.length) {
        result.push(lead[i])
      } else {
        result.push(getRandomWord())
      }
    }
  } else {
    for (let i = 0; i < length; i++) {
      result.push(getRandomWord())
    }
  }

  const sentence = result.join(' ')
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.'
}

function getRandomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)]
}
