/**
 * Contrast Checking Logic (WCAG 2.1 & APCA)
 * Uses culori for WCAG and apca-w3 for perceptual contrast.
 */
import { wcagContrast } from 'culori'
import { calcAPCA } from 'apca-w3'
import { colorParsley } from 'colorparsley'

export type WcagLevel = 'AA_Normal' | 'AAA_Normal' | 'AA_Large' | 'AAA_Large' | 'UI_Component'

const WCAG_THRESHOLDS: Record<WcagLevel, number> = {
  AA_Normal: 4.5,
  AAA_Normal: 7.0,
  AA_Large: 3.0,
  AAA_Large: 4.5,
  UI_Component: 3.0
}

/**
 * Calculates WCAG 2.1 contrast ratio between text and background.
 * Returns a number between 1 and 21.
 */
export function getWcagContrast(textColor: string, bgColor: string): number {
  return wcagContrast(textColor, bgColor)
}

/**
 * Calculates the Advanced Perceptual Contrast Algorithm (APCA) value.
 * Requires apca-w3 and colorparsley formats.
 */
export function getApcaContrast(textColor: string, bgColor: string): number {
  const text = colorParsley(textColor)
  const bg = colorParsley(bgColor)
  if (!text || !bg) return 0
  
  // APCA expects RGB arrays or numbers, colorParsley returns an array format
  // calcAPCA( text, bg ) -> Lightness Contrast Lc
  // The first 3 elements of colorParsley output are R,G,B [0-255]
  return parseFloat(calcAPCA(text, bg) as unknown as string) || 0
}

/**
 * Checks if a contrast ratio meets a specific WCAG level.
 */
export function meetsWcagLevel(ratio: number, level: WcagLevel): boolean {
  return ratio >= WCAG_THRESHOLDS[level]
}
