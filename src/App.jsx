import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Inbox from './pages/Inbox'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/inbox" element={<Inbox />} />
    </Routes>
  )
}
