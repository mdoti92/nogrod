import { describe, it, expect } from 'vitest'
import { validateApiKey, extractApiKey } from '../_lib/auth'

describe('validateApiKey', () => {
  it('returns false when header is null', () => {
    expect(validateApiKey(null, 'secret')).toBe(false)
  })

  it('returns false when expected secret is undefined', () => {
    expect(validateApiKey('some-key', undefined)).toBe(false)
  })

  it('returns false when key does not match', () => {
    expect(validateApiKey('wrong-key', 'secret')).toBe(false)
  })

  it('returns true when key matches', () => {
    expect(validateApiKey('secret', 'secret')).toBe(true)
  })

  it('returns true when secret has trailing newline (Deno.env.get quirk)', () => {
    expect(validateApiKey('secret', 'secret\n')).toBe(true)
  })

  it('returns true when either value has surrounding whitespace', () => {
    expect(validateApiKey(' secret ', ' secret ')).toBe(true)
  })

  it('returns false when keys share every character except the last one', () => {
    expect(validateApiKey('secret-key-1', 'secret-key-2')).toBe(false)
  })

  it('returns false when keys have different lengths but a common prefix', () => {
    expect(validateApiKey('secret', 'secret-extra')).toBe(false)
  })

  it('returns false for empty strings compared against a real secret', () => {
    expect(validateApiKey('', 'secret')).toBe(false)
  })
})

describe('extractApiKey', () => {
  it('returns header value when X-Api-Key header is present', () => {
    const headers = new Headers({ 'X-Api-Key': 'from-header' })
    const params = new URLSearchParams()
    expect(extractApiKey(headers, params)).toBe('from-header')
  })

  it('returns query param when header is absent', () => {
    const headers = new Headers()
    const params = new URLSearchParams('api_key=from-param')
    expect(extractApiKey(headers, params)).toBe('from-param')
  })

  it('prefers header over query param when both are present', () => {
    const headers = new Headers({ 'X-Api-Key': 'from-header' })
    const params = new URLSearchParams('api_key=from-param')
    expect(extractApiKey(headers, params)).toBe('from-header')
  })

  it('returns null when neither header nor query param is present', () => {
    const headers = new Headers()
    const params = new URLSearchParams()
    expect(extractApiKey(headers, params)).toBeNull()
  })
})
