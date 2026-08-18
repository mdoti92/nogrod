import { DndContext, PointerSensor, useSensor, useSensors, useDraggable, useDroppable } from '@dnd-kit/core'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'
import { groupItemsByStatus, resolveDroppedStatus, STATUS_LABELS, TYPE_LABELS, PRIORITY_LABELS, STATUSES } from '../lib/items'

export default function BoardView() {
  const { currentProject, items, setNewItemOpen, setDetailItem, showToast, refresh } = useApp()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  if (!currentProject) {
    return (
      <div className="empty-state">
        <div className="empty-icon">⚒</div>
        <div className="empty-title">Seleccioná un proyecto</div>
      </div>
    )
  }

  const grouped = groupItemsByStatus(items)

  async function handleDragEnd({ active, over }) {
    const item = items.find(i => i.id === active.id)
    const newStatus = resolveDroppedStatus(item, over)
    if (!newStatus) return

    const { error } = await supabase
      .from('items')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', item.id)
    if (error) { showToast('Error moviendo el item'); return }
    refresh()
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
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
        {STATUSES.map(status => (
          <BoardColumn key={status} status={status} items={grouped[status]} onOpenDetail={setDetailItem} />
        ))}
      </div>
    </DndContext>
  )
}

function BoardColumn({ status, items, onOpenDetail }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div ref={setNodeRef} className={`board-col${isOver ? ' board-col-over' : ''}`}>
      <div className="board-col-header">
        <span className="board-col-title">{STATUS_LABELS[status]}</span>
        <span className="board-col-count">{items.length}</span>
      </div>

      {items.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', padding: 16 }}>
          Vacío
        </div>
      ) : (
        items.map(item => (
          <BoardCard key={item.id} item={item} onOpenDetail={onOpenDetail} />
        ))
      )}
    </div>
  )
}

function BoardCard({ item, onOpenDetail }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`board-item${isDragging ? ' board-item-dragging' : ''}`}
      onClick={() => onOpenDetail(item)}
    >
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
  )
}
