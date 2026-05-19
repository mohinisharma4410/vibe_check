import React, { useRef, useState, useCallback } from 'react'

/* ─── Google Fonts injected once ─── */
const FONTS_INJECTED = { done: false }
function injectFonts() {
  if (FONTS_INJECTED.done || typeof document === 'undefined') return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href =
    'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300;1,600&family=DM+Serif+Display:ital@0;1&family=Space+Grotesk:wght@400;700&family=Italiana&display=swap'
  document.head.appendChild(link)
  FONTS_INJECTED.done = true
}
injectFonts()

const VIBE_EMOJI = { 1: '💀', 2: '😑', 3: '🙂', 4: '😄', 5: '🤩' }
const VIBE_WORDS = { 1: 'rough', 2: 'meh', 3: 'decent', 4: 'great', 5: 'perfect' }

/* ─── Café ambience photos (Unsplash, CORS-safe) ─── */
const CAFE_PHOTOS = [
  {
    id: 'golden',
    label: 'Golden Hour',
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 'rainy',
    label: 'Rainy Window',
    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 'latte',
    label: 'Latte Art',
    url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 'window',
    label: 'Window Seat',
    url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 'cozy',
    label: 'Cozy Corner',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 'espresso',
    label: 'Espresso Bar',
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 'pastry',
    label: 'Pastry Moment',
    url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 'night',
    label: 'Night Café',
    url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 'books',
    label: 'Bookish',
    url: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 'cold',
    label: 'Cold Brew',
    url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=900&auto=format&fit=crop',
  },
]

/* pick 4 photos for this café deterministically */
function pickPhotos(cafeId) {
  let h = 0
  const s = cafeId || 'demo'
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffffffff
  h = Math.abs(h)
  return Array.from({ length: 4 }, (_, i) => CAFE_PHOTOS[(h + i * 3) % CAFE_PHOTOS.length])
}

/* ═══════════════════════════════════════════════
   LAYOUT 1 — "THE SPLIT"
   Top half: full-bleed photo with overlay text
   Bottom half: cream panel, bold stats grid
   ════════════════════════════════════════════ */
