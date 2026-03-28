import { describe, it, expect } from 'vitest'
import { buildUtmUrl } from '../useUtmBuilder'

describe('buildUtmUrl', () => {
  it('builds URL with all required params', () => {
    const result = buildUtmUrl({
      url: 'https://example.com',
      source: 'sponsored-mail',
      medium: 'insert',
      campaign: 'summer2026',
    })
    expect(result).toBe(
      'https://example.com/?utm_source=sponsored-mail&utm_medium=insert&utm_campaign=summer2026'
    )
  })

  it('includes optional params when provided', () => {
    const result = buildUtmUrl({
      url: 'https://example.com',
      source: 'newsletter',
      medium: 'email',
      campaign: 'promo',
      content: 'banner-top',
      term: 'retail',
    })
    expect(result).toContain('utm_content=banner-top')
    expect(result).toContain('utm_term=retail')
  })

  it('omits optional params when not provided', () => {
    const result = buildUtmUrl({
      url: 'https://example.com',
      source: 'test',
      medium: 'test',
      campaign: 'test',
    })
    expect(result).not.toContain('utm_content')
    expect(result).not.toContain('utm_term')
  })

  it('throws on invalid URL', () => {
    expect(() => buildUtmUrl({ url: 'not-a-url', source: 'x', medium: 'y', campaign: 'z' })).toThrow()
  })
})
