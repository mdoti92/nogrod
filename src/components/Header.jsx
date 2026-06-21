import { useApp } from '../context/AppContext'

export default function Header() {
  const { setNewItemOpen } = useApp()

  return (
    <header>
      <div className="logo">Nogrod <span>TD Forge</span></div>
      <div className="header-actions">
        <button className="btn btn-ghost" onClick={() => setNewItemOpen(true)}>
          + Nuevo Item
        </button>
      </div>
    </header>
  )
}
