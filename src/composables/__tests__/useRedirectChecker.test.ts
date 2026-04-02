import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { 
  checkRedirect, 
  RedirectCheckerError, 
  isApiUrlConfigured 
} from '../useRedirectChecker'

describe('isApiUrlConfigured', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns true when VITE_REDIRECT_API_URL is set', () => {
    vi.stubEnv('VITE_REDIRECT_API_URL', 'https://api.test.workers.dev')
    expect(isApiUrlConfigured()).toBe(true)
  })

  it('returns false when VITE_REDIRECT_API_URL is not set', () => {
    vi.stubEnv('VITE_REDIRECT_API_URL', undefined)
    expect(isApiUrlConfigured()).toBe(false)
  })
})

describe('checkRedirect', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns full hop chain when redirects occur', async () => {
    vi.stubEnv('VITE_REDIRECT_API_URL', 'https://redirect-checker.test.workers.dev')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        hops: [
          { url: 'https://short.ly/abc', status: 301 },
          { url: 'https://example.com/', status: 200 },
        ],
      }),
    }))

    const result = await checkRedirect('https://short.ly/abc')

    expect(result.redirected).toBe(true)
    expect(result.hops).toHaveLength(2)
    expect(result.hops[0]).toEqual({ url: 'https://short.ly/abc', status: 301 })
    expect(result.hops[1]).toEqual({ url: 'https://example.com/', status: 200 })
    expect(result.finalUrl).toBe('https://example.com/')
    expect(result.inputUrl).toBe('https://short.ly/abc')
  })

  it('returns redirected: false when no redirect', async () => {
    vi.stubEnv('VITE_REDIRECT_API_URL', 'https://redirect-checker.test.workers.dev')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        hops: [{ url: 'https://example.com/', status: 200 }],
      }),
    }))

    const result = await checkRedirect('https://example.com/')

    expect(result.redirected).toBe(false)
    expect(result.hops).toHaveLength(1)
    expect(result.finalUrl).toBe('https://example.com/')
    expect(result.inputUrl).toBe('https://example.com/')
  })

  it('normalizes URL without protocol', async () => {
    vi.stubEnv('VITE_REDIRECT_API_URL', 'https://redirect-checker.test.workers.dev')
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ hops: [{ url: 'https://example.com', status: 200 }] }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const result = await checkRedirect('example.com')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent('https://example.com')),
    )
    expect(result.inputUrl).toBe('https://example.com')
  })

  it('throws RedirectCheckerError with MISSING_API_URL when API URL is not configured', async () => {
    vi.stubEnv('VITE_REDIRECT_API_URL', undefined)
    
    await expect(checkRedirect('https://example.com'))
      .rejects
      .toThrow(RedirectCheckerError)
    
    try {
      await checkRedirect('https://example.com')
    } catch (error) {
      expect(error).toBeInstanceOf(RedirectCheckerError)
      expect((error as RedirectCheckerError).code).toBe('MISSING_API_URL')
      expect((error as RedirectCheckerError).message).toContain('not configured')
    }
  })

  it('throws RedirectCheckerError with API_ERROR when API returns error status', async () => {
    vi.stubEnv('VITE_REDIRECT_API_URL', 'https://redirect-checker.test.workers.dev')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))

    try {
      await checkRedirect('https://example.com')
    } catch (error) {
      expect(error).toBeInstanceOf(RedirectCheckerError)
      expect((error as RedirectCheckerError).code).toBe('API_ERROR')
      expect((error as RedirectCheckerError).message).toContain('500')
    }
  })

  it('throws RedirectCheckerError with INVALID_RESPONSE when API returns empty hops array', async () => {
    vi.stubEnv('VITE_REDIRECT_API_URL', 'https://redirect-checker.test.workers.dev')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ hops: [] }),
    }))
    
    try {
      await checkRedirect('https://example.com')
    } catch (error) {
      expect(error).toBeInstanceOf(RedirectCheckerError)
      expect((error as RedirectCheckerError).code).toBe('INVALID_RESPONSE')
      expect((error as RedirectCheckerError).message).toBe('API returned empty hop list')
    }
  })

  it('throws RedirectCheckerError with INVALID_RESPONSE when API returns no hops property', async () => {
    vi.stubEnv('VITE_REDIRECT_API_URL', 'https://redirect-checker.test.workers.dev')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'something else' }),
    }))
    
    try {
      await checkRedirect('https://example.com')
    } catch (error) {
      expect(error).toBeInstanceOf(RedirectCheckerError)
      expect((error as RedirectCheckerError).code).toBe('INVALID_RESPONSE')
    }
  })

  it('throws RedirectCheckerError with NETWORK_ERROR on network failure', async () => {
    vi.stubEnv('VITE_REDIRECT_API_URL', 'https://redirect-checker.test.workers.dev')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    try {
      await checkRedirect('https://example.com')
    } catch (error) {
      expect(error).toBeInstanceOf(RedirectCheckerError)
      expect((error as RedirectCheckerError).code).toBe('NETWORK_ERROR')
      expect((error as RedirectCheckerError).message).toContain('Network error')
    }
  })

  it('handles 15-hop chain', async () => {
    vi.stubEnv('VITE_REDIRECT_API_URL', 'https://redirect-checker.test.workers.dev')
    const hops = Array.from({ length: 15 }, (_, i) => ({
      url: `https://example.com/hop-${i}`,
      status: i < 14 ? 301 : 200,
    }))
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ hops }),
    }))

    const result = await checkRedirect('https://example.com/hop-0')

    expect(result.hops).toHaveLength(15)
    expect(result.redirected).toBe(true)
    expect(result.finalUrl).toBe('https://example.com/hop-14')
  })
})
