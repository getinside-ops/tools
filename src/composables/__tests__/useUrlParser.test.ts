import { describe, it, expect } from 'vitest'
import { parseUrl } from '../useUrlParser'

describe('parseUrl', () => {
  it('parses a standard URL correctly', () => {
    const result = parseUrl('https://example.com:8080/path/to/page?q=test#hash')
    expect(result.protocol).toBe('https:')
    expect(result.hostname).toBe('example.com')
    expect(result.port).toBe('8080')
    expect(result.pathname).toBe('/path/to/page')
    expect(result.search).toBe('?q=test')
    expect(result.hash).toBe('#hash')
    expect(result.params).toEqual({ q: 'test' })
  })

  it('handles URLs without path or params', () => {
    const result = parseUrl('https://google.com')
    expect(result.pathname).toBe('/')
    expect(result.search).toBe('')
    expect(result.params).toEqual({})
  })

  it('parses multiple query parameters', () => {
    const result = parseUrl('https://example.com?a=1&b=2&c=3')
    expect(result.params).toEqual({ a: '1', b: '2', c: '3' })
  })

  it('throws on invalid URL', () => {
    expect(() => parseUrl('not-a-url')).toThrow()
  })
})
