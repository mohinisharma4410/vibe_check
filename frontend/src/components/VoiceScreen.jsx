import React, { useState, useRef, useEffect } from 'react'

export default function VoiceScreen({ update, nextStep }) {
  const [phase, setPhase] = useState('idle') // idle | recording | done | error | unsupported
  const [transcript, setTranscript] = useState('')
  const [seconds, setSeconds] = useState(0)
  const recognitionRef = useRef(null)
  const timerRef = useRef(null)
  const transcriptRef = useRef('')

  const supported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  useEffect(() => {
    if (!supported) setPhase('unsupported')
    return () => {
      clearInterval(timerRef.current)
      recognitionRef.current?.abort()
    }
  }, [])

  function startRecording() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SR()
    rec.continuous = true
    rec.interimResults = false
    rec.lang = 'en-IN'
    transcriptRef.current = ''

    rec.onresult = e => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcriptRef.current += e.results[i][0].transcript + ' '
      }
      setTranscript(transcriptRef.current.trim())
    }
    rec.onerror = () => stopRecording()
    rec.onend = () => { if (phase === 'recording') stopRecording() }

    recognitionRef.current = rec
    rec.start()
    setSeconds(0)
    setPhase('recording')

    timerRef.current = setInterval(() => {
      setSeconds(s => {
        if (s >= 29) { stopRecording(); return 30 }
        return s + 1
      })
    }, 1000)
  }

  function stopRecording() {
    clearInterval(timerRef.current)
    recognitionRef.current?.stop()
    const final = transcriptRef.current.trim() || null
    update({ voice_transcript: final })
    setPhase('done')
  }

  const arcPct = Math.min(seconds / 30, 1)
  const r = 58
  const circ = 2 * Math.PI * r
  const dashoffset = circ * (1 - arcPct)

  return (
    <div className="screen" style={{ paddingTop: 72 }}>
      <div className="step-label">Voice Note</div>
      <h1 className="screen-title fade-up">Say it<br /><em>out loud.</em></h1>
      <p className="screen-sub" style={{ margin: '8px 0 24px' }}>
        Record up to 30s. Your voice is deleted instantly — only the words reach the owner.
      </p>

      {phase === 'unsupported' ? (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 16, textAlign: 'center',
        }}>
          <span style={{ fontSize: 40 }}>🎙️</span>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Voice input isn't supported in this browser. Try Chrome or Safari.
          </p>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {/* Ring timer */}
          <div style={{ width: 140, height: 140, position: 'relative', marginBottom: 20 }}>
            <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="70" cy="70" r={r} fill="none" stroke="var(--cream3)" strokeWidth="3" />
              <circle
                cx="70" cy="70" r={r} fill="none"
                stroke={phase === 'recording' ? '#d64c3b' : 'var(--mocha)'}
                strokeWidth="3"
                strokeDasharray={circ}
                strokeDashoffset={dashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <button
              onClick={phase === 'recording' ? stopRecording : startRecording}
              disabled={phase === 'done'}
              style={{
                position: 'absolute', inset: 0, margin: 'auto',
                width: 86, height: 86, borderRadius: '50%', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26,
                background: phase === 'recording' ? '#d64c3b'
                  : phase === 'done' ? 'var(--mocha)'
                  : 'var(--brown-dark)',
                color: 'var(--latte)',
                cursor: phase === 'done' ? 'default' : 'pointer',
                transition: 'background 0.2s',
              }}
            >
              {phase === 'recording' ? '⏹' : phase === 'done' ? '✓' : '🎙️'}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            {phase === 'idle' && (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Tap to start recording</p>
            )}
            {phase === 'recording' && (
              <div>
                <p style={{ color: '#d64c3b', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                  Recording… {seconds}s / 30s
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
                  Tap the square to stop
                </p>
              </div>
            )}
            {phase === 'done' && (
              <p style={{ color: 'var(--mocha)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                🔒 Voice deleted. Words kept.
              </p>
            )}
            {phase === 'error' && (
              <p style={{ color: '#d64c3b', fontSize: 13 }}>Couldn't access mic. Skip or retry.</p>
            )}
          </div>

          {transcript && (
            <div style={{
              background: 'var(--cream2)',
              borderRadius: 14,
              padding: '14px 16px',
              width: '100%',
              animation: 'fadeUp 0.3s both',
            }}>
              <div style={{
                fontSize: 10,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: 6,
                fontWeight: 500,
              }}>
                What we heard
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-main)', lineHeight: 1.6, fontStyle: 'italic' }}>
                "{transcript}"
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn-primary" onClick={nextStep}>
          {phase === 'done' && transcript ? 'Looks right → Next' : 'Next →'}
        </button>
        <button className="btn-secondary" onClick={nextStep}>Skip this step</button>
      </div>
    </div>
  )
}