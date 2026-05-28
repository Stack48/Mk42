'use client'

const TESTIMONIALS = [
  {
    name: 'Marc D.',
    role: 'Agent immobilier — Apporteur pro',
    quote:
      "Avant Opus, je passais 2 heures par mois à faire ma facturation d'apport. Maintenant c'est automatique dès que le chantier est signé. Et mes factures sont vraiment conformes.",
    rating: 5,
    initials: 'MD',
    color: '#E4F1F9',
    textColor: '#2274A5',
  },
  {
    name: 'Sophie L.',
    role: 'Cadre — Apporteuse particulière',
    quote:
      'Je n\'y connaissais rien en DAS2. Opus m\'a expliqué le processus en 3 lignes et le reste s\'est fait tout seul. Mon reçu est arrivé par email le jour même.',
    rating: 5,
    initials: 'SL',
    color: '#D8F0E6',
    textColor: '#15724A',
  },
  {
    name: 'Jean-Pierre M.',
    role: 'Gérant PME maçonnerie — 10 salariés',
    quote:
      'Mes 8 apporteurs sont tous dans le tableau de bord. La DAS2 de janvier ? Générée en 5 minutes. Je l\'ai déposée sur net-entreprises.fr sans relire une seule ligne.',
    rating: 5,
    initials: 'JM',
    color: '#FEF3C7',
    textColor: '#92400E',
  },
]

function Stars({ count }: { count: number }) {
  return (
    <span aria-label={`${count} étoiles sur 5`} style={{ display: 'flex', gap: '2px' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="16" height="16" viewBox="0 0 16 16"
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

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <p style={{
            fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--opus-primary)', fontFamily: 'var(--font-dm-mono, monospace)',
            marginBottom: '12px',
          }}>
            Témoignages
          </p>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800,
            color: 'var(--opus-ink)', letterSpacing: '-0.02em',
            marginBottom: '12px',
          }}>
            Success Stories
          </h2>
          {/* Rating aggregate */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <Stars count={5} />
            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--opus-ink)', fontFamily: 'var(--font-dm-mono, monospace)' }}>
              4.9
            </span>
            <span style={{ fontSize: '15px', color: 'var(--opus-muted)' }}>/ 5 · +200 avis</span>
          </div>
        </div>

        {/* Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginTop: '48px',
        }}>
          {TESTIMONIALS.map(t => (
            <div
              key={t.name}
              style={{
                backgroundColor: 'white',
                border: '1px solid var(--opus-border)',
                borderRadius: '12px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
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
              <Stars count={t.rating} />

              <p style={{
                fontSize: '17px',
                lineHeight: 1.7,
                color: 'var(--opus-text)',
                fontStyle: 'italic',
                flex: 1,
              }}>
                &ldquo;{t.quote}&rdquo;
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid var(--opus-border)', paddingTop: '16px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  backgroundColor: t.color,
                  color: t.textColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {t.initials}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--opus-ink)' }}>{t.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--opus-muted)' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
