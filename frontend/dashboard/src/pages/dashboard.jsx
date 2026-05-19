/**
 * VibeCheck — Owner Dashboard
 * File: frontend/src/pages/Dashboard.jsx
 *
 * Add to App.jsx:
 *   import Dashboard from './pages/Dashboard'
 *   <Route path="/dashboard" element={<Dashboard />} />
 *
 * Uses same CSS variables as index.css (cream/mocha palette).
 * Fetches from /api/dashboard/* endpoints already built in backend.
 */

import React, { useState, useEffect, useCallback } from 'react'

// ─── Config ──────────────────────────────────────────────────────────────────
const API = '/api/dashboard'

const VIBE_EMOJI  = { 1: '💀', 2: '😑', 3: '🙂', 4: '😄', 5: '🤩' }
const VIBE_LABEL  = { 1: 'Dead Inside', 2: 'Meh', 3: 'Decent', 4: 'Vibing', 5: 'Absolutely Cooked' }
const VIBE_COLOR  = { 1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#22c55e', 5: '#c4956a' }
const MOOD_EMOJI  = { happy: '😄', neutral: '😐', sad: '😔' }

// ─── Helpers ─────────────────────────────────────────────────────────────────
function timeAgo(iso) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function fmtTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

async function apiFetch(path, cafeId) {
  const res = await fetch(`${API}${path}?cafe_id=${encodeURIComponent(cafeId)}`)
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Stat({ label, value, sub, accent }) {
  return (
    <div style={{
      background: 'var(--foam)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r)',
      padding: '18px 16px',
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: accent || 'var(--espresso)', lineHeight: 1 }}>
        {value ?? '—'}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--espresso)', margin: '28px 0 12px' }}>
      {children}
    </div>
  )
}

function Badge({ children, color }) {
  return (
    <span style={{
      display: 'inline-block',
      background: color ? `${color}18` : 'var(--cream2)',
      color: color || 'var(--mocha)',
      border: `1px solid ${color ? `${color}40` : 'var(--border)'}`,
      borderRadius: 100,
      padding: '3px 10px',
      fontSize: 11,
      fontWeight: 600,
    }}>{children}</span>
  )
}

function Spinner() {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%',
      border: '2.5px solid var(--cream3)',
      borderTopColor: 'var(--mocha)',
      animation: 'spin 0.8s linear infinite',
      margin: '0 auto',
    }} />
  )
}

