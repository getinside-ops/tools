import QRCode from 'qrcode'

export type QrContentType = 'url' | 'text' | 'wifi' | 'vcard'

export interface WifiData {
  ssid: string
  password: string
  encryption: 'WPA' | 'WEP' | 'nopass'
  hidden: boolean
}

export interface VCardData {
  firstName: string
  lastName: string
  phone: string
  email: string
  organization: string
  address: string
  url: string
}

export interface QrOptions {
  width: number
  colorDark: string
  colorLight: string
  transparentBg: boolean
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
  dotStyle: 'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded'
  cornerSquareStyle: 'square' | 'dot' | 'extra-rounded' | 'none'
  cornerDotStyle: 'square' | 'dot' | 'none'
  logoUrl: string | null
  logoWidth: number
  logoHeight: number
  logoMargin: number
}

export interface QrResult {
  dataUrl: string
  svg: string
}

function buildWifiString(data: WifiData): string {
  const encryption = data.encryption === 'nopass' ? 'nopass' : data.encryption
  const hidden = data.hidden ? 'H' : 'N'
  return `WIFI:T:${encryption};S:${escapeWifi(data.ssid)};P:${escapeWifi(data.password)};H:${hidden};;`
}

function escapeWifi(str: string): string {
  return str.replace(/[\\;,:"]/g, '\\$&')
}

function buildVCardString(data: VCardData): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
  ]
  if (data.firstName || data.lastName) {
    lines.push(`N:${data.lastName};${data.firstName};;;`)
    lines.push(`FN:${data.firstName} ${data.lastName}`.trim())
  }
  if (data.organization) lines.push(`ORG:${data.organization}`)
  if (data.phone) lines.push(`TEL:${data.phone}`)
  if (data.email) lines.push(`EMAIL:${data.email}`)
  if (data.address) lines.push(`ADR:;;${data.address};;;;`)
  if (data.url) lines.push(`URL:${data.url}`)
  lines.push('END:VCARD')
  return lines.join('\n')
}

export function getQrData(
  type: QrContentType,
  url: string,
  text: string,
  wifi: WifiData,
  vcard: VCardData
): string {
  switch (type) {
    case 'url':
      return url
    case 'text':
      return text
    case 'wifi':
      return buildWifiString(wifi)
    case 'vcard':
      return buildVCardString(vcard)
    default:
      return url
  }
}

export function generateQrCode(data: string, options: QrOptions): Promise<QrResult> {
  return new Promise(async (resolve, reject) => {
    try {
      const bgColor = options.transparentBg ? 'transparent' : options.colorLight

      const baseOptions: QRCode.QRCodeToDataURLOptions & Record<string, unknown> = {
        width: options.width,
        margin: 1,
        color: {
          dark: options.colorDark,
          light: bgColor,
        },
        errorCorrectionLevel: options.errorCorrectionLevel,
        dotsOptions: {
          type: options.dotStyle,
        },
        cornersSquareOptions: {
          type: options.cornerSquareStyle,
        },
        cornersDotOptions: {
          type: options.cornerDotStyle,
        },
      }

      let dataUrl = await QRCode.toDataURL(data, baseOptions)

      if (options.logoUrl) {
        dataUrl = await addLogoToQr(
          dataUrl,
          options.logoUrl,
          options.logoWidth,
          options.logoHeight,
          options.logoMargin,
          options.transparentBg ? '#00000000' : options.colorLight
        )
      }

      const svg = await QRCode.toString(data, {
        ...baseOptions,
        type: 'svg',
      })

      resolve({ dataUrl, svg })
    } catch (err) {
      reject(err)
    }
  })
}

async function addLogoToQr(
  qrDataUrl: string,
  logoUrl: string,
  logoWidth: number,
  logoHeight: number,
  logoMargin: number,
  bgColor: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const qrImg = new Image()
    qrImg.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = qrImg.width
      canvas.height = qrImg.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      ctx.drawImage(qrImg, 0, 0)

      const logoImg = new Image()
      logoImg.onload = () => {
        const qrSize = qrImg.width
        const scaleFactor = qrSize / 256
        const scaledLogoW = logoWidth * scaleFactor
        const scaledLogoH = logoHeight * scaleFactor
        const scaledMargin = logoMargin * scaleFactor

        const x = (qrSize - scaledLogoW) / 2
        const y = (qrSize - scaledLogoH) / 2

        ctx.fillStyle = bgColor
        ctx.fillRect(x - scaledMargin, y - scaledMargin, scaledLogoW + scaledMargin * 2, scaledLogoH + scaledMargin * 2)

        ctx.drawImage(logoImg, x, y, scaledLogoW, scaledLogoH)

        resolve(canvas.toDataURL('image/png'))
      }
      logoImg.onerror = () => reject(new Error('Failed to load logo'))
      logoImg.src = logoUrl
    }
    qrImg.onerror = () => reject(new Error('Failed to load QR code'))
    qrImg.src = qrDataUrl
  })
}

export async function copyToClipboard(dataUrl: string): Promise<boolean> {
  try {
    const response = await fetch(dataUrl)
    const blob = await response.blob()
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ])
    return true
  } catch {
    return false
  }
}

export async function copyToClipboardWithBg(dataUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = async () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(false)
        return
      }
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false)
          return
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ])
          resolve(true)
        } catch {
          resolve(false)
        }
      }, 'image/png')
    }
    img.onerror = () => resolve(false)
    img.src = dataUrl
  })
}

export function downloadFile(dataUrl: string, filename: string): void {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function downloadSvg(svg: string, filename: string): void {
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
