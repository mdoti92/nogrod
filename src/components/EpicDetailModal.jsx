import { useApp } from '../context/AppContext'
import { STATUS_LABELS } from '../lib/items'
import { isPaused } from '../lib/pause'
import PauseControl from './PauseControl'

export default function EpicDetailModal() {
  const { detailEpic, setDetailEpic, showToast, refresh } = useApp()

  if (!detailEpic) return null

  function close() {
    setDetailEpic(null)
  }

  function handlePauseChanged() {
    showToast(isPaused(detailEpic) ? 'Épica reanudada ✓' : 'Épica pausada ✓')
    close()
    refresh()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div className="modal-title">{detailEpic.title}</div>
          <button className="close-btn" onClick={close}>×</button>
        </div>

        <div className="modal-body">
          {detailEpic.description && (
            <div style={{ color: 'var(--text-dim)', fontSize: 13, whiteSpace: 'pre-wrap' }}>{detailEpic.description}</div>
          )}
          {!isPaused(detailEpic) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-dim)' }}>
              Estado:
              <span className={`status-pill status-${detailEpic.status}`}>{STATUS_LABELS[detailEpic.status]}</span>
            </div>
          )}
          <PauseControl
            table="epics"
            entity={detailEpic}
            onChanged={handlePauseChanged}
            onError={() => showToast('Error cambiando la pausa')}
          />
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={close}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}
