import { describe, it, expect } from 'vitest'
import { sortByPriority, isItemBlocked, selectNextItem } from '../_lib/next'

describe('sortByPriority', () => {
  it('places critical before high', () => {
    const items = [
      { id: '1', priority: 'high' },
      { id: '2', priority: 'critical' },
    ]
    const result = sortByPriority(items)
    expect(result[0].id).toBe('2')
    expect(result[1].id).toBe('1')
  })

  it('places high before medium', () => {
    const items = [
      { id: '1', priority: 'medium' },
      { id: '2', priority: 'high' },
    ]
    const result = sortByPriority(items)
    expect(result[0].id).toBe('2')
  })

  it('places medium before low', () => {
    const items = [
      { id: '1', priority: 'low' },
      { id: '2', priority: 'medium' },
    ]
    const result = sortByPriority(items)
    expect(result[0].id).toBe('2')
  })

  it('sorts all four priorities in correct order', () => {
    const items = [
      { id: 'low', priority: 'low' },
      { id: 'critical', priority: 'critical' },
      { id: 'medium', priority: 'medium' },
      { id: 'high', priority: 'high' },
    ]
    const result = sortByPriority(items)
    expect(result.map(i => i.id)).toEqual(['critical', 'high', 'medium', 'low'])
  })

  it('does not mutate the original array', () => {
    const items = [
      { id: '1', priority: 'low' },
      { id: '2', priority: 'high' },
    ]
    const original = [...items]
    sortByPriority(items)
    expect(items).toEqual(original)
  })
})

describe('isItemBlocked', () => {
  it('returns false when item has no dependencies', () => {
    expect(isItemBlocked('item-1', {}, {})).toBe(false)
  })

  it('returns false when all dependencies are done', () => {
    const depsByItemId = { 'item-1': ['dep-a', 'dep-b'] }
    const depStatusById = { 'dep-a': 'done', 'dep-b': 'done' }
    expect(isItemBlocked('item-1', depsByItemId, depStatusById)).toBe(false)
  })

  it('returns true when a dependency is in_progress', () => {
    const depsByItemId = { 'item-1': ['dep-a'] }
    const depStatusById = { 'dep-a': 'in_progress' }
    expect(isItemBlocked('item-1', depsByItemId, depStatusById)).toBe(true)
  })

  it('returns true when a dependency is in todo', () => {
    const depsByItemId = { 'item-1': ['dep-a'] }
    const depStatusById = { 'dep-a': 'todo' }
    expect(isItemBlocked('item-1', depsByItemId, depStatusById)).toBe(true)
  })

  it('returns true when at least one of multiple dependencies is not done', () => {
    const depsByItemId = { 'item-1': ['dep-a', 'dep-b'] }
    const depStatusById = { 'dep-a': 'done', 'dep-b': 'in_progress' }
    expect(isItemBlocked('item-1', depsByItemId, depStatusById)).toBe(true)
  })
})

describe('selectNextItem', () => {
  it('returns null when there are no items', () => {
    expect(selectNextItem([], {}, {})).toBeNull()
  })

  it('returns null when all items are blocked', () => {
    const items = [{ id: 'item-1', priority: 'high' }]
    const depsByItemId = { 'item-1': ['dep-1'] }
    const depStatusById = { 'dep-1': 'in_progress' }
    expect(selectNextItem(items, depsByItemId, depStatusById)).toBeNull()
  })

  it('returns the highest priority available item (CA1)', () => {
    const items = [
      { id: 'low-item', priority: 'low' },
      { id: 'critical-item', priority: 'critical' },
    ]
    const result = selectNextItem(items, {}, {})
    expect(result.id).toBe('critical-item')
  })

  it('skips blocked items and returns next available (CA2)', () => {
    const items = [
      { id: 'critical-item', priority: 'critical' },
      { id: 'high-item', priority: 'high' },
    ]
    const depsByItemId = { 'critical-item': ['dep-1'] }
    const depStatusById = { 'dep-1': 'in_progress' }
    const result = selectNextItem(items, depsByItemId, depStatusById)
    expect(result.id).toBe('high-item')
  })

  it('returns null when all items are blocked across different priorities (CA3)', () => {
    const items = [
      { id: 'item-1', priority: 'critical' },
      { id: 'item-2', priority: 'high' },
    ]
    const depsByItemId = {
      'item-1': ['dep-1'],
      'item-2': ['dep-2'],
    }
    const depStatusById = { 'dep-1': 'todo', 'dep-2': 'in_progress' }
    expect(selectNextItem(items, depsByItemId, depStatusById)).toBeNull()
  })
})
