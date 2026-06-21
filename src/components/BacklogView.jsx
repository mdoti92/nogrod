import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { groupItemsByEpic, STATUS_LABELS, TYPE_LABELS, PRIORITY_LABELS } from '../lib/items'

function ItemRow({ item }) {
  const { setDetailItem } = useApp()
  return (
    <div className="item-row" onClick={() => setDetailItem(item)}>
      <span className={`badge badge-${item.type}`}>{TYPE_LABELS[item.type]}</span>
      <span className="item-row-title">
        {item.item_id ? <span style={{ color: 'var(--gold)', fontFamily: 'monospace', fontSize: 11, marginRight: 6 }}>{item.item_id}</span> : null}
        {item.title}
      </span>
      <div className="item-row-meta">
        {item.story_points ? (
          <span className={`badge badge-sp${item.story_points > 8 ? ' warning' : ''}`}>
            {item.story_points} SP
          </span>
        ) : null}
        <span className={`status-pill status-${item.status}`}>{STATUS_LABELS[item.status]}</span>
        {item.priority && (
          <span className={`badge badge-priority-${item.priority}`}>{PRIORITY_LABELS[item.priority]}</span>
        )}
      </div>
    </div>
  )
}

function EpicSection({ epic, items }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="epic-section">
      <div className="epic-header" onClick={() => setOpen(o => !o)}>
        <span className={`epic-chevron${open ? ' open' : ''}`}>▶</span>
        <span className="epic-title-text">{epic.title}</span>
        <span className="badge badge-sp" style={{ marginLeft: 'auto' }}>{items.length} items</span>
        <span className={`status-pill status-${epic.status}`}>{STATUS_LABELS[epic.status]}</span>
      </div>
      {open && (
        <div className="epic-body">
          {items.length === 0
            ? <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: '8px 0' }}>Sin items</div>
            : items.map(item => <ItemRow key={item.id} item={item} />)
          }
        </div>
      )}
    </div>
  )
}

export default function BacklogView() {
  const { currentProject, items, epics, setNewItemOpen } = useApp()
  const [noEpicOpen, setNoEpicOpen] = useState(false)

  if (!currentProject) return null

  const { byEpic, noEpic } = groupItemsByEpic(items)
  const isEmpty = epics.length === 0 && items.filter(i => !i.parent_id).length === 0

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">{currentProject.name}</div>
          <div className="page-subtitle">Backlog completo</div>
        </div>
        <button className="btn btn-primary" onClick={() => setNewItemOpen(true)}>
          + Nuevo Item
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {epics.map(epic => (
          <EpicSection key={epic.id} epic={epic} items={byEpic[epic.id] || []} />
        ))}

        {noEpic.length > 0 && (
          <div className="epic-section">
            <div className="epic-header" onClick={() => setNoEpicOpen(o => !o)}>
              <span className={`epic-chevron${noEpicOpen ? ' open' : ''}`}>▶</span>
              <span className="epic-title-text" style={{ color: 'var(--text-muted)' }}>Sin épica</span>
              <span className="badge badge-sp" style={{ marginLeft: 'auto' }}>{noEpic.length} items</span>
            </div>
            {noEpicOpen && (
              <div className="epic-body">
                {noEpic.map(item => <ItemRow key={item.id} item={item} />)}
              </div>
            )}
          </div>
        )}

        {isEmpty && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-title">Backlog vacío</div>
            <div className="empty-desc">Creá tu primer item para empezar</div>
          </div>
        )}
      </div>
    </>
  )
}
