import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

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

  const typeColor = {
    Technical: 'text-[var(--color-signal)] bg-blue-50 border-blue-200',
    Project: 'text-[var(--color-good)] bg-green-50 border-green-200',
    Behavioral: 'text-[var(--color-warn)] bg-orange-50 border-orange-200'
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] px-8 py-16">
      <div className="max-w-3xl mx-auto">

        <Link to="/" className="text-xs font-mono text-gray-400 hover:text-[var(--color-signal)] mb-8 inline-block">
          ← Back to Home
        </Link>

        <div className="mb-12 text-center">
          <p className="font-mono text-xs tracking-widest uppercase text-[var(--color-signal)] mb-2">
            Resume Diagnostic
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Interview Questions
          </h1>
          <p className="text-sm text-gray-500 mt-3">
            Paste your resume and a job description to get likely interview questions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <textarea
            placeholder="Paste your resume here"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="h-56 p-4 rounded-lg border border-gray-200 bg-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)]"
          ></textarea>

          <textarea
            placeholder="Paste job description here"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            className="h-56 p-4 rounded-lg border border-gray-200 bg-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)]"
          ></textarea>
        </div>

        <div className="text-center mb-6">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-[var(--color-ink)] text-white font-mono text-sm tracking-wide px-8 py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Questions'}
          </button>
        </div>

        {error && (
          <p className="text-center text-sm text-red-500 mb-6">{error}</p>
        )}

        {questions && (
          <div className="border-t border-gray-200 pt-10 space-y-3">
            {questions.map((q, index) => (
              <div key={index} className="p-4 rounded-lg bg-white border border-gray-200">
                <span className={`inline-block text-xs font-mono px-2 py-0.5 rounded-full border mb-2 ${typeColor[q.type] || 'text-gray-500 bg-gray-50 border-gray-200'}`}>
                  {q.type}
                </span>
                <p className="text-sm font-medium">{q.question}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default InterviewQuestionsPage