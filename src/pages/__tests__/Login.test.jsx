import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Login from '../Login'
import { useAuth } from '../../context/AuthContext'

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => mockNavigate }
})

function fillAndSubmit(email, password) {
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } })
  fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: password } })
  fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
}

describe('Login', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('shows an error message and does not navigate when credentials are invalid', async () => {
    const signIn = vi.fn().mockResolvedValue({ error: { message: 'Invalid login credentials' } })
    useAuth.mockReturnValue({ signIn })

    render(<MemoryRouter><Login /></MemoryRouter>)
    fillAndSubmit('martin@tdforge.com', 'wrong-password')

    await waitFor(() => expect(screen.getByText('Email o contraseña incorrectos')).toBeInTheDocument())
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('navigates to the home view when credentials are valid', async () => {
    const signIn = vi.fn().mockResolvedValue({ error: null })
    useAuth.mockReturnValue({ signIn })

    render(<MemoryRouter><Login /></MemoryRouter>)
    fillAndSubmit('martin@tdforge.com', 'correct-password')

    await waitFor(() => expect(signIn).toHaveBeenCalledWith('martin@tdforge.com', 'correct-password'))
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
  })
})
