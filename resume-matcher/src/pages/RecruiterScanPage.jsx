import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'

const API_BASE = 'https://resume-matcher-backend-d5q4.onrender.com'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
}

function RecruiterScanPage() {
  const location = useLocation()
  const [resumeText, setResumeText] = useState(location.state?.resumeText || '')
  const [jdText, setJdText] = useState(location.state?.jdText || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [scanData, setScanData] = useState(null)

  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [visibleSteps, setVisibleSteps] = useState([])
  const [showFinalReveal, setShowFinalReveal] = useState(false)
  const timerRef = useRef(null)

  async function handleScan() {
    if (!resumeText.trim()) return
    setLoading(true)
    setError('')
    setScanData(null)
    setVisibleSteps([])
    setShowFinalReveal(false)
    setElapsed(0)

    try {
      const res = await fetch(`${API_BASE}/api/recruiter-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jdText }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to run scan')
      setScanData(data)
      startPlayback(data)
    } catch (err) {
      setError(err.message || 'Something went wrong running the scan.')
    }
    setLoading(false)
  }

  function startPlayback(data) {
    setPlaying(true)
    const maxSecond = Math.max(...data.scanSequence.map(s => s.second), 20)

    timerRef.current = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1
        if (next >= maxSecond) {
          clearInterval(timerRef.current)
          setPlaying(false)
          setTimeout(() => setShowFinalReveal(true), 600)
        }
        return next
      })
    }, 1000)
  }

  useEffect(() => {
    if (!scanData) return
    const newlyVisible = scanData.scanSequence.filter(s => s.second <= elapsed)
    setVisibleSteps(newlyVisible)
  }, [elapsed, scanData])

  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  const maxSecond = scanData ? Math.max(...scanData.scanSequence.map(s => s.second), 20) : 20
  const progressPct = (elapsed / maxSecond) * 100

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] bg-paper-texture">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-16">

        <Link to="/" className="font-mono text-xs text-gray-400 hover:text-[var(--color-signal)] mb-8 inline-block transition">
          ← Back to Home
        </Link>

        <motion.div initial="hidden" animate="show" variants={fadeUp} className="mb-12 text-center">
          <p className="font-mono text-xs tracking-widest uppercase text-[var(--color-signal)] mb-2">Live Simulation</p>
          <h1 className="text-5xl mb-3" style={{ fontFamily: 'Lora, serif', fontWeight: 600 }}>Recruiter Scan</h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Watch exactly what a recruiter notices in the first 20 seconds with your resume.
          </p>
        </motion.div>

        {!scanData && (
          <>
            <motion.div initial="hidden" animate="show" custom={1} variants={fadeUp} className="grid md:grid-cols-2 gap-4 mb-6">
              <textarea
                placeholder="Paste your resume here"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="h-56 p-4 rounded-xl border border-gray-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)] shadow-sm transition"
              ></textarea>
              <textarea
                placeholder="Paste job description here (optional)"
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                className="h-56 p-4 rounded-xl border border-gray-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)] shadow-sm transition"
              ></textarea>
            </motion.div>

            <motion.div initial="hidden" animate="show" custom={2} variants={fadeUp} className="text-center mb-6">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleScan}
                disabled={loading}
                className="bg-[var(--color-ink)] text-white font-mono text-sm tracking-wide px-8 py-3 rounded-full hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? 'Reading Resume...' : 'Simulate Recruiter Scan'}
              </motion.button>
            </motion.div>

            {error && <p className="text-center text-sm text-[var(--color-signal)] mb-6">{error}</p>}
          </>
        )}

        {scanData && (
          <div className="border-t border-gray-200 pt-10">

            {playing && (
              <div className="mb-8">
                <div className="flex justify-between font-mono text-xs text-gray-400 mb-2">
                  <span>SCANNING</span>
                  <span>{elapsed}s / {maxSecond}s</span>
                </div>
                <div className="h-1.5 w-full bg-[#EDEAE2] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[var(--color-signal)] rounded-full"
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 1, ease: 'linear' }}
                  />
                </div>
              </div>
            )}

            {elapsed >= 0 && !showFinalReveal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8 p-6 rounded-xl bg-white border border-gray-200 shadow-sm"
              >
                <h3 className="font-mono text-xs tracking-widest uppercase text-gray-400 mb-2">First Impression</h3>
                <p className="text-sm italic" style={{ fontFamily: 'Lora, serif' }}>"{scanData.firstImpression}"</p>
              </motion.div>
            )}

            <div className="space-y-3 mb-8">
              <AnimatePresence>
                {visibleSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm flex gap-4"
                  >
                    <span className="font-mono text-xs text-[var(--color-signal)] shrink-0 pt-0.5">
                      {String(step.second).padStart(2, '0')}s
                    </span>
                    <div>
                      <p className="text-sm font-medium">{step.noticed}</p>
                      <p className="text-sm text-gray-500 mt-1">{step.reaction}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {showFinalReveal && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center mb-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.1 }}
                      className="inline-block"
                    >
                      <div className="text-5xl font-bold font-mono" style={{
                        color: scanData.moveForwardLikelihood >= 70 ? 'var(--color-good)' : scanData.moveForwardLikelihood >= 40 ? '#C68A2E' : 'var(--color-warn)'
                      }}>
                        {scanData.moveForwardLikelihood}%
                      </div>
                    </motion.div>
                    <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                      Likelihood They Keep Reading
                    </p>
                  </div>

                  <div className="mb-8 p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <h3 className="font-mono text-xs tracking-widest uppercase text-gray-400 mb-3">The Verdict</h3>
                    <p className="text-sm leading-relaxed">{scanData.verdict}</p>
                  </div>

                  <div className="mb-8 p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <h3 className="font-mono text-xs tracking-widest uppercase text-[var(--color-warn)] mb-3">What Got Skipped</h3>
                    <div className="flex flex-wrap gap-2">
                      {scanData.whatGotSkipped.map((item, index) => (
                        <span key={index} className="text-sm px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setScanData(null); setShowFinalReveal(false); }}
                      className="border-2 border-[var(--color-signal)] text-[var(--color-signal)] font-mono text-sm tracking-wide px-6 py-2.5 rounded-full hover:bg-[var(--color-signal)] hover:text-white transition"
                    >
                      Run Again →
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}

      </div>
    </div>
  )
}

export default RecruiterScanPage