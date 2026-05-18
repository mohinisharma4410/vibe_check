import React, { useState } from 'react'

export default function GhostNoteScreen({ onSubmit, submitting }) {
  const [note, setNote] = useState('')
  const MAX = 280

  return (
    <div className="screen" style={{ paddingTop: 72 }}>
      <div className="step-label">Final thought</div>
      <h1 className="screen-title fade-up">Say the thing<br /><em>you didn't say.</em></h1>
      <p className="screen-sub" style={{ margin: '8px 0 24px' }}>
        100% optional. 100% anonymous. The owner sees this exactly as you write it.
      </p>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          fontSize: 10.5,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: 10,
        }}>
          👻 Ghost note
        </div>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value.slice(0, MAX))}
          placeholder="Rude server? Cold dish? Actually perfect afternoon? Say it."
          rows={7}
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
          color: note.length > 250 ? 'var(--mocha)' : 'var(--brown-pale)',
          textAlign: 'right',
          borderTop: '1px solid var(--border)',
          paddingTop: 8,
          marginTop: 8,
        }}>
          {note.length} / {MAX}
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          className="btn-primary"
          onClick={() => onSubmit(note.trim())}
          disabled={submitting}
        >
          {submitting
            ? 'Sending your vibe…'
            : note.trim()
              ? 'Submit & get my receipt →'
              : 'Skip & submit →'}
        </button>
      </div>
    </div>
  )
}