import { describe, it, expect } from 'vitest'
import { useImageUpload } from '../useImageUpload'

describe('useImageUpload', () => {
  it('should handle file validation', () => {
    const { isValidFile } = useImageUpload({ accept: ['image/*'] })
    const imageFile = new File(['test'], 'test.png', { type: 'image/png' })
    expect(isValidFile(imageFile)).toBe(true)
  })

  it('should reject non-image files when accept is image/*', () => {
    const { isValidFile } = useImageUpload({ accept: ['image/*'] })
    const pdfFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    expect(isValidFile(pdfFile)).toBe(false)
  })

  it('should reject files exceeding maxSizeMB', () => {
    const { isValidFile } = useImageUpload({ accept: ['image/*'], maxSizeMB: 1 })
    const largeFile = new File([new ArrayBuffer(2 * 1024 * 1024)], 'test.png', { type: 'image/png' })
    expect(isValidFile(largeFile)).toBe(false)
  })

  it('should accept files within size limit', () => {
    const { isValidFile } = useImageUpload({ accept: ['image/*'], maxSizeMB: 1 })
    const smallFile = new File(['test'], 'test.png', { type: 'image/png' })
    expect(isValidFile(smallFile)).toBe(true)
  })

  it('should accept multiple file types', () => {
    const { isValidFile } = useImageUpload({ accept: ['image/png', 'image/jpeg'] })
    const pngFile = new File(['test'], 'test.png', { type: 'image/png' })
    const jpegFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const gifFile = new File(['test'], 'test.gif', { type: 'image/gif' })
    
    expect(isValidFile(pngFile)).toBe(true)
    expect(isValidFile(jpegFile)).toBe(true)
    expect(isValidFile(gifFile)).toBe(false)
  })

  it('should accept all files when accept is empty', () => {
    const { isValidFile } = useImageUpload({ accept: [] })
    const anyFile = new File(['test'], 'test.any', { type: 'application/unknown' })
    expect(isValidFile(anyFile)).toBe(true)
  })

  it('should reset state correctly', () => {
    const { processFile, reset, file, error, isProcessing } = useImageUpload()
    const imageFile = new File(['test'], 'test.png', { type: 'image/png' })
    
    // Process a file first
    processFile(imageFile)
    
    // Then reset
    reset()
    
    expect(file.value).toBeNull()
    expect(error.value).toBeNull()
    expect(isProcessing.value).toBe(false)
  })

  it('should set error when file is invalid', async () => {
    const { processFile, error } = useImageUpload({ accept: ['image/*'] })
    const pdfFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    
    await processFile(pdfFile)
    
    expect(error.value).not.toBeNull()
  })

  it('should process valid file successfully', async () => {
    const { processFile, file, error, isProcessing } = useImageUpload({ accept: ['image/*'] })
    const imageFile = new File(['test'], 'test.png', { type: 'image/png' })
    
    await processFile(imageFile)
    
    expect(file.value).toBe(imageFile)
    expect(error.value).toBeNull()
    expect(isProcessing.value).toBe(false)
  })

  it('should handle specific file extensions', () => {
    const { isValidFile } = useImageUpload({ accept: ['.png', '.jpg'] })
    const pngFile = new File(['test'], 'test.png', { type: 'image/png' })
    const jpgFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const gifFile = new File(['test'], 'test.gif', { type: 'image/gif' })
    
    expect(isValidFile(pngFile)).toBe(true)
    expect(isValidFile(jpgFile)).toBe(true)
    expect(isValidFile(gifFile)).toBe(false)
  })

  it('should handle PDF files with application/pdf type', () => {
    const { isValidFile } = useImageUpload({ accept: ['.pdf', 'application/pdf'] })
    const pdfFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })

    expect(isValidFile(pdfFile)).toBe(true)
  })

  it('should handle extension-based accept types', () => {
    const { isValidFile } = useImageUpload({ accept: ['.png', '.jpg'] })
    const pngFile = new File(['test'], 'test.png', { type: 'image/png' })
    const jpgFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const gifFile = new File(['test'], 'test.gif', { type: 'image/gif' })

    expect(isValidFile(pngFile)).toBe(true)
    expect(isValidFile(jpgFile)).toBe(true)
    expect(isValidFile(gifFile)).toBe(false)
  })

  it('should handle mixed accept types with wildcards and extensions', () => {
    const { isValidFile } = useImageUpload({ accept: ['image/*', '.pdf'] })
    const pngFile = new File(['test'], 'test.png', { type: 'image/png' })
    const jpgFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const pdfFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    const txtFile = new File(['test'], 'test.txt', { type: 'text/plain' })

    expect(isValidFile(pngFile)).toBe(true)
    expect(isValidFile(jpgFile)).toBe(true)
    expect(isValidFile(pdfFile)).toBe(true)
    expect(isValidFile(txtFile)).toBe(false)
  })

  it('should handle case-insensitive extension matching', () => {
    const { isValidFile } = useImageUpload({ accept: ['.png', '.jpg'] })
    const upperCasePng = new File(['test'], 'test.PNG', { type: 'image/png' })
    const upperCaseJpg = new File(['test'], 'test.JPG', { type: 'image/jpeg' })
    const mixedCasePng = new File(['test'], 'test.Png', { type: 'image/png' })

    expect(isValidFile(upperCasePng)).toBe(true)
    expect(isValidFile(upperCaseJpg)).toBe(true)
    expect(isValidFile(mixedCasePng)).toBe(true)
  })

  it('should set specific error message for invalid file type', async () => {
    const { processFile, error } = useImageUpload({ accept: ['image/*'] })
    const pdfFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })

    await processFile(pdfFile)

    expect(error.value).toBe('File type "application/pdf" is not accepted')
  })

  it('should set specific error message for file size exceeding limit', async () => {
    const { processFile, error } = useImageUpload({ accept: ['image/*'], maxSizeMB: 1 })
    const largeFile = new File([new ArrayBuffer(2 * 1024 * 1024)], 'test.png', { type: 'image/png' })

    await processFile(largeFile)

    expect(error.value).toBe('File size exceeds 1MB limit')
  })
})
