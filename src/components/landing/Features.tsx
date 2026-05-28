'use client'

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="14" y2="13" />
        <line x1="8" y1="17" x2="12" y2="17" />
      </svg>
    ),
    title: 'Contrats légaux en 2 clics',
    desc: "Générez des contrats d'apport conformes au droit français. Signature électronique eIDAS incluse.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="3" width="18" height="18" rx="2" />
        <line x1="8" y1="12" x2="14" y2="12" />
        <line x1="11" y1="9" x2="11" y2="15" />
        <line x1="5" y1="7" x2="7" y2="7" />
        <line x1="15" y1="7" x2="17" y2="7" />
      </svg>
    ),
    title: 'DAS2 sans effort',
    desc: "Déclaration annuelle générée automatiquement pour tous vos bénéficiaires. Prête pour net-entreprises.fr.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="16" height="14" rx="2" />
        <path d="M7 5V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1" />
        <line x1="7" y1="10" x2="15" y2="10" />
        <line x1="7" y1="14" x2="11" y2="14" />
      </svg>
    ),
    title: 'Factures automatiques',
    desc: 'Facture légale ou reçu de commission générés dès le chantier terminé. Exportables en PDF.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 2L4 6v6c0 4.4 3 8.5 7 9.5 4-1 7-5.1 7-9.5V6z" />
        <polyline points="8 11 10 13 14 9" />
      </svg>
    ),
    title: 'Coffre-fort sécurisé',
    desc: "Documents accessibles immédiatement en cas de contrôle fiscal.",
  },
]

export default function Features() {
  return (
    <section
      id="fonctionnalites"
      style={{
        backgroundColor: 'var(--opus-bg)',
        padding: 'clamp(64px, 8vw, 100px) 24px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Section label */}
        <p style={{
          fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--opus-primary)', fontFamily: 'var(--font-dm-mono, monospace)',
          marginBottom: '16px',
        }}>
          Fonctionnalités
        </p>

        {/* Heading */}
        <h2 style={{
          fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800,
          color: 'var(--opus-ink)', letterSpacing: '-0.02em', lineHeight: 1.15,
          maxWidth: '480px', marginBottom: '48px',
        }}>
          Toutes les fonctionnalités, sans les maux de tête
        </h2>

        {/* 2-col: cards left / photo right */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px',
          alignItems: 'center',
        }}
          className="features-grid"
        >
          {/* Left — 2×2 cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
          }}>
            {FEATURES.map(f => (
              <div
                key={f.title}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid var(--opus-border)',
                  borderRadius: '12px',
                  padding: '24px 20px',
                  transition: 'box-shadow 200ms, border-color 200ms, transform 200ms',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  const t = e.currentTarget
                  t.style.boxShadow = '0 8px 32px rgba(34,116,165,0.12)'
                  t.style.borderColor = 'var(--opus-primary-lt)'
                  t.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  const t = e.currentTarget
                  t.style.boxShadow = 'none'
                  t.style.borderColor = 'var(--opus-border)'
                  t.style.transform = 'translateY(0)'
                }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  backgroundColor: 'var(--opus-primary-xl)',
                  color: 'var(--opus-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '14px',
                  flexShrink: 0,
                }}>
                  {f.icon}
                </div>
                <h3 style={{
                  fontSize: '16px', fontWeight: 700,
                  color: 'var(--opus-ink)', marginBottom: '6px', lineHeight: 1.3,
                }}>
                  {f.title}
                </h3>
                <p style={{
                  fontSize: '14px', color: 'var(--opus-muted)',
                  lineHeight: 1.6,
                }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Right — construction photo */}
          <div style={{
            borderRadius: '14px',
            overflow: 'hidden',
            aspectRatio: '4 / 3',
            backgroundColor: '#D5E8F2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
            {/* Placeholder — remplacer par <Image src="/chantier.jpg" .../> quand disponible */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
              color: 'var(--opus-primary)', opacity: 0.5,
            }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="10" width="40" height="30" rx="4" />
                <circle cx="24" cy="25" r="8" />
                <circle cx="24" cy="25" r="3" />
                <line x1="4" y1="18" x2="44" y2="18" />
              </svg>
              <span style={{ fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-dm-mono, monospace)' }}>
                Photo chantier
              </span>
            </div>
          </div>
        </div>

        {/* Bottom tagline */}
        <p style={{
          marginTop: '40px',
          fontSize: '15px',
          color: 'var(--opus-muted)',
          fontStyle: 'italic',
        }}>
          Parce que gérer une entreprise ne devrait pas ressembler à un contrôle fiscal.
        </p>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .features-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 500px) {
          .features-grid > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}
