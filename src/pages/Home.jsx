import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const API_URL = import.meta.env.VITE_NOGROD_API_URL
const API_KEY = import.meta.env.VITE_NOGROD_API_KEY

export default function Home() {
  const { state } = useLocation()
  const [items, setItems] = useState([])
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/items?api_key=${API_KEY}`)
      .then(r => r.json())
      .then(setItems)
      .catch(err => setLoadError(err.message))
  }, [])

  return (
    <div style={styles.page}>
      {state?.success && (
        <div style={styles.banner}>
          ✓ Item creado —{' '}
          <span style={styles.itemId}>{state.item_id}</span>{' '}
          <strong>{state.title}</strong>
        </div>
      )}
      <h1 style={styles.title}>Nogrod — TD Forge</h1>

      {loadError && <p style={styles.error}>{loadError}</p>}

      {items.length === 0 && !loadError ? (
        <p style={styles.muted}>No hay items todavía.</p>
      ) : (
        <ul style={styles.list}>
          {items.map(item => (
            <li key={item.id} style={styles.item}>
              <span style={styles.itemId}>{item.item_id ?? '—'}</span>
              <span style={styles.itemTitle}>{item.title}</span>
              <span style={styles.itemStatus}>{item.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#0a0a0f', color: '#e8e8e8', padding: 32, fontFamily: 'Inter, sans-serif' },
  banner: { background: '#1a3a1a', border: '1px solid #2a5a2a', color: '#6fcf6f', borderRadius: 6, padding: '12px 16px', marginBottom: 24, fontSize: 14 },
  title: { color: '#C9A84C', fontFamily: 'serif', fontSize: 28, marginBottom: 20 },
  muted: { color: '#555', fontSize: 14 },
  error: { color: '#c0392b', fontSize: 13, marginBottom: 16 },
  list: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 },
  item: { display: 'flex', alignItems: 'center', gap: 12, background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 6, padding: '10px 14px' },
  itemId: { color: '#C9A84C', fontFamily: 'monospace', fontSize: 13, minWidth: 70 },
  itemTitle: { color: '#e8e8e8', fontSize: 14, flex: 1 },
  itemStatus: { color: '#555', fontSize: 12 },
}
