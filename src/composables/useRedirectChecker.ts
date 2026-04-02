export interface RedirectHop {
  url: string
  status: number
}

export interface RedirectResult {
  inputUrl: string
  finalUrl: string
  hops: RedirectHop[]
  redirected: boolean
}

export class RedirectCheckerError extends Error {
  constructor(
    message: string,
    public code: 'MISSING_API_URL' | 'API_ERROR' | 'INVALID_RESPONSE' | 'NETWORK_ERROR'
  ) {
    super(message)
    this.name = 'RedirectCheckerError'
  }
}

export function isApiUrlConfigured(): boolean {
  return !!import.meta.env.VITE_REDIRECT_API_URL
}

export async function checkRedirect(inputUrl: string): Promise<RedirectResult> {
  const normalized = inputUrl.startsWith('http://') || inputUrl.startsWith('https://')
    ? inputUrl
    : `https://${inputUrl}`
  
  const apiUrl = import.meta.env.VITE_REDIRECT_API_URL
  
  if (!apiUrl) {
    throw new RedirectCheckerError(
      'Redirect checker API is not configured. Please set VITE_REDIRECT_API_URL environment variable.',
      'MISSING_API_URL'
    )
  }
  
  try {
    const res = await fetch(`${apiUrl}?url=${encodeURIComponent(normalized)}`)
    
    if (!res.ok) {
      throw new RedirectCheckerError(
        `API returned status ${res.status}`,
        'API_ERROR'
      )
    }
    
    const data = await res.json() as { hops?: RedirectHop[] }
    
    if (!data.hops || data.hops.length === 0) {
      throw new RedirectCheckerError(
        'API returned empty hop list',
        'INVALID_RESPONSE'
      )
    }
    
    return {
      inputUrl: normalized,
      finalUrl: data.hops[data.hops.length - 1].url,
      hops: data.hops,
      redirected: data.hops.length > 1,
    }
  } catch (error) {
    if (error instanceof RedirectCheckerError) {
      throw error
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new RedirectCheckerError(
        'Network error: unable to reach the redirect checker API',
        'NETWORK_ERROR'
      )
    }
    throw new RedirectCheckerError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      'NETWORK_ERROR'
    )
  }
}
