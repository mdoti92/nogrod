import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { loadDependenciesForItem, addDependency, deleteDependency } from '../lib/dependencies'

const STATUS_DONE = 'done'

export default function DependenciesSection({ itemId }) {
  const { items, showToast } = useApp()
  const [depIds, setDepIds] = useState([])
  const [adding, setAdding] = useState(false)
  const [selected, setSelected] = useState('')

  useEffect(() => {
    if (!itemId) return
    loadDependenciesForItem(itemId)
      .then(setDepIds)
      .catch(() => showToast('Error cargando dependencias'))
  }, [itemId]) // eslint-disable-line react-hooks/exhaustive-deps

  const depItems = depIds
    .map(id => items.find(i => i.id === id))
    .filter(Boolean)

  const eligible = items.filter(
    i => i.id !== itemId && !depIds.includes(i.id)
  )

  async function handleAdd() {
    if (!selected) return
    const prev = depIds
    setDepIds(ids => [...ids, selected])
    setAdding(false)
    setSelected('')
    try {
      await addDependency(itemId, selected)
    } catch {
      setDepIds(prev)
      showToast('Error agregando dependencia')
    }
  }

  async function handleDelete(dependsOnId) {
    const prev = depIds
    setDepIds(ids => ids.filter(id => id !== dependsOnId))
    try {
      await deleteDependency(itemId, dependsOnId)
    } catch {
      setDepIds(prev)
      showToast('Error eliminando dependencia')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          Dependencias
          {depItems.length > 0 && (
            <span style={{ marginLeft: 8, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
              {depItems.filter(i => i.status === STATUS_DONE).length}/{depItems.length} resueltas
            </span>
          )}
        </label>
        {!adding && eligible.length > 0 && (
          <button
            className="btn btn-ghost"
            style={{ fontSize: 11, padding: '3px 10px' }}
            onClick={() => setAdding(true)}
          >
            + Agregar dependencia
          </button>
        )}
      </div>

      {depItems.length > 0 && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {depItems.map(dep => {
            const isDone = dep.status === STATUS_DONE
            return (
              <li key={dep.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: isDone ? 'var(--gold)' : 'var(--border)',
                  border: isDone ? 'none' : '1px solid var(--text-muted)',
                }} />
                <span style={{ flex: 1, fontSize: 13, color: isDone ? 'var(--text-dim)' : 'var(--text)', lineHeight: 1.4 }}>
                  {dep.item_id && (
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--gold)', marginRight: 6 }}>
                      {dep.item_id}
                    </span>
                  )}
                  {dep.title}
                </span>
                <span style={{
                  fontSize: 11, padding: '2px 6px', borderRadius: 3,
                  background: isDone ? 'rgba(168,192,204,0.12)' : 'rgba(255,100,100,0.1)',
                  color: isDone ? 'var(--gold)' : '#e07070',
                  flexShrink: 0,
                }}>
                  {isDone ? 'Done' : 'Pendiente'}
                </span>
                <button
                  onClick={() => handleDelete(dep.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, padding: '0 2px', lineHeight: 1, flexShrink: 0 }}
                  title="Eliminar dependencia"
                >
                  ×
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {adding && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <select
            autoFocus
            value={selected}
            onChange={e => setSelected(e.target.value)}
            style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: selected ? 'var(--text)' : 'var(--text-muted)', fontSize: 13, padding: '6px 10px' }}
          >
            <option value="">Seleccionar item…</option>
            {eligible.map(i => (
              <option key={i.id} value={i.id}>
                {i.item_id ? `${i.item_id} — ` : ''}{i.title}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={handleAdd} disabled={!selected}>
            Agregar
          </button>
          <button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => { setAdding(false); setSelected('') }}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}
