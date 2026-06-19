import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

export default function App() {
  const [projects, setProjects] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase
      .from('projects')
      .select('*')
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setProjects(data)
      })
  }, [])

  return (
    <div>
      <h1>Nogrod — TD Forge</h1>
      {error && <p>Error: {error}</p>}
      <pre>{JSON.stringify(projects, null, 2)}</pre>
    </div>
  )
}
