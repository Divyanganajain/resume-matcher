import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function formatResumeAsText(resumeData) {
  const lines = []
  lines.push(resumeData.contactInfo.name)
  lines.push(resumeData.title)
  lines.push([resumeData.contactInfo.email, resumeData.contactInfo.phone, resumeData.contactInfo.linkedin, resumeData.contactInfo.location].filter(Boolean).join(' | '))
  lines.push('')
  lines.push('SUMMARY')
  lines.push(resumeData.summary)
  lines.push('')

  if (resumeData.experience?.length > 0) {
    lines.push('EXPERIENCE')
    resumeData.experience.forEach(exp => {
      lines.push(`${exp.role} — ${exp.company} (${exp.dates})`)
      exp.bullets.forEach(b => lines.push(`- ${b}`))
    })
    lines.push('')
  }

  lines.push('SKILLS')
  const allSkills = [...(resumeData.skills?.column1 || []), ...(resumeData.skills?.column2 || []), ...(resumeData.skills?.column3 || [])]
  lines.push(allSkills.join(', '))
  lines.push('')

  if (resumeData.projects?.length > 0) {
    lines.push('PROJECTS')
    resumeData.projects.forEach(p => {
      lines.push(`${p.name}: ${p.description}`)
      p.bullets.forEach(b => lines.push(`- ${b}`))
    })
    lines.push('')
  }

  if (resumeData.education?.length > 0) {
    lines.push('EDUCATION')
    resumeData.education.forEach(e => lines.push(`${e.degree} — ${e.institution} (${e.dates})`))
    lines.push('')
  }

  if (resumeData.strengths?.length > 0) {
    lines.push('STRENGTHS')
    lines.push(resumeData.strengths.join(', '))
    lines.push('')
  }

  if (resumeData.certificates?.length > 0) {
    lines.push('CERTIFICATES')
    resumeData.certificates.forEach(c => lines.push(`- ${c}`))
  }

  return lines.join('\n')
}

