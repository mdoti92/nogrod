import { useApp } from '../context/AppContext'

export default function OverviewView() {
  const { currentProject, items, epics } = useApp()

  if (!currentProject) return null

  const stats = [
    { value: items.length, label: 'Total items', color: 'var(--gold)' },
    { value: items.filter(i => i.status === 'done').length, label: 'Completados', color: '#4ade80' },
    { value: items.filter(i => i.status === 'in_progress').length, label: 'En progreso', color: '#ffc107' },
    { value: items.filter(i => i.type === 'bug').length, label: 'Bugs abiertos', color: '#f56a6a' },
    { value: items.reduce((a, i) => a + (i.story_points || 0), 0), label: 'Story Points', color: 'var(--gold)' },
    { value: epics.length, label: 'Épicas', color: 'var(--gold)' },
  ]

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">{currentProject.name}</div>
          <div className="page-subtitle">Vista general</div>
        </div>
      </div>
      <div className="stats-grid">
        {stats.map(({ value, label, color }) => (
          <div key={label} className="stat-card">
            <div className="stat-value" style={{ color }}>{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>
    </>
  )
}
