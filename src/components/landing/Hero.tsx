'use client'
import Link from 'next/link'
import DashboardPreview from './DashboardPreview'

export default function Hero() {
  return (
    <section style={{
      backgroundColor: 'var(--opus-bg)',
      paddingTop: '120px',
      paddingBottom: '80px',
      overflow: 'hidden',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

        {/* Eyebrow */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            padding: '6px 14px',
            borderRadius: '100px',
            border: '1px solid var(--opus-border)',
            backgroundColor: 'var(--opus-primary-xl)',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--opus-primary-dk)',
            fontFamily: 'var(--font-dm-mono, monospace)',
            letterSpacing: '0.02em',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--opus-primary)', display: 'inline-block',
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            Conformité DAS2 · Factures légales · Coffre-fort
          </span>
        </div>

        {/* H1 */}
        <h1 style={{
          textAlign: 'center',
          fontSize: 'clamp(36px, 5.5vw, 60px)',
          fontWeight: 800,
          lineHeight: 1.1,
          color: 'var(--opus-ink)',
          letterSpacing: '-0.025em',
          maxWidth: '800px',
          margin: '0 auto 24px',
        }}>
          Simplifiez vos opérations.{' '}
          <span style={{ color: 'var(--opus-primary)' }}>
            Accélérez votre croissance.
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          textAlign: 'center',
          fontSize: 'clamp(18px, 2vw, 21px)',
          fontWeight: 400,
          color: 'var(--opus-muted)',
          lineHeight: 1.65,
          maxWidth: '580px',
          margin: '0 auto 40px',
        }}>
          Opus automatise la conformité de vos commissions d'apporteurs d'affaires — contrats, factures, DAS2 — sans risque de redressement fiscal.
        </p>

        {/* CTA row */}
        <div style={{
          display: 'flex', flexWrap: 'wrap',
          gap: '12px', justifyContent: 'center',
          marginBottom: '64px',
        }}>
          <Link
            href="/inscription"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              backgroundColor: 'var(--opus-primary)',
              color: 'white',
              padding: '14px 28px',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(34,116,165,0.35)',
              transition: 'background 150ms, box-shadow 150ms, transform 150ms',
            }}
            onMouseEnter={e => {
              const t = e.currentTarget
              t.style.backgroundColor = 'var(--opus-primary-dk)'
              t.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              const t = e.currentTarget
              t.style.backgroundColor = 'var(--opus-primary)'
              t.style.transform = 'translateY(0)'
            }}
          >
            Essayer gratuitement
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </Link>

          <Link
            href="/connexion"
            style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '14px 24px',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 500,
              color: 'var(--opus-text)',
              textDecoration: 'none',
              border: '1px solid var(--opus-border)',
              background: 'white',
              transition: 'border-color 150ms, background 150ms',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--opus-primary)'
              e.currentTarget.style.background = 'var(--opus-primary-xl)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--opus-border)'
              e.currentTarget.style.background = 'white'
            }}
          >
            Se connecter
          </Link>
        </div>

        {/* Dashboard preview */}
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <DashboardPreview />
        </div>

      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </section>
  )
}
