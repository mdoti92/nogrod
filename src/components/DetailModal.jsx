import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'
import { STATUS_LABELS, TYPE_LABELS, PRIORITY_LABELS, SP_OPTIONS } from '../lib/items'
import AcceptanceCriteriaSection from './AcceptanceCriteriaSection'
import DependenciesSection from './DependenciesSection'

export default function DetailModal() {
  const { detailItem, setDetailItem, epics, showToast, refresh } = useApp()
  const [form, setForm] = useState({})

  useEffect(() => {
    if (!detailItem) return
    setForm({
      title: detailItem.title || '',
      context: detailItem.context || '',
      status: detailItem.status || 'backlog',
      storyPoints: detailItem.story_points ?? '',
      priority: detailItem.priority || 'medium',
      scopeOut: detailItem.scope_out || '',
      actualBehavior: detailItem.actual_behavior || '',
      expectedBehavior: detailItem.expected_behavior || '',
      executablePrompt: detailItem.executable_prompt || '',
    })
  }, [detailItem])

  if (!detailItem) return null

  const epic = epics.find(e => e.id === detailItem.epic_id)
  const spWarning = form.storyPoints && parseInt(form.storyPoints) > 8

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    const payload = {
      title: form.title.trim(),
      context: form.context || null,
      status: form.status,
      story_points: form.storyPoints ? parseInt(form.storyPoints) : null,
      priority: form.priority,
      scope_out: form.scopeOut || null,
      executable_prompt: form.executablePrompt || null,
      updated_at: new Date().toISOString(),
    }
    if (detailItem.type === 'bug') {
      payload.actual_behavior = form.actualBehavior || null
      payload.expected_behavior = form.expectedBehavior || null
    }
    const { error } = await supabase.from('items').update(payload).eq('id', detailItem.id)
    if (error) { showToast('Error guardando'); return }
    showToast('Guardado ✓')
    setDetailItem(null)
    refresh()
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar este item?')) return
    const { error } = await supabase.from('items').delete().eq('id', detailItem.id)
    if (error) { showToast('Error eliminando'); return }
    showToast('Item eliminado')
    setDetailItem(null)
    refresh()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDetailItem(null)}>
      <div className="modal" style={{ maxWidth: 700 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {detailItem.item_id && (
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--gold)' }}>
                {detailItem.item_id}
              </span>
            )}
            <span className={`badge badge-${detailItem.type}`}>{TYPE_LABELS[detailItem.type]}</span>
          </div>
          <button className="close-btn" onClick={() => setDetailItem(null)}>×</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Título</label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>

          {epic && (
            <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>
              📦 Épica: {epic.title}
            </div>
          )}

          <div className="form-group">
            <label>Contexto</label>
            <textarea value={form.context} onChange={e => set('context', e.target.value)} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Estado</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}>
                {Object.entries(STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Story Points</label>
              <select value={form.storyPoints} onChange={e => set('storyPoints', e.target.value)}>
                <option value="">Sin estimar</option>
                {SP_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Prioridad</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)}>
                {Object.entries(PRIORITY_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {spWarning && (
            <div className="sp-warning">
              ⚠️ Esta US supera los 8 SP — considerar dividirla en historias más pequeñas.
            </div>
          )}

          {detailItem.type === 'bug' && (
            <>
              <div className="form-group">
                <label>Comportamiento Actual</label>
                <textarea value={form.actualBehavior} onChange={e => set('actualBehavior', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Comportamiento Esperado</label>
                <textarea value={form.expectedBehavior} onChange={e => set('expectedBehavior', e.target.value)} />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Scope Out</label>
            <textarea value={form.scopeOut} onChange={e => set('scopeOut', e.target.value)} />
          </div>

          <DependenciesSection itemId={detailItem.id} />

          <AcceptanceCriteriaSection itemId={detailItem.id} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                Prompt ejecutable
              </label>
              {form.executablePrompt && (
                <button
                  className="btn btn-ghost"
                  style={{ fontSize: 11, padding: '3px 10px' }}
                  onClick={() => navigator.clipboard.writeText(form.executablePrompt).then(() => showToast('Prompt copiado ✓'))}
                >
                  Copiar
                </button>
              )}
            </div>
            <textarea
              value={form.executablePrompt}
              onChange={e => set('executablePrompt', e.target.value)}
              placeholder="Prompt para Claude Code..."
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontFamily: 'monospace', fontSize: 12, padding: '8px 12px', resize: 'vertical', minHeight: 120, lineHeight: 1.5, outline: 'none', width: '100%' }}
            />
          </div>

          <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
            Creado: {new Date(detailItem.created_at).toLocaleString('es-UY')}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-danger" onClick={handleDelete}>Eliminar</button>
          <button className="btn btn-ghost" onClick={() => setDetailItem(null)}>Cerrar</button>
          <button className="btn btn-primary" onClick={handleSave}>Guardar cambios</button>
        </div>
      </div>
    </div>
  )
}
