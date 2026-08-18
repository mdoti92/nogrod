import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'

export default function NewInitiativeModal({ onClose }) {
  const { currentProject, showToast, refresh } = useApp()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    if (!title.trim()) { showToast('El título es requerido'); return }
    setLoading(true)
    const { error } = await supabase.from('initiatives').insert({
      project_id: currentProject.id,
      title: title.trim(),
      description: description.trim() || null,
      status: 'active',
    })
    setLoading(false)
    if (error) { showToast('Error creando iniciativa'); return }
    showToast('Iniciativa creada ✓')
    refresh()
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div className="modal-title">Nueva Iniciativa</div>
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
              placeholder="Nombre de la iniciativa"
            />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Objetivo o contexto de la iniciativa"
              style={{ minHeight: 80 }}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Creando…' : 'Crear Iniciativa'}
          </button>
        </div>
      </div>
    </div>
  )
}
