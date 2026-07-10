import { Link } from 'react-router-dom'

function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] px-6 py-16">
      <div className="max-w-3xl mx-auto text-center">

        <p className="font-mono text-xs tracking-widest uppercase text-[var(--color-signal)] mb-2">
          Resume Diagnostic
        </p>
        <h1 className="text-4xl font-semibold tracking-tight mb-4">
          Resume Matcher
        </h1>
        <p className="text-gray-500 mb-12">
          Build a new resume from scratch, or check how your existing one stacks up.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            to="/build"
            className="block p-8 rounded-lg border border-gray-200 bg-white hover:border-[var(--color-signal)] transition text-left"
          >
            <h2 className="font-mono text-sm uppercase tracking-wide text-[var(--color-signal)] mb-2">
              Build a Resume
            </h2>
            <p className="text-sm text-gray-500">
              Paste your raw experience and a job description — get an ATS-optimized resume draft.
            </p>
          </Link>

          <Link
            to="/check"
            className="block p-8 rounded-lg border border-gray-200 bg-white hover:border-[var(--color-signal)] transition text-left"
          >
            <h2 className="font-mono text-sm uppercase tracking-wide text-[var(--color-good)] mb-2">
              Check My Resume
            </h2>
            <p className="text-sm text-gray-500">
              Upload or paste your resume, compare it against a job description, and get your ATS score.
            </p>
          </Link>
        </div>

      </div>
    </div>
  )
}

export default LandingPage