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
    expect(result.acceptance_criteria).toBeUndefined()
    expect(result.executable_prompt).toBeUndefined()
    expect(result.dependencies).toBeUndefined()
  })

  it('maps multiple dep params to dependencies array', () => {
    const uuid1 = 'aaaaaaaa-0000-0000-0000-000000000001'
    const uuid2 = 'aaaaaaaa-0000-0000-0000-000000000002'
    const params = new URLSearchParams(`type=us&title=T&project_id=x&dep=${uuid1}&dep=${uuid2}`)
    expect(parseInboxParams(params).dependencies).toEqual([uuid1, uuid2])
  })

  it('maps single dep param to dependencies array of one', () => {
    const uuid = 'aaaaaaaa-0000-0000-0000-000000000001'
    const params = new URLSearchParams(`type=us&title=T&project_id=x&dep=${uuid}`)
    expect(parseInboxParams(params).dependencies).toEqual([uuid])
  })

  it('omits dependencies when no dep params present', () => {
    const params = new URLSearchParams('type=us&title=T&project_id=x')
    expect(parseInboxParams(params).dependencies).toBeUndefined()
  })

  it('maps multiple ca params to acceptance_criteria array', () => {
    const params = new URLSearchParams(
      'type=us&title=T&project_id=x&ca=El+sistema+valida+email&ca=Se+muestra+error+si+falla'
    )
    expect(parseInboxParams(params).acceptance_criteria).toEqual([
      'El sistema valida email',
      'Se muestra error si falla',
    ])
  })

  it('maps single ca param to acceptance_criteria array of one', () => {
    const params = new URLSearchParams('type=us&title=T&project_id=x&ca=Un+solo+criterio')
    expect(parseInboxParams(params).acceptance_criteria).toEqual(['Un solo criterio'])
  })

  it('omits acceptance_criteria when no ca params present', () => {
    const params = new URLSearchParams('type=us&title=T&project_id=x')
    expect(parseInboxParams(params).acceptance_criteria).toBeUndefined()
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