function LayoutSplit({ photo, submission, tableId }) {
  const score = submission.vibe_score || 3
  const oneliner = submission.receipt_oneliner || 'a visit worth remembering'
  const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toUpperCase()

  return (
    <div style={{
      width: 390, height: 693, overflow: 'hidden', position: 'relative',
      fontFamily: 'sans-serif', background: '#f5ede0',
    }}>
      {/* TOP — photo half */}
      <div style={{ position: 'relative', height: 390, overflow: 'hidden' }}>
        <img src={photo.url} crossOrigin="anonymous" alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        {/* dark gradient from bottom */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 55%)',
        }} />
        {/* top left badge */}
        <div style={{
          position: 'absolute', top: 22, left: 22,
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: 100, padding: '6px 14px',
          color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          ☕ vibecheck
        </div>
        {/* top right date */}
        <div style={{
          position: 'absolute', top: 22, right: 22,
          color: 'rgba(255,255,255,0.75)', fontSize: 11, textAlign: 'right',
          letterSpacing: '0.08em',
        }}>
          {date}<br />Table {tableId}
        </div>
        {/* bottom text */}
        <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
          <div style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: 58, lineHeight: 0.9, color: '#fff',
            letterSpacing: '0.02em', marginBottom: 10,
            textShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }}>
            {VIBE_EMOJI[score]}<br />
            {VIBE_WORDS[score].toUpperCase()}<br />
            VIBES
          </div>
        </div>
      </div>

      {/* BOTTOM — cream panel */}
      <div style={{ padding: '24px 26px', height: 303 }}>
        {/* quote */}
        <div style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 17, fontStyle: 'italic', lineHeight: 1.55,
          color: '#3b2314', marginBottom: 20,
          borderLeft: '3px solid #c4956a', paddingLeft: 14,
        }}>
          "{oneliner}"
        </div>

        {/* stat grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
          {[
            { label: 'VIBE SCORE', val: `${score}/5` },
            { label: 'VISIT TYPE', val: submission.is_direct ? 'Direct' : 'Full review' },
            { label: 'MOOD', val: submission.vibe_label || 'Vibing' },
            { label: 'TABLE', val: `#${tableId}` },
          ].map(({ label, val }) => (
            <div key={label} style={{
              background: 'rgba(196,149,106,0.12)', borderRadius: 10,
              padding: '10px 12px',
            }}>
              <div style={{ fontSize: 9, letterSpacing: '0.12em', color: '#8b6b52', textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#2c1810' }}>{val}</div>
            </div>
          ))}
        </div>

        {/* footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 10, color: '#8b6b52', letterSpacing: '0.06em' }}>anonymous · honest · real</div>
          <div style={{
            background: '#2c1810', color: '#e0c9a6',
            borderRadius: 100, padding: '6px 14px',
            fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
          }}>
            VIBECHECK ✓
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   LAYOUT 2 — "THE COLLAGE"
   Pinterest-style: 3-photo asymmetric grid
   Large photo left, 2 stacked right, text overlay
   ════════════════════════════════════════════ */
function LayoutCollage({ photos, submission, tableId }) {
  const score = submission.vibe_score || 3
  const oneliner = submission.receipt_oneliner || 'a visit worth remembering'
  const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })

  const [p1, p2, p3] = photos

  return (
    <div style={{
      width: 390, height: 693, overflow: 'hidden', position: 'relative',
      background: '#1a1108', fontFamily: 'sans-serif',
    }}>

      {/* Photo grid — top 420px */}
      <div style={{ display: 'flex', height: 420, gap: 3 }}>
        {/* big left photo */}
        <div style={{ flex: '0 0 215px', overflow: 'hidden', position: 'relative' }}>
          <img src={p1.url} crossOrigin="anonymous" alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {/* subtle dark edge */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.2) 0%, transparent 60%)' }} />
        </div>

        {/* right column — 2 photos stacked */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <img src={p2.url} crossOrigin="anonymous" alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <img src={p3.url} crossOrigin="anonymous" alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </div>

      {/* "CAFÉ DAY" bold stamp over grid */}
      <div style={{
        position: 'absolute', top: 16, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', pointerEvents: 'none',
      }}>
        <div style={{
          fontFamily: '"Bebas Neue", sans-serif',
          fontSize: 90, lineHeight: 1, color: 'rgba(255,255,255,0.12)',
          letterSpacing: '0.08em', userSelect: 'none',
          textShadow: '0 0 40px rgba(255,255,255,0.06)',
        }}>
          CAFÉ
        </div>
      </div>

      {/* score sticker — floats over grid corner */}
      <div style={{
        position: 'absolute', top: 14, right: 14,
        background: '#f5d9a0', color: '#1a1108',
        width: 56, height: 56, borderRadius: '50%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        transform: 'rotate(12deg)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        fontSize: 10, fontWeight: 800, letterSpacing: '0.06em',
        lineHeight: 1.2,
      }}>
        <div style={{ fontSize: 20 }}>{VIBE_EMOJI[score]}</div>
        <div>{score}/5</div>
      </div>

      {/* date pill */}
      <div style={{
        position: 'absolute', top: 16, left: 16,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
        color: '#fff', borderRadius: 100, padding: '5px 12px',
        fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
      }}>
        {date}
      </div>

      {/* BOTTOM dark panel */}
      <div style={{ padding: '20px 24px', background: '#1a1108' }}>
        {/* big italic quote */}
        <div style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 22, fontStyle: 'italic', fontWeight: 300,
          color: '#f5d9a0', lineHeight: 1.4, marginBottom: 16,
        }}>
          "{oneliner}"
        </div>

        {/* horizontal pills row */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {[
            `Table ${tableId}`,
            submission.vibe_label || 'Vibing',
            ...(submission.voice_transcript ? ['🎙 voice note'] : []),
            ...(submission.photo_feedback ? ['📸 photo'] : []),
          ].map(tag => (
            <div key={tag} style={{
              border: '1px solid rgba(245,217,160,0.3)',
              color: '#d4a855', borderRadius: 100,
              padding: '5px 12px', fontSize: 11, letterSpacing: '0.06em',
            }}>
              {tag}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
            anonymous feedback
          </div>
          <div style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: 18, color: '#c4893a', letterSpacing: '0.12em',
          }}>
            VIBECHECK
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   LAYOUT 3 — "THE MINIMAL POSTER"
   Full-bleed photo, massive number score,
   thin serif quote, very clean
   ════════════════════════════════════════════ */
function LayoutPoster({ photo, submission, tableId }) {
  const score = submission.vibe_score || 3
  const oneliner = submission.receipt_oneliner || 'a visit worth remembering'
  const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{
      width: 390, height: 693, overflow: 'hidden', position: 'relative',
      fontFamily: 'sans-serif',
    }}>
      {/* Full bleed photo */}
      <img src={photo.url} crossOrigin="anonymous" alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />

      {/* strong vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.5) 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.4) 100%)',
      }} />

      {/* grain texture */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'200\' height=\'200\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        backgroundSize: '100px',
      }} />

      {/* top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '24px 24px 0',
      }}>
        <div style={{
          fontFamily: '"Italiana", serif',
          fontSize: 13, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.18em',
        }}>
          VIBECHECK
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em' }}>
          {date}
        </div>
      </div>

      {/* GIANT score number — centrepiece */}
      <div style={{
        position: 'absolute', top: '50%', left: 0, right: 0,
        transform: 'translateY(-60%)',
        textAlign: 'center', pointerEvents: 'none',
      }}>
        <div style={{
          fontFamily: '"Bebas Neue", sans-serif',
          fontSize: 180, lineHeight: 1, color: 'rgba(255,255,255,0.08)',
          letterSpacing: '-0.02em',
        }}>
          {score}
        </div>
      </div>

      {/* bottom text block */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '0 28px 36px',
      }}>
        {/* score dots */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} style={{
              width: n <= score ? 28 : 8, height: 4, borderRadius: 4,
              background: n <= score ? '#f5d9a0' : 'rgba(255,255,255,0.2)',
              transition: 'width 0.4s',
            }} />
          ))}
        </div>

        <div style={{
          fontFamily: '"DM Serif Display", serif',
          fontSize: 28, lineHeight: 1.2, color: '#fff', marginBottom: 14,
          fontStyle: 'italic',
        }}>
          {oneliner}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
              Table
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>
              {tableId}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 36 }}>{VIBE_EMOJI[score]}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {VIBE_WORDS[score]} vibes
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   LAYOUT 4 — "THE JOURNAL"
   Cream background, photo as inset card,
   handwritten-feel headline, soft aesthetic
   ════════════════════════════════════════════ */
