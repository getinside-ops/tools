export function pxToRem(px: number, base: number = 16): number {
  if (base === 0) return 0
  return px / base
}

export function remToPx(rem: number, base: number = 16): number {
  return rem * base
}
