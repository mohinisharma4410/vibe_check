import React, { useState } from 'react'

const VIBES = [
  { score: 1, label: 'Dead Inside',      emoji: '💀' },
  { score: 2, label: 'Meh',             emoji: '😑' },
  { score: 3, label: 'Decent',          emoji: '🙂' },
  { score: 4, label: 'Vibing',          emoji: '😄' },
  { score: 5, label: 'Absolutely Cooked', emoji: '🤩' },
]

const CheckIcon = () => (
  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
    <path d="M1 4L3.5 6.5L9 1" stroke="#f5ede0" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

export default function VibeScoreScreen({ update, nextStep }) {
  const [selected, setSelected] = useState(null)
  const [confirmed, setConfirmed] = useState(false)

  function choose(vibe) {
    setSelected(vibe)
    update({ vibe_score: vibe.score, vibe_label: vibe.label })
  }

  function confirm() {
    if (!selected) return
    setConfirmed(true)
    setTimeout(nextStep, 400)
  }

  return (
    <div className="screen" style={{ paddingTop: 72 }}>
      <div className="step-label">Vibe Score</div>
      <h1 className="screen-title fade-up">What's the<br /><em>vibe score?</em></h1>
      <p className="screen-sub" style={{ margin: '8px 0 28px' }}>
        Pick the one that fits right now. No judgment.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {VIBES.map((vibe, i) => {
          const isSelected = selected?.score === vibe.score
          return (
            <button
              key={vibe.score}
              onClick={() => choose(vibe)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '15px 18px',
                borderRadius: 16,
                border: `1.5px solid ${isSelected ? 'var(--mocha)' : 'var(--border)'}`,
                background: isSelected ? 'rgba(139,94,60,0.07)' : 'var(--foam)',
                transition: 'all 0.2s cubic-bezier(0.25,1,0.5,1)',
                transform: isSelected ? 'translateX(4px) scale(1.01)' : 'translateX(0) scale(1)',
                animation: `fadeUp 0.35s ${0.05 * i}s both`,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <span style={{
                fontSize: 26, lineHeight: 1,
                transition: 'transform 0.2s',
                transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                display: 'inline-block',
              }}>
                {vibe.emoji}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: 15,
                  color: isSelected ? 'var(--mocha)' : 'var(--espresso)',
                  transition: 'color 0.18s',
                }}>
                  {vibe.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                  {vibe.score} / 5
                </div>
              </div>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: 'var(--mocha)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: isSelected ? 1 : 0,
                transition: 'opacity 0.15s',
              }}>
                <CheckIcon />
              </div>
            </button>
          )
        })}
      </div>

      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          className="btn-primary"
          disabled={!selected || confirmed}
          style={{ opacity: selected ? 1 : 0.4 }}
          onClick={confirm}
        >
          {confirmed ? '✓ Locked in' : 'Next →'}
        </button>
        <button className="btn-secondary" onClick={nextStep}>Skip this step</button>
      </div>
    </div>
  )
}