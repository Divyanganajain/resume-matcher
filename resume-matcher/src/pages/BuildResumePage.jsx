import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function BuildResumePage() {
  const [rawInfo, setRawInfo] = useState('')
  const [jdText, setJdText] = useState('')
  const [builtResume, setBuiltResume] = useState('')
  const [building, setBuilding] = useState(false)
  const navigate = useNavigate()

  async function handleBuildResume() {
    setBuilding(true)
    setBuiltResume('')

    try {
      const response = await fetch('https://resume-matcher-backend-d5q4.onrender.com/api/build-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawInfo, jdText })
      })

      const data = await response.json()
      setBuiltResume(data.resume)
    } catch (err) {
      console.error('Build resume error:', err)
    }

    setBuilding(false)
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] px-8 py-16">
      <div className="max-w-3xl mx-auto">

        {/* Back link */}
        <Link to="/" className="text-xs font-mono text-gray-400 hover:text-[var(--color-signal)] mb-8 inline-block">
          ← Back to Home
        </Link>

        {/* Header */}
        <div className="mb-12 text-center">
          <p className="font-mono text-xs tracking-widest uppercase text-[var(--color-signal)] mb-2">
            Resume Diagnostic
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Build a Resume
          </h1>
          <p className="text-sm text-gray-500 mt-3">
            Paste rough, unorganized info about yourself, plus a target job description, and get an ATS-optimized resume draft.
          </p>
        </div>

        {/* Inputs */}
        <div className="mb-6">
          <label className="text-xs font-mono text-gray-400 uppercase tracking-wide mb-2 block">
            Your Background
          </label>
          <textarea
            placeholder="e.g. 2nd year CS student, built a React + Node app, know Java and MongoDB..."
            value={rawInfo}
            onChange={(e) => setRawInfo(e.target.value)}
            className="h-40 w-full p-4 rounded-lg border border-gray-200 bg-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)]"
          ></textarea>
        </div>

        <div className="mb-6">
          <label className="text-xs font-mono text-gray-400 uppercase tracking-wide mb-2 block">
            Target Job Description (optional)
          </label>
          <textarea
            placeholder="Paste the job description you're targeting, for a tailored resume"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            className="h-40 w-full p-4 rounded-lg border border-gray-200 bg-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)]"
          ></textarea>
        </div>

        <div className="text-center mb-12">
          <button
            onClick={handleBuildResume}
            disabled={building}
            className="bg-[var(--color-ink)] text-white font-mono text-sm tracking-wide px-8 py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {building ? 'Building...' : 'Build Resume'}
          </button>
        </div>

        {builtResume && (
          <div className="border-t border-gray-200 pt-10">
            <h3 className="font-mono text-xs tracking-widest uppercase text-gray-400 mb-3">
              Your Draft Resume
            </h3>
            <div className="p-6 rounded-lg bg-white border border-gray-200">
              <pre className="whitespace-pre-wrap font-mono text-sm">{builtResume}</pre>
            </div>
            <div className="text-center mt-6">
              <button
                onClick={() => navigate('/check', { state: { resumeText: builtResume, jdText } })}
                className="bg-[var(--color-ink)] text-white font-mono text-sm tracking-wide px-6 py-2.5 rounded-lg hover:opacity-90 transition"
              >
                Check This Resume's ATS Score →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default BuildResumePage