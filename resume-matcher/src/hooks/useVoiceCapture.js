// src/hooks/useVoiceCapture.js
import { useState, useRef, useCallback } from 'react'

const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'so yeah']

export function useVoiceCapture() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [deliveryStats, setDeliveryStats] = useState(null)
  const [supported, setSupported] = useState(true)

  const recognitionRef = useRef(null)
  const startTimeRef = useRef(null)
  const lastWordTimeRef = useRef(null)
  const pausesRef = useRef([])
  const wordCountRef = useRef(0)

  const startRecording = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    startTimeRef.current = Date.now()
    lastWordTimeRef.current = Date.now()
    pausesRef.current = []
    wordCountRef.current = 0
    setTranscript('')
    setDeliveryStats(null)

    recognition.onresult = (event) => {
      let fullText = ''
      for (let i = 0; i < event.results.length; i++) {
        fullText += event.results[i][0].transcript + ' '
      }
      const now = Date.now()
      const gap = now - lastWordTimeRef.current
      if (gap > 1500) {
        pausesRef.current.push(gap)
      }
      lastWordTimeRef.current = now
      wordCountRef.current = fullText.trim().split(/\s+/).length

      setTranscript(fullText.trim())
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
    }

    recognition.start()
    recognitionRef.current = recognition
    setIsRecording(true)
  }, [])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsRecording(false)

    const durationSeconds = (Date.now() - startTimeRef.current) / 1000
    const durationMinutes = durationSeconds / 60
    const wpm = durationMinutes > 0 ? Math.round(wordCountRef.current / durationMinutes) : 0

    const lowerTranscript = transcript.toLowerCase()
    const fillerCount = FILLER_WORDS.reduce((count, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      const matches = lowerTranscript.match(regex)
      return count + (matches ? matches.length : 0)
    }, 0)

    setDeliveryStats({
      wordsPerMinute: wpm,
      fillerWordCount: fillerCount,
      longPauseCount: pausesRef.current.length,
      durationSeconds: Math.round(durationSeconds),
    })
  }, [transcript])

  return {
    isRecording,
    transcript,
    setTranscript,
    deliveryStats,
    supported,
    startRecording,
    stopRecording,
  }
}