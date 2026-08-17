import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import RequireAuth from '../RequireAuth'
import { useAuth } from '../../context/AuthContext'

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/protected" element={<RequireAuth><div>Secret content</div></RequireAuth>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('RequireAuth', () => {
  it('renders nothing while the session is still loading', () => {
    useAuth.mockReturnValue({ session: null, loading: true })

    renderProtected()

    expect(screen.queryByText('Secret content')).not.toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })

  it('redirects to /login when there is no active session', () => {
    useAuth.mockReturnValue({ session: null, loading: false })

    renderProtected()

    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('renders the protected content when there is an active session', () => {
    useAuth.mockReturnValue({ session: { user: { email: 'a@a.com' } }, loading: false })

    renderProtected()

    expect(screen.getByText('Secret content')).toBeInTheDocument()
  })
})
