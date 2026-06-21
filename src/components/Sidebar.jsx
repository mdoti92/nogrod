import { useApp } from '../context/AppContext'

const VIEWS = [
  { id: 'board', icon: '⬛', label: 'Board' },
  { id: 'backlog', icon: '☰', label: 'Backlog' },
  { id: 'overview', icon: '◈', label: 'Overview' },
]

export default function Sidebar() {
  const { projects, currentProject, view, setView, selectProject } = useApp()

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-label">Vistas</div>
        {VIEWS.map(({ id, icon, label }) => (
          <div
            key={id}
            className={`sidebar-item ${view === id ? 'active' : ''}`}
            onClick={() => setView(id)}
          >
            {icon} {label}
          </div>
        ))}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">Proyectos</div>
        {projects.map(p => (
          <div
            key={p.id}
            className={`sidebar-item ${currentProject?.id === p.id ? 'active' : ''}`}
            onClick={() => selectProject(p)}
          >
            <div className="project-dot" style={{ background: p.color }} />
            {p.name}
          </div>
        ))}
      </div>
    </aside>
  )
}
