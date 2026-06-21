import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'
import { SP_OPTIONS } from '../lib/items'

const API_URL = import.meta.env.VITE_NOGROD_API_URL
const API_KEY = import.meta.env.VITE_NOGROD_API_KEY

const EMPTY_FORM = {
  type: 'us',
  title: '',
  epicId: '',
  context: '',
  scopeOut: '',
  executablePrompt: '',
  storyPoints: '',
  priority: 'medium',
  status: 'backlog',
  actualBehavior: '',
  expectedBehavior: '',
  severity: 'medium',
}

export default function NewItemModal() {
  const { projects, currentProject, epics: ctxEpics, setNewItemOpen, showToast, refresh } = useApp()
  const [form, setForm] = useState(EMPTY_FORM)
  const [projectId, setProjectId] = useState('')
  const [modalEpics, setModalEpics] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (currentProject) {
      setProjectId(currentProject.id)
      setModalEpics(ctxEpics)
    }
    setForm(EMPTY_FORM)
  }, [currentProject, ctxEpics])

  useEffect(() => {
    if (!projectId || projectId === currentProject?.id) {
      setModalEpics(ctxEpics)
      return
    }
    supabase.from('epics').select('*').eq('project_id', projectId).then(({ data }) => {
      setModalEpics(data || [])
    })
  }, [projectId, currentProject, ctxEpics])

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!form.title.trim()) { showToast('El título es requerido'); return }
    setLoading(true)

    const payload = {
      project_id: projectId,
      epic_id: form.epicId || null,
      type: form.type,
      title: form.title.trim(),
      context: form.context || null,
      scope_out: form.scopeOut || null,
      executable_prompt: form.executablePrompt || null,
      story_points: form.storyPoints ? parseInt(form.storyPoints) : null,
      priority: form.priority,
      status: form.status,
    }

    if (form.type === 'bug') {
      payload.actual_behavior = form.actualBehavior || null
      payload.expected_behavior = form.expectedBehavior || null
      payload.severity = form.severity
    }

    try {
      const res = await fetch(`${API_URL}/items?api_key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear item')
      showToast('Item creado ⚒')
      setNewItemOpen(false)
      refresh()
    } catch (err) {
      showToast(err.message)
    } finally {
      setLoading(false)
    }
  }

  const spWarning = form.storyPoints && parseInt(form.storyPoints) > 8

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setNewItemOpen(false)}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Nuevo Item</div>
          <button className="close-btn" onClick={() => setNewItemOpen(false)}>×</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Tipo</label>
            <select value={form.type} onChange={e => set('type', e.target.value)}>
              <option value="us">Historia de Usuario</option>
              <option value="task">Task</option>
              <option value="bug">Bug</option>
              <option value="subtask">Subtask</option>
            </select>
          </div>

          <div className="form-group">
            <label>Título *</label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Título del item" />
          </div>

          <div className="form-group">
            <label>Proyecto</label>
            <select value={projectId} onChange={e => setProjectId(e.target.value)}>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Épica</label>
            <select value={form.epicId} onChange={e => set('epicId', e.target.value)}>
              <option value="">Sin épica</option>
              {modalEpics.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Contexto / Descripción</label>
            <textarea
              value={form.context}
              onChange={e => set('context', e.target.value)}
              placeholder="¿Por qué existe este item? ¿Qué problema resuelve?"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Story Points</label>
              <select value={form.storyPoints} onChange={e => set('storyPoints', e.target.value)}>
                <option value="">Sin estimar</option>
                {SP_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Prioridad</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)}>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
          </div>

          {spWarning && (
            <div className="sp-warning">
              ⚠️ Esta US supera los 8 SP — considerar dividirla en historias más pequeñas.
            </div>
          )}

          <div className="form-group">
            <label>Estado</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="backlog">Backlog</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="done">Done</option>
            </select>
          </div>

          {form.type === 'bug' && (
            <>
              <div className="form-group">
                <label>Comportamiento Actual</label>
                <textarea value={form.actualBehavior} onChange={e => set('actualBehavior', e.target.value)} placeholder="¿Qué pasa hoy?" />
              </div>
              <div className="form-group">
                <label>Comportamiento Esperado</label>
                <textarea value={form.expectedBehavior} onChange={e => set('expectedBehavior', e.target.value)} placeholder="¿Qué debería pasar?" />
              </div>
              <div className="form-group">
                <label>Severidad</label>
                <select value={form.severity} onChange={e => set('severity', e.target.value)}>
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Scope Out (qué NO hace)</label>
            <textarea
              value={form.scopeOut}
              onChange={e => set('scopeOut', e.target.value)}
              placeholder="Qué está explícitamente fuera del alcance"
              style={{ minHeight: 60 }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
              Prompt ejecutable
            </label>
            <textarea
              value={form.executablePrompt}
              onChange={e => set('executablePrompt', e.target.value)}
              placeholder="Prompt para Claude Code..."
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontFamily: 'monospace', fontSize: 12, padding: '8px 12px', resize: 'vertical', minHeight: 120, lineHeight: 1.5, outline: 'none', width: '100%' }}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setNewItemOpen(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Creando…' : 'Crear Item'}
          </button>
        </div>
      </div>
    </div>
  )
}
