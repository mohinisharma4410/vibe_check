import React, { useState } from 'react'

export default function BrutalQuestionScreen({ submission, updateSubmission, nextStep, stepLabel }) {
  const { question } = submission
  const [answer, setAnswer] = useState('')
  const maxChars = 140

  function confirm() {
    updateSubmission({ question_answer: answer.trim() || null })
    nextStep()
  }

  function skip() {
    updateSubmission({ question_answer: null })
    nextStep()
  }

  return (
    <div className="screen" style={{ paddingTop: 48 }}>
      {stepLabel && <div className="step-label">{stepLabel}</div>}
      <h1 className="screen-title fade-up">
        One<br />
        <span style={{ color: 'var(--accent)' }}>brutal question.</span>
      </h1>

      <div style={{
        background: 'var(--bg2)',
        border: '1px solid rgba(232,255,74,0.2)',
        borderLeft: '3px solid var(--accent)',
        borderRadius: 'var(--r-sm)',
        padding: '20px',
        marginTop: 24, marginBottom: 24,
        animation: 'fadeUp 0.4s 0.1s both',
      }}>
        <p style={{
          fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18,
          lineHeight: 1.4, color: 'var(--text)',
        }}>
          "{question}"
        </p>
      </div>

      <div style={{ flex: 1, animation: 'fadeUp 0.4s 0.2s both' }}>
        <textarea
          value={answer}
          onChange={e => setAnswer(e.target.value.slice(0, maxChars))}
          placeholder="Be honest. This goes directly to the owner."
          rows={4}
          style={{
            width: '100%', background: 'var(--bg3)',
            border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
            padding: '14px 16px', color: 'var(--text)',
            fontSize: 15, lineHeight: 1.6, resize: 'none', outline: 'none',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(232,255,74,0.4)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <div style={{ textAlign: 'right', fontSize: 12, color: answer.length > 120 ? 'var(--accent)' : 'var(--text2)', marginTop: 6 }}>
          {answer.length}/{maxChars}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
        <button
          className="btn-primary"
          onClick={confirm}
          disabled={!answer.trim()}
          style={{ opacity: answer.trim() ? 1 : 0.4 }}
        >
          Next →
        </button>
        <button className="btn-secondary" onClick={skip}>Skip this question</button>
      </div>
    </div>
  )
}