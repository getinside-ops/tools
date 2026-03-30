import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkRedirect } from '../useRedirectChecker'

vi.stubEnv('VITE_REDIRECT_API_URL', 'https://redirect-checker.test.workers.dev')

describe('checkRedirect', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns full hop chain when redirects occur', async () => {
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

  it('throws when API returns empty hops array', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ hops: [] }),
    }))
    await expect(checkRedirect('https://example.com')).rejects.toThrow('API returned empty hop list')
  })

  it('throws on API error response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))

    await expect(checkRedirect('https://example.com')).rejects.toThrow('API error: 500')
  })

  it('handles 15-hop chain', async () => {
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
