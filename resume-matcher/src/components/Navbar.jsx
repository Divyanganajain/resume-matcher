import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[var(--color-paper)]/85 border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full border-2 border-[var(--color-signal)] flex items-center justify-center">
            <span className="font-mono text-[10px] font-bold text-[var(--color-signal)]">RM</span>
          </div>
          <span className="font-semibold text-sm tracking-tight">Resume Matcher</span>
        </Link>
        <div className="flex items-center gap-7 font-mono text-sm font-semibold text-[var(--color-ink)]">
          <Link to="/build" className="hidden sm:inline hover:text-[var(--color-signal)] transition">Build</Link>
          <Link to="/check" className="hidden sm:inline hover:text-[var(--color-signal)] transition">Check</Link>
          <Link to="/interview" className="hidden sm:inline hover:text-[var(--color-signal)] transition">Interview</Link>
          <Link to="/github-analyzer" className="hidden sm:inline hover:text-[var(--color-signal)] transition">GitHub</Link>
          <Link to="/recruiter-scan" className="hidden sm:inline hover:text-[var(--color-signal)] transition">Recruiter Scan</Link>
          <Link
            to="/check"
            className="bg-[var(--color-ink)] text-white px-4 py-1.5 rounded-full hover:opacity-85 transition"
          >
            Try it →
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar