import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import RequireAuth from './components/RequireAuth'
import Home from './pages/Home'
import Inbox from './pages/Inbox'
import Login from './pages/Login'

const Flows = lazy(() => import('./pages/Flows'))

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
      <Route path="/inbox" element={<RequireAuth><Inbox /></RequireAuth>} />
      <Route
        path="/flows"
        element={
          <RequireAuth>
            <Suspense fallback={null}>
              <Flows />
            </Suspense>
          </RequireAuth>
        }
      />
    </Routes>
  )
}
