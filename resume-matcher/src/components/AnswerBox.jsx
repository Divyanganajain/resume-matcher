import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVoiceCapture } from '../hooks/useVoiceCapture'

const API_BASE = 'https://resume-matcher-backend-d5q4.onrender.com'

function DeliveryStat({ label, value, tone }) {
  const colors = {
    good: 'text-[var(--color-good)]',
    warn: 'text-[var(--color-warn)]',
    neutral: 'text-gray-500',
  }
  return (
    <div className="text-center">
      <div className={`font-mono text-lg font-bold ${colors[tone]}`}>{value}</div>
      <div className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">{label}</div>
    </div>
  )
}

function paceLabel(wpm) {
  if (wpm === 0) return { text: '—', tone: 'neutral' }
  if (wpm < 110) return { text: 'Slow', tone: 'warn' }
  if (wpm > 170) return { text: 'Fast', tone: 'warn' }
  return { text: 'Good', tone: 'good' }
}

export default function AnswerBox({ question, resumeText, jdText }) {
  const {
    isRecording, transcript, setTranscript, deliveryStats,
    supported, startRecording, stopRecording,
  } = useVoiceCapture()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    setFeedback(null)
    setError('')
  }, [question])

  async function handleSubmit() {
    if (!transcript.trim()) return
    setLoading(true)
    setError('')
    setFeedback(null)
    try {
      const res = await fetch(`${API_BASE}/api/interview/evaluate-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, userAnswer: transcript, resumeText, jdText }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to evaluate answer')
      setFeedback(data)
    } catch (err) {
      setError(err.message || 'Something went wrong evaluating your answer.')
    }
    setLoading(false)
  }

  const pace = deliveryStats ? paceLabel(deliveryStats.wordsPerMinute) : null

  return (
    <div className="mt-4">
      <div className="relative">
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Speak your answer for better practice, or type it here..."
          className="w-full h-32 p-4 pr-14 rounded-xl border border-gray-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)] shadow-sm transition"
        />
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!supported}
          title={supported ? (isRecording ? 'Stop recording' : 'Answer by voice') : 'Voice input not supported in this browser'}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition ${
            isRecording
              ? 'bg-[var(--color-warn)] text-white'
              : 'bg-[var(--color-paper)] border border-gray-300 text-gray-500 hover:border-[var(--color-signal)] hover:text-[var(--color-signal)]'
          }`}
        >
          {isRecording ? (
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-2.5 h-2.5 rounded-full bg-white"
            />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
            </svg>
          )}
        </motion.button>
      </div>

      {isRecording && (
        <p className="font-mono text-[11px] text-[var(--color-warn)] mt-1.5 flex items-center gap-1.5">
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="w-1.5 h-1.5 rounded-full bg-[var(--color-warn)]"
          />
          Listening...
        </p>
      )}

      <div className="flex justify-end mt-2">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={loading || !transcript.trim()}
          className="bg-[var(--color-ink)] text-white font-mono text-xs tracking-wide px-5 py-2 rounded-full hover:opacity-90 transition disabled:opacity-40"
        >
          {loading ? 'Evaluating...' : 'Submit Answer'}
        </motion.button>
      </div>

      {error && <p className="text-sm text-[var(--color-signal)] mt-2">{error}</p>}

      <AnimatePresence>
        {deliveryStats && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-around p-4 mt-4 rounded-xl bg-white border border-gray-200 shadow-sm"
          >
            <DeliveryStat label="Pace" value={`${deliveryStats.wordsPerMinute} wpm — ${pace.text}`} tone={pace.tone} />
            <DeliveryStat
              label="Filler Words"
              value={deliveryStats.fillerWordCount}
              tone={deliveryStats.fillerWordCount > 4 ? 'warn' : 'good'}
            />
            <DeliveryStat
              label="Long Pauses"
              value={deliveryStats.longPauseCount}
              tone={deliveryStats.longPauseCount > 2 ? 'warn' : 'good'}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-5 rounded-xl bg-white border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-mono text-xs tracking-widest uppercase text-gray-400">Feedback</h4>
              <span className="font-mono text-lg font-bold text-[var(--color-signal)]">{feedback.score}/10</span>
            </div>
            <p className="text-sm mb-4">{feedback.verdict}</p>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <h5 className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-good)] mb-2">Strengths</h5>
                <ul className="space-y-1 text-sm">
                  {feedback.strengths.map((s, i) => (
                    <li key={i} className="flex gap-1.5"><span className="text-[var(--color-good)]">+</span>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-warn)] mb-2">Gaps</h5>
                <ul className="space-y-1 text-sm">
                  {feedback.gaps.map((g, i) => (
                    <li key={i} className="flex gap-1.5"><span className="text-[var(--color-warn)]">–</span>{g}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <h5 className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-2">A Stronger Version</h5>
              <p className="text-sm leading-relaxed italic" style={{ fontFamily: 'Lora, serif' }}>{feedback.improvedAnswer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}