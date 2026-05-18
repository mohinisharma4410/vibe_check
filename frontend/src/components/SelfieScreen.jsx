import React, { useRef, useState, useEffect } from 'react'

const MOOD_MESSAGES = {
  happy:   ["you're glowing ☀️", "okay clearly something's going right", "we see you ✨"],
  neutral: ["considering energy ☕", "unbothered. stoic. present.", "somewhere between fine and fabulous"],
  sad:     ["oof. let's figure out what happened", "this needed more oat milk", "we appreciate the honesty 🤍"],
}

function getMoodMessage(mood) {
  const msgs = MOOD_MESSAGES[mood] || MOOD_MESSAGES.neutral
  return msgs[Math.floor(Math.random() * msgs.length)]
}

function mapExpressionToMood(e) {
  const { happy = 0, sad = 0, angry = 0, disgusted = 0, fearful = 0 } = e
  if (happy > 0.5) return 'happy'
  if (sad + angry + disgusted + fearful > 0.4) return 'sad'
  return 'neutral'
}

const MOOD_EMOJI = { happy: '😄', neutral: '😐', sad: '😔' }

export default function SelfieScreen({ updateSubmission, nextStep, stepLabel }) {
  const videoRef  = useRef(null)
  const streamRef = useRef(null)
  const [phase, setPhase]           = useState('loading')
  const [detectedMood, setMood]     = useState(null)
  const [moodMessage, setMessage]   = useState('')
  const [faceApi, setFaceApi]       = useState(null)

  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const fapi = await import('face-api.js')
        if (cancelled) return
        await Promise.all([
          fapi.nets.tinyFaceDetector.loadFromUri('/models'),
          fapi.nets.faceExpressionNet.loadFromUri('/models'),
        ])
        if (cancelled) return
        setFaceApi(fapi)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 480, height: 480 },
        })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play() }
        setPhase('ready')
      } catch (err) {
        console.warn('SelfieScreen init failed:', err)
        if (!cancelled) setPhase('error')
      }
    }
    init()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  async function capture() {
    if (!faceApi || !videoRef.current) return
    setPhase('capturing')
    try {
      const det = await faceApi
        .detectSingleFace(videoRef.current, new faceApi.TinyFaceDetectorOptions())
        .withFaceExpressions()
      streamRef.current?.getTracks().forEach(t => t.stop())
      const mood = det?.expressions ? mapExpressionToMood(det.expressions) : 'neutral'
      setMood(mood)
      setMessage(getMoodMessage(mood))
      setPhase('result')
    } catch { setPhase('error') }
  }

  function confirm(accurate) { updateSubmission({ mood: detectedMood, mood_accurate: accurate }); nextStep() }
  function skip()             { updateSubmission({ mood: 'neutral', mood_accurate: false });      nextStep() }

  return (
    <div className="screen" style={{ paddingTop: 52 }}>
      {stepLabel && <div className="step-label">{stepLabel}</div>}

      <h1 className="screen-title fade-up">
        Quick<br /><em>mood snap.</em>
      </h1>
      <p className="screen-sub fade-up" style={{ marginBottom: 32, animationDelay: '0.05s' }}>
        Your photo never leaves this screen — we only read your expression.
      </p>

      {/* Loading */}
      {phase === 'loading' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            border: '2.5px solid var(--bg3)', borderTopColor: 'var(--accent)',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: 'var(--text3)', fontSize: 13 }}>Loading face model…</p>
        </div>
      )}

      {/* Camera */}
      {(phase === 'ready' || phase === 'capturing') && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          {/* Circular viewfinder */}
          <div style={{
            width: 220, height: 220, borderRadius: '50%', overflow: 'hidden',
            border: '3px solid var(--accent)',
            boxShadow: '0 0 0 8px rgba(139,69,19,0.08)',
            position: 'relative', background: 'var(--bg3)',
          }}>
            <video
              ref={videoRef}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
              muted playsInline
            />
            {phase === 'capturing' && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(139,69,19,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Reading…
                </span>
              </div>
            )}
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn-primary" onClick={capture} disabled={phase === 'capturing'}>
              {phase === 'capturing' ? 'Reading your mood…' : 'Read my mood →'}
            </button>
            <button className="btn-secondary" onClick={skip}>Skip this step</button>
          </div>
        </div>
      )}

      {/* Result */}
      {phase === 'result' && (
        <div className="fade-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <div style={{
            width: 110, height: 110, borderRadius: '50%',
            background: 'var(--surface)',
            border: '3px solid var(--accent)',
            boxShadow: '0 0 0 8px rgba(139,69,19,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48,
          }}>
            {MOOD_EMOJI[detectedMood]}
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 20, color: 'var(--text)', marginBottom: 6 }}>
              {moodMessage}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>
              We read: <strong style={{ color: 'var(--accent)', textTransform: 'capitalize' }}>{detectedMood}</strong>. Right?
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <button onClick={() => confirm(true)} className="btn-primary" style={{ flex: 1, width: 'auto' }}>
              Yeah ✓
            </button>
            <button onClick={() => confirm(false)} className="btn-secondary" style={{ flex: 1, width: 'auto' }}>
              Not quite
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {phase === 'error' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'var(--surface)', border: '2px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
          }}>📷</div>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Camera unavailable</div>
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>Camera access denied or model couldn't load. No worries.</p>
          </div>
          <button className="btn-primary" onClick={skip}>Continue without selfie</button>
        </div>
      )}
    </div>
  )
}