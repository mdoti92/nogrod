import { describe, it, expect } from 'vitest'
import { formatItemId } from '../_lib/items'

describe('formatItemId', () => {
  it('combines prefix and sequential id with a dash', () => {
    expect(formatItemId('NOG', 1)).toBe('NOG-1')
  })

  it('works for any project prefix', () => {
    expect(formatItemId('DOM', 42)).toBe('DOM-42')
  })

  it('handles large sequential numbers', () => {
    expect(formatItemId('NOG', 100)).toBe('NOG-100')
  })
})
