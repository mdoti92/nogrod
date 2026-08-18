import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [currentProject, setCurrentProject] = useState(null)
  const [items, setItems] = useState([])
  const [epics, setEpics] = useState([])
  const [initiatives, setInitiatives] = useState([])
  const [view, setView] = useState('board')
  const [toast, setToast] = useState(null)
  const [newItemOpen, setNewItemOpen] = useState(false)
  const [detailItem, setDetailItem] = useState(null)

  async function loadForProject(project) {
    const [itemsRes, epicsRes, initiativesRes] = await Promise.all([
      supabase.from('items').select('*').eq('project_id', project.id).order('created_at'),
      supabase.from('epics').select('*').eq('project_id', project.id).order('created_at'),
      supabase.from('initiatives').select('*').eq('project_id', project.id).order('created_at'),
    ])
    setItems(itemsRes.data || [])
    setEpics(epicsRes.data || [])
    setInitiatives(initiativesRes.data || [])
  }

  useEffect(() => {
    supabase
      .from('projects')
      .select('*')
      .order('created_at')
      .then(({ data, error }) => {
        if (error) { showToast('Error cargando proyectos'); return }
        const list = data || []
        setProjects(list)
        if (list.length > 0) {
          setCurrentProject(list[0])
          loadForProject(list[0])
        }
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function selectProject(project) {
    setCurrentProject(project)
    await loadForProject(project)
  }

  async function refresh() {
    if (currentProject) await loadForProject(currentProject)
  }

  return (
    <AppContext.Provider value={{
      projects, currentProject, items, epics, initiatives, view, toast,
      newItemOpen, detailItem,
      setView, setNewItemOpen, setDetailItem,
      selectProject, showToast, refresh,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
