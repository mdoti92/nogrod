import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import BacklogView from '../BacklogView'
import { useApp } from '../../context/AppContext'

vi.mock('../../context/AppContext', () => ({
  useApp: vi.fn(),
}))

const activeItem = { id: 'i1', item_id: 'NOG-1', title: 'Item activo', type: 'task', status: 'todo', parent_id: null, epic_id: null }
const pausedItem = { id: 'i2', item_id: 'NOG-2', title: 'Item pausado', type: 'us', status: 'paused', paused_from_status: 'in_progress', parent_id: null, epic_id: null }
const pausedEpicWithActiveItem = { id: 'e1', title: 'Épica pausada con trabajo vivo', status: 'paused', paused_from_status: 'todo', initiative_id: null }
const pausedEmptyEpic = { id: 'e2', title: 'Épica pausada vacía', status: 'paused', paused_from_status: 'backlog', initiative_id: null }
const itemInPausedEpic = { id: 'i3', item_id: 'NOG-3', title: 'Item en épica pausada', type: 'task', status: 'in_progress', parent_id: null, epic_id: 'e1' }

function mockApp(overrides = {}) {
  useApp.mockReturnValue({
    currentProject: { id: 'p1', name: 'Nogrod' },
    items: [activeItem, pausedItem, itemInPausedEpic],
    epics: [pausedEpicWithActiveItem, pausedEmptyEpic],
    initiatives: [],
    setNewItemOpen: vi.fn(),
    setDetailItem: vi.fn(),
    setDetailEpic: vi.fn(),
    ...overrides,
  })
}

function openNoEpicGroup() {
  fireEvent.click(screen.getByText('Sin épica'))
}

describe('BacklogView paused filter', () => {
  beforeEach(() => mockApp())

  it('hides paused items by default', () => {
    render(<BacklogView />)
    openNoEpicGroup()

    expect(screen.getByText('Item activo')).toBeInTheDocument()
    expect(screen.queryByText('Item pausado')).not.toBeInTheDocument()
  })

  it('shows paused items with a "Pausado" badge when "Mostrar pausados" is on', () => {
    render(<BacklogView />)
    fireEvent.click(screen.getByLabelText('Mostrar pausados'))
    openNoEpicGroup()

    const row = screen.getByText('Item pausado').closest('.item-row')
    expect(within(row).getByText('Pausado')).toBeInTheDocument()
  })

  it('keeps a paused epic visible, with its badge, while it has active items', () => {
    render(<BacklogView />)

    const header = screen.getByText('Épica pausada con trabajo vivo').closest('.epic-header')
    expect(within(header).getByText('Pausado')).toBeInTheDocument()
  })

  it('hides a paused epic without visible items by default and shows it with the filter on', () => {
    render(<BacklogView />)
    expect(screen.queryByText('Épica pausada vacía')).not.toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Mostrar pausados'))
    expect(screen.getByText('Épica pausada vacía')).toBeInTheDocument()
  })

  it('opens the epic detail from the epic header', () => {
    const setDetailEpic = vi.fn()
    mockApp({ setDetailEpic })
    render(<BacklogView />)

    const header = screen.getByText('Épica pausada con trabajo vivo').closest('.epic-header')
    fireEvent.click(within(header).getByRole('button', { name: 'Detalle' }))

    expect(setDetailEpic).toHaveBeenCalledWith(pausedEpicWithActiveItem)
  })
})
