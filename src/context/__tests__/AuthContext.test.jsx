import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { supabase } from '../../lib/supabase'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  },
}))

function Consumer() {
  const { session, loading, signIn, signOut } = useAuth()
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="session">{session ? session.user.email : 'none'}</span>
      <button onClick={() => signIn('a@a.com', 'pw')}>signIn</button>
      <button onClick={() => signOut()}>signOut</button>
    </div>
  )
}

const fakeSession = { user: { email: 'martin@tdforge.com' } }
let authChangeCallback

beforeEach(() => {
  vi.clearAllMocks()
  authChangeCallback = null
  supabase.auth.onAuthStateChange.mockImplementation((cb) => {
    authChangeCallback = cb
    return { data: { subscription: { unsubscribe: vi.fn() } } }
  })
})

describe('AuthProvider', () => {
  it('starts loading and resolves to no session when there is none stored', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } })

    render(<AuthProvider><Consumer /></AuthProvider>)

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(screen.getByTestId('session')).toHaveTextContent('none')
  })

  it('exposes the stored session once getSession resolves', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: fakeSession } })

    render(<AuthProvider><Consumer /></AuthProvider>)

    await waitFor(() => expect(screen.getByTestId('session')).toHaveTextContent('martin@tdforge.com'))
  })

  it('updates the session when Supabase emits an auth state change', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } })

    render(<AuthProvider><Consumer /></AuthProvider>)
    await waitFor(() => expect(screen.getByTestId('session')).toHaveTextContent('none'))

    act(() => authChangeCallback('SIGNED_IN', fakeSession))

    expect(screen.getByTestId('session')).toHaveTextContent('martin@tdforge.com')
  })

  it('signIn calls Supabase with the given credentials and returns the error', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } })
    supabase.auth.signInWithPassword.mockResolvedValue({ error: null })

    let result
    function Trigger() {
      const { signIn } = useAuth()
      return <button onClick={async () => { result = await signIn('a@a.com', 'pw') }}>go</button>
    }
    render(<AuthProvider><Trigger /></AuthProvider>)
    await waitFor(() => expect(supabase.auth.getSession).toHaveBeenCalled())

    await act(async () => screen.getByText('go').click())

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'a@a.com', password: 'pw' })
    expect(result).toEqual({ error: null })
  })

  it('signOut calls Supabase signOut', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: fakeSession } })
    supabase.auth.signOut.mockResolvedValue({ error: null })

    render(<AuthProvider><Consumer /></AuthProvider>)
    await waitFor(() => expect(screen.getByTestId('session')).toHaveTextContent('martin@tdforge.com'))

    await act(async () => screen.getByText('signOut').click())

    expect(supabase.auth.signOut).toHaveBeenCalled()
  })
})
