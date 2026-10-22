import { describe, it, expect } from 'vitest'
import {
  PAUSED_STATUS,
  PAUSABLE_STATUSES,
  isPaused,
  canPause,
  buildPauseUpdate,
  buildResumeUpdate,
  filterVisibleItems,
  filterVisibleEpics,
} from '../pause'

describe('canPause', () => {
  it.each(['backlog', 'todo', 'in_progress', 'in_review'])('allows pausing from %s', status => {
    expect(canPause({ status })).toBe(true)
  })

  it('does not allow pausing something that is done', () => {
    expect(canPause({ status: 'done' })).toBe(false)
  })

  it('does not allow pausing something that is already paused', () => {
    expect(canPause({ status: PAUSED_STATUS, paused_from_status: 'todo' })).toBe(false)
  })

  it('exposes exactly the pausable statuses', () => {
    expect(PAUSABLE_STATUSES).toEqual(['backlog', 'todo', 'in_progress', 'in_review'])
  })
})

describe('isPaused', () => {
  it('is true only for the paused status', () => {
    expect(isPaused({ status: 'paused' })).toBe(true)
    expect(isPaused({ status: 'todo' })).toBe(false)
  })
})

describe('buildPauseUpdate', () => {
  it.each(PAUSABLE_STATUSES)('pauses from %s and records it as the previous status', status => {
    expect(buildPauseUpdate({ status })).toEqual({ status: 'paused', paused_from_status: status })
  })

  it('throws when the entity is done', () => {
    expect(() => buildPauseUpdate({ status: 'done' })).toThrow()
  })

  it('throws when the entity is already paused', () => {
    expect(() => buildPauseUpdate({ status: 'paused', paused_from_status: 'todo' })).toThrow()
  })
})

describe('buildResumeUpdate', () => {
  it('returns to the previous status and clears it', () => {
    const paused = { status: 'paused', paused_from_status: 'in_progress' }
    expect(buildResumeUpdate(paused)).toEqual({ status: 'in_progress', paused_from_status: null })
  })

  it('throws when the entity is not paused', () => {
    expect(() => buildResumeUpdate({ status: 'todo', paused_from_status: null })).toThrow()
  })

  it('throws when the paused entity has no valid previous status', () => {
    expect(() => buildResumeUpdate({ status: 'paused', paused_from_status: null })).toThrow()
    expect(() => buildResumeUpdate({ status: 'paused', paused_from_status: 'done' })).toThrow()
  })
})

describe('filterVisibleItems', () => {
  const items = [
    { id: '1', status: 'todo' },
    { id: '2', status: 'paused', paused_from_status: 'todo' },
    { id: '3', status: 'done' },
  ]

  it('hides paused items by default', () => {
    expect(filterVisibleItems(items).map(i => i.id)).toEqual(['1', '3'])
  })

  it('shows paused items when showPaused is on', () => {
    expect(filterVisibleItems(items, { showPaused: true }).map(i => i.id)).toEqual(['1', '2', '3'])
  })
})

describe('filterVisibleEpics', () => {
  const activeEpic = { id: 'e1', status: 'in_progress' }
  const pausedEmptyEpic = { id: 'e2', status: 'paused', paused_from_status: 'todo' }
  const pausedEpicWithItems = { id: 'e3', status: 'paused', paused_from_status: 'backlog' }
  const epics = [activeEpic, pausedEmptyEpic, pausedEpicWithItems]
  const visibleItemsByEpic = { e3: [{ id: 'i1', status: 'todo' }] }

  it('hides paused epics without visible items by default', () => {
    const visible = filterVisibleEpics(epics, visibleItemsByEpic)
    expect(visible.map(e => e.id)).toEqual(['e1', 'e3'])
  })

  it('keeps a paused epic visible while it still has visible items', () => {
    const visible = filterVisibleEpics([pausedEpicWithItems], visibleItemsByEpic)
    expect(visible).toEqual([pausedEpicWithItems])
  })

  it('shows every epic when showPaused is on', () => {
    const visible = filterVisibleEpics(epics, {}, { showPaused: true })
    expect(visible.map(e => e.id)).toEqual(['e1', 'e2', 'e3'])
  })
})
