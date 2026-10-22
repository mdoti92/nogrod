import { supabase } from '../lib/supabase'
import { STATUS_LABELS } from '../lib/items'
import { isPaused, canPause, buildPauseUpdate, buildResumeUpdate } from '../lib/pause'

export default function PauseControl({ table, entity, onChanged, onError }) {
  async function apply(buildUpdate) {
    let update
    try {
      update = buildUpdate(entity)
    } catch (error) {
      onError?.(error)
      return
    }
    const { error } = await supabase
      .from(table)
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq('id', entity.id)
    if (error) { onError?.(error); return }
    onChanged(update)
  }

  if (isPaused(entity)) {
    return (
      <div className="paused-banner">
        <span className="status-pill status-paused">{STATUS_LABELS.paused}</span>
        <span>Pausado desde {STATUS_LABELS[entity.paused_from_status] ?? 'estado desconocido'}</span>
        <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => apply(buildResumeUpdate)}>
          Reanudar
        </button>
      </div>
    )
  }

  if (!canPause(entity)) return null

  return (
    <button className="btn btn-ghost" onClick={() => apply(buildPauseUpdate)}>
      Pausar
    </button>
  )
}
