import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import AnswerBox from '../components/AnswerBox'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
}

function InterviewQuestionsPage() {
  const location = useLocation()
  const [resumeText, setResumeText] = useState(location.state?.resumeText || '')
  const [jdText, setJdText] = useState(location.state?.jdText || '')
  const [questions, setQuestions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate() {
    setLoading(true)
    setQuestions(null)
    setError('')

    try {
      const response = await fetch('https://resume-matcher-backend-d5q4.onrender.com/api/interview-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jdText })
      })

      if (!response.ok) {
        throw new Error('Server error')
      }

      const data = await response.json()
      setQuestions(data.questions)
    } catch (err) {
      console.error('Interview questions error:', err)
      setError('Something went wrong generating questions. Please try again in a moment.')
    }

    setLoading(false)
  }

  const typeStyle = {
    Technical: 'text-[var(--color-signal)] bg-red-50 border-red-200',
    Project: 'text-[var(--color-good)] bg-green-50 border-green-200',
    Behavioral: 'text-[#C68A2E] bg-amber-50 border-amber-200'
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] bg-paper-texture">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-16">

        <Link to="/" className="font-mono text-xs text-gray-400 hover:text-[var(--color-signal)] mb-8 inline-block transition">
          ← Back to Home
        </Link>

        <motion.div initial="hidden" animate="show" variants={fadeUp} className="mb-12 text-center">
          <p className="font-mono text-xs tracking-widest uppercase text-[var(--color-signal)] mb-2">
            Resume Diagnostic
          </p>
          <h1 className="text-5xl mb-3" style={{ fontFamily: 'Lora, serif', fontWeight: 600 }}>
            Interview Questions
          </h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Paste your resume and a job description to get likely interview questions.
          </p>
        </motion.div>

        <motion.div initial="hidden" animate="show" custom={1} variants={fadeUp} className="grid md:grid-cols-2 gap-4 mb-6">
          <textarea
            placeholder="Paste your resume here"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="h-56 p-4 rounded-xl border border-gray-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)] shadow-sm transition"
          ></textarea>

          <textarea
            placeholder="Paste job description here"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            className="h-56 p-4 rounded-xl border border-gray-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)] shadow-sm transition"
          ></textarea>
        </motion.div>

        <motion.div initial="hidden" animate="show" custom={2} variants={fadeUp} className="text-center mb-6">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            disabled={loading}
            className="bg-[var(--color-ink)] text-white font-mono text-sm tracking-wide px-8 py-3 rounded-full hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Questions'}
          </motion.button>
        </motion.div>

        {error && (
          <p className="text-center text-sm text-[var(--color-signal)] mb-6">{error}</p>
        )}

        <AnimatePresence>
          {questions && (
            <div className="border-t border-gray-200 pt-10 space-y-4">
              {questions.map((q, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className={`inline-block text-xs font-mono px-2.5 py-0.5 rounded-full border mb-2 ${typeStyle[q.type] || 'text-gray-500 bg-gray-50 border-gray-200'}`}>
                    {q.type}
                  </span>
                  <p className="text-sm font-medium leading-relaxed">{q.question}</p>

                  <AnswerBox question={q.question} resumeText={resumeText} jdText={jdText} />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}

export default InterviewQuestionsPage