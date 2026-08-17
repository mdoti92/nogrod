import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { setNewItemOpen } = useApp()
  const { signOut } = useAuth()

  return (
    <header>
      <div className="logo">Nogrod <span>TD Forge</span></div>
      <div className="header-actions">
        <button className="btn btn-ghost" onClick={() => setNewItemOpen(true)}>
          + Nuevo Item
        </button>
        <button className="btn btn-ghost" onClick={signOut}>
          Salir
        </button>
      </div>
    </header>
  )
}
