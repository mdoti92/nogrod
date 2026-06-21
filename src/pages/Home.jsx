import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { AppProvider, useApp } from '../context/AppContext'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import BoardView from '../components/BoardView'
import BacklogView from '../components/BacklogView'
import OverviewView from '../components/OverviewView'
import NewItemModal from '../components/NewItemModal'
import DetailModal from '../components/DetailModal'
import Toast from '../components/Toast'

function NogrodApp() {
  const { view, newItemOpen, detailItem, showToast } = useApp()
  const location = useLocation()

  useEffect(() => {
    const { state } = location
    if (state?.success && state?.item_id) {
      showToast(`Item creado: ${state.item_id} — ${state.title}`)
      window.history.replaceState({}, '')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Header />
      <div className="app">
        <Sidebar />
        <main className="main">
          {view === 'board' && <BoardView />}
          {view === 'backlog' && <BacklogView />}
          {view === 'overview' && <OverviewView />}
        </main>
      </div>
      {newItemOpen && <NewItemModal />}
      {detailItem && <DetailModal />}
      <Toast />
    </>
  )
}

export default function Home() {
  return (
    <AppProvider>
      <NogrodApp />
    </AppProvider>
  )
}
