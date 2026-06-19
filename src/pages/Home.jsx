import { useLocation } from 'react-router-dom'

export default function Home() {
  const { state } = useLocation()

  return (
    <div style={styles.page}>
      {state?.success && (
        <div style={styles.banner}>
          ✓ Item creado correctamente —{' '}
          <strong>{state.title}</strong>{' '}
          <span style={styles.id}>#{state.id}</span>
        </div>
      )}
      <h1 style={styles.title}>Nogrod — TD Forge</h1>
      <p style={styles.muted}>Board en construcción.</p>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#0a0a0f', color: '#e8e8e8', padding: 32, fontFamily: 'Inter, sans-serif' },
  banner: { background: '#1a3a1a', border: '1px solid #2a5a2a', color: '#6fcf6f', borderRadius: 6, padding: '12px 16px', marginBottom: 24, fontSize: 14 },
  title: { color: '#C9A84C', fontFamily: 'serif', fontSize: 28, marginBottom: 8 },
  muted: { color: '#555', fontSize: 14 },
  id: { color: '#888', fontFamily: 'monospace', fontSize: 12 },
}
