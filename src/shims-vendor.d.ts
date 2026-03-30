declare module 'culori' {
  export function converter(mode: string): any
  export function formatHex(color: any): string
  export function wcagContrast(color1: any, color2: any): number
  export type Rgb = any
  export type Oklch = any
  export type Lab = any
  export type Lch = any
}

declare module 'apca-w3' {
  export function calcAPCA(textColor: any, bgColor: any): any
}

declare module 'colorparsley' {
  export function colorParsley(color: string): any
}
