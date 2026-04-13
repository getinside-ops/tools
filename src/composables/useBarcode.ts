/**
 * EAN-13 and EAN-8 Barcode Logic
 * 100% client-side.
 */

const L_CODE = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011']
const G_CODE = ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111']
const R_CODE = ['1110010', '1100110', '1101100', '1000010', '1011100', '1001110', '1010000', '1000100', '1001000', '1110100']

// First digit parity sequence for L (0) and G (1)
const FIRST_DIGIT_PARITY = [
  '000000', '001011', '001101', '001110', '010011', '011001', '011100', '010101', '010110', '011010'
]

export function calculateEanChecksum(digits: string): number {
  const nums = digits.split('').map(Number)
  let sum = 0
  
  // Weights: alternating 1 and 3 (from right to left)
  // For 12 digits (EAN-13): 1,3,1,3... or just sum them with correct weights
  for (let i = nums.length - 1; i >= 0; i--) {
    const weight = (nums.length - 1 - i) % 2 === 0 ? 3 : 1
    sum += nums[i] * weight
  }
  
  const check = (10 - (sum % 10)) % 10
  return check
}

export function generateEanBinary(ean: string): string {
  if (!/^\d{13}$/.test(ean)) {
    throw new Error('EAN-13 must be exactly 13 digits')
  }

  const digits = ean.split('').map(Number)
  const firstDigit = digits[0]
  const leftDigits = digits.slice(1, 7)
  const rightDigits = digits.slice(7)
  const parity = FIRST_DIGIT_PARITY[firstDigit]

  let binary = '101' // Start guard

  // Left 6 digits
  for (let i = 0; i < 6; i++) {
    const d = leftDigits[i]
    binary += parity[i] === '0' ? L_CODE[d] : G_CODE[d]
  }

  binary += '01010' // Middle guard

  // Right 6 digits
  for (let i = 0; i < 6; i++) {
    const d = rightDigits[i]
    binary += R_CODE[d]
  }

  binary += '101' // End guard

  return binary
}

export function generateRandomEan13(): string {
  const digits = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10))
  const checksum = calculateEanChecksum(digits.join(''))
  return digits.join('') + checksum
}
