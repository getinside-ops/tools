import { ref, type Ref } from 'vue'

export interface UseImageUploadOptions {
  accept?: string[]
  multiple?: boolean
  maxSizeMB?: number
}

export interface UseImageUploadReturn {
  file: Ref<File | null>
  error: Ref<string | null>
  isProcessing: Ref<boolean>
  isValidFile: (file: File) => boolean
  processFile: (file: File) => Promise<void>
  reset: () => void
}

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
  const { accept = ['image/*'], maxSizeMB } = options

  const file = ref<File | null>(null)
  const error = ref<string | null>(null)
  const isProcessing = ref(false)

  function isValidFile(file: File): boolean {
    // Check file type
    if (accept.length > 0) {
      const isAccepted = accept.some(type => {
        if (type === 'image/*') return file.type.startsWith('image/')
        if (type === '.pdf') return file.type === 'application/pdf'
        return file.type === type || file.name.endsWith(type)
      })
      if (!isAccepted) return false
    }

    // Check file size
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      return false
    }

    return true
  }

  async function processFile(newFile: File): Promise<void> {
    isProcessing.value = true
    error.value = null

    if (!isValidFile(newFile)) {
      error.value = 'Invalid file type or size'
      isProcessing.value = false
      return
    }

    file.value = newFile
    isProcessing.value = false
  }

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
