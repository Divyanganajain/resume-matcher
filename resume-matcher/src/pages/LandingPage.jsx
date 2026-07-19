import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'

function MagnifyingGlass() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <circle cx="24" cy="24" r="16" fill="var(--color-signal)" fillOpacity="0.08" />
      <circle cx="24" cy="24" r="16" stroke="var(--color-signal)" strokeWidth="3" />
      <line x1="35" y1="35" x2="48" y2="48" stroke="var(--color-signal)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

function Checkmark() {
  return (
    <motion.svg
      width="14" height="14" viewBox="0 0 14 14" fill="none"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="absolute -right-5 top-1/2 -translate-y-1/2"
    >
      <circle cx="7" cy="7" r="7" fill="var(--color-good)" />
      <path d="M4 7L6 9L10 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  )
}

function LandingPage() {
  const lines = [
    { width: 'w-1/2', color: 'bg-[var(--color-signal)]', delay: 1.3 },
    { width: 'w-full', color: 'bg-gray-200', delay: 1.55 },
    { width: 'w-5/6', color: 'bg-gray-200', delay: 1.8 },
    { width: 'w-full', color: 'bg-gray-200', delay: 2.05 },
    { width: 'w-1/3', color: 'bg-[var(--color-good)]', delay: 2.3 },
    { width: 'w-full', color: 'bg-gray-200', delay: 2.55 },
    { width: 'w-4/5', color: 'bg-gray-200', delay: 2.8 },
    { width: 'w-1/3', color: 'bg-[var(--color-warn)]', delay: 3.05 },
    { width: 'w-full', color: 'bg-gray-200', delay: 3.3 },
  ]

  const howItWorks = [
    { n: '01', title: 'Build', desc: 'Give it your raw background — it writes a structured, ATS-optimized draft.', to: '/build' },
    { n: '02', title: 'Check', desc: 'Paste a job description. Get your ATS score, missing skills, and weak bullets.', to: '/check' },
    { n: '03', title: 'Interview', desc: 'Get tailored interview questions based on your resume and the role.', to: '/interview' },
  ]

  const features = [
    { title: 'Keyword scanning', desc: 'See exactly which skills the JD wants and which ones your resume is missing.' },
    { title: 'Bullet rewrites', desc: 'Weak, vague bullets get flagged and rewritten with stronger action verbs and real impact.' },
    { title: 'PDF upload', desc: 'Already have a resume? Upload the PDF directly instead of retyping everything.' },
    { title: 'Styled PDF export', desc: 'Download a clean, ATS-friendly resume the moment it\'s built.' },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] overflow-hidden bg-paper-texture">

      <Navbar />

      <div className="px-6 pt-10 pb-6">
        <div className="max-w-4xl mx-auto text-center">

          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-mono text-xs tracking-widest uppercase text-[var(--color-signal)] mb-2"
          >
            Resume Diagnostic
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl tracking-tight mb-4"
            style={{ fontFamily: 'Lora, serif', fontWeight: 600 }}
          >
            Resume Matcher
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-500 mb-16"
          >
            Build a new resume from scratch, or check how your existing one stacks up.
          </motion.p>

          {/* Resume graphic with magnifying glass */}
          <div className="relative w-full max-w-lg mx-auto mb-16 h-96">

            <div
              className="absolute inset-0 -z-10"
              style={{
                background: 'radial-gradient(ellipse 60% 50% at 50% 40%, var(--color-signal) 0%, transparent 70%)',
                opacity: 0.06,
              }}
            />

            <motion.div
              initial={{ opacity: 0, x: -20, rotate: -6 }}
              animate={{ opacity: 0.5, x: 0, rotate: -8 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="absolute -top-4 -left-6 w-24 h-32 bg-gray-100 border border-gray-200 rounded"
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20, rotate: 8 }}
              animate={{ opacity: 0.6, x: 0, rotate: 10 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="absolute -top-6 -right-8 w-28 h-20 bg-gray-200 rounded-lg"
            >
              <div className="grid grid-cols-6 gap-1 p-3">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-gray-300 rounded-sm"></div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.7, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute bottom-2 -left-10 w-1 h-24 bg-[var(--color-warn)] rounded-full origin-bottom"
              style={{ rotate: '35deg' }}
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.5, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="absolute -bottom-4 -right-6 w-14 h-14 bg-gray-200 rounded-full border-4 border-gray-100"
            ></motion.div>

            {/* Resume card */}
            <motion.div
              initial={{ x: -200, opacity: 0, rotate: -8 }}
              animate={{ x: 0, opacity: 1, rotate: -3 }}
              transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }}
              className="absolute inset-0 bg-white border border-gray-200 rounded-lg shadow-lg p-6 text-left z-10"
            >
              {lines.map((line, i) => (
                <div key={i} className="relative mb-3">
                  <div className={`${line.width} h-2.5 ${line.color} rounded ${line.color.includes('gray') ? '' : 'opacity-70'}`}></div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.6, delay: line.delay }}
                    className="absolute inset-0 -mx-2 -my-1 rounded"
                    style={{ background: 'radial-gradient(ellipse, var(--color-signal) 0%, transparent 70%)', opacity: 0.15 }}
                  ></motion.div>
                  {!line.color.includes('gray') && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: line.delay + 0.2 }}
                    >
                      <Checkmark />
                    </motion.div>
                  )}
                </div>
              ))}
            </motion.div>

            {/* ATS Score stamp */}
            <motion.div
              initial={{ opacity: 0, scale: 1.5, rotate: -25 }}
              animate={{ opacity: 1, scale: 1, rotate: -10 }}
              transition={{ duration: 0.45, delay: 3.4, type: 'spring', stiffness: 260, damping: 16 }}
              className="absolute -right-3 -top-3 z-30 w-[72px] h-[72px] rounded-full border-[3px] border-[var(--color-signal)] bg-white flex flex-col items-center justify-center shadow-md"
            >
              <span className="font-mono text-[8px] tracking-widest text-[var(--color-signal)]">ATS SCORE</span>
              <span className="font-mono text-xl font-bold leading-none text-[var(--color-signal)]">87</span>
            </motion.div>

            {/* Magnifying glass */}
            <motion.div
              initial={{ x: -80, y: -40, opacity: 0 }}
              animate={{
                x: [null, 60, 90, 110, 40, 130, 100, 90, 60],
                y: [null, 10, 35, 60, 85, 110, 135, 160, 185],
                opacity: [null, 1, 1, 1, 1, 1, 1, 1, 0]
              }}
              transition={{ duration: 2.3, delay: 1.2, ease: 'easeInOut' }}
              className="absolute z-20"
            >
              <MagnifyingGlass />
            </motion.div>

          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 3.6 }}
            className="grid md:grid-cols-3 gap-6"
          >
            <Link to="/build">
              <motion.div
                whileHover={{ scale: 1.03, rotateX: 4, rotateY: -4 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="flex flex-col justify-between min-h-[180px] p-8 rounded-lg border border-gray-200 bg-white hover:border-[var(--color-signal)] hover:shadow-md transition-all text-left"
              >
                <div>
                  <h2 className="font-mono text-sm uppercase tracking-wide text-[var(--color-signal)] mb-2">
                    Build a Resume
                  </h2>
                  <p className="text-sm text-gray-500">
                    Paste your raw experience and a job description — get an ATS-optimized resume draft.
                  </p>
                </div>
              </motion.div>
            </Link>

            <Link to="/check">
              <motion.div
                whileHover={{ scale: 1.03, rotateX: 4, rotateY: 4 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="flex flex-col justify-between min-h-[180px] p-8 rounded-lg border border-gray-200 bg-white hover:border-[var(--color-good)] hover:shadow-md transition-all text-left"
              >
                <div>
                  <h2 className="font-mono text-sm uppercase tracking-wide text-[var(--color-good)] mb-2">
                    Check My Resume
                  </h2>
                  <p className="text-sm text-gray-500">
                    Upload or paste your resume, compare it against a job description, and get your ATS score.
                  </p>
                </div>
              </motion.div>
            </Link>

            <Link to="/interview">
              <motion.div
                whileHover={{ scale: 1.03, rotateX: 4, rotateY: -4 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="flex flex-col justify-between min-h-[180px] p-8 rounded-lg border border-gray-200 bg-white hover:border-[var(--color-warn)] hover:shadow-md transition-all text-left"
              >
                <div>
                  <h2 className="font-mono text-sm uppercase tracking-wide text-[var(--color-warn)] mb-2">
                    Interview Questions
                  </h2>
                  <p className="text-sm text-gray-500">
                    Get likely interview questions based on your resume and target role.
                  </p>
                </div>
              </motion.div>
            </Link>
          </motion.div>

        </div>
      </div>

      {/* How it works */}
      <div className="max-w-3xl mx-auto px-6 py-20 border-t border-gray-200 mt-12">
        <p className="font-mono text-xs tracking-widest uppercase text-[var(--color-signal)] mb-3 text-center">
          The process
        </p>
        <h2 className="text-3xl text-center mb-14" style={{ fontFamily: 'Lora, serif', fontWeight: 600 }}>
          Three steps, in order.
        </h2>

        <div className="grid md:grid-cols-3 gap-10 relative">
          <div className="hidden md:block absolute top-3 left-[16.5%] right-[16.5%] h-px bg-gray-200" />
          {howItWorks.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative"
            >
              <Link to={step.to} className="block group">
                <div className="w-6 h-6 rounded-full bg-[var(--color-paper)] border-2 border-gray-300 group-hover:border-[var(--color-signal)] flex items-center justify-center mb-4 font-mono text-[10px] text-gray-500 group-hover:text-[var(--color-signal)] transition relative z-10">
                  {i + 1}
                </div>
                <h3 className="font-semibold mb-1.5">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-3xl mx-auto px-6 py-20 border-t border-gray-200">
        <h2 className="text-3xl mb-12" style={{ fontFamily: 'Lora, serif', fontWeight: 600 }}>
          Everything a resume review actually needs.
        </h2>
        <div className="grid md:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="p-6 rounded-lg border border-gray-200 bg-white hover:shadow-sm transition"
            >
              <h3 className="font-semibold text-sm mb-1.5">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-gray-500">
          <p>Resume Matcher — built by a CS student at Bennett University.</p>
          <div className="flex gap-6">
            <Link to="/build" className="hover:text-[var(--color-ink)] transition">Build</Link>
            <Link to="/check" className="hover:text-[var(--color-ink)] transition">Check</Link>
            <Link to="/interview" className="hover:text-[var(--color-ink)] transition">Interview</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default LandingPage