/**
 * Image Upload logic
 * Handles file validation for image uploads from multiple sources (paste, drag-drop, file input).
 */

import { ref, type Ref } from 'vue'

export interface UseImageUploadOptions {
  /** Accepted file types (e.g., ['image/*'], ['.png', '.jpg'], ['application/pdf']) */
  accept?: string[]
  /** Allow multiple files */
  multiple?: boolean
  /** Maximum file size in MB */
  maxSizeMB?: number
}

export interface UseImageUploadReturn {
  /** Current selected file */
  file: Ref<File | null>
  /** Error message if any */
  error: Ref<string | null>
  /** Processing state */
  isProcessing: Ref<boolean>
  /** Validate a file against the accept and maxSizeMB criteria */
  isValidFile: (file: File) => boolean
  /** Process a file (validate and set as current file) */
  processFile: (file: File) => Promise<void>
  /** Reset component state */
  reset: () => void
}

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
  const { accept = ['image/*'], maxSizeMB } = options
  // Note: 'multiple' option is available for future extension but not currently used

  const file = ref<File | null>(null)
  const error = ref<string | null>(null)
  const isProcessing = ref(false)

  /**
   * Validates a file against the accept types and max size criteria
   */
  function isValidFile(file: File): boolean {
    // Check file type
    if (accept.length > 0) {
      const isAccepted = accept.some(type => {
        if (type === 'image/*') {
          return file.type.startsWith('image/')
        }
        if (type === '.pdf') {
          return file.type === 'application/pdf'
        }
        // Check if it's a MIME type (contains '/')
        if (type.includes('/')) {
          return file.type === type
        }
        // Check file extension
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      })
      if (!isAccepted) {
        return false
      }
    }

    // Check file size
    if (maxSizeMB !== undefined && file.size > maxSizeMB * 1024 * 1024) {
      return false
    }

    return true
  }

  /**
   * Processes a file: validates and sets it as the current file
   */
  async function processFile(fileToProcess: File): Promise<void> {
    isProcessing.value = true
    error.value = null

    if (!isValidFile(fileToProcess)) {
      error.value = 'Invalid file type or size'
      isProcessing.value = false
      return
    }

    file.value = fileToProcess
    isProcessing.value = false
  }

  /**
   * Resets the component state
   */
  function reset() {
    file.value = null
    error.value = null
    isProcessing.value = false
  }

  return {
    file,
    error,
    isProcessing,
    isValidFile,
    processFile,
    reset,
  }
}
