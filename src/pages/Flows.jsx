import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FLOWS_DIAGRAM, FLOW_SECTIONS } from '../content/flows'
import FlowsDiagram from '../components/FlowsDiagram'

export default function Flows() {
  const { signOut } = useAuth()

  return (
    <>
      <header>
        <div className="logo">Nogrod <span>Flows</span></div>
        <div className="header-actions">
          <Link className="btn btn-ghost" to="/">← Volver</Link>
          <button className="btn btn-ghost" onClick={signOut}>Salir</button>
        </div>
      </header>
      <main className="main">
        <div className="page-header">
          <div>
            <div className="page-title">Cómo funciona Nogrod</div>
            <div className="page-subtitle">Mapa general y detalle de cada flujo, siempre actualizado.</div>
          </div>
        </div>

        <FlowsDiagram definition={FLOWS_DIAGRAM} />

        <div className="item-list">
          {FLOW_SECTIONS.map(section => (
            <FlowSection key={section.id} section={section} />
          ))}
        </div>
      </main>
    </>
  )
}

function FlowSection({ section }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="epic-section">
      <div className="epic-header" onClick={() => setOpen(o => !o)}>
        <span className={`epic-chevron ${open ? 'open' : ''}`}>▸</span>
        <span className="epic-title-text">{section.title}</span>
      </div>
      {open && (
        <div className="epic-body">
          <p>{section.description}</p>
        </div>
      )}
    </div>
  )
}
