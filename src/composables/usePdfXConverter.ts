const MAX_SIZE_BYTES = 30 * 1024 * 1024 // 30 MB

export type ConversionError = 'size' | 'type' | 'server'

export async function convertToPdfX(file: File): Promise<Blob> {
  if (file.type !== 'application/pdf') throw Object.assign(new Error(), { code: 'type' as ConversionError })
  if (file.size > MAX_SIZE_BYTES)       throw Object.assign(new Error(), { code: 'size' as ConversionError })

  const apiUrl = import.meta.env.VITE_PDFX_API_URL
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${apiUrl}/convert`, { method: 'POST', body: formData })
  if (!response.ok) throw Object.assign(new Error(), { code: 'server' as ConversionError })

  return response.blob()
}
