'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardPreview from './DashboardPreview'

const C = {
  primary: '#4648D4',
  primaryDk: '#3533B0',
  primaryXL: '#EEEEFF',
  ink: '#111111',
  muted: '#6B7280',
  border: '#E5E7EB',
}

export default function Hero() {
  const [email, setEmail] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push('/inscription')
  }

  return (
    <section style={{ background: '#fff', paddingTop: 100, paddingBottom: 72, overflow: 'hidden' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>

        {/* Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 100,
            border: `1px solid ${C.border}`, background: C.primaryXL,
            fontSize: 13, fontWeight: 500, color: C.primary,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill={C.primary}>
              <path d="M7.833 1.167L2.917 7.583h4.25l-.834 5.25 5.25-6.416H7.25z"/>
            </svg>
            Découvrez tout ce qui peut être transformé avec les pros de votre entreprise
          </span>
        </div>

        {/* H1 */}
        <h1 style={{
          textAlign: 'center',
          fontSize: 'clamp(36px, 5vw, 58px)',
          fontWeight: 800, lineHeight: 1.1,
          color: C.ink, letterSpacing: '-0.03em',
          maxWidth: 820, margin: '0 auto 20px',
        }}>
          Simplifiez vos opérations.{' '}
          <br />
          Accélérez votre croissance.
        </h1>

        {/* Subtitle */}
        <p style={{
          textAlign: 'center', fontSize: 16,
          color: C.muted, lineHeight: 1.7,
          maxWidth: 560, margin: '0 auto 36px',
        }}>
          Une plateforme SaaS tout-en-un pour rationaliser vos projets, automatiser vos ventes et fluidifier vos flux de travail pour toute entreprise du bâtiment.
        </p>

        {/* Email + CTA */}
        <form onSubmit={handleSubmit} style={{
          display: 'flex', justifyContent: 'center', gap: 8,
          marginBottom: 56, flexWrap: 'wrap',
        }}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            style={{
              padding: '11px 16px', borderRadius: 8, fontSize: 14,
              border: `1px solid ${C.border}`, outline: 'none',
              width: 240, color: C.ink,
              transition: 'border-color 150ms',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = C.primary)}
            onBlur={e => (e.currentTarget.style.borderColor = C.border)}
          />
          <button type="submit" style={{
            background: C.primary, color: '#fff',
            padding: '11px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            border: 'none', cursor: 'pointer', transition: 'background 150ms',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = C.primaryDk)}
            onMouseLeave={e => (e.currentTarget.style.background = C.primary)}
          >
            Démarrer maintenant
          </button>
        </form>

        {/* Dashboard */}
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <DashboardPreview />
        </div>

      </div>
    </section>
  )
}
