export interface PromoCheck {
  rule: 'length' | 'no-special-chars' | 'no-spaces' | 'no-ambiguous' | 'uppercase'
  pass: boolean
}

export function validatePromoCode(code: string): PromoCheck[] {
  if (!code) return []
  return [
    { rule: 'length',           pass: code.length <= 12 },
    { rule: 'no-special-chars', pass: /^[a-zA-Z0-9_-]+$/.test(code) },
    { rule: 'no-spaces',        pass: !code.includes(' ') },
    { rule: 'no-ambiguous',     pass: !/[0OIl1]/.test(code) },
    { rule: 'uppercase',        pass: code === code.toUpperCase() },
  ]
}
