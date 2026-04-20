interface RandomHexOptions {
  digits: number
  count: number
}

export function generateRandomHex(options: RandomHexOptions): string[] {
  const { digits, count } = options
  const results: string[] = []

  for (let i = 0; i < count; i++) {
    let hex = ''
    for (let j = 0; j < digits; j++) {
      hex += getRandomHexChar()
    }
    results.push(hex)
  }

  return results
}

function getRandomHexChar(): string {
  const hexChars = '0123456789abcdef'
  return hexChars[Math.floor(Math.random() * 16)]
}
