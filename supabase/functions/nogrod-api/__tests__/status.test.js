import { describe, it, expect } from 'vitest'
import { isValidStatus, VALID_STATUSES } from '../_lib/status'

describe('VALID_STATUSES', () => {
  it('contains all five board statuses', () => {
    expect(VALID_STATUSES).toEqual(['backlog', 'todo', 'in_progress', 'in_review', 'done'])
  })
})

describe('isValidStatus', () => {
  it('returns true for each valid status', () => {
    for (const status of VALID_STATUSES) {
      expect(isValidStatus(status)).toBe(true)
    }
  })

  it('returns false for an unknown status string', () => {
    expect(isValidStatus('pending')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isValidStatus('')).toBe(false)
  })

  it('returns false for null', () => {
    expect(isValidStatus(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isValidStatus(undefined)).toBe(false)
  })

  it('returns false for a status with wrong casing', () => {
    expect(isValidStatus('In_Progress')).toBe(false)
    expect(isValidStatus('DONE')).toBe(false)
  })
})
