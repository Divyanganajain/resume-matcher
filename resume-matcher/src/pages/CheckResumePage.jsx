import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

function highlightKeywords(text, keywords) {
  if (!keywords || keywords.length === 0) return text

  const pattern = new RegExp(`(${keywords.join('|')})`, 'gi')
  const parts = text.split(pattern)

  return parts.map((part, index) => {
    const isMatch = keywords.some(kw => kw.toLowerCase() === part.toLowerCase())
    return isMatch ? (
      <mark key={index} className="bg-green-100 text-green-800 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  })
}
function analyzeSkillPlacement(resumeText, skills) {
  if (!skills || skills.length === 0) return []

  const lines = resumeText.split('\n').filter(line => line.trim().length > 0)

  return skills.map(skill => {
    const regex = new RegExp(skill, 'gi')
    let count = 0
    let foundInBullet = false

    lines.forEach(line => {
      const matches = line.match(regex)
      if (matches) {
        count += matches.length
        const wordCount = line.trim().split(/\s+/).length
        if (wordCount > 10) {
          foundInBullet = true
        }
      }
    })

    return { skill, count, onlyInSkillsList: count > 0 && !foundInBullet }
  })
}
function CheckResumePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [resumeText, setResumeText] = useState(location.state?.resumeText || '')
  const [jdText, setJdText] = useState(location.state?.jdText || '')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [rewrites, setRewrites] = useState({})
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleAnalyze() {
    setLoading(true)
    setResults(null)
    setError('')

    try {
      const response = await fetch('https://resume-matcher-backend-d5q4.onrender.com/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jdText })
      })

      if (!response.ok) {
        throw new Error('Server error')
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      console.error('Frontend error:', err)
      setError('Something went wrong analyzing your resume. Please try again in a moment.')
    }

    setLoading(false)
  }

  async function handleRewrite(bulletText, index) {
    try {
      const response = await fetch('https://resume-matcher-backend-d5q4.onrender.com/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulletText })
      })

      const data = await response.json()
      setRewrites(prev => ({ ...prev, [index]: data.rewritten }))
    } catch (err) {
      console.error('Rewrite error:', err)
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)

    const formData = new FormData()
    formData.append('resume', file)

    try {
      const response = await fetch('https://resume-matcher-backend-d5q4.onrender.com/api/upload-resume', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      setResumeText(data.text)
    } catch (err) {
      console.error('Upload error:', err)
    }

    setUploading(false)
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
            Check My Resume
          </h1>
        </div>

        {/* Inputs */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wide">Resume</span>
              <label className="text-xs font-mono text-[var(--color-signal)] cursor-pointer hover:underline">
                {uploading ? 'Reading PDF...' : 'Upload PDF'}
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </label>

            <textarea
              placeholder="Paste your resume here, or upload a PDF"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="h-64 w-full p-4 rounded-lg border border-gray-200 bg-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)]"
            ></textarea>
          </div>

          <textarea
            placeholder="Paste job description here"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            className="h-64 p-4 rounded-lg border border-gray-200 bg-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)]"
          ></textarea>
        </div>

        {/* Button */}
        <div className="text-center mb-6">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-[var(--color-ink)] text-white font-mono text-sm tracking-wide px-8 py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Scanning...' : 'Analyze Match'}
          </button>
        </div>

        {error && (
          <p className="text-center text-sm text-red-500 mb-6">{error}</p>
        )}

        {/* Results */}
        {results && (
          <div className="border-t border-gray-200 pt-10">

            <div className="text-center mb-10">
              <p className="font-mono text-xs tracking-widest uppercase text-gray-400 mb-1">
                ATS Score
              </p>
              <p className="font-mono text-6xl font-bold text-[var(--color-signal)]">
                {results.atsScore}
              </p>
              {results.scoreExplanation && (
                <p className="text-sm text-gray-500 max-w-md mx-auto mt-3">
                  {results.scoreExplanation}
                </p>
              )}
            </div>

            <div className="mb-10 p-6 rounded-lg bg-white border border-gray-200 text-left">
              <h3 className="font-mono text-xs tracking-widest uppercase text-gray-400 mb-3">
                Keyword Scan
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap font-mono">
                {highlightKeywords(resumeText, results.matchingSkills)}
              </p>
            </div>
            <div className="mb-10 p-6 rounded-lg bg-white border border-gray-200 text-left">
  <h3 className="font-mono text-xs tracking-widest uppercase text-gray-400 mb-3">
    Skill Placement
  </h3>
  <div className="space-y-2">
    {analyzeSkillPlacement(resumeText, results.matchingSkills).map((item, index) => (
      <div key={index} className="flex items-start justify-between gap-4 py-2 border-b border-gray-100 last:border-0">
        <div>
          <span className="text-sm font-medium">{item.skill}</span>
          <span className="text-xs text-gray-400 ml-2">mentioned {item.count}x</span>
        </div>
        {item.onlyInSkillsList && (
          <span className="text-xs text-[var(--color-warn)] text-right">
            Only in skills list — add to a project bullet
          </span>
        )}
      </div>
    ))}
  </div>
</div>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div>
                <h3 className="font-mono text-xs tracking-widest uppercase text-[var(--color-good)] mb-3">
                  Matching Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {results.matchingSkills.map((skill, index) => (
                    <span key={index} className="text-sm px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-mono text-xs tracking-widest uppercase text-[var(--color-warn)] mb-3">
                  Missing Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {results.missingSkills.map((skill, index) => (
                    <span key={index} className="text-sm px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {results.weakBullets.length > 0 && (
              <div className="mb-10">
                <h3 className="font-mono text-xs tracking-widest uppercase text-gray-400 mb-3">
                  Weak Bullet Points
                </h3>
                <div className="space-y-3">
                  {results.weakBullets.map((bullet, index) => (
                    <div key={index} className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <p className="text-sm font-medium mb-1">{bullet.original}</p>
                      <p className="text-sm text-gray-500">{bullet.suggestion}</p>

                      {rewrites[index] ? (
                        <p className="text-sm text-[var(--color-good)] font-medium mt-2 pt-2 border-t border-gray-200">
                          ✓ {rewrites[index]}
                        </p>
                      ) : (
                        <button
                          onClick={() => handleRewrite(bullet.original, index)}
                          className="text-xs font-mono text-[var(--color-signal)] mt-2 hover:underline"
                        >
                          Rewrite this bullet →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center">
              <button
                onClick={() => navigate('/interview', { state: { resumeText, jdText } })}
                className="bg-[var(--color-warn)] text-white font-mono text-sm tracking-wide px-6 py-2.5 rounded-lg hover:opacity-90 transition"
              >
                Get Interview Questions →
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

export default CheckResumePage