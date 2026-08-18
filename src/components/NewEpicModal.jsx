import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'

export default function NewEpicModal({ onClose }) {
  const { currentProject, initiatives, showToast, refresh } = useApp()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [initiativeId, setInitiativeId] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    if (!title.trim()) { showToast('El título es requerido'); return }
    setLoading(true)
    const { error } = await supabase.from('epics').insert({
      project_id: currentProject.id,
      title: title.trim(),
      description: description.trim() || null,
      status: 'backlog',
      initiative_id: initiativeId || null,
    })
    setLoading(false)
    if (error) { showToast('Error creando épica'); return }
    showToast('Épica creada ✓')
    refresh()
    onClose()
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} onKeyDown={handleKeyDown}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div className="modal-title">Nueva Épica</div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Título *</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="Nombre de la épica"
            />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Objetivo o contexto de la épica"
              style={{ minHeight: 80 }}
            />
          </div>
          {initiatives.length > 0 && (
            <div className="form-group">
              <label>Iniciativa</label>
              <select value={initiativeId} onChange={e => setInitiativeId(e.target.value)}>
                <option value="">Sin iniciativa</option>
                {initiatives.map(i => (
                  <option key={i.id} value={i.id}>{i.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Creando…' : 'Crear Épica'}
          </button>
        </div>
      </div>
    </div>
  )
}
