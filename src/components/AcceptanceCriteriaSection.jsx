import { useState, useEffect } from 'react'
import { loadCriteriaForItem, addCriterion, toggleCriterion, deleteCriterion } from '../lib/acceptanceCriteria'
import { useApp } from '../context/AppContext'

export default function AcceptanceCriteriaSection({ itemId }) {
  const { showToast } = useApp()
  const [criteria, setCriteria] = useState([])
  const [newText, setNewText] = useState('')
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!itemId) return
    loadCriteriaForItem(itemId)
      .then(setCriteria)
      .catch(() => showToast('Error cargando criterios'))
  }, [itemId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleToggle(criterion) {
    const next = !criterion.done
    setCriteria(prev => prev.map(c => c.id === criterion.id ? { ...c, done: next } : c))
    try {
      await toggleCriterion(criterion.id, next)
    } catch {
      setCriteria(prev => prev.map(c => c.id === criterion.id ? { ...c, done: criterion.done } : c))
      showToast('Error actualizando criterio')
    }
  }

  async function handleDelete(id) {
    setCriteria(prev => prev.filter(c => c.id !== id))
    try {
      await deleteCriterion(id)
    } catch {
      showToast('Error eliminando criterio')
      loadCriteriaForItem(itemId).then(setCriteria).catch(() => {})
    }
  }

  async function handleAdd() {
    const text = newText.trim()
    if (!text) return
    setSaving(true)
    try {
      const created = await addCriterion(itemId, text)
      setCriteria(prev => [...prev, created])
      setNewText('')
      setAdding(false)
    } catch {
      showToast('Error guardando criterio')
    } finally {
      setSaving(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd() }
    if (e.key === 'Escape') { setAdding(false); setNewText('') }
  }

  const done = criteria.filter(c => c.done).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          Criterios de Aceptación
          {criteria.length > 0 && (
            <span style={{ marginLeft: 8, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
              {done}/{criteria.length}
            </span>
          )}
        </label>
        {!adding && (
          <button
            className="btn btn-ghost"
            style={{ fontSize: 11, padding: '3px 10px' }}
            onClick={() => setAdding(true)}
          >
            + Agregar CA
          </button>
        )}
      </div>

      {criteria.length > 0 && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {criteria.map(c => (
            <li key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <input
                type="checkbox"
                checked={c.done}
                onChange={() => handleToggle(c)}
                style={{ marginTop: 3, accentColor: 'var(--gold)', cursor: 'pointer', flexShrink: 0 }}
              />
              <span style={{
                flex: 1,
                fontSize: 13,
                color: c.done ? 'var(--text-dim)' : 'var(--text)',
                textDecoration: c.done ? 'line-through' : 'none',
                lineHeight: 1.4,
              }}>
                {c.description}
              </span>
              <button
                onClick={() => handleDelete(c.id)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, padding: '0 2px', lineHeight: 1, flexShrink: 0 }}
                title="Eliminar"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
          <input
            autoFocus
            type="text"
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Descripción del criterio..."
            style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: 13, padding: '6px 10px', outline: 'none' }}
          />
          <button className="btn btn-primary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={handleAdd} disabled={saving}>
            {saving ? '…' : 'Agregar'}
          </button>
          <button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => { setAdding(false); setNewText('') }}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}
