import { describe, it, expect } from 'vitest'
import { groupItemsByStatus, groupItemsByEpic, groupEpicsByInitiative, STATUSES } from '../items'

describe('groupItemsByStatus', () => {
  it('returns empty buckets for all statuses when there are no items', () => {
    const result = groupItemsByStatus([])
    expect(Object.keys(result)).toEqual(STATUSES)
    STATUSES.forEach(s => expect(result[s]).toEqual([]))
  })

  it('places each item into its corresponding status bucket', () => {
    const items = [
      { id: '1', status: 'backlog', parent_id: null },
      { id: '2', status: 'todo', parent_id: null },
      { id: '3', status: 'in_progress', parent_id: null },
      { id: '4', status: 'done', parent_id: null },
    ]
    const result = groupItemsByStatus(items)
    expect(result.backlog).toHaveLength(1)
    expect(result.todo).toHaveLength(1)
    expect(result.in_progress).toHaveLength(1)
    expect(result.in_review).toHaveLength(0)
    expect(result.done).toHaveLength(1)
  })

  it('excludes items that have a parent_id (subtasks)', () => {
    const items = [
      { id: '1', status: 'todo', parent_id: 'some-parent' },
      { id: '2', status: 'todo', parent_id: null },
    ]
    const result = groupItemsByStatus(items)
    expect(result.todo).toHaveLength(1)
    expect(result.todo[0].id).toBe('2')
  })

  it('ignores items with unknown status', () => {
    const items = [{ id: '1', status: 'unknown', parent_id: null }]
    const result = groupItemsByStatus(items)
    STATUSES.forEach(s => expect(result[s]).toHaveLength(0))
  })
})

describe('groupItemsByEpic', () => {
  it('returns empty groups when there are no items', () => {
    const { byEpic, noEpic } = groupItemsByEpic([])
    expect(byEpic).toEqual({})
    expect(noEpic).toEqual([])
  })

  it('separates items by epic_id and collects items without epic in noEpic', () => {
    const items = [
      { id: '1', epic_id: 'e1', parent_id: null },
      { id: '2', epic_id: 'e1', parent_id: null },
      { id: '3', epic_id: null, parent_id: null },
      { id: '4', epic_id: 'e2', parent_id: null },
    ]
    const { byEpic, noEpic } = groupItemsByEpic(items)
    expect(byEpic['e1']).toHaveLength(2)
    expect(byEpic['e2']).toHaveLength(1)
    expect(noEpic).toHaveLength(1)
    expect(noEpic[0].id).toBe('3')
  })

  it('excludes items that have a parent_id', () => {
    const items = [
      { id: '1', epic_id: null, parent_id: 'parent-uuid' },
      { id: '2', epic_id: null, parent_id: null },
    ]
    const { noEpic } = groupItemsByEpic(items)
    expect(noEpic).toHaveLength(1)
    expect(noEpic[0].id).toBe('2')
  })
})

describe('groupEpicsByInitiative', () => {
  it('returns empty groups when there are no epics', () => {
    const { byInitiative, noInitiative } = groupEpicsByInitiative([])
    expect(byInitiative).toEqual({})
    expect(noInitiative).toEqual([])
  })

  it('groups epics by initiative_id', () => {
    const epics = [
      { id: 'e1', initiative_id: 'i1' },
      { id: 'e2', initiative_id: 'i1' },
      { id: 'e3', initiative_id: 'i2' },
    ]
    const { byInitiative } = groupEpicsByInitiative(epics)
    expect(byInitiative['i1']).toHaveLength(2)
    expect(byInitiative['i2']).toHaveLength(1)
  })

  it('collects epics without initiative_id in noInitiative', () => {
    const epics = [
      { id: 'e1', initiative_id: 'i1' },
      { id: 'e2', initiative_id: null },
      { id: 'e3', initiative_id: null },
    ]
    const { noInitiative } = groupEpicsByInitiative(epics)
    expect(noInitiative).toHaveLength(2)
    expect(noInitiative.map(e => e.id)).toEqual(['e2', 'e3'])
  })

  it('returns all epics in noInitiative when none have initiative_id', () => {
    const epics = [{ id: 'e1' }, { id: 'e2' }]
    const { byInitiative, noInitiative } = groupEpicsByInitiative(epics)
    expect(byInitiative).toEqual({})
    expect(noInitiative).toHaveLength(2)
  })
})
