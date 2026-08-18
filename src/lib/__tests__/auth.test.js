import { describe, it, expect } from 'vitest'
import { getAuthErrorMessage } from '../auth'

describe('getAuthErrorMessage', () => {
  it('translates invalid credentials error to a Spanish message', () => {
    const error = { message: 'Invalid login credentials' }
    expect(getAuthErrorMessage(error)).toBe('Email o contraseña incorrectos')
  })

  it('falls back to a generic message for unknown errors', () => {
    const error = { message: 'Something exploded' }
    expect(getAuthErrorMessage(error)).toBe('No se pudo iniciar sesión. Intentá de nuevo.')
  })

  it('returns the generic message when there is no error object', () => {
    expect(getAuthErrorMessage(null)).toBe('No se pudo iniciar sesión. Intentá de nuevo.')
  })
})
