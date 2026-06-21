import { useApp } from '../context/AppContext'
import { groupItemsByStatus, STATUS_LABELS, TYPE_LABELS, PRIORITY_LABELS, STATUSES } from '../lib/items'

export default function BoardView() {
  const { currentProject, items, setNewItemOpen, setDetailItem } = useApp()

  if (!currentProject) {
    return (
      <div className="empty-state">
        <div className="empty-icon">⚒</div>
        <div className="empty-title">Seleccioná un proyecto</div>
      </div>
    )
  }

  const grouped = groupItemsByStatus(items)

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">{currentProject.name}</div>
          <div className="page-subtitle">Board de trabajo</div>
        </div>
        <button className="btn btn-primary" onClick={() => setNewItemOpen(true)}>
          + Nuevo Item
        </button>
      </div>

      <div className="board">
        {STATUSES.map(status => {
          const colItems = grouped[status]
          return (
            <div key={status} className="board-col">
              <div className="board-col-header">
                <span className="board-col-title">{STATUS_LABELS[status]}</span>
                <span className="board-col-count">{colItems.length}</span>
              </div>

              {colItems.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', padding: 16 }}>
                  Vacío
                </div>
              ) : (
                colItems.map(item => (
                  <div key={item.id} className="board-item" onClick={() => setDetailItem(item)}>
                    {item.item_id && (
                      <div className="board-item-id">{item.item_id}</div>
                    )}
                    <div className="board-item-title">{item.title}</div>
                    <div className="board-item-meta">
                      <span className={`badge badge-${item.type}`}>
                        {TYPE_LABELS[item.type]}
                      </span>
                      {item.story_points ? (
                        <span className={`badge badge-sp${item.story_points > 8 ? ' warning' : ''}`}>
                          {item.story_points} SP
                        </span>
                      ) : null}
                      {item.priority && (
                        <span className={`badge badge-priority-${item.priority}`}>
                          {PRIORITY_LABELS[item.priority]}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