function BuildResumePage() {
  const [rawInfo, setRawInfo] = useState('')
  const [jdText, setJdText] = useState('')
  const [contactInfo, setContactInfo] = useState({ name: '', email: '', phone: '', linkedin: '', location: '' })
  const [resumeData, setResumeData] = useState(null)
  const [building, setBuilding] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleContactChange(field, value) {
    setContactInfo(prev => ({ ...prev, [field]: value }))
  }

  async function handleBuildResume() {
    if (!contactInfo.name || !contactInfo.email) {
      setError('Name and email are required')
      return
    }

    setBuilding(true)
    setResumeData(null)
    setError('')

    try {
      const response = await fetch('https://resume-matcher-backend-d5q4.onrender.com/api/build-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawInfo, jdText, contactInfo })
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Server error')
      }

      const data = await response.json()
      setResumeData(data)
    } catch (err) {
      console.error('Build resume error:', err)
      setError('Something went wrong building your resume. Please try again.')
    }

    setBuilding(false)
  }
  async function handleDownloadPdf() {
  try {
    const response = await fetch('https://resume-matcher-backend-d5q4.onrender.com/api/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resumeData)
    })

    if (!response.ok) throw new Error('Failed to generate PDF')

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${resumeData.contactInfo.name.replace(/\s+/g, '_')}_Resume.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Download PDF error:', err)
    setError('Failed to download PDF. Please try again.')
  }
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
            Build a Resume
          </h1>
          <p className="text-sm text-gray-500 mt-3">
            Paste rough, unorganized info about yourself, plus a target job description, and get an ATS-optimized resume draft.
          </p>
        </div>

        {/* Contact fields */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Full Name *"
            value={contactInfo.name}
            onChange={(e) => handleContactChange('name', e.target.value)}
            className="p-3 rounded-lg border border-gray-200 bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)]"
          />
          <input
            type="email"
            placeholder="Email *"
            value={contactInfo.email}
            onChange={(e) => handleContactChange('email', e.target.value)}
            className="p-3 rounded-lg border border-gray-200 bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)]"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={contactInfo.phone}
            onChange={(e) => handleContactChange('phone', e.target.value)}
            className="p-3 rounded-lg border border-gray-200 bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)]"
          />
          <input
            type="text"
            placeholder="LinkedIn URL"
            value={contactInfo.linkedin}
            onChange={(e) => handleContactChange('linkedin', e.target.value)}
            className="p-3 rounded-lg border border-gray-200 bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)]"
          />
          <input
            type="text"
            placeholder="Location (e.g. Greater Noida, India)"
            value={contactInfo.location}
            onChange={(e) => handleContactChange('location', e.target.value)}
            className="p-3 rounded-lg border border-gray-200 bg-white font-mono text-sm sm:col-span-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)]"
          />
        </div>

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

        {error && (
          <p className="text-center text-sm text-red-500 mb-6">{error}</p>
        )}

        <div className="text-center mb-12">
          <button
            onClick={handleBuildResume}
            disabled={building}
            className="bg-[var(--color-ink)] text-white font-mono text-sm tracking-wide px-8 py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {building ? 'Building...' : 'Build Resume'}
          </button>
        </div>

        {resumeData && (
          <div className="border-t border-gray-200 pt-10">
            <h3 className="font-mono text-xs tracking-widest uppercase text-gray-400 mb-3">
              Your Draft Resume
            </h3>

            <div className="p-6 rounded-lg bg-white border border-gray-200 space-y-6">
              <div>
                <h2 className="text-xl font-bold">{resumeData.contactInfo.name}</h2>
                <p className="text-gray-600">{resumeData.title}</p>
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  {[resumeData.contactInfo.email, resumeData.contactInfo.phone, resumeData.contactInfo.linkedin, resumeData.contactInfo.location].filter(Boolean).join(' • ')}
                </p>
              </div>

              <div>
                <h3 className="font-mono text-xs uppercase tracking-widest text-gray-400 border-b pb-1 mb-2">Summary</h3>
                <p className="text-sm">{resumeData.summary}</p>
              </div>

              {resumeData.experience?.length > 0 && (
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-widest text-gray-400 border-b pb-1 mb-2">Experience</h3>
                  {resumeData.experience.map((exp, i) => (
                    <div key={i} className="mb-3">
                      <p className="text-sm font-medium">{exp.role} — {exp.company} <span className="text-gray-500 font-normal">({exp.dates})</span></p>
                      <ul className="list-disc list-inside text-sm text-gray-700">
                        {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <h3 className="font-mono text-xs uppercase tracking-widest text-gray-400 border-b pb-1 mb-2">Skills</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <ul>{resumeData.skills?.column1?.map((s, i) => <li key={i}>{s}</li>)}</ul>
                  <ul>{resumeData.skills?.column2?.map((s, i) => <li key={i}>{s}</li>)}</ul>
                  <ul>{resumeData.skills?.column3?.map((s, i) => <li key={i}>{s}</li>)}</ul>
                </div>
              </div>

             {resumeData.projects?.length > 0 && (
  <div>
    <h3 className="font-mono text-xs uppercase tracking-widest text-gray-400 border-b pb-1 mb-2">Projects</h3>
    {resumeData.projects.map((p, i) => (
      <div key={i} className="mb-3">
        <div className="flex justify-between text-sm">
          <p className="font-medium">{p.name}{p.role ? ` — ${p.role}` : ''}</p>
          {p.dates && <p className="text-gray-500">{p.dates}</p>}
        </div>
        <p className="text-sm text-gray-600">{p.description}</p>
        {p.techStack?.length > 0 && (
          <p className="text-xs text-gray-400 mt-1">{p.techStack.join(' · ')}</p>
        )}
      </div>
    ))}
  </div>
)}

              {resumeData.education?.length > 0 && (
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-widest text-gray-400 border-b pb-1 mb-2">Education</h3>
                  {resumeData.education.map((e, i) => (
                    <p key={i} className="text-sm">{e.degree} — {e.institution} ({e.dates})</p>
                  ))}
                </div>
              )}
{resumeData.strengths?.length > 0 && (
  <div>
    <h3 className="font-mono text-xs uppercase tracking-widest text-gray-400 border-b pb-1 mb-2">Strengths</h3>
    {resumeData.strengths.map((s, i) => (
      <p key={i} className="text-sm mb-1"><span className="font-medium">{s.title}:</span> {s.description}</p>
    ))}
  </div>
)}{resumeData.certificates?.length > 0 && (
  <div>
    <h3 className="font-mono text-xs uppercase tracking-widest text-gray-400 border-b pb-1 mb-2">Certificates</h3>
    {resumeData.certificates.map((c, i) => (
      <p key={i} className="text-sm"><span className="font-medium">{c.title}</span> — {c.issuer}</p>
    ))}
  </div>
)}
            </div>

           <div className="text-center mt-6 flex justify-center gap-3">
  <button
    onClick={() => navigate('/check', { state: { resumeText: formatResumeAsText(resumeData), jdText } })}
    className="bg-[var(--color-ink)] text-white font-mono text-sm tracking-wide px-6 py-2.5 rounded-lg hover:opacity-90 transition"
  >
    Check This Resume's ATS Score →
  </button>
  <button
    onClick={handleDownloadPdf}
    className="bg-[var(--color-signal)] text-white font-mono text-sm tracking-wide px-6 py-2.5 rounded-lg hover:opacity-90 transition"
  >
    Download PDF
  </button>
</div>
          </div>
        )}

      </div>
    </div>
  )
}

export default BuildResumePage