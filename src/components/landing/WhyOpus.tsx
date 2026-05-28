'use client'
import { useState } from 'react'
import Image from 'next/image'

const TABS = [
  {
    id: 'apporteur-pro',
    label: 'Apporteur pro',
    heading: 'Facturez vos commissions en toute légalité',
    body: "Marc émet une facture légale conforme avec toutes les mentions obligatoires : SIRET, TVA, référence chantier, conditions de règlement. Fini la paperasse — Opus s'en charge.",
    badge: 'Pour Marc — 45 ans, agent immobilier',
  },
  {
    id: 'apporteur-part',
    label: 'Apporteur particulier',
    heading: 'Reçu de commission automatique, zéro paperasse',
    body: "Sarah reçoit son reçu de commission dès que le chantier est terminé. L'entreprise génère la DAS2 correspondante. Sarah n'a rien à faire.",
    badge: 'Pour Sarah — 30 ans, cadre',
  },
  {
    id: 'entreprise',
    label: 'Entreprise BTP',
    heading: 'DAS2 et comptabilité automatisées',
    body: "Jean gère 14 apporteurs depuis un tableau de bord. La DAS2 annuelle est générée automatiquement avec toutes les données requises par l'URSSAF. Export FEC inclus.",
    badge: 'Pour Jean — PME maçonnerie, 10 salariés',
  },
]

export default function WhyOpus() {
  const [active, setActive] = useState(0)
  const tab = TABS[active]

  return (
    <section
      id="temoignages"
      style={{
        backgroundColor: 'var(--opus-bg-warm)',
        padding: 'clamp(64px, 8vw, 100px) 24px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{
            fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--opus-primary)', fontFamily: 'var(--font-dm-mono, monospace)',
            marginBottom: '12px',
          }}>
            Pourquoi Opus
          </p>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800,
            color: 'var(--opus-ink)', letterSpacing: '-0.02em', lineHeight: 1.15,
          }}>
            Pourquoi vous allez adorer OPUS
          </h2>
        </div>

        {/* Tab buttons */}
        <div style={{
          display: 'flex', gap: '8px', justifyContent: 'center',
          flexWrap: 'wrap', marginBottom: '40px',
        }}>
          {TABS.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setActive(i)}
              style={{
                padding: '10px 22px',
                borderRadius: '100px',
                fontSize: '15px',
                fontWeight: 600,
                border: '1px solid',
                cursor: 'pointer',
                transition: 'all 200ms',
                ...(active === i
                  ? {
                      backgroundColor: 'var(--opus-primary)',
                      color: 'white',
                      borderColor: 'var(--opus-primary)',
                      boxShadow: '0 4px 16px rgba(34,116,165,0.28)',
                    }
                  : {
                      backgroundColor: 'white',
                      color: 'var(--opus-text)',
                      borderColor: 'var(--opus-border)',
                    }),
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.6fr',
          gap: '40px',
          alignItems: 'center',
        }}>
          {/* Text side */}
          <div style={{
            opacity: 1,
            transform: 'translateY(0)',
            transition: 'opacity 300ms, transform 300ms',
          }}>
            <span style={{
              display: 'inline-block',
              marginBottom: '16px',
              padding: '5px 12px',
              borderRadius: '6px',
              backgroundColor: 'var(--opus-primary-xl)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--opus-primary)',
              fontFamily: 'var(--font-dm-mono, monospace)',
              letterSpacing: '0.02em',
            }}>
              {tab.badge}
            </span>

            <h3 style={{
              fontSize: 'clamp(22px, 2.8vw, 30px)',
              fontWeight: 700,
              color: 'var(--opus-ink)',
              lineHeight: 1.25,
              marginBottom: '16px',
              letterSpacing: '-0.015em',
            }}>
              {tab.heading}
            </h3>

            <p style={{
              fontSize: '18px',
              color: 'var(--opus-muted)',
              lineHeight: 1.65,
            }}>
              {tab.body}
            </p>

            <a
              href="/inscription"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                marginTop: '28px',
                color: 'var(--opus-primary)',
                fontSize: '15px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'gap 150ms',
              }}
              onMouseEnter={e => (e.currentTarget.style.gap = '10px')}
              onMouseLeave={e => (e.currentTarget.style.gap = '6px')}
            >
              En savoir plus
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 7h10M8 3l4 4-4 4" />
              </svg>
            </a>
          </div>

          {/* Dashboard preview side */}
          <div style={{
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid var(--opus-border)',
            boxShadow: '0 12px 40px rgba(34,116,165,0.12)',
          }}>
            {/* Browser bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 12px',
              background: '#F1F5F9',
              borderBottom: '1px solid #E2EBF3',
            }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FC5F57', display: 'inline-block' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FDBC2C', display: 'inline-block' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#25CC40', display: 'inline-block' }} />
              <div style={{
                flex: 1, marginLeft: '6px', background: 'white', borderRadius: '4px',
                padding: '3px 8px', fontSize: '10px', color: '#8EA3B3',
                fontFamily: 'var(--font-dm-mono, monospace)',
                border: '1px solid #DDE8F0',
              }}>
                app.opus-btp.fr/dashboard
              </div>
            </div>
            <Image
              src="/dashboard-preview.png"
              alt={`Dashboard Opus — vue ${tab.label}`}
              width={800}
              height={580}
              style={{ display: 'block', width: '100%', height: 'auto' }}
            />
          </div>
        </div>
      </div>

      {/* Mobile responsive */}
      <style>{`
        @media (max-width: 768px) {
          #temoignages [style*="gridTemplateColumns: '1fr 1.6fr'"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}
