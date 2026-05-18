import React, { useState } from 'react'

export default function DirectScreen({ onSubmit, submitting }) {
  const [text, setText] = useState('')
  const MAX = 280

  function handleChange(e) {
    setText(e.target.value.slice(0, MAX))
  }

  return (
    <div className="screen" style={{ paddingTop: 72 }}>
      <div className="step-label">Direct feedback</div>
      <h1 className="screen-title fade-up">Say exactly<br /><em>what you think.</em></h1>
      <p className="screen-sub" style={{ margin: '8px 0 24px' }}>
        No steps. No filters. Just you and your thoughts.
      </p>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          fontSize: 10.5,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: 10,
        }}>
          ✍️ Your feedback
        </div>
        <textarea
          value={text}
          onChange={handleChange}
          placeholder="The espresso was perfect. The service felt a bit rushed today but overall a great spot…"
          rows={8}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 15,
            color: 'var(--text-main)',
            lineHeight: 1.7,
            resize: 'none',
            width: '100%',
          }}
        />
        <div style={{
          fontSize: 11,
          color: text.length > 250 ? 'var(--mocha)' : 'var(--brown-pale)',
          textAlign: 'right',
          borderTop: '1px solid var(--border)',
          paddingTop: 8,
          marginTop: 8,
        }}>
          {text.length} / {MAX}
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          className="btn-primary"
          disabled={text.trim().length < 3 || submitting}
          style={{ opacity: text.trim().length >= 3 ? 1 : 0.4 }}
          onClick={() => onSubmit(text.trim())}
        >
          {submitting ? 'Sending…' : 'Submit & get receipt →'}
        </button>
      </div>
    </div>
  )
}
