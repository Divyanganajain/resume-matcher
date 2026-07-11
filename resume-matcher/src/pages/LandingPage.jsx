import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

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

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] px-6 py-16 overflow-hidden">
      <div className="max-w-3xl mx-auto text-center">

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
          className="text-4xl font-semibold tracking-tight mb-4"
        >
          Resume Matcher
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gray-500 mb-12"
        >
          Build a new resume from scratch, or check how your existing one stacks up.
        </motion.p>

        {/* Resume graphic with magnifying glass */}
        <div className="relative w-full max-w-md mx-auto mb-16 h-80">

          {/* Background desk scene elements */}
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

          {/* Magnifying glass */}
          <motion.div
            initial={{ x: -80, y: -40, opacity: 0 }}
            animate={{
              x: [null, 60, 90, 110, 40, 130, 100, 90, 60],
              y: [null, 10, 35, 60, 85, 110, 135, 160, 185],
              opacity: 1
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
              className="block p-8 rounded-lg border border-gray-200 bg-white hover:border-[var(--color-signal)] transition-colors text-left h-full"
            >
              <h2 className="font-mono text-sm uppercase tracking-wide text-[var(--color-signal)] mb-2">
                Build a Resume
              </h2>
              <p className="text-sm text-gray-500">
                Paste your raw experience and a job description — get an ATS-optimized resume draft.
              </p>
            </motion.div>
          </Link>

          <Link to="/check">
            <motion.div
              whileHover={{ scale: 1.03, rotateX: 4, rotateY: 4 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="block p-8 rounded-lg border border-gray-200 bg-white hover:border-[var(--color-good)] transition-colors text-left h-full"
            >
              <h2 className="font-mono text-sm uppercase tracking-wide text-[var(--color-good)] mb-2">
                Check My Resume
              </h2>
              <p className="text-sm text-gray-500">
                Upload or paste your resume, compare it against a job description, and get your ATS score.
              </p>
            </motion.div>
          </Link>
          <Link to="/interview">
  <motion.div
    whileHover={{ scale: 1.03, rotateX: 4, rotateY: -4 }}
    style={{ transformStyle: 'preserve-3d' }}
    className="block p-8 rounded-lg border border-gray-200 bg-white hover:border-[var(--color-warn)] transition-colors text-left h-full"
  >
    <h2 className="font-mono text-sm uppercase tracking-wide text-[var(--color-warn)] mb-2">
      Interview Questions
    </h2>
    <p className="text-sm text-gray-500">
      Get likely interview questions based on your resume and target role.
    </p>
  </motion.div>
</Link>
        </motion.div>

      </div>
    </div>
  )
}

export default LandingPage