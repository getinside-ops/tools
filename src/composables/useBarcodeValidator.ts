/**
 * EAN-13 Barcode Validator with Country Detection
 * Real-time validation with checksum verification and country code detection.
 */

import { ref } from 'vue'

// EAN country code ranges
const COUNTRY_RANGES: Array<{ range: string; country: string }> = [
  { range: '000-139', country: 'États-Unis / Canada' },
  { range: '200-299', country: 'Distribution interne' },
  { range: '300-379', country: 'France' },
  { range: '380', country: 'Bulgarie' },
  { range: '383', country: 'Slovénie' },
  { range: '385', country: 'Croatie' },
  { range: '387', country: 'Bosnie-Herzégovine' },
  { range: '400-440', country: 'France' },
  { range: '450-459', country: 'Japon' },
  { range: '460-469', country: 'Russie' },
  { range: '471', country: 'Taïwan' },
  { range: '474', country: 'Estonie' },
  { range: '475', country: 'Lettonie' },
  { range: '477', country: 'Lituanie' },
  { range: '479', country: 'Sri Lanka' },
  { range: '480', country: 'Philippines' },
  { range: '481', country: 'Biélorussie' },
  { range: '482', country: 'Ukraine' },
  { range: '484', country: 'Moldavie' },
  { range: '485', country: 'Arménie' },
  { range: '486', country: 'Géorgie' },
  { range: '487', country: 'Kazakhstan' },
  { range: '489', country: 'Hong Kong' },
  { range: '500-509', country: 'Royaume-Uni' },
  { range: '520-521', country: 'Grèce' },
  { range: '528', country: 'Liban' },
  { range: '529', country: 'Chypre' },
  { range: '531', country: 'Macédoine' },
  { range: '535', country: 'Malte' },
  { range: '539', country: 'Irlande' },
  { range: '540-549', country: 'Belgique / Luxembourg' },
  { range: '560', country: 'Portugal' },
  { range: '569', country: 'Islande' },
  { range: '570-579', country: 'Danemark' },
  { range: '590', country: 'Pologne' },
  { range: '594', country: 'Roumanie' },
  { range: '599', country: 'Hongrie' },
  { range: '600-601', country: 'Afrique du Sud' },
  { range: '603', country: 'Ghana' },
  { range: '608', country: 'Bahreïn' },
  { range: '609', country: 'Maurice' },
  { range: '611', country: 'Maroc' },
  { range: '613', country: 'Kenya' },
  { range: '614', country: 'Côte d\'Ivoire' },
  { range: '615', country: 'Tunisie' },
  { range: '616', country: 'Égypte' },
  { range: '618', country: 'Arabie saoudite' },
  { range: '619', country: 'Émirats arabes unis' },
  { range: '620-629', country: 'Tanzanie' },
  { range: '640-649', country: 'Finlande' },
  { range: '690-699', country: 'Chine' },
  { range: '700-709', country: 'Norvège' },
  { range: '729', country: 'Israël' },
  { range: '730-739', country: 'Suède' },
  { range: '740', country: 'Guatemala' },
  { range: '741', country: 'Salvador' },
  { range: '742', country: 'Honduras' },
  { range: '743', country: 'Nicaragua' },
  { range: '744', country: 'Costa Rica' },
  { range: '745', country: 'Panama' },
  { range: '746', country: 'République dominicaine' },
  { range: '750', country: 'Mexique' },
  { range: '754-755', country: 'Canada' },
  { range: '759', country: 'Venezuela' },
  { range: '760-769', country: 'Suisse' },
  { range: '770', country: 'Colombie' },
  { range: '773', country: 'Uruguay' },
  { range: '775', country: 'Pérou' },
  { range: '777', country: 'Bolivie' },
  { range: '779', country: 'Argentine' },
  { range: '780', country: 'Chili' },
  { range: '784', country: 'Paraguay' },
  { range: '786', country: 'Équateur' },
  { range: '789-790', country: 'Brésil' },
  { range: '800-839', country: 'Italie' },
  { range: '840-849', country: 'Espagne' },
  { range: '850', country: 'Cuba' },
  { range: '858', country: 'Slovaquie' },
  { range: '859', country: 'République tchèque' },
  { range: '860', country: 'Serbie' },
  { range: '865', country: 'Mongolie' },
  { range: '867', country: 'Corée du Nord' },
  { range: '868-869', country: 'Turquie' },
  { range: '870-879', country: 'Pays-Bas' },
  { range: '880', country: 'Corée du Sud' },
  { range: '885', country: 'Thaïlande' },
  { range: '888', country: 'Singapour' },
  { range: '890', country: 'Inde' },
  { range: '893', country: 'Vietnam' },
  { range: '896', country: 'Oman' },
  { range: '899', country: 'Indonésie' },
  { range: '900-919', country: 'Autriche' },
  { range: '930-939', country: 'Australie' },
  { range: '940-949', country: 'Nouvelle-Zélande' },
  { range: '950', country: 'GS1' },
  { range: '955', country: 'Malaisie' },
  { range: '958', country: 'Macau' },
  { range: '960-969', country: 'GS1 UK' },
]

