import React, { useRef, useState } from 'react'

const VIBE_EMOJI = {
  1: '💀',
  2: '😑',
  3: '🙂',
  4: '😄',
  5: '🤩',
}

const RECEIPT_TEMPLATES = [
  {
    id: 'thermal',
    name: 'Thermal Receipt',

    container: {
      background: '#f6efe5',
      borderRadius: 28,
      overflow: 'hidden',
      border: '1px solid #e7d8c7',
      boxShadow: '0 18px 60px rgba(0,0,0,0.14)',
    },

    overlay:
      'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.08))',

    quoteStyle: {
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: 26,
      lineHeight: 1.5,
      color: '#fff',
      fontWeight: 600,
      textAlign: 'center',
      textShadow: '0 4px 16px rgba(0,0,0,0.35)',
    },

    contentBackground: '#f8f1e7',

    sticker: {
      background: '#fff',
      color: '#4b3221',
      rotate: '-4deg',
    },
  },

  {
    id: 'scrapbook',
    name: 'Scrapbook Memory',

    container: {
      background:
        'linear-gradient(180deg,#fdf7ef 0%, #f4e3d0 100%)',
      borderRadius: 34,
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.4)',
      boxShadow: '0 20px 70px rgba(0,0,0,0.16)',
    },

    overlay:
      'linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0.1))',

    quoteStyle: {
      fontFamily: '"Playfair Display", serif',
      fontSize: 30,
      lineHeight: 1.45,
      color: '#fff',
      fontWeight: 500,
      textAlign: 'left',
      textShadow: '0 4px 18px rgba(0,0,0,0.45)',
    },

    contentBackground: '#f7ebdf',

    sticker: {
      background: '#fff4e6',
      color: '#5b3926',
      rotate: '3deg',
    },
  },
]

const AMBIENCE_PHOTOS = [
  {
    id: 'golden',
    label: 'Golden Hour',

    image:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1200&auto=format&fit=crop',
  },

  {
    id: 'rainy',
    label: 'Rainy Café',

    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop',
  },

  {
    id: 'books',
    label: 'Bookstore Energy',

    image:
      'https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=1200&auto=format&fit=crop',
  },

  {
    id: 'night',
    label: 'Night Café',

    image:
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1200&auto=format&fit=crop',
  },
]

