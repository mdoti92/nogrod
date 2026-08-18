import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { buildStatusUpdate } from '../_lib/status'

const FIXED_NOW = '2026-06-22T18:00:00.000Z'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(FIXED_NOW))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('buildStatusUpdate', () => {
  it('sets started_at when transitioning to in_progress and started_at is null', () => {
    const update = buildStatusUpdate({ started_at: null }, 'in_progress')
    expect(update.status).toBe('in_progress')
    expect(update.started_at).toBe(FIXED_NOW)
  })

  it('does not override started_at when already set', () => {
    const existing = '2026-06-20T10:00:00.000Z'
    const update = buildStatusUpdate({ started_at: existing }, 'in_progress')
    expect(update.started_at).toBeUndefined()
  })

  it('sets completed_at when transitioning to in_review', () => {
    const update = buildStatusUpdate({ started_at: '2026-06-20T10:00:00.000Z' }, 'in_review')
    expect(update.status).toBe('in_review')
    expect(update.completed_at).toBe(FIXED_NOW)
  })

  it('does not set date fields for other status transitions', () => {
    const update = buildStatusUpdate({ started_at: null }, 'todo')
    expect(update.started_at).toBeUndefined()
    expect(update.completed_at).toBeUndefined()
  })

  it('does not set date fields when transitioning to done', () => {
    const update = buildStatusUpdate({ started_at: '2026-06-20T10:00:00.000Z' }, 'done')
    expect(update.started_at).toBeUndefined()
    expect(update.completed_at).toBeUndefined()
  })
})