function LayoutJournal({ photo, submission, tableId }) {
  const score = submission.vibe_score || 3
  const oneliner = submission.receipt_oneliner || 'a visit worth remembering'
  const date = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={{
      width: 390, height: 693, overflow: 'hidden', position: 'relative',
      background: '#faf6f0', fontFamily: 'sans-serif',
    }}>
      {/* paper texture bg */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.4,
        backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, rgba(196,149,106,0.12) 27px, rgba(196,149,106,0.12) 28px)',
      }} />

      {/* top heading */}
      <div style={{ position: 'relative', padding: '32px 28px 0' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c4956a', marginBottom: 6 }}>
          café journal · {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </div>
        <div style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 38, lineHeight: 1.05, color: '#2c1810',
          fontStyle: 'italic', fontWeight: 300,
        }}>
          {VIBE_WORDS[score]}<br />afternoon
        </div>

        {/* score dots below heading */}
        <div style={{ display: 'flex', gap: 5, marginTop: 10, marginBottom: 22 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: n <= score ? '#8b5e3c' : '#e0ccb8',
            }} />
          ))}
          <span style={{ fontSize: 11, color: '#8b6b52', marginLeft: 6, alignSelf: 'center' }}>
            {score}/5 — {submission.vibe_label || 'vibing'}
          </span>
        </div>
      </div>

      {/* photo inset — rotated slightly, with shadow */}
      <div style={{ position: 'relative', padding: '0 28px', marginBottom: 20 }}>
        <div style={{
          transform: 'rotate(-1.5deg)',
          borderRadius: 14, overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(0,0,0,0.16), 0 2px 6px rgba(0,0,0,0.08)',
          border: '8px solid #fff',
          position: 'relative',
        }}>
          <img src={photo.url} crossOrigin="anonymous" alt=""
            style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }} />
          {/* light leak */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(255,200,100,0.15) 0%, transparent 50%)',
          }} />
        </div>
        {/* photo caption sticker */}
        <div style={{
          position: 'absolute', bottom: -8, right: 36,
          background: '#fff', color: '#4b3221',
          transform: 'rotate(2deg)',
          padding: '5px 12px', borderRadius: 100,
          fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
          boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
        }}>
          📍 {photo.label}
        </div>
      </div>

      {/* quote */}
      <div style={{ padding: '4px 28px 0' }}>
        <div style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 18, fontStyle: 'italic', lineHeight: 1.55,
          color: '#4b3221',
          borderBottom: '1px solid rgba(196,149,106,0.3)',
          paddingBottom: 16, marginBottom: 14,
        }}>
          "{oneliner}"
        </div>

        {/* meta row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, color: '#8b6b52', letterSpacing: '0.06em', marginBottom: 2 }}>{date}</div>
            <div style={{ fontSize: 12, color: '#2c1810', fontWeight: 600 }}>Table {tableId} · anonymous</div>
          </div>
          <div style={{ fontSize: 34 }}>{VIBE_EMOJI[score]}</div>
        </div>

        {/* tag pills */}
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 14 }}>
          {[
            '#cafelife', '#coffeedate', '#vibecheck',
            ...(submission.vibe_label ? [`#${submission.vibe_label.toLowerCase().replace(/\s+/g, '')}`] : []),
          ].map(tag => (
            <div key={tag} style={{
              background: 'rgba(196,149,106,0.12)', color: '#8b5e3c',
              borderRadius: 100, padding: '5px 12px',
              fontSize: 11, fontWeight: 500,
            }}>
              {tag}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   LAYOUT 5 — "THE GRID RECAP"
   2×2 photo grid top half,
   bold stats + quote bottom half
   ════════════════════════════════════════════ */
function LayoutGrid({ photos, submission, tableId }) {
  const score = submission.vibe_score || 3
  const oneliner = submission.receipt_oneliner || 'a visit worth remembering'

  return (
    <div style={{
      width: 390, height: 693, overflow: 'hidden', position: 'relative',
      background: '#fff', fontFamily: 'sans-serif',
    }}>
      {/* 2×2 grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, height: 350 }}>
        {photos.map((p, i) => (
          <div key={p.id} style={{ overflow: 'hidden', position: 'relative' }}>
            <img src={p.url} crossOrigin="anonymous" alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {/* subtle color grading per slot */}
            <div style={{
              position: 'absolute', inset: 0,
              background: [
                'linear-gradient(135deg, rgba(255,200,100,0.1) 0%, transparent 60%)',
                'linear-gradient(225deg, rgba(100,150,255,0.08) 0%, transparent 60%)',
                'linear-gradient(315deg, rgba(255,100,150,0.08) 0%, transparent 60%)',
                'linear-gradient(45deg, rgba(100,200,150,0.08) 0%, transparent 60%)',
              ][i],
            }} />
          </div>
        ))}
      </div>

      {/* centre score overlay on grid */}
      <div style={{
        position: 'absolute', top: 145, left: '50%', transform: 'translateX(-50%) translateY(-50%)',
        width: 72, height: 72, borderRadius: '50%',
        background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: 24 }}>{VIBE_EMOJI[score]}</div>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#2c1810', lineHeight: 1 }}>{score}/5</div>
      </div>

      {/* BOTTOM content */}
      <div style={{ padding: '20px 24px', background: '#fff' }}>
        {/* big headline */}
        <div style={{
          fontFamily: '"Bebas Neue", sans-serif',
          fontSize: 52, lineHeight: 0.95, color: '#1a0f07',
          letterSpacing: '0.02em', marginBottom: 14,
        }}>
          CAFÉ<br />RECAP
        </div>

        <div style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 15, fontStyle: 'italic', lineHeight: 1.55,
          color: '#4b3221', marginBottom: 16,
          borderLeft: '2px solid #c4956a', paddingLeft: 12,
        }}>
          "{oneliner}"
        </div>

        {/* stats row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {[
            { n: `${score}/5`, l: 'Score' },
            { n: `#${tableId}`, l: 'Table' },
            { n: VIBE_WORDS[score], l: 'Vibe' },
          ].map(({ n, l }) => (
            <div key={l} style={{
              flex: 1, background: '#f5ede0', borderRadius: 10,
              padding: '10px 8px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#2c1810', marginBottom: 2 }}>{n}</div>
              <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8b6b52' }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 10, color: '#bca99a', letterSpacing: '0.06em' }}>
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div style={{
            background: '#2c1810', color: '#e0c9a6', borderRadius: 100,
            padding: '5px 14px', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
          }}>
            VIBECHECK ☕
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   LAYOUT 6 — "THE NEON NIGHT"
   Dark moody, full-bleed with neon accents,
   feels like you're posting at 11pm from a café
   ════════════════════════════════════════════ */
function LayoutNeon({ photo, submission, tableId }) {
  const score = submission.vibe_score || 3
  const oneliner = submission.receipt_oneliner || 'a visit worth remembering'
  const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{
      width: 390, height: 693, overflow: 'hidden', position: 'relative',
      background: '#080510', fontFamily: 'sans-serif',
    }}>
      {/* photo — top 55% with fade */}
      <div style={{ position: 'relative', height: 360, overflow: 'hidden' }}>
        <img src={photo.url} crossOrigin="anonymous" alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.8) brightness(0.65)' }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 40%, #080510 100%)',
        }} />
        {/* neon top border */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent, #c77dff, #48cae4, #c77dff, transparent)',
        }} />
        {/* time badge */}
        <div style={{
          position: 'absolute', top: 20, right: 20,
          color: '#c77dff', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em',
          textShadow: '0 0 12px rgba(199,125,255,0.8)',
        }}>
          {time}
        </div>
        <div style={{
          position: 'absolute', top: 20, left: 20,
          border: '1px solid rgba(199,125,255,0.4)',
          color: 'rgba(255,255,255,0.6)',
          borderRadius: 100, padding: '5px 12px',
          fontSize: 10, letterSpacing: '0.1em',
        }}>
          ☕ vibecheck
        </div>
      </div>

      {/* bottom content */}
      <div style={{ padding: '0 26px 32px', position: 'relative' }}>
        {/* score chip — floats between photo and content */}
        <div style={{
          display: 'flex', gap: 6, alignItems: 'center', marginBottom: 18,
        }}>
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} style={{
              flex: 1, height: 3, borderRadius: 3,
              background: n <= score
                ? 'linear-gradient(90deg, #c77dff, #48cae4)'
                : 'rgba(255,255,255,0.1)',
            }} />
          ))}
          <span style={{ fontSize: 20, marginLeft: 4 }}>{VIBE_EMOJI[score]}</span>
        </div>

        <div style={{
          fontFamily: '"Bebas Neue", sans-serif',
          fontSize: 68, lineHeight: 0.88,
          color: '#fff', letterSpacing: '0.02em',
          marginBottom: 14,
          textShadow: '0 0 60px rgba(199,125,255,0.2)',
        }}>
          {VIBE_WORDS[score].toUpperCase()}<br />
          VIBES
        </div>

        <div style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 16, fontStyle: 'italic', lineHeight: 1.6,
          color: 'rgba(255,255,255,0.6)',
          marginBottom: 20,
          borderLeft: '2px solid #c77dff', paddingLeft: 14,
        }}>
          "{oneliner}"
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(199,125,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Table {tableId}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
              anonymous · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </div>
          </div>
          <div style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: 16, letterSpacing: '0.15em',
            color: '#c77dff',
            textShadow: '0 0 20px rgba(199,125,255,0.6)',
          }}>
            VIBECHECK
          </div>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════
   MAIN ReceiptScreen
   ═══════════════════════════════════════════════ */
