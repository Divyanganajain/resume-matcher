import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'

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
      exp.bullets?.forEach(b => lines.push(`- ${b}`))
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
      lines.push(`${p.name}${p.role ? ' — ' + p.role : ''}: ${p.description}`)
      if (p.techStack?.length > 0) lines.push(`Tech: ${p.techStack.join(', ')}`)
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
    resumeData.strengths.forEach(s => lines.push(`${s.title}: ${s.description}`))
    lines.push('')
  }

  if (resumeData.certificates?.length > 0) {
    lines.push('CERTIFICATES')
    resumeData.certificates.forEach(c => lines.push(`- ${c.title} (${c.issuer})`))
  }

  return lines.join('\n')
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
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

  const inputClass = "p-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)] focus:border-transparent transition"

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
          <h1 className="text-5xl mb-4" style={{ fontFamily: 'Lora, serif', fontWeight: 600 }}>
            Build a Resume
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Paste rough, unorganized info about yourself, plus a target job description, and get an ATS-optimized resume draft.
          </p>
        </motion.div>

        <motion.div
          initial="hidden" animate="show" custom={1} variants={fadeUp}
          className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
        >
          <input type="text" placeholder="Full Name *" value={contactInfo.name} onChange={(e) => handleContactChange('name', e.target.value)} className={inputClass} />
          <input type="email" placeholder="Email *" value={contactInfo.email} onChange={(e) => handleContactChange('email', e.target.value)} className={inputClass} />
          <input type="tel" placeholder="Phone" value={contactInfo.phone} onChange={(e) => handleContactChange('phone', e.target.value)} className={inputClass} />
          <input type="text" placeholder="LinkedIn URL" value={contactInfo.linkedin} onChange={(e) => handleContactChange('linkedin', e.target.value)} className={inputClass} />
          <input type="text" placeholder="Location" value={contactInfo.location} onChange={(e) => handleContactChange('location', e.target.value)} className={`${inputClass} sm:col-span-2`} />
        </motion.div>

        <motion.div initial="hidden" animate="show" custom={2} variants={fadeUp} className="mb-6">
          <label className="font-mono text-xs text-gray-400 uppercase tracking-wide mb-2 block">Your Background</label>
          <textarea
            placeholder="e.g. 2nd year CS student, built a React + Node app, know Java and MongoDB..."
            value={rawInfo}
            onChange={(e) => setRawInfo(e.target.value)}
            className="h-40 w-full p-4 rounded-xl border border-gray-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)] shadow-sm transition"
          ></textarea>
        </motion.div>

        <motion.div initial="hidden" animate="show" custom={3} variants={fadeUp} className="mb-6">
          <label className="font-mono text-xs text-gray-400 uppercase tracking-wide mb-2 block">Target Job Description (optional)</label>
          <textarea
            placeholder="Paste the job description you're targeting, for a tailored resume"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            className="h-40 w-full p-4 rounded-xl border border-gray-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)] shadow-sm transition"
          ></textarea>
        </motion.div>

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-[var(--color-signal)] mb-6">
            {error}
          </motion.p>
        )}

        <motion.div initial="hidden" animate="show" custom={4} variants={fadeUp} className="text-center mb-12">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBuildResume}
            disabled={building}
            className="bg-[var(--color-ink)] text-white font-mono text-sm tracking-wide px-8 py-3 rounded-full hover:opacity-90 transition disabled:opacity-50"
          >
            {building ? 'Building...' : 'Build Resume'}
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {resumeData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="border-t border-gray-200 pt-10"
            >
              <h3 className="font-mono text-xs tracking-widest uppercase text-gray-400 mb-3">Your Draft Resume</h3>

              <div className="p-8 rounded-xl bg-white border border-gray-200 shadow-md space-y-6">
                <motion.div initial="hidden" animate="show" custom={0} variants={fadeUp}>
                  <h2 className="text-2xl" style={{ fontFamily: 'Lora, serif', fontWeight: 600 }}>{resumeData.contactInfo.name}</h2>
                  <p className="text-gray-600">{resumeData.title}</p>
                  <p className="text-xs text-gray-500 mt-1 font-mono">
                    {[resumeData.contactInfo.email, resumeData.contactInfo.phone, resumeData.contactInfo.linkedin, resumeData.contactInfo.location].filter(Boolean).join(' • ')}
                  </p>
                </motion.div>

                <motion.div initial="hidden" animate="show" custom={1} variants={fadeUp}>
                  <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--color-signal)] border-b border-gray-200 pb-1 mb-2">Summary</h3>
                  <p className="text-sm text-gray-700">{resumeData.summary}</p>
                </motion.div>

                {resumeData.experience?.length > 0 && (
                  <motion.div initial="hidden" animate="show" custom={2} variants={fadeUp}>
                    <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--color-signal)] border-b border-gray-200 pb-1 mb-2">Experience</h3>
                    {resumeData.experience.map((exp, i) => (
                      <div key={i} className="mb-3">
                        <p className="text-sm font-medium">{exp.role} — {exp.company} <span className="text-gray-500 font-normal">({exp.dates})</span></p>
                        <ul className="list-disc list-inside text-sm text-gray-700">
                          {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
                        </ul>
                      </div>
                    ))}
                  </motion.div>
                )}

                <motion.div initial="hidden" animate="show" custom={3} variants={fadeUp}>
                  <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--color-signal)] border-b border-gray-200 pb-1 mb-2">Skills</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <ul className="space-y-1">{resumeData.skills?.column1?.map((s, i) => <li key={i} className="text-gray-700">{s}</li>)}</ul>
                    <ul className="space-y-1">{resumeData.skills?.column2?.map((s, i) => <li key={i} className="text-gray-700">{s}</li>)}</ul>
                    <ul className="space-y-1">{resumeData.skills?.column3?.map((s, i) => <li key={i} className="text-gray-700">{s}</li>)}</ul>
                  </div>
                </motion.div>

                {resumeData.projects?.length > 0 && (
                  <motion.div initial="hidden" animate="show" custom={4} variants={fadeUp}>
                    <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--color-signal)] border-b border-gray-200 pb-1 mb-2">Projects</h3>
                    {resumeData.projects.map((p, i) => (
                      <div key={i} className="mb-3">
                        <p className="text-sm font-medium">{p.name}{p.role ? ` — ${p.role}` : ''}</p>
                        <p className="text-sm text-gray-500">{p.description}</p>
                        {p.techStack?.length > 0 && <p className="text-xs text-gray-400 mt-1 font-mono">{p.techStack.join(' · ')}</p>}
                      </div>
                    ))}
                  </motion.div>
                )}

                {resumeData.education?.length > 0 && (
                  <motion.div initial="hidden" animate="show" custom={5} variants={fadeUp}>
                    <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--color-signal)] border-b border-gray-200 pb-1 mb-2">Education</h3>
                    {resumeData.education.map((e, i) => (
                      <p key={i} className="text-sm text-gray-700">{e.degree} — {e.institution} ({e.dates})</p>
                    ))}
                  </motion.div>
                )}

                {resumeData.strengths?.length > 0 && (
                  <motion.div initial="hidden" animate="show" custom={6} variants={fadeUp}>
                    <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--color-signal)] border-b border-gray-200 pb-1 mb-2">Strengths</h3>
                    {resumeData.strengths.map((s, i) => (
                      <p key={i} className="text-sm mb-1 text-gray-700"><span className="font-medium text-[var(--color-ink)]">{s.title}:</span> {s.description}</p>
                    ))}
                  </motion.div>
                )}

                {resumeData.certificates?.length > 0 && (
                  <motion.div initial="hidden" animate="show" custom={7} variants={fadeUp}>
                    <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--color-signal)] border-b border-gray-200 pb-1 mb-2">Certificates</h3>
                    {resumeData.certificates.map((c, i) => (
                      <p key={i} className="text-sm text-gray-700"><span className="font-medium">{c.title}</span> — {c.issuer}</p>
                    ))}
                  </motion.div>
                )}
              </div>

              <div className="text-center mt-6 flex justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/check', { state: { resumeText: formatResumeAsText(resumeData), jdText } })}
                  className="bg-[var(--color-ink)] text-white font-mono text-sm tracking-wide px-6 py-2.5 rounded-full hover:opacity-90 transition"
                >
                  Check This Resume's ATS Score →
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownloadPdf}
                  className="border-2 border-[var(--color-signal)] text-[var(--color-signal)] font-mono text-sm tracking-wide px-6 py-2.5 rounded-full hover:bg-[var(--color-signal)] hover:text-white transition"
                >
                  Download PDF
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}

export default BuildResumePage