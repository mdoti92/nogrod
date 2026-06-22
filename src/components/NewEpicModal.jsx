import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'

export default function NewEpicModal({ onClose }) {
  const { currentProject, showToast, refresh } = useApp()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    if (!title.trim()) { showToast('El título es requerido'); return }
    setLoading(true)
    const { error } = await supabase.from('epics').insert({
      project_id: currentProject.id,
      title: title.trim(),
      description: description.trim() || null,
      status: 'backlog',
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
