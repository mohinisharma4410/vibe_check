import React from 'react'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24,
      fontFamily: 'var(--font-body)', color: 'var(--text-main)',
    }}>
      <span style={{ fontSize: 48 }}>☕</span>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--espresso)' }}>
        Wrong table.
      </div>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center' }}>
        This page doesn't exist. Try scanning your table's QR code again.
      </p>
    </div>
  )
}