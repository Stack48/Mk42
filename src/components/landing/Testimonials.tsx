'use client'

const TESTIMONIALS = [
  {
    name: 'Marc G.',
    role: 'Agent immobilier — Apporteur pro',
    quote:
      "Avant Opus, je passais 2 heures par mois à faire ma facturation d'apport. Maintenant c'est automatique dès que le chantier est signé.",
    rating: 5,
    initials: 'MG',
    color: '#E4F1F9',
    textColor: '#2274A5',
  },
  {
    name: 'Sophie N.',
    role: 'Cadre — Apporteuse particulière',
    quote:
      "Je n'y connaissais rien en DAS2. Opus m'a expliqué le processus en 3 lignes et le reste s'est fait tout seul. Mon reçu est arrivé par email le jour même.",
    rating: 5,
    initials: 'SN',
    color: '#D8F0E6',
    textColor: '#15724A',
  },
  {
    name: 'Jean-Pierre T.',
    role: 'Gérant PME maçonnerie',
    quote:
      "J'aurais dû avoir ces fonctionnalités il y a dix ans. La plateforme est extrêmement facile à prendre en main. Je la recommande à tous mes collègues.",
    rating: 5,
    initials: 'JT',
    color: '#FEF3C7',
    textColor: '#92400E',
  },
]

function Stars({ count }: { count: number }) {
  return (
    <span aria-label={`${count} étoiles sur 5`} style={{ display: 'flex', gap: '3px' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="18" height="18" viewBox="0 0 16 16"
          fill={i < count ? '#F59E0B' : '#E5E7EB'}
          aria-hidden="true"
        >
          <path d="M8 1l1.85 3.75L14 5.5l-3 2.92.7 4.08L8 10.4l-3.7 2.1.7-4.08-3-2.92 4.15-.75z" />
        </svg>
      ))}
    </span>
  )
}

export default function Testimonials() {
  return (
    <section
      style={{
        backgroundColor: 'var(--opus-bg)',
        padding: 'clamp(64px, 8vw, 100px) 24px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '80px',
          alignItems: 'start',
        }}
          className="testimonials-grid"
        >

          {/* Left — heading + rating */}
          <div style={{ position: 'sticky', top: '80px' }}>
            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 800,
              color: 'var(--opus-ink)',
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
              marginBottom: '20px',
            }}>
              Success<br />Stories.
            </h2>

            <p style={{
              fontSize: '16px',
              color: 'var(--opus-muted)',
              lineHeight: 1.7,
              marginBottom: '28px',
            }}>
              Découvrez comment les meilleurs professionnels du bâtiment font confiance à Opus pour gérer leurs commissions.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Stars count={5} />
              <span style={{
                fontSize: '22px', fontWeight: 800,
                color: 'var(--opus-ink)',
                fontFamily: 'var(--font-dm-mono, monospace)',
              }}>
                4.9
              </span>
              <span style={{ fontSize: '14px', color: 'var(--opus-muted)' }}>/5</span>
            </div>
          </div>

          {/* Right — cards stacked */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {TESTIMONIALS.map(t => (
              <div
                key={t.name}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid var(--opus-border)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'box-shadow 200ms, transform 200ms',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(34,116,165,0.1)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* Colored accent top */}
                <div style={{
                  height: '4px',
                  backgroundColor: t.textColor,
                  opacity: 0.6,
                }} />

                <div style={{ padding: '24px 28px' }}>
                  <Stars count={t.rating} />

                  <p style={{
                    fontSize: '16px',
                    lineHeight: 1.7,
                    color: 'var(--opus-text)',
                    fontStyle: 'italic',
                    margin: '14px 0 20px',
                  }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '10px',
                      backgroundColor: t.color,
                      color: t.textColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 700,
                      flexShrink: 0,
                    }}>
                      {t.initials}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--opus-ink)' }}>
                        {t.name}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--opus-muted)' }}>
                        {t.role}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .testimonials-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .testimonials-grid > div:first-child {
            position: static !important;
          }
        }
      `}</style>
    </section>
  )
}
