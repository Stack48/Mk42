'use client'
import Link from 'next/link'

interface Props {
  step: number
  totalSteps: number
  backHref?: string
}

export default function OnboardingHeader({ step, totalSteps, backHref = '/' }: Props) {
  return (
    <header style={{
      backgroundColor: '#fff',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 0 #E2EDF5',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontSize: '22px',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            color: 'var(--opus-ink)',
            textDecoration: 'underline',
            textDecorationColor: 'var(--opus-primary)',
            textDecorationThickness: '3px',
            textUnderlineOffset: '5px',
          }}>
            OPUS
          </span>
        </Link>

        <Link
          href={backHref}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '14px',
            fontWeight: 400,
            color: 'var(--opus-muted)',
            textDecoration: 'none',
            transition: 'color 200ms ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--opus-ink)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--opus-muted)')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Retour
        </Link>
      </div>

      <div
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={`Étape ${step} sur ${totalSteps}`}
        style={{ width: '100%', height: '3px', backgroundColor: '#E5EBF0', overflow: 'hidden' }}
      >
        <div style={{
          width: `${(step / totalSteps) * 100}%`,
          height: '100%',
          backgroundColor: '#1C3064',
          borderRadius: '0 2px 2px 0',
          transition: 'width 0.45s cubic-bezier(.4,0,.2,1)',
        }} />
      </div>
    </header>
  )
}
