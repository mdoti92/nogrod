import { describe, it, expect } from 'vitest'
import mermaid from 'mermaid'
import { FLOWS_DIAGRAM } from '../flows'

mermaid.initialize({ startOnLoad: false })

describe('FLOWS_DIAGRAM', () => {
  it('is valid mermaid syntax', async () => {
    await expect(mermaid.parse(FLOWS_DIAGRAM)).resolves.toBeTruthy()
  })
})
