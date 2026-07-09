import { useState } from 'react'
import './App.css'

function App() {
  const [resumeText, setResumeText] = useState('')
  const [jdText, setJdText] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [rewrites, setRewrites] = useState({})
  const [uploading, setUploading] = useState(false)

  async function handleAnalyze() {
    setLoading(true)
    setResults(null)

    try {
      const response = await fetch('https://resume-matcher-backend-d5q4.onrender.com/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jdText })
      })

      const data = await response.json()
      setResults(data)
    } catch (err) {
      console.error('Frontend error:', err)
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
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] px-6 py-16">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-12 text-center">
          <p className="font-mono text-xs tracking-widest uppercase text-[var(--color-signal)] mb-2">
            Resume Diagnostic
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Resume Matcher
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
        <div className="text-center mb-12">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-[var(--color-ink)] text-white font-mono text-sm tracking-wide px-8 py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Scanning...' : 'Analyze Match'}
          </button>
        </div>

        {/* Results */}
        {results && (
          <div className="border-t border-gray-200 pt-10">

            {/* ATS Score */}
            <div className="text-center mb-10">
              <p className="font-mono text-xs tracking-widest uppercase text-gray-400 mb-1">
                ATS Score
              </p>
              <p className="font-mono text-6xl font-bold text-[var(--color-signal)]">
                {results.atsScore}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
              {/* Matching Skills */}
              <div>
                <h3 className="font-mono text-xs tracking-widest uppercase text-[var(--color-good)] mb-3">
                  Matching Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {results.matchingSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="text-sm px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              <div>
                <h3 className="font-mono text-xs tracking-widest uppercase text-[var(--color-warn)] mb-3">
                  Missing Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {results.missingSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="text-sm px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Weak Bullets */}
            {results.weakBullets.length > 0 && (
              <div>
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
          </div>
        )}

      </div>
    </div>
  )
}

export default App