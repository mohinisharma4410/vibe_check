import React, { useState } from 'react'

const METHODS = [
  { id: 'photo',  icon: '📸', label: 'Photo',       desc: 'AI reads your image for context' },
  { id: 'audio',  icon: '🎙️', label: 'Voice',       desc: 'Speak — text extracted, audio deleted' },
  { id: 'vibe',   icon: '✨', label: 'Vibe Score',  desc: 'Rate your vibe 1–5' },
  { id: 'all',    icon: '🚀', label: 'All of it',   desc: 'Full experience — takes ~2 min' },
]

const CheckIcon = () => (
  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
    <path d="M1 4L3.5 6.5L9 1" stroke="#f5ede0" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

export default function MethodSelectScreen({ onContinue }) {
  const [selected, setSelected] = useState(new Set())

  function toggle(id) {
    setSelected(prev => {
      const next = new Set(prev)
      // 'all' and 'direct' are exclusive
      if (id === 'all') {
        return new Set(['all'])
      }
      next.delete('all')
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectDirect() {
    onContinue(new Set(['direct']), true)
  }

  const hasSelection = selected.size > 0

  return (
    <div className="screen" style={{ paddingTop: 72 }}>
      <div className="step-label">How would you like to share?</div>
      <h1 className="screen-title fade-up">Choose your<br /><em>feedback style.</em></h1>
      <p className="screen-sub" style={{ margin: '8px 0 28px' }}>
        Pick one or more — or send everything at once.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        {METHODS.map(m => {
          const isSelected = selected.has(m.id)
          return (
            <div
              key={m.id}
              onClick={() => toggle(m.id)}
              style={{
                background: isSelected ? 'rgba(139,94,60,0.07)' : 'var(--foam)',
                border: `1.5px solid ${isSelected ? 'var(--mocha)' : 'var(--border)'}`,
                borderRadius: 16,
                padding: '18px 14px',
                cursor: 'pointer',
                textAlign: 'center',
                position: 'relative',
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                position: 'absolute', top: 10, right: 10,
                width: 18, height: 18, borderRadius: '50%',
                background: 'var(--mocha)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: isSelected ? 1 : 0,
                transition: 'opacity 0.15s',
              }}>
                <CheckIcon />
              </div>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 14, fontWeight: 600,
                color: isSelected ? 'var(--mocha)' : 'var(--espresso)',
                marginBottom: 3,
              }}>{m.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{m.desc}</div>
            </div>
          )
        })}
      </div>

      {/* Direct post — full width */}
      <div
        onClick={selectDirect}
        style={{
          background: 'var(--foam)',
          border: '1.5px solid var(--border)',
          borderRadius: 16,
          padding: '18px 20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          transition: 'all 0.2s',
          marginBottom: 20,
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brown-light)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        <span style={{ fontSize: 28 }}>⚡</span>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 14, fontWeight: 600,
            color: 'var(--espresso)', marginBottom: 3,
          }}>Post directly</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Write your thoughts &amp; submit instantly — no steps
          </div>
        </div>
        <div style={{ marginLeft: 'auto', color: 'var(--brown-light)', fontSize: 18 }}>→</div>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          className="btn-primary"
          disabled={!hasSelection}
          style={{ opacity: hasSelection ? 1 : 0.4 }}
          onClick={() => onContinue(selected, false)}
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
