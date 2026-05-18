import React, { useState, useRef } from 'react'

export default function PhotoScreen({ update, nextStep }) {
  const [phase, setPhase] = useState('idle') // idle | preview | analyzing | done | error
  const [preview, setPreview] = useState(null)
  const [feedback, setFeedback] = useState('')
  const inputRef = useRef(null)

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async ev => {
      const dataUrl = ev.target.result
      const base64 = dataUrl.split(',')[1]
      setPreview(dataUrl)
      setPhase('analyzing')
      try {
        const fb = await analyzeWithGemini(base64, file.type || 'image/jpeg')
        setFeedback(fb)
        update({ photo_feedback: fb })
        setPhase('done')
      } catch {
        setPhase('error')
      }
    }
    reader.readAsDataURL(file)
  }

  async function analyzeWithGemini(base64, mimeType) {
    const key = import.meta.env.VITE_GEMINI_API_KEY || ''
    if (!key) return 'Photo captured — AI analysis unavailable without API key.'
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: mimeType, data: base64 } },
              { text: "You are analyzing a photo taken at a café or restaurant. In 1–2 sentences, describe what this photo reveals about the customer's experience — food quality, ambiance, table setup, or mood. Be specific, warm, and useful as feedback for the owner. Don't say 'the image shows' — just describe directly." }
            ]
          }]
        })
      }
    )
    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (!text) throw new Error('No response')
    return text
  }

  function reset() {
    setPhase('idle')
    setPreview(null)
    setFeedback('')
    update({ photo_feedback: null })
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="screen" style={{ paddingTop: 72 }}>
      <div className="step-label">Photo</div>
      <h1 className="screen-title fade-up">Show us<br /><em>the moment.</em></h1>
      <p className="screen-sub" style={{ margin: '8px 0 24px' }}>
        Snap your drink, table, or the vibe — AI reads the context. Photo is never stored.
      </p>

      <div style={{ flex: 1 }}>
        {phase === 'idle' && (
          <div
            onClick={() => inputRef.current?.click()}
            style={{
              border: '2px dashed var(--brown-pale)',
              borderRadius: 18,
              padding: '40px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'rgba(196,149,106,0.04)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--mocha)'
              e.currentTarget.style.background = 'rgba(139,94,60,0.05)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--brown-pale)'
              e.currentTarget.style.background = 'rgba(196,149,106,0.04)'
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 16, fontWeight: 600,
              color: 'var(--espresso)', marginBottom: 6,
            }}>
              Tap to add a photo
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              From camera or gallery
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFile}
            />
          </div>
        )}

        {phase !== 'idle' && (
          <div style={{ animation: 'fadeUp 0.3s both' }}>
            <img
              src={preview}
              alt="Your photo"
              style={{
                width: '100%',
                borderRadius: 14,
                maxHeight: 220,
                objectFit: 'cover',
                marginBottom: 12,
              }}
            />

            {phase === 'analyzing' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px',
                background: 'var(--cream2)',
                borderRadius: 12,
                fontSize: 13,
                color: 'var(--text-muted)',
              }}>
                <div className="spinner" />
                AI is reading your photo…
              </div>
            )}

            {phase === 'done' && (
              <div style={{
                background: 'var(--cream2)',
                borderRadius: 14,
                padding: '14px 16px',
              }}>
                <div style={{
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: 6,
                  fontWeight: 500,
                }}>
                  AI read from your photo
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-main)', lineHeight: 1.6, fontStyle: 'italic' }}>
                  "{feedback}"
                </div>
              </div>
            )}

            {phase === 'error' && (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                Couldn't analyze photo — that's okay, continuing without it.
              </div>
            )}

            <button
              onClick={reset}
              style={{
                background: 'none', border: 'none',
                color: 'var(--text-muted)',
                fontSize: 12, cursor: 'pointer',
                marginTop: 10, textDecoration: 'underline',
              }}
            >
              Use a different photo
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          className="btn-primary"
          disabled={phase === 'analyzing'}
          onClick={nextStep}
        >
          {phase === 'analyzing' ? 'Analyzing…' : 'Next →'}
        </button>
        <button className="btn-secondary" onClick={nextStep}>Skip this step</button>
      </div>
    </div>
  )
}
