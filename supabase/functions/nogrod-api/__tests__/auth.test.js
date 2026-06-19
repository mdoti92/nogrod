import { describe, it, expect } from 'vitest'
import { validateApiKey } from '../_lib/auth'

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
})
