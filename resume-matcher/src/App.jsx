import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import BuildResumePage from './pages/BuildResumePage'
import CheckResumePage from './pages/CheckResumePage'
import InterviewQuestionsPage from './pages/InterviewQuestionsPage'
import GitHubAnalyzer from './pages/GitHubAnalyzerPage'
import RecruiterScanPage from './pages/RecruiterScanPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/build" element={<BuildResumePage />} />
      <Route path="/check" element={<CheckResumePage />} />
      <Route path="/interview" element={<InterviewQuestionsPage />} />
      <Route path="/github-analyzer" element={<GitHubAnalyzer />} />
      <Route path="/recruiter-scan" element={<RecruiterScanPage />} />
    </Routes>
  )
}

export default App