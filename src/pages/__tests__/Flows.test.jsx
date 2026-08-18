import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Flows from '../Flows'
import { FLOW_SECTIONS } from '../../content/flows'

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ signOut: vi.fn() }),
}))

vi.mock('../../components/FlowsDiagram', () => ({
  default: () => <div data-testid="flows-diagram-stub" />,
}))

function renderFlows() {
  return render(<MemoryRouter><Flows /></MemoryRouter>)
}

describe('Flows', () => {
  it('renders one section header per entry in FLOW_SECTIONS', () => {
    renderFlows()
    FLOW_SECTIONS.forEach(section => {
      expect(screen.getByText(section.title)).toBeInTheDocument()
    })
  })

  it('keeps section descriptions collapsed by default', () => {
    renderFlows()
    expect(screen.queryByText(FLOW_SECTIONS[0].description)).not.toBeInTheDocument()
  })

  it('expands a section description on click and collapses it again on a second click', () => {
    renderFlows()
    const header = screen.getByText(FLOW_SECTIONS[0].title)

    fireEvent.click(header)
    expect(screen.getByText(FLOW_SECTIONS[0].description)).toBeInTheDocument()

    fireEvent.click(header)
    expect(screen.queryByText(FLOW_SECTIONS[0].description)).not.toBeInTheDocument()
  })

  it('expanding one section does not affect the others', () => {
    renderFlows()
    fireEvent.click(screen.getByText(FLOW_SECTIONS[0].title))

    expect(screen.getByText(FLOW_SECTIONS[0].description)).toBeInTheDocument()
    expect(screen.queryByText(FLOW_SECTIONS[1].description)).not.toBeInTheDocument()
  })
})
