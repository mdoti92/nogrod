import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BoardView from '../BoardView'
import { useApp } from '../../context/AppContext'

vi.mock('../../context/AppContext', () => ({
  useApp: vi.fn(),
}))

const item = {
  id: 'item-1',
  item_id: 'NOG-1',
  title: 'Un item cualquiera',
  type: 'task',
  status: 'todo',
  parent_id: null,
}

describe('BoardView', () => {
  beforeEach(() => {
    useApp.mockReturnValue({
      currentProject: { id: 'p1', name: 'Nogrod' },
      items: [item],
      setNewItemOpen: vi.fn(),
      setDetailItem: vi.fn(),
      showToast: vi.fn(),
      refresh: vi.fn(),
    })
  })

  it('opens the item detail on a plain click, without a drag in progress', () => {
    const setDetailItem = vi.fn()
    useApp.mockReturnValue({
      currentProject: { id: 'p1', name: 'Nogrod' },
      items: [item],
      setNewItemOpen: vi.fn(),
      setDetailItem,
      showToast: vi.fn(),
      refresh: vi.fn(),
    })

    render(<BoardView />)
    fireEvent.click(screen.getByText('Un item cualquiera'))

    expect(setDetailItem).toHaveBeenCalledWith(item)
  })
})
