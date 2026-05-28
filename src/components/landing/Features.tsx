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
    title: 'Contrats légaux en 2 min',
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
    desc: 'Facture légale ou reçu de commission générés dès le chantier terminé. Numérotation séquentielle incluse.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 2L4 6v6c0 4.4 3 8.5 7 9.5 4-1 7-5.1 7-9.5V6z" />
        <polyline points="8 11 10 13 14 9" />
      </svg>
    ),
    title: 'Coffre-fort sécurisé',
    desc: "Conservation 6 ans avec valeur probante. Horodatage tiers pour vos contrôles fiscaux.",
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

        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{
            fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--opus-primary)', fontFamily: 'var(--font-dm-mono, monospace)',
            marginBottom: '12px',
          }}>
            Fonctionnalités
          </p>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800,
            color: 'var(--opus-ink)', letterSpacing: '-0.02em', lineHeight: 1.15,
            maxWidth: '600px', margin: '0 auto 16px',
          }}>
            Toutes les fonctionnalités, sans les maux de tête
          </h2>
          <p style={{
            fontSize: '18px', color: 'var(--opus-muted)', lineHeight: 1.6,
            maxWidth: '520px', margin: '0 auto',
          }}>
            Un outil pensé pour les entreprises BTP et leurs réseaux d'apporteurs.
          </p>
        </div>

        {/* Grid + promo card */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '16px',
        }}>
          {/* 2x2 feature cards */}
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              style={{
                gridColumn: 'span 3',
                backgroundColor: 'white',
                border: '1px solid var(--opus-border)',
                borderRadius: '12px',
                padding: '28px 24px',
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
                width: '44px', height: '44px', borderRadius: '10px',
                backgroundColor: 'var(--opus-primary-xl)',
                color: 'var(--opus-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '16px',
                flexShrink: 0,
              }}>
                {f.icon}
              </div>
              <h3 style={{
                fontSize: '17px', fontWeight: 700,
                color: 'var(--opus-ink)', marginBottom: '8px', lineHeight: 1.3,
              }}>
                {f.title}
              </h3>
              <p style={{
                fontSize: '15px', color: 'var(--opus-muted)',
                lineHeight: 1.6,
              }}>
                {f.desc}
              </p>
            </div>
          ))}

          {/* Promo card — full-width bottom */}
          <div style={{
            gridColumn: 'span 12',
            background: 'linear-gradient(135deg, var(--opus-primary) 0%, var(--opus-primary-lt) 100%)',
            borderRadius: '12px',
            padding: '36px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px',
          }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', fontFamily: 'var(--font-dm-mono, monospace)' }}>
                Prêt à commencer ?
              </p>
              <h3 style={{ fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 700, color: 'white', lineHeight: 1.25 }}>
                Conformez-vous en 10 minutes chrono.
              </h3>
            </div>
            <a
              href="/inscription"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                backgroundColor: 'white',
                color: 'var(--opus-primary)',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 700,
                textDecoration: 'none',
                flexShrink: 0,
                transition: 'opacity 150ms',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Créer mon compte gratuit
            </a>
          </div>
        </div>
      </div>

      {/* Mobile responsive override */}
      <style>{`
        @media (max-width: 900px) {
          #fonctionnalites [style*="span 3"] { grid-column: span 6 !important; }
        }
        @media (max-width: 600px) {
          #fonctionnalites [style*="span 3"] { grid-column: span 12 !important; }
        }
      `}</style>
    </section>
  )
}