export default function ReceiptScreen({
  submission,
  tableId,
  visits,
}) {
  const receiptRef = useRef(null)

  const [sharing, setSharing] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const [selectedTemplate, setSelectedTemplate] =
    useState('thermal')

  const [selectedPhoto, setSelectedPhoto] =
    useState('golden')

  const template =
    RECEIPT_TEMPLATES.find(
      t => t.id === selectedTemplate
    )

  const ambience =
    AMBIENCE_PHOTOS.find(
      p => p.id === selectedPhoto
    )

  const now = new Date()

  const dateStr = now.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const oneliner =
    submission.receipt_oneliner ||
    'A visit worth remembering. ☕'

  const vibeScore = submission.vibe_score || 3

  const statPills = []

  if (submission.vibe_score) {
    statPills.push({
      emoji: VIBE_EMOJI[submission.vibe_score],
      label: submission.vibe_label || 'Vibing',
    })
  }

  if (submission.voice_transcript) {
    statPills.push({
      emoji: '🎙️',
      label: 'Voice captured',
    })
  }

  if (submission.photo_feedback) {
    statPills.push({
      emoji: '📸',
      label: 'Photo analyzed',
    })
  }

  if (submission.is_direct && submission.direct_text) {
    statPills.push({
      emoji: '✍️',
      label: 'Written note',
    })
  }

  async function shareCard() {
    setSharing(true)

    try {
      const { default: html2canvas } = await import(
        'html2canvas'
      )

      const canvas = await html2canvas(
        receiptRef.current,
        {
          backgroundColor: null,
          scale: 2,
          useCORS: true,
        }
      )

      canvas.toBlob(async blob => {
        const file = new File(
          [blob],
          'vibecheck-receipt.png',
          { type: 'image/png' }
        )

        if (
          navigator.share &&
          navigator.canShare({ files: [file] })
        ) {
          await navigator.share({
            files: [file],
            title: 'My VibeCheck Receipt',
            text: oneliner,
          })
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
      const { default: html2canvas } = await import(
        'html2canvas'
      )

      const canvas = await html2canvas(
        receiptRef.current,
        {
          backgroundColor: null,
          scale: 2,
          useCORS: true,
        }
      )

      downloadCanvas(canvas)

      setDownloaded(true)
    } catch {}
  }

  function downloadCanvas(canvas) {
    const link = document.createElement('a')

    link.download = 'vibecheck-receipt.png'
    link.href = canvas.toDataURL()

    link.click()
  }

  return (
    <div
      className="screen"
      style={{
        paddingTop: 28,
        paddingBottom: 42,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: 18,
        }}
      >
        <div className="tag-pill">
          ✓ Submitted
        </div>

        <h1
          className="screen-title"
          style={{
            fontSize: 24,
            marginBottom: 4,
          }}
        >
          Your café memory
        </h1>

        <p
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
          }}
        >
          pick a vibe & share ✨
        </p>
      </div>

      {/* TEMPLATE SWITCHER */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          overflowX: 'auto',
          marginBottom: 16,
          paddingBottom: 4,
        }}
      >
        {RECEIPT_TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() =>
              setSelectedTemplate(t.id)
            }
            style={{
              border:
                selectedTemplate === t.id
                  ? '2px solid #7a4a2a'
                  : '1px solid #ddd',
              background:
                selectedTemplate === t.id
                  ? '#f5e2cf'
                  : 'white',
              padding: '10px 14px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* PHOTO SELECTOR */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          marginBottom: 20,
          paddingBottom: 4,
        }}
      >
        {AMBIENCE_PHOTOS.map(photo => (
          <div
            key={photo.id}
            onClick={() =>
              setSelectedPhoto(photo.id)
            }
            style={{
              minWidth: 90,
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                borderRadius: 18,
                overflow: 'hidden',
                border:
                  selectedPhoto === photo.id
                    ? '3px solid #7a4a2a'
                    : '2px solid transparent',
                transition: '0.2s',
              }}
            >
              <img
                src={photo.image}
                alt={photo.label}
                crossOrigin="anonymous"
                style={{
                  width: 90,
                  height: 120,
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 11,
                textAlign: 'center',
                color: '#6a584d',
              }}
            >
              {photo.label}
            </div>
          </div>
        ))}
      </div>

      {/* RECEIPT */}
      <div
        ref={receiptRef}
        style={{
          ...template.container,
          maxWidth: 420,
          margin: '0 auto',
          position: 'relative',
        }}
      >
        {/* PHOTO */}
        <div
          style={{
            position: 'relative',
            height: 320,
            overflow: 'hidden',
          }}
        >
          <img
            src={ambience.image}
            alt={ambience.label}
            crossOrigin="anonymous"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {/* OVERLAY */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: template.overlay,
            }}
          />

          {/* GRAIN */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.05,
              backgroundImage:
                'radial-gradient(#fff 1px, transparent 1px)',
              backgroundSize: '3px 3px',
            }}
          />

          {/* STICKER */}
          <div
            style={{
              position: 'absolute',
              top: 18,
              left: 18,
              background:
                template.sticker.background,
              color: template.sticker.color,
              transform: `rotate(${template.sticker.rotate})`,
              padding: '10px 14px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              boxShadow:
                '0 10px 25px rgba(0,0,0,0.14)',
            }}
          >
            ☕ café archive
          </div>

          {/* DATE */}
          <div
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
              color: 'white',
              textAlign: 'right',
            }}
          >
            <div
              style={{
                fontSize: 11,
                opacity: 0.9,
              }}
            >
              {dateStr}
            </div>

            <div
              style={{
                fontSize: 11,
                opacity: 0.8,
              }}
            >
              {timeStr}
            </div>
          </div>

          {/* QUOTE */}
          <div
            style={{
              position: 'absolute',
              left: 24,
              right: 24,
              bottom: 26,
            }}
          >
            <div
              style={{
                fontSize: 48,
                marginBottom: 10,
              }}
            >
              {VIBE_EMOJI[vibeScore]}
            </div>

            <div
              style={template.quoteStyle}
            >
              “{oneliner}”
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div
          style={{
            background:
              template.contentBackground,
            padding: '24px 22px',
          }}
        >
          {/* TOP */}
          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              marginBottom: 18,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  textTransform:
                    'uppercase',
                  opacity: 0.55,
                  marginBottom: 4,
                }}
              >
                VIBECHECK
              </div>

              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#3f2819',
                }}
              >
                Table {tableId}
              </div>
            </div>

            <div
              style={{
                textAlign: 'right',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  opacity: 0.55,
                }}
              >
                Mood captured at
              </div>

              <div
                style={{
                  fontWeight: 700,
                  color: '#3f2819',
                }}
              >
                {timeStr}
              </div>
            </div>
          </div>

          {/* STATS */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              marginBottom: 18,
            }}
          >
            {statPills.map((p, i) => (
              <div
                key={i}
                style={{
                  background:
                    'rgba(255,255,255,0.72)',
                  borderRadius: 999,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#4f3523',
                }}
              >
                <span>{p.emoji}</span>
                <span>{p.label}</span>
              </div>
            ))}
          </div>

          {/* MEMORY BOX */}
          <div
            style={{
              background:
                'rgba(255,255,255,0.62)',
              borderRadius: 20,
              padding: '18px',
              marginBottom: 18,
            }}
          >
            <div
              style={{
                fontSize: 11,
                textTransform:
                  'uppercase',
                letterSpacing: '0.1em',
                opacity: 0.55,
                marginBottom: 12,
              }}
            >
              Café Memory
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                fontSize: 13,
                color: '#4b3221',
              }}
            >
              <div>
                ☕ Ordered during main
                character hours
              </div>

              <div>
                🎵 Playlist energy:
                immaculate
              </div>

              <div>
                🪟 Window seat vibes
                detected
              </div>

              {visits > 0 && (
                <div>
                  🔥 Visit #{visits} at
                  this café
                </div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontSize: 11,
                opacity: 0.55,
              }}
            >
              anonymous feedback ✓
            </div>

            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#4f3523',
              }}
            >
              vibecheck
            </div>
          </div>
        </div>
      </div>

      {/* BUTTONS */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          marginTop: 22,
        }}
      >
        <button
          className="btn-primary"
          onClick={shareCard}
          disabled={sharing}
        >
          {sharing
            ? 'Preparing…'
            : '📤 Share to stories'}
        </button>

        <button
          className="btn-secondary"
          onClick={downloadReceipt}
        >
          {downloaded
            ? '✓ Saved to camera roll'
            : '⬇ Save to camera roll'}
        </button>
      </div>

      <p
        style={{
          textAlign: 'center',
          fontSize: 11.5,
          color: 'var(--text-muted)',
          marginTop: 20,
          lineHeight: 1.6,
        }}
      >
        Your feedback was submitted
        anonymously.
        <br />
        thank you for making cafés
        better ☕
      </p>
    </div>
  )
}