export interface BarcodeValidationState {
  isValid: boolean
  error: string | null
  isCalculating: boolean
  checksum: number | null
  checksumValid: boolean
  country: string | null
  countryCode: string | null
  formatted: string
}

export function useBarcodeValidator() {
  const state = ref<BarcodeValidationState>({
    isValid: false,
    error: null,
    isCalculating: false,
    checksum: null,
    checksumValid: false,
    country: null,
    countryCode: null,
    formatted: '',
  })

  function calculateChecksum(digits: string): number {
    const nums = digits.split('').map(Number)
    let sum = 0
    for (let i = 0; i < nums.length; i++) {
      const weight = i % 2 === 0 ? 1 : 3  // Even indices (0,2,4) = weight 1
      sum += nums[i] * weight
    }
    return (10 - (sum % 10)) % 10
  }

  function detectCountry(code: string): { country: string; code: string } | null {
    const prefix = parseInt(code.slice(0, 3))
    for (const range of COUNTRY_RANGES) {
      const parts = range.range.split('-').map(Number)
      const start = parts[0]
      const end = parts[1] ?? start  // Fix: Handle single-value ranges (e.g., '380')
      if (prefix >= start && prefix <= end) {
        return { country: range.country, code: range.range }
      }
    }
    return null
  }

  function formatCode(code: string): string {
    if (code.length === 13) {
      return `${code[0]} ${code.slice(1, 7)} ${code.slice(7)}`
    }
    return code
  }

  function validate(code: string): void {
    // Strip non-digits
    const cleanCode = code.replace(/\D/g, '')

    // Empty state
    if (cleanCode.length === 0) {
      state.value = {
        isValid: false,
        error: null,
        isCalculating: false,
        checksum: null,
        checksumValid: false,
        country: null,
        countryCode: null,
        formatted: '',
      }
      return
    }

    // Too many digits
    if (cleanCode.length > 13) {
      state.value = {
        isValid: false,
        error: '13 chiffres maximum',
        isCalculating: false,
        checksum: null,
        checksumValid: false,
        country: null,
        countryCode: null,
        formatted: cleanCode.slice(0, 13),
      }
      return
    }

    // 12 digits - calculating checksum
    if (cleanCode.length === 12) {
      const checksum = calculateChecksum(cleanCode)
      const country = detectCountry(cleanCode)
      state.value = {
        isValid: false,
        error: null,
        isCalculating: false,
        checksum,
        checksumValid: true,
        country: country?.country || null,
        countryCode: country?.code || null,
        formatted: formatCode(cleanCode),
      }
      return
    }

    // Wrong length (not 12 or 13)
    if (cleanCode.length !== 13) {
      state.value = {
        isValid: false,
        error: '13 chiffres requis',
        isCalculating: false,
        checksum: null,
        checksumValid: false,
        country: null,
        countryCode: null,
        formatted: cleanCode,
      }
      return
    }

    // 13 digits - full validation
    const first12 = cleanCode.slice(0, 12)
    const lastDigit = parseInt(cleanCode[12])
    const expectedChecksum = calculateChecksum(first12)
    const country = detectCountry(cleanCode)

    state.value = {
      isValid: true,
      error: null,
      isCalculating: false,
      checksum: expectedChecksum,
      checksumValid: lastDigit === expectedChecksum,
      country: country?.country || null,
      countryCode: country?.code || null,
      formatted: formatCode(cleanCode),
    }
  }

  return {
    state,
    validate,
  }
}
