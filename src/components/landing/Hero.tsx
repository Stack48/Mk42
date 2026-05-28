'use client'
import Link from 'next/link'
import { useState } from 'react'
import DashboardPreview from './DashboardPreview'

export default function Hero() {
  const [email, setEmail] = useState('')

  return (
    <section style={{
      backgroundColor: 'var(--opus-bg)',
      paddingTop: '120px',
      paddingBottom: '80px',
      overflow: 'hidden',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

        {/* Eyebrow badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            padding: '6px 16px',
            borderRadius: '100px',
            border: '1px solid var(--opus-border)',
            backgroundColor: 'var(--opus-primary-xl)',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--opus-primary-dk)',
            letterSpacing: '0.01em',
          }}>
            {/* Sparkle icon */}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1L8.04 4.52L11.5 5L8.68 7.48L9.56 11L7 9.26L4.44 11L5.32 7.48L2.5 5L5.96 4.52Z" fill="var(--opus-primary)" />
            </svg>
            Obtenez tout en un pour la croissance de votre entreprise
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
          Simplifiez vos opérations.
          <br />
          Accélérez votre croissance.
        </h1>

        {/* Subtitle */}
        <p style={{
          textAlign: 'center',
          fontSize: 'clamp(17px, 1.8vw, 20px)',
          fontWeight: 400,
          color: 'var(--opus-muted)',
          lineHeight: 1.65,
          maxWidth: '600px',
          margin: '0 auto 40px',
        }}>
          La plateforme SaaS tout-en-un pour rationaliser vos projets, automatiser vos ventes et fluidifier vos flux de travail pour toute entreprise du bâtiment.
        </p>

        {/* Email input + CTA */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '64px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'white',
            border: '1px solid var(--opus-border)',
            borderRadius: '10px',
            padding: '6px 6px 6px 18px',
            boxShadow: '0 4px 20px rgba(34,116,165,0.08)',
            width: '100%',
            maxWidth: '460px',
          }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '15px',
                color: 'var(--opus-ink)',
                background: 'transparent',
                minWidth: 0,
                fontFamily: 'inherit',
              }}
            />
            <Link
              href={`/inscription${email ? `?email=${encodeURIComponent(email)}` : ''}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'var(--opus-primary)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '7px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'background 150ms',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--opus-primary-dk)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--opus-primary)')}
            >
              Démarrer maintenant
            </Link>
          </div>
        </div>

        {/* Dashboard preview */}
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <DashboardPreview />
        </div>

      </div>
    </section>
  )
}