const LAYOUT_META = [
  { id: 'split',   label: 'The Split',    icon: '◼◻', desc: 'Photo + stats' },
  { id: 'collage', label: 'Collage',      icon: '⊞',  desc: '3 photos' },
  { id: 'poster',  label: 'Poster',       icon: '◻',  desc: 'Full photo' },
  { id: 'journal', label: 'Journal',      icon: '📖', desc: 'Soft & warm' },
  { id: 'grid',    label: 'Grid',         icon: '⊟',  desc: '4-photo recap' },
  { id: 'neon',    label: 'Neon Night',   icon: '✦',  desc: 'Dark & moody' },
]

export default function ReceiptScreen({ submission, tableId, cafeId }) {
  const cardRef = useRef(null)
  const [layoutId,   setLayoutId]   = useState('split')
  const [photoIdx,   setPhotoIdx]   = useState(0)
  const [sharing,    setSharing]    = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const photos = pickPhotos(cafeId)
  const photo  = photos[photoIdx]

  const renderCard = useCallback(() => {
    const props = { photo, photos, submission, tableId }
    switch (layoutId) {
      case 'split':   return <LayoutSplit   {...props} />
      case 'collage': return <LayoutCollage {...props} />
      case 'poster':  return <LayoutPoster  {...props} />
      case 'journal': return <LayoutJournal {...props} />
      case 'grid':    return <LayoutGrid    {...props} />
      case 'neon':    return <LayoutNeon    {...props} />
      default:        return <LayoutSplit   {...props} />
    }
  }, [layoutId, photo, photos, submission, tableId])

  async function captureCanvas() {
    const { default: html2canvas } = await import('html2canvas')
    return html2canvas(cardRef.current, {
      backgroundColor: null, scale: 3, useCORS: true, allowTaint: false,
      width: 390, height: 693,
    })
  }

  async function shareCard() {
    setSharing(true)
    try {
      const canvas = await captureCanvas()
      canvas.toBlob(async blob => {
        const file = new File([blob], 'vibecheck.png', { type: 'image/png' })
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'My café vibe', text: submission.receipt_oneliner || '' })
        } else {
          dl(canvas)
        }
        setSharing(false)
      })
    } catch { setSharing(false) }
  }

  async function downloadCard() {
    try {
      const canvas = await captureCanvas()
      dl(canvas)
      setDownloaded(true)
    } catch {}
  }

  function dl(canvas) {
    const a = document.createElement('a')
    a.download = 'vibecheck.png'
    a.href = canvas.toDataURL('image/png')
    a.click()
  }

  const needsPhotoPicker = ['split', 'poster', 'journal', 'neon'].includes(layoutId)
  const needsMultiPhoto  = ['collage', 'grid'].includes(layoutId)

  return (
    <div className="screen" style={{ paddingTop: 20, paddingBottom: 48 }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div className="tag-pill">✓ Submitted</div>
        <h1 className="screen-title" style={{ fontSize: 22, marginBottom: 3 }}>Your café story</h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>story-ready · pick a layout & post ✨</p>
      </div>

      {/* Layout tabs */}
      <p style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>Layout</p>
      <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
        {LAYOUT_META.map(l => (
          <button
            key={l.id}
            onClick={() => setLayoutId(l.id)}
            style={{
              border: layoutId === l.id ? '2px solid #3b2314' : '1px solid #ddd',
              background: layoutId === l.id ? '#3b2314' : 'white',
              color: layoutId === l.id ? '#e0c9a6' : '#3b2314',
              padding: '8px 13px', borderRadius: 10,
              fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
              cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            }}
          >
            <span style={{ fontSize: 14 }}>{l.icon}</span>
            <span>{l.label}</span>
            <span style={{ fontSize: 9, opacity: 0.65, fontWeight: 400 }}>{l.desc}</span>
          </button>
        ))}
      </div>

      {/* Photo picker — only for single-photo layouts */}
      {needsPhotoPicker && (
        <>
          <p style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>Ambience</p>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
            {photos.map((p, i) => (
              <div key={p.id} onClick={() => setPhotoIdx(i)} style={{ minWidth: 68, cursor: 'pointer', flexShrink: 0 }}>
                <div style={{
                  borderRadius: 10, overflow: 'hidden',
                  border: photoIdx === i ? '3px solid #3b2314' : '2px solid transparent',
                  transition: '0.15s',
                }}>
                  <img src={p.url} crossOrigin="anonymous" alt={p.label}
                    style={{ width: 68, height: 90, objectFit: 'cover', display: 'block' }} />
                </div>
                <div style={{ marginTop: 4, fontSize: 9, textAlign: 'center', color: '#6a584d', fontWeight: 500 }}>
                  {p.label}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {needsMultiPhoto && (
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
          📸 Uses your 4 café ambience photos automatically
        </p>
      )}

      {/* Story card preview — 390×693 (9:16) */}
      <div style={{
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 18, overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
        maxWidth: 390, margin: '0 auto 24px',
        aspectRatio: '390/693',
      }}>
        <div ref={cardRef} style={{ width: 390, height: 693, transformOrigin: 'top left' }}>
          {renderCard()}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn-primary" onClick={shareCard} disabled={sharing}>
          {sharing ? 'Preparing…' : '📤 Share to Instagram / Stories'}
        </button>
        <button className="btn-secondary" onClick={downloadCard}>
          {downloaded ? '✓ Saved!' : '⬇ Save to camera roll'}
        </button>
      </div>

      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 18, lineHeight: 1.6 }}>
        Your feedback was submitted anonymously.<br />
        thank you for making cafés better ☕
      </p>
    </div>
  )
}
