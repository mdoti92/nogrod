import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { parseInboxParams } from '../lib/inbox'

const API_URL = import.meta.env.VITE_NOGROD_API_URL
const API_KEY = import.meta.env.VITE_NOGROD_API_KEY

const FIELD_LABELS = {
  type: 'Tipo',
  title: 'Título',
  story_points: 'Story Points',
  priority: 'Prioridad',
  context: 'Contexto',
  status: 'Estado',
}

const SP_OPTIONS = [1, 2, 3, 5, 8, 13, 21]
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'critical']
const TYPE_OPTIONS = ['us', 'task', 'bug', 'subtask']
const STATUS_OPTIONS = ['backlog', 'todo', 'in_progress', 'in_review', 'done']

export default function Inbox() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const parsed = parseInboxParams(searchParams)
  const [item, setItem] = useState(parsed)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!parsed) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={styles.title}>Parámetros inválidos</h2>
          <p style={styles.muted}>
            El link no contiene los campos requeridos: <code>type</code>,{' '}
            <code>title</code>, <code>project_id</code>.
          </p>
        </div>
      </div>
    )
  }

  function handleChange(field, value) {
    setItem(prev => ({ ...prev, [field]: value }))
  }

  async function handleConfirm() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/items?api_key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear item')
      navigate('/', { state: { success: true, item_id: data.item_id, title: item.title } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Nuevo item desde Claude</h2>

        {editing ? (
          <EditForm item={item} onChange={handleChange} />
        ) : (
          <Preview item={item} />
        )}

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.actions}>
          {editing ? (
            <button style={styles.btnSecondary} onClick={() => setEditing(false)}>
              Cancelar edición
            </button>
          ) : (
            <button style={styles.btnSecondary} onClick={() => setEditing(true)}>
              Editar antes de confirmar
            </button>
          )}
          <button style={styles.btnPrimary} onClick={handleConfirm} disabled={loading}>
            {loading ? 'Creando…' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Preview({ item }) {
  const rows = [
    ['Tipo', item.type],
    ['Título', item.title],
    ['Story Points', item.story_points ?? '—'],
    ['Prioridad', item.priority ?? '—'],
    ['Estado', item.status],
    ['Contexto', item.context ?? '—'],
  ]
  return (
    <table style={styles.table}>
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label}>
            <td style={styles.tdLabel}>{label}</td>
            <td style={styles.tdValue}>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function EditForm({ item, onChange }) {
  return (
    <div style={styles.form}>
      <label style={styles.label}>
        Tipo
        <select style={styles.input} value={item.type} onChange={e => onChange('type', e.target.value)}>
          {TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </label>
      <label style={styles.label}>
        Título
        <input style={styles.input} value={item.title} onChange={e => onChange('title', e.target.value)} />
      </label>
      <label style={styles.label}>
        Story Points
        <select
          style={styles.input}
          value={item.story_points ?? ''}
          onChange={e => onChange('story_points', e.target.value ? parseInt(e.target.value, 10) : undefined)}
        >
          <option value="">—</option>
          {SP_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <label style={styles.label}>
        Prioridad
        <select
          style={styles.input}
          value={item.priority ?? ''}
          onChange={e => onChange('priority', e.target.value || undefined)}
        >
          <option value="">—</option>
          {PRIORITY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </label>
      <label style={styles.label}>
        Estado
        <select style={styles.input} value={item.status} onChange={e => onChange('status', e.target.value)}>
          {STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </label>
      <label style={styles.label}>
        Contexto
        <textarea
          style={{ ...styles.input, height: 80 }}
          value={item.context ?? ''}
          onChange={e => onChange('context', e.target.value || undefined)}
        />
      </label>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', padding: 24 },
  card: { background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 8, padding: 32, width: '100%', maxWidth: 560 },
  title: { color: '#C9A84C', fontFamily: 'serif', marginBottom: 24, fontSize: 22 },
  muted: { color: '#888', fontSize: 14 },
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: 24 },
  tdLabel: { color: '#888', fontSize: 13, padding: '8px 0', width: 120, verticalAlign: 'top' },
  tdValue: { color: '#e8e8e8', fontSize: 14, padding: '8px 0' },
  form: { display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 },
  label: { display: 'flex', flexDirection: 'column', gap: 4, color: '#888', fontSize: 13 },
  input: { background: '#1a1a26', border: '1px solid #2a2a3a', borderRadius: 4, color: '#e8e8e8', fontSize: 14, padding: '6px 10px' },
  actions: { display: 'flex', gap: 12, justifyContent: 'flex-end' },
  btnPrimary: { background: '#C9A84C', color: '#0a0a0f', border: 'none', borderRadius: 4, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' },
  btnSecondary: { background: 'transparent', color: '#C9A84C', border: '1px solid #C9A84C', borderRadius: 4, padding: '8px 20px', cursor: 'pointer' },
  error: { color: '#c0392b', fontSize: 13, marginBottom: 16 },
}
