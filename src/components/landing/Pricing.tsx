'use client'
import Link from 'next/link'

const CHECK = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 8 6.5 11.5 13 5" />
  </svg>
)

const PLANS = [
  {
    name: 'Gratuit',
    price: '0€',
    period: '',
    desc: 'Pour tester Opus sans engagement.',
    highlight: false,
    badge: null,
    features: [
      '1 apporteur',
      '3 documents / mois',
      'Contrats basiques',
      'Support par email',
    ],
  },
  {
    name: 'Pro',
    price: '3.99€',
    period: '/ mois',
    desc: 'Idéal pour les PME avec plusieurs apporteurs.',
    highlight: true,
    badge: 'La plus populaire',
    features: [
      'Apporteurs illimités',
      'Documents illimités',
      'DAS2 automatique',
      'Coffre-fort 6 ans',
      'Signature eIDAS',
      'Export comptable FEC',
      'Support prioritaire',
    ],
  },
  {
    name: 'Ultra',
    price: '6.99€',
    period: '/ mois',
    desc: 'Pour les structures multi-sites et grands comptes.',
    highlight: false,
    badge: null,
    features: [
      'Tout Pro',
      'Multi-entreprises',
      'API access',
      'Onboarding dédié',
      'SLA 99.9%',
      'Manager de compte',
    ],
  },
]

export default function Pricing() {
  return (
    <section
      id="prix"
      style={{
        backgroundColor: 'var(--opus-bg-tint)',
        padding: 'clamp(64px, 8vw, 100px) 24px',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <p style={{
            fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--opus-primary)', fontFamily: 'var(--font-dm-mono, monospace)',
            marginBottom: '12px',
          }}>
            Tarifs
          </p>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800,
            color: 'var(--opus-ink)', letterSpacing: '-0.02em',
            marginBottom: '12px',
          }}>
            Choisissez votre forfait
          </h2>
          <p style={{
            fontSize: '18px',
            color: 'var(--opus-muted)',
            lineHeight: 1.6,
          }}>
            Des prix justes qui évoluent avec votre entreprise
          </p>
        </div>

        {/* Plans */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          alignItems: 'start',
        }}>
          {PLANS.map(plan => (
            <div
              key={plan.name}
              style={{
                backgroundColor: plan.highlight ? 'var(--opus-primary)' : 'white',
                border: `2px solid ${plan.highlight ? 'var(--opus-primary)' : 'var(--opus-border)'}`,
                borderRadius: '14px',
                padding: '32px 28px',
                position: 'relative',
                transition: 'box-shadow 200ms, transform 200ms',
              }}
              onMouseEnter={e => {
                if (!plan.highlight) {
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(34,116,165,0.12)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {plan.badge && (
                <span style={{
                  position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
                  backgroundColor: '#F59E0B', color: 'white',
                  padding: '4px 16px', borderRadius: '100px',
                  fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap',
                }}>
                  {plan.badge}
                </span>
              )}

              <div style={{ marginBottom: '4px' }}>
                <span style={{
                  fontSize: '14px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
                  color: plan.highlight ? 'rgba(255,255,255,0.7)' : 'var(--opus-muted)',
                  fontFamily: 'var(--font-dm-mono, monospace)',
                }}>
                  {plan.name}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '6px' }}>
                <span style={{
                  fontSize: '42px', fontWeight: 800, letterSpacing: '-0.03em',
                  color: plan.highlight ? 'white' : 'var(--opus-ink)',
                  fontFamily: 'var(--font-rubik)',
                }}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span style={{ fontSize: '15px', color: plan.highlight ? 'rgba(255,255,255,0.65)' : 'var(--opus-muted)' }}>
                    {plan.period}
                  </span>
                )}
              </div>

              <p style={{
                fontSize: '14px',
                color: plan.highlight ? 'rgba(255,255,255,0.7)' : 'var(--opus-muted)',
                marginBottom: '24px',
                lineHeight: 1.5,
              }}>
                {plan.desc}
              </p>

              <Link
                href="/inscription"
                style={{
                  display: 'block', textAlign: 'center',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  marginBottom: '24px',
                  transition: 'opacity 150ms, background 150ms',
                  ...(plan.highlight
                    ? { backgroundColor: 'white', color: 'var(--opus-primary)' }
                    : { backgroundColor: 'var(--opus-primary-xl)', color: 'var(--opus-primary)' }),
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Commencer {plan.name === 'Gratuit' ? 'gratuitement' : `— ${plan.price}/mois`}
              </Link>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      color: plan.highlight ? 'rgba(255,255,255,0.9)' : 'var(--opus-primary)',
                      flexShrink: 0,
                    }}>
                      {CHECK}
                    </span>
                    <span style={{
                      fontSize: '14px',
                      color: plan.highlight ? 'rgba(255,255,255,0.85)' : 'var(--opus-text)',
                    }}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p style={{
          textAlign: 'center', marginTop: '28px',
          fontSize: '14px', color: 'var(--opus-muted)',
        }}>
          Pas de carte bancaire requise · Résiliation à tout moment · Données hébergées en France
        </p>
      </div>
    </section>
  )
}