// ─── Heatmap ─────────────────────────────────────────────────────────────────
function Heatmap({ data }) {
  if (!data?.cells?.length) return (
    <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 14 }}>
      Not enough data yet
    </div>
  )

  const tables   = [...new Set(data.cells.map(c => c.table_id))].sort()
  const timeSlots = [...new Set(data.cells.map(c => c.time_slot))].sort()

  function cellColor(score) {
    if (!score) return 'var(--cream3)'
    if (score >= 4)  return '#22c55e'
    if (score >= 3)  return '#eab308'
    return '#ef4444'
  }

  function findScore(table, slot) {
    return data.cells.find(c => c.table_id === table && c.time_slot === slot)?.avg_vibe
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'separate', borderSpacing: 4, minWidth: '100%' }}>
        <thead>
          <tr>
            <th style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, padding: '0 4px 8px', textAlign: 'left' }}>Table</th>
            {timeSlots.map(slot => (
              <th key={slot} style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, padding: '0 2px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                {slot}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tables.map(table => (
            <tr key={table}>
              <td style={{ fontSize: 12, color: 'var(--espresso)', fontWeight: 600, paddingRight: 8, whiteSpace: 'nowrap' }}>
                T{table}
              </td>
              {timeSlots.map(slot => {
                const score = findScore(table, slot)
                return (
                  <td key={slot} title={score ? `Vibe: ${score.toFixed(1)}` : 'No data'}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: cellColor(score),
                      opacity: score ? 1 : 0.25,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, color: '#fff', fontWeight: 700,
                    }}>
                      {score ? score.toFixed(1) : ''}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', gap: 12, marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
        {[['#ef4444', '1–2 Bad'], ['#eab308', '3 Okay'], ['#22c55e', '4–5 Great']].map(([c, l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />{l}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Feedback Card ────────────────────────────────────────────────────────────
function FeedbackCard({ item, expanded, onToggle }) {
  const vc = VIBE_COLOR[item.vibe_score]
  return (
    <div
      style={{
        background: 'var(--foam)',
        border: `1px solid ${expanded ? 'var(--brown-light)' : 'var(--border)'}`,
        borderRadius: 'var(--r)',
        overflow: 'hidden',
        transition: 'border-color 0.2s',
        cursor: 'pointer',
      }}
      onClick={onToggle}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
        <div style={{ fontSize: 24 }}>{VIBE_EMOJI[item.vibe_score] || '❓'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: 'var(--espresso)', fontSize: 14 }}>
              Table {item.table_id}
            </span>
            {item.vibe_score && (
              <Badge color={vc}>{VIBE_LABEL[item.vibe_score]}</Badge>
            )}
            {item.mood && (
              <Badge>{MOOD_EMOJI[item.mood]} {item.mood}</Badge>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {fmtDate(item.submitted_at)} · {fmtTime(item.submitted_at)} · {timeAgo(item.submitted_at)}
          </div>
        </div>
        <div style={{ fontSize: 16, color: 'var(--brown-light)', flexShrink: 0 }}>
          {expanded ? '▲' : '▼'}
        </div>
      </div>

      {/* Preview — ghost note snippet */}
      {!expanded && item.ghost_note && (
        <div style={{ padding: '0 16px 12px', fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
          "{item.ghost_note.slice(0, 80)}{item.ghost_note.length > 80 ? '…' : ''}"
        </div>
      )}

      {/* Expanded detail */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {item.voice_transcript && (
            <div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 6 }}>🎙️ Voice Note</div>
              <div style={{
                background: 'var(--cream2)', borderRadius: 'var(--r-sm)', padding: '12px 14px',
                fontSize: 14, color: 'var(--espresso)', lineHeight: 1.6, fontStyle: 'italic'
              }}>
                "{item.voice_transcript}"
              </div>
            </div>
          )}

          {item.ghost_note && (
            <div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 6 }}>👻 Ghost Note</div>
              <div style={{
                background: 'var(--cream2)', borderRadius: 'var(--r-sm)', padding: '12px 14px',
                fontSize: 14, color: 'var(--espresso)', lineHeight: 1.6
              }}>
                {item.ghost_note}
              </div>
            </div>
          )}

          {item.question && (
            <div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 6 }}>❓ Rotating Question</div>
              <div style={{ fontSize: 12, color: 'var(--mocha)', marginBottom: 6, fontStyle: 'italic' }}>"{item.question}"</div>
              {item.question_answer && (
                <div style={{
                  background: 'var(--cream2)', borderRadius: 'var(--r-sm)', padding: '10px 14px',
                  fontSize: 14, color: 'var(--espresso)'
                }}>
                  {item.question_answer}
                </div>
              )}
            </div>
          )}

          {item.receipt_oneliner && (
            <div style={{
              background: `${VIBE_COLOR[item.vibe_score] || '#c4956a'}12`,
              border: `1px solid ${VIBE_COLOR[item.vibe_score] || '#c4956a'}30`,
              borderRadius: 'var(--r-sm)', padding: '10px 14px',
              fontSize: 13, color: 'var(--espresso)', fontStyle: 'italic'
            }}>
              AI summary: "{item.receipt_oneliner}"
            </div>
          )}

          {!item.ghost_note && !item.voice_transcript && !item.question_answer && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
              Only vibe score submitted — no text feedback
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  // Simple "auth" — cafe_id stored in localStorage after login
  const [cafeId,    setCafeId]    = useState(() => localStorage.getItem('vc_cafe_id') || '')
  const [inputId,   setInputId]   = useState('')
  const [loggedIn,  setLoggedIn]  = useState(() => !!localStorage.getItem('vc_cafe_id'))

  const [tab,       setTab]       = useState('feed')       // feed | heatmap | insights
  const [overview,  setOverview]  = useState(null)
  const [feed,      setFeed]      = useState([])
  const [heatmap,   setHeatmap]   = useState(null)
  const [insights,  setInsights]  = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  // Feed filters
  const [filterVibe,  setFilterVibe]  = useState('all')
  const [filterTable, setFilterTable] = useState('all')

  const load = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      const [ov, fd, hm, ins] = await Promise.all([
        apiFetch('/overview',       id),
        apiFetch('/feed',           id),
        apiFetch('/heatmap',        id),
        apiFetch('/table-rankings', id),
      ])
      setOverview(ov)
      setFeed(fd.items || [])
      setHeatmap(hm)
      setInsights(ins)
    } catch (e) {
      setError('Could not load data. Check your café ID or backend connection.')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (loggedIn && cafeId) load(cafeId)
  }, [loggedIn, cafeId, load])

  function login() {
    const id = inputId.trim()
    if (!id) return
    localStorage.setItem('vc_cafe_id', id)
    setCafeId(id)
    setLoggedIn(true)
  }

  function logout() {
    localStorage.removeItem('vc_cafe_id')
    setCafeId('')
    setLoggedIn(false)
    setOverview(null)
    setFeed([])
  }

  // Filtered feed
  const tables = [...new Set(feed.map(f => f.table_id))].sort()
  const filteredFeed = feed.filter(f => {
    if (filterVibe  !== 'all' && String(f.vibe_score) !== filterVibe)  return false
    if (filterTable !== 'all' && f.table_id !== filterTable)           return false
    return true
  })

  // ── Login screen ─────────────────────────────────────────────────────────
  if (!loggedIn) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--cream)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}>
        <div style={{
          background: 'var(--foam)', border: '1px solid var(--border)',
          borderRadius: 24, padding: 32, width: '100%', maxWidth: 380,
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--espresso)', marginBottom: 4 }}>
            VibeCheck
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>Owner Dashboard</div>

          <label style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>
            Your Café ID
          </label>
          <input
            value={inputId}
            onChange={e => setInputId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="e.g. brew-house-bhopal"
            style={{
              width: '100%', padding: '14px 16px',
              background: 'var(--cream)', border: '1.5px solid var(--border)',
              borderRadius: 12, fontSize: 15, color: 'var(--espresso)',
              marginBottom: 12,
            }}
          />
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
            This is the <code style={{ background: 'var(--cream2)', padding: '1px 5px', borderRadius: 4 }}>cafe</code> param from your QR URL.
          </p>
          <button
            onClick={login}
            disabled={!inputId.trim()}
            style={{
              width: '100%', padding: '14px',
              background: 'var(--mocha)', color: 'var(--latte)',
              borderRadius: 12, fontSize: 15, fontWeight: 600,
              opacity: inputId.trim() ? 1 : 0.4, cursor: inputId.trim() ? 'pointer' : 'default',
            }}
          >
            View my dashboard →
          </button>
        </div>
      </div>
    )
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', fontFamily: 'var(--font-body)' }}>

      {/* Top bar */}
      <div style={{
        background: 'var(--foam)', borderBottom: '1px solid var(--border)',
        padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--espresso)', flex: 1 }}>
          VibeCheck
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--cream2)', padding: '4px 10px', borderRadius: 100 }}>
          {cafeId}
        </div>
        <button onClick={() => load(cafeId)} style={{ fontSize: 18, color: 'var(--mocha)' }} title="Refresh">↻</button>
        <button onClick={logout} style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sign out</button>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px 60px' }}>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12,
            padding: '12px 16px', fontSize: 13, color: '#b91c1c', marginBottom: 20
          }}>
            {error}
          </div>
        )}

        {loading && !overview && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}><Spinner /></div>
        )}

        {overview && (
          <>
            {/* Stats row */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
              <Stat label="Total Feedback" value={overview.total_feedback} />
              <Stat label="Avg Vibe" value={overview.avg_vibe_score} accent={
                overview.avg_vibe_score >= 4 ? '#22c55e' :
                overview.avg_vibe_score >= 3 ? '#eab308' : '#ef4444'
              } sub="out of 5" />
              <Stat label="Alerts" value={overview.low_vibe_alerts} accent="#ef4444" sub="vibe ≤ 2" />
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
              <Stat label="Voice Notes" value={overview.voice_notes} accent="var(--mocha)" />
              <Stat label="Ghost Notes" value={overview.ghost_notes} accent="var(--mocha)" />
            </div>

            {/* Tab switcher */}
            <div style={{ display: 'flex', gap: 6, margin: '24px 0 0', background: 'var(--cream2)', borderRadius: 12, padding: 4 }}>
              {[['feed', '📋 Feed'], ['heatmap', '🌡️ Heatmap'], ['insights', '📊 Insights']].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 9, fontSize: 13, fontWeight: 600,
                    background: tab === id ? 'var(--foam)' : 'transparent',
                    color: tab === id ? 'var(--espresso)' : 'var(--text-muted)',
                    border: tab === id ? '1px solid var(--border)' : '1px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ── FEED TAB ─────────────────────────────────────────────── */}
            {tab === 'feed' && (
              <>
                {/* Filters */}
                <div style={{ display: 'flex', gap: 8, margin: '16px 0', flexWrap: 'wrap' }}>
                  <select
                    value={filterVibe}
                    onChange={e => setFilterVibe(e.target.value)}
                    style={{
                      padding: '8px 12px', borderRadius: 10, fontSize: 13,
                      background: 'var(--foam)', border: '1px solid var(--border)',
                      color: 'var(--espresso)', cursor: 'pointer',
                    }}
                  >
                    <option value="all">All vibes</option>
                    {[1,2,3,4,5].map(v => (
                      <option key={v} value={v}>{VIBE_EMOJI[v]} {VIBE_LABEL[v]}</option>
                    ))}
                  </select>

                  <select
                    value={filterTable}
                    onChange={e => setFilterTable(e.target.value)}
                    style={{
                      padding: '8px 12px', borderRadius: 10, fontSize: 13,
                      background: 'var(--foam)', border: '1px solid var(--border)',
                      color: 'var(--espresso)', cursor: 'pointer',
                    }}
                  >
                    <option value="all">All tables</option>
                    {tables.map(t => <option key={t} value={t}>Table {t}</option>)}
                  </select>

                  {(filterVibe !== 'all' || filterTable !== 'all') && (
                    <button
                      onClick={() => { setFilterVibe('all'); setFilterTable('all') }}
                      style={{ fontSize: 12, color: 'var(--text-muted)', padding: '8px 12px', background: 'var(--cream2)', borderRadius: 10 }}
                    >
                      Clear filters
                    </button>
                  )}

                  <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center', marginLeft: 'auto' }}>
                    {filteredFeed.length} result{filteredFeed.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Feed list */}
                {filteredFeed.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', fontSize: 14 }}>
                    No feedback yet for these filters ☕
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filteredFeed.map(item => (
                      <FeedbackCard
                        key={item.id}
                        item={item}
                        expanded={expandedId === item.id}
                        onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── HEATMAP TAB ──────────────────────────────────────────── */}
            {tab === 'heatmap' && (
              <>
                <SectionTitle>Vibe by Table & Time</SectionTitle>
                <div style={{
                  background: 'var(--foam)', border: '1px solid var(--border)',
                  borderRadius: 'var(--r)', padding: 20,
                }}>
                  <Heatmap data={heatmap} />
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.6 }}>
                  Red = consistently bad vibe. Check which shift or server covers that slot.
                </p>
              </>
            )}

            {/* ── INSIGHTS TAB ─────────────────────────────────────────── */}
            {tab === 'insights' && (
              <>
                <SectionTitle>Table Rankings</SectionTitle>
                {insights?.rankings?.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {insights.rankings.map((r, i) => (
                      <div key={r.table_id} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        background: 'var(--foam)', border: '1px solid var(--border)',
                        borderRadius: 'var(--r-sm)', padding: '14px 16px',
                      }}>
                        <div style={{ fontSize: 18, width: 28, textAlign: 'center' }}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, color: 'var(--espresso)', fontSize: 14 }}>Table {r.table_id}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.count} feedback{r.count !== 1 ? 's' : ''}</div>
                        </div>
                        <div style={{
                          fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700,
                          color: VIBE_COLOR[Math.round(r.avg_vibe)] || 'var(--mocha)',
                        }}>
                          {r.avg_vibe?.toFixed(1)}
                        </div>
                        <div style={{ fontSize: 20 }}>{VIBE_EMOJI[Math.round(r.avg_vibe)]}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 14 }}>
                    No table data yet
                  </div>
                )}

                <SectionTitle>Recent Ghost Notes</SectionTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {feed.filter(f => f.ghost_note).slice(0, 5).map(f => (
                    <div key={f.id} style={{
                      background: 'var(--foam)', border: '1px solid var(--border)',
                      borderRadius: 'var(--r-sm)', padding: '14px 16px',
                    }}>
                      <div style={{ fontSize: 13, color: 'var(--espresso)', lineHeight: 1.6, marginBottom: 8 }}>
                        "{f.ghost_note}"
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <Badge color={VIBE_COLOR[f.vibe_score]}>{VIBE_EMOJI[f.vibe_score]} {VIBE_LABEL[f.vibe_score]}</Badge>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Table {f.table_id} · {timeAgo(f.submitted_at)}</span>
                      </div>
                    </div>
                  ))}
                  {!feed.filter(f => f.ghost_note).length && (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 14 }}>
                      No ghost notes yet 👻
                    </div>
                  )}
                </div>

                <SectionTitle>Voice Transcripts</SectionTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {feed.filter(f => f.voice_transcript).slice(0, 5).map(f => (
                    <div key={f.id} style={{
                      background: 'var(--foam)', border: '1px solid var(--border)',
                      borderRadius: 'var(--r-sm)', padding: '14px 16px',
                    }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>🎙️ VOICE NOTE</div>
                      <div style={{ fontSize: 13, color: 'var(--espresso)', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 8 }}>
                        "{f.voice_transcript}"
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Badge color={VIBE_COLOR[f.vibe_score]}>{VIBE_EMOJI[f.vibe_score]}</Badge>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Table {f.table_id} · {timeAgo(f.submitted_at)}</span>
                      </div>
                    </div>
                  ))}
                  {!feed.filter(f => f.voice_transcript).length && (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 14 }}>
                      No voice notes yet 🎙️
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}