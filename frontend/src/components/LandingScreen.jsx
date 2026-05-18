import React from 'react'

export default function LandingScreen({ tableId, visits, onStart }) {
  return (
    <div className="screen" style={{ paddingTop: 40 }}>
      <div>
        <div className="tag-pill">☕ VibeCheck</div>

        {visits > 0 && (
          <div style={{
            background: 'var(--brown-dark)',
            borderRadius: 16,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 20,
            animation: 'fadeUp 0.4s both',
          }}>
            <span style={{ fontSize: 26 }}>🔥</span>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 14,
                color: 'var(--latte)',
              }}>
                Welcome back! Visit #{visits + 1}
              </div>
              <div style={{ fontSize: 12, color: 'var(--brown-pale)', marginTop: 2 }}>
                {visits + 1 >= 5
                  ? "You're a regular — show this for a surprise ✨"
                  : `${5 - (visits + 1)} more visits to unlock something special`}
              </div>
            </div>
          </div>
        )}

        <div className="step-label">Table {tableId} · Anonymous</div>
        <h1 className="screen-title fade-up">
          How's your<br /><em>experience?</em>
        </h1>
        <p className="screen-sub fade-up" style={{ marginTop: 10, marginBottom: 36 }}>
          60 seconds. No login. 100% anonymous.<br />
          Your honesty helps them get better.
        </p>

        <div style={{
          display: 'flex',
          gap: 16,
          fontSize: 32,
          marginBottom: 44,
        }}>
          {['😶', '😑', '🙂', '😄', '🤩'].map((e, i) => (
            <span key={i} style={{
              display: 'inline-block',
              animation: `fadeUp 0.4s ${0.15 + i * 0.07}s both`,
            }}>{e}</span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button className="btn-primary" onClick={onStart}>
          Begin ↓
        </button>
        <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.55 }}>
          No photo, voice, or text is ever stored or linked to you.
        </p>
      </div>
    </div>
  )
}