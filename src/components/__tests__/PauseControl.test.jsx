import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PauseControl from '../PauseControl'
import { supabase } from '../../lib/supabase'

vi.mock('../../lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

let updateSpy
let eqSpy

beforeEach(() => {
  eqSpy = vi.fn().mockResolvedValue({ error: null })
  updateSpy = vi.fn(() => ({ eq: eqSpy }))
  supabase.from.mockReturnValue({ update: updateSpy })
})

describe('PauseControl', () => {
  it('offers "Pausar" for an active entity and persists the pause with its previous status', async () => {
    const onChanged = vi.fn()
    render(<PauseControl table="items" entity={{ id: 'i1', status: 'in_review' }} onChanged={onChanged} />)

    fireEvent.click(screen.getByRole('button', { name: 'Pausar' }))

    await waitFor(() => expect(onChanged).toHaveBeenCalled())
    expect(supabase.from).toHaveBeenCalledWith('items')
    expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({ status: 'paused', paused_from_status: 'in_review' }))
    expect(eqSpy).toHaveBeenCalledWith('id', 'i1')
  })

  it('does not offer "Pausar" for a done entity', () => {
    render(<PauseControl table="epics" entity={{ id: 'e1', status: 'done' }} onChanged={vi.fn()} />)

    expect(screen.queryByRole('button', { name: 'Pausar' })).not.toBeInTheDocument()
  })

  it('shows that a paused entity is paused, from which status, and offers "Reanudar"', () => {
    render(<PauseControl table="items" entity={{ id: 'i1', status: 'paused', paused_from_status: 'in_progress' }} onChanged={vi.fn()} />)

    expect(screen.getByText(/Pausado desde In Progress/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reanudar' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Pausar' })).not.toBeInTheDocument()
  })

  it('resumes to the previous status and clears it', async () => {
    const onChanged = vi.fn()
    render(<PauseControl table="epics" entity={{ id: 'e1', status: 'paused', paused_from_status: 'todo' }} onChanged={onChanged} />)

    fireEvent.click(screen.getByRole('button', { name: 'Reanudar' }))

    await waitFor(() => expect(onChanged).toHaveBeenCalled())
    expect(supabase.from).toHaveBeenCalledWith('epics')
    expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({ status: 'todo', paused_from_status: null }))
  })

  it('reports the error and does not notify a change when persisting fails', async () => {
    eqSpy.mockResolvedValue({ error: { message: 'check violation' } })
    const onChanged = vi.fn()
    const onError = vi.fn()
    render(<PauseControl table="items" entity={{ id: 'i1', status: 'todo' }} onChanged={onChanged} onError={onError} />)

    fireEvent.click(screen.getByRole('button', { name: 'Pausar' }))

    await waitFor(() => expect(onError).toHaveBeenCalled())
    expect(onChanged).not.toHaveBeenCalled()
  })
})
