import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'

const API_BASE = 'https://resume-matcher-backend-d5q4.onrender.com'

const loadingSteps = [
  'Connecting to GitHub...',
  'Reading repositories...',
  'Checking READMEs...',
  'Analyzing profile health...',
  'Generating recruiter verdict...',
]

function ScoreRing({ score }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 75 ? 'var(--color-good)' : score >= 50 ? '#C68A2E' : 'var(--color-warn)'

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#EDEAE2" strokeWidth="8" />
        <motion.circle
          cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-4xl font-bold font-mono"
          style={{ color }}
        >
          {score}
        </motion.span>
        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">GitHub Health</span>
      </div>
    </div>
  )
}

function DimensionBar({ label, score, delay }) {
  const color = score >= 75 ? 'var(--color-good)' : score >= 50 ? '#C68A2E' : 'var(--color-warn)'
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="font-mono text-xs text-gray-500 uppercase tracking-wide">{label}</span>
        <span className="font-mono text-xs font-bold" style={{ color }}>{score}</span>
      </div>
      <div className="h-2 w-full bg-[#EDEAE2] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay }}
        />
      </div>
    </div>
  )
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
}

function GitHubAnalyzerPage() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState('')
  const [githubData, setGithubData] = useState(null)
  const [critique, setCritique] = useState(null)

  useEffect(() => {
    if (!loading) return
    setLoadingStep(0)
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev))
    }, 1400)
    return () => clearInterval(interval)
  }, [loading])

  async function handleAnalyze() {
    if (!username.trim()) return
    setLoading(true)
    setError('')
    setGithubData(null)
    setCritique(null)

    try {
      const analyzeRes = await fetch(`${API_BASE}/api/github/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      const data = await analyzeRes.json()
      if (!analyzeRes.ok) throw new Error(data.error || 'Failed to fetch GitHub data')
      setGithubData(data)

      const critiqueRes = await fetch(`${API_BASE}/api/github/critique`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubData: data }),
      })
      const critiqueData = await critiqueRes.json()
      if (!critiqueRes.ok) throw new Error(critiqueData.error || 'Failed to analyze profile')
      setCritique(critiqueData)
    } catch (err) {
      console.error('GitHub analyzer error:', err)
      setError(err.message || 'Something went wrong analyzing your GitHub. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] bg-paper-texture">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-16">

        <Link to="/" className="font-mono text-xs text-gray-400 hover:text-[var(--color-signal)] mb-8 inline-block transition">
          ← Back to Home
        </Link>

        <motion.div initial="hidden" animate="show" variants={fadeUp} className="mb-12 text-center">
          <p className="font-mono text-xs tracking-widest uppercase text-[var(--color-signal)] mb-2">Profile Diagnostic</p>
          <h1 className="text-5xl" style={{ fontFamily: 'Lora, serif', fontWeight: 600 }}>Check My GitHub</h1>
        </motion.div>

        <motion.div initial="hidden" animate="show" custom={1} variants={fadeUp} className="mb-6">
          <label className="font-mono text-xs text-gray-400 uppercase tracking-wide mb-2 block">GitHub Username or URL</label>
          <input
            type="text"
            placeholder="e.g. Divyanganajain or github.com/Divyanganajain"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            className="w-full p-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)] shadow-sm transition"
          />
        </motion.div>

        <motion.div initial="hidden" animate="show" custom={2} variants={fadeUp} className="text-center mb-6">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-[var(--color-ink)] text-white font-mono text-sm tracking-wide px-8 py-3 rounded-full hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Scanning...' : 'Analyze GitHub'}
          </motion.button>
        </motion.div>

        {error && <p className="text-center text-sm text-[var(--color-signal)] mb-6">{error}</p>}

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-8 h-8 border-2 border-[var(--color-signal)] border-t-transparent rounded-full mx-auto mb-4"
              />
              <AnimatePresence mode="wait">
                <motion.p
                  key={loadingStep}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="font-mono text-xs text-gray-400 uppercase tracking-widest"
                >
                  {loadingSteps[loadingStep]}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {critique && githubData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="border-t border-gray-200 pt-10"
          >
            <div className="text-center mb-10">
              <ScoreRing score={critique.healthScore} />
              {critique.scoreExplanation && (
                <p className="text-sm text-gray-500 max-w-md mx-auto mt-4">{critique.scoreExplanation}</p>
              )}
            </div>

            {critique.dimensionScores && (
              <motion.div initial="hidden" animate="show" custom={0} variants={fadeUp} className="mb-8 p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                <h3 className="font-mono text-xs tracking-widest uppercase text-gray-400 mb-4">Breakdown</h3>
                <DimensionBar label="Documentation" score={critique.dimensionScores.documentation} delay={0.1} />
                <DimensionBar label="Activity" score={critique.dimensionScores.activity} delay={0.2} />
                <DimensionBar label="Substance" score={critique.dimensionScores.substance} delay={0.3} />
                <DimensionBar label="Presentation" score={critique.dimensionScores.presentation} delay={0.4} />
                <DimensionBar label="Diversity" score={critique.dimensionScores.diversity} delay={0.5} />
              </motion.div>
            )}

            {critique.nonObviousInsight && (
              <motion.div initial="hidden" animate="show" custom={0.5} variants={fadeUp} className="mb-8 p-6 rounded-xl border-2 border-[var(--color-signal)] bg-white shadow-sm">
                <h3 className="font-mono text-xs tracking-widest uppercase text-[var(--color-signal)] mb-2">Something You Probably Didn't Think Of</h3>
                <p className="text-sm leading-relaxed">{critique.nonObviousInsight}</p>
              </motion.div>
            )}

            <motion.div initial="hidden" animate="show" custom={1} variants={fadeUp} className="mb-8 p-6 rounded-xl bg-white border border-gray-200 shadow-sm text-left">
              <h3 className="font-mono text-xs tracking-widest uppercase text-gray-400 mb-3">Recruiter's 20-Second Take</h3>
              <p className="text-sm leading-relaxed italic" style={{ fontFamily: 'Lora, serif' }}>
                "{critique.recruiterVerdict}"
              </p>
            </motion.div>

            <motion.div initial="hidden" animate="show" custom={1.5} variants={fadeUp} className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                <h3 className="font-mono text-xs tracking-widest uppercase text-[var(--color-good)] mb-3">Strengths</h3>
                <ul className="space-y-2 text-sm">
                  {critique.strengths.map((s, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-[var(--color-good)]">+</span>
                      <span>{typeof s === 'string' ? s : s.strength || JSON.stringify(s)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                <h3 className="font-mono text-xs tracking-widest uppercase text-[var(--color-warn)] mb-3">Weak Points</h3>
                <ul className="space-y-3 text-sm">
                  {critique.weakPoints.map((w, index) => (
                    <li key={index}>
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium">{w.issue}</span>
                        {w.repo && <span className="text-xs text-gray-400 font-mono">({w.repo})</span>}
                      </div>
                      <p className="text-gray-500 text-xs mt-1">{w.why}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div initial="hidden" animate="show" custom={2} variants={fadeUp} className="mb-8 p-6 rounded-xl bg-white border border-gray-200 shadow-sm text-left">
              <h3 className="font-mono text-xs tracking-widest uppercase text-gray-400 mb-3">Missing</h3>
              <div className="flex flex-wrap gap-2">
                {critique.missing.map((item, index) => (
                  <span key={index} className="text-sm px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                    {typeof item === 'string' ? item : item.issue}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div initial="hidden" animate="show" custom={3} variants={fadeUp} className="mb-8 p-6 rounded-xl bg-white border border-gray-200 shadow-sm text-left">
              <h3 className="font-mono text-xs tracking-widest uppercase text-gray-400 mb-3">Quick Wins</h3>
              <div className="space-y-2">
                {critique.quickWins.map((win, index) => {
                  const text = typeof win === 'string' ? win : (win.action || win.fix || win.text || Object.values(win)[0])
                  return (
                    <div key={index} className="flex gap-3 items-start py-2 border-b border-gray-100 last:border-0">
                      <span className="font-mono text-xs text-[var(--color-signal)] mt-0.5">{String(index + 1).padStart(2, '0')}</span>
                      <span className="text-sm">{text}</span>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            <motion.div initial="hidden" animate="show" custom={4} variants={fadeUp}>
              <h3 className="font-mono text-xs tracking-widest uppercase text-gray-400 mb-3">Repo Breakdown</h3>
              <div className="space-y-3">
                {githubData.repos.map((r, index) => (
                  <motion.div
                    key={r.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-between"
                  >
                    <div>
                      <span className="text-sm font-medium">{r.name}</span>
                      {r.language && <span className="text-xs text-gray-400 ml-2 font-mono">{r.language}</span>}
                    </div>
                    <span
                      className={`text-xs font-mono px-2 py-1 rounded-full ${
                        r.hasReadme
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {r.hasReadme ? 'README ✓' : 'No README'}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </motion.div>
        )}

      </div>
    </div>
  )
}

export default GitHubAnalyzerPage