import { describe, it, expect } from 'vitest'
import { parseInboxParams } from '../inbox'

describe('parseInboxParams', () => {
  it('returns null when required fields are missing', () => {
    expect(parseInboxParams(new URLSearchParams(''))).toBeNull()
    expect(parseInboxParams(new URLSearchParams('title=Test&project_id=x'))).toBeNull()
    expect(parseInboxParams(new URLSearchParams('type=us&project_id=x'))).toBeNull()
    expect(parseInboxParams(new URLSearchParams('type=us&title=T'))).toBeNull()
  })

  it('parses required fields and defaults status to backlog', () => {
    const params = new URLSearchParams('type=us&title=Mi+historia&project_id=abc-123')
    expect(parseInboxParams(params)).toEqual({
      type: 'us',
      title: 'Mi historia',
      project_id: 'abc-123',
      status: 'backlog',
    })
  })

  it('maps sp to story_points as integer', () => {
    const params = new URLSearchParams('type=us&title=T&project_id=x&sp=5')
    expect(parseInboxParams(params).story_points).toBe(5)
  })

  it('includes optional fields when present', () => {
    const params = new URLSearchParams(
      'type=us&title=T&project_id=x&sp=3&priority=high&context=Contexto+del+item'
    )
    expect(parseInboxParams(params)).toEqual({
      type: 'us',
      title: 'T',
      project_id: 'x',
      story_points: 3,
      priority: 'high',
      context: 'Contexto del item',
      status: 'backlog',
    })
  })

  it('omits optional fields when absent', () => {
    const params = new URLSearchParams('type=task&title=T&project_id=x')
    const result = parseInboxParams(params)
    expect(result.story_points).toBeUndefined()
    expect(result.priority).toBeUndefined()
    expect(result.context).toBeUndefined()
    expect(result.executable_prompt).toBeUndefined()
  })

  it('maps prompt param to executable_prompt when present', () => {
    const params = new URLSearchParams('type=us&title=T&project_id=x&prompt=Implementar+el+endpoint')
    expect(parseInboxParams(params).executable_prompt).toBe('Implementar el endpoint')
  })

  it('omits executable_prompt when prompt param is absent', () => {
    const params = new URLSearchParams('type=us&title=T&project_id=x')
    expect(parseInboxParams(params).executable_prompt).toBeUndefined()
  })
})
