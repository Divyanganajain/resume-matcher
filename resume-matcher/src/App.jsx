import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import BuildResumePage from './pages/BuildResumePage'
import CheckResumePage from './pages/CheckResumePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/build" element={<BuildResumePage />} />
      <Route path="/check" element={<CheckResumePage />} />
    </Routes>
  )
}

export default App