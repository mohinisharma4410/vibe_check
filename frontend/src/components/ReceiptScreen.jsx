import React, { useRef, useState } from 'react'

const VIBE_EMOJI = { 1: '💀', 2: '😑', 3: '🙂', 4: '😄', 5: '🤩' }

export default function ReceiptScreen({ submission, tableId, visits }) {
  const receiptRef = useRef(null)
  const [sharing, setSharing] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  const oneliner = submission.receipt_oneliner || 'A visit worth remembering. ☕'

  const statPills = []
  if (submission.vibe_score) {
    statPills.push({
      emoji: VIBE_EMOJI[submission.vibe_score],
      label: submission.vibe_label || 'Vibing',
      sub: 'Vibe Score',
    })
  }
  if (submission.voice_transcript) {
    statPills.push({ emoji: '🎙️', label: 'Voice note', sub: 'Text extracted' })
  }
  if (submission.photo_feedback) {
    statPills.push({ emoji: '📸', label: 'Photo read', sub: 'AI analyzed' })
  }
  if (submission.is_direct && submission.direct_text) {
    statPills.push({ emoji: '✍️', label: 'Written', sub: 'Direct note' })
  }
  if (statPills.length === 0) {
    statPills.push({ emoji: '✨', label: 'Submitted', sub: 'Thank you!' })
  }

  async function shareCard() {
    setSharing(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#faf6f0',
        scale: 2,
        useCORS: true,
      })
      canvas.toBlob(async blob => {
        const file = new File([blob], 'vibecheck-receipt.png', { type: 'image/png' })
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'My VibeCheck Receipt', text: oneliner })
        } else {
          downloadCanvas(canvas)
        }
        setSharing(false)
      })
    } catch {
      setSharing(false)
    }
  }

  async function downloadReceipt() {
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#faf6f0',
        scale: 2,
        useCORS: true,
      })
      downloadCanvas(canvas)
      setDownloaded(true)
    } catch { /* silent fail */ }
  }

  function downloadCanvas(canvas) {
    const link = document.createElement('a')
    link.download = 'vibecheck-receipt.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="screen" style={{ paddingTop: 48 }}>
      <div style={{ textAlign: 'center', marginBottom: 20, animation: 'fadeUp 0.4s both' }}>
        <div className="tag-pill">✓ Submitted</div>
        <h1 className="screen-title" style={{ fontSize: 22, marginBottom: 4 }}>Your receipt</h1>
        <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Screenshot or share this to your story</p>
      </div>

      <div
        ref={receiptRef}
        style={{
          background: 'var(--foam)',
          border: '1px solid var(--cream3)',
          borderRadius: 24,
          padding: '28px 22px',
          animation: 'fadeUp 0.4s 0.1s both',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          background: 'linear-gradient(90deg, var(--mocha), var(--brown-light), transparent)',
        }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{
              fontSize: 10, letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--mocha)', fontWeight: 500, marginBottom: 3,
            }}>VibeCheck</div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600, fontSize: 15, color: 'var(--espresso)',
            }}>Table {tableId}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{dateStr}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{timeStr}</div>
          </div>
        </div>

        {/* Tear */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '16px -22px', position: 'relative' }}>
          <div style={{ flex: 1, borderTop: '2px dashed var(--cream3)' }} />
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--cream)', margin: '0 -10px', border: '1px solid var(--cream3)', flexShrink: 0 }} />
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--cream)', margin: '0 -10px', border: '1px solid var(--cream3)', flexShrink: 0 }} />
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          {statPills.slice(0, 3).map((p, i) => (
            <div key={i} style={{
              background: 'var(--cream2)',
              borderRadius: 12,
              padding: '14px 16px',
              textAlign: 'center',
              flex: '1 1 0',
              minWidth: 80,
            }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{p.emoji}</div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 12, fontWeight: 600, color: 'var(--espresso)',
              }}>{p.label}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{p.sub}</div>
            </div>
          ))}
        </div>

        {/* AI One-liner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(196,149,106,0.12), rgba(122,74,42,0.06))',
          border: '1px solid rgba(196,149,106,0.3)',
          borderRadius: 14,
          padding: '16px 18px',
          marginBottom: 16,
        }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--mocha)', marginBottom: 8, fontWeight: 500,
          }}>AI one-liner</div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 15,
            color: 'var(--espresso)',
            lineHeight: 1.55,
          }}>
            "{oneliner}"
          </div>
        </div>

        {/* Streak */}
        {visits > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>🔥</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Visit #{visits} at this café
            </span>
          </div>
        )}

        {/* Bottom tear */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '12px -22px', position: 'relative' }}>
          <div style={{ flex: 1, borderTop: '2px dashed var(--cream3)' }} />
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--cream)', margin: '0 -10px', border: '1px solid var(--cream3)', flexShrink: 0 }} />
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--cream)', margin: '0 -10px', border: '1px solid var(--cream3)', flexShrink: 0 }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12 }}>
          <div style={{ fontSize: 10, color: 'var(--brown-pale)', letterSpacing: '0.05em' }}>feedback by vibecheck</div>
          <div style={{ fontSize: 10, color: 'var(--brown-pale)' }}>anonymous ✓</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
        <button className="btn-primary" onClick={shareCard} disabled={sharing}>
          {sharing ? 'Preparing…' : '📤 Share to stories'}
        </button>
        <button className="btn-secondary" onClick={downloadReceipt}>
          {downloaded ? '✓ Saved to camera roll' : '⬇ Save to camera roll'}
        </button>
      </div>

      <p style={{
        textAlign: 'center', fontSize: 11.5,
        color: 'var(--text-muted)', marginTop: 20, lineHeight: 1.6,
      }}>
        Your feedback was submitted anonymously.<br />
        Thank you for making this place better. ☕
      </p>
    </div>
  )
}