'use client'

const COLUMNS = [
  {
    title: 'Produit',
    links: [
      { label: 'Fonctionnalités', href: '#fonctionnalites' },
      { label: 'Tarifs', href: '#prix' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Guide DAS2', href: '#' },
      { label: 'Statuts', href: '#' },
    ],
  },
  {
    title: 'Contact',
    links: [
      { label: 'Support', href: 'mailto:support@opus-btp.fr' },
      { label: 'Ventes', href: 'mailto:contact@opus-btp.fr' },
      { label: 'Presse', href: 'mailto:presse@opus-btp.fr' },
    ],
  },
]

const LEGAL = [
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'CGU', href: '/cgu' },
  { label: 'Confidentialité', href: '/confidentialite' },
  { label: 'Cookies', href: '/cookies' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{
      backgroundColor: 'var(--opus-ink)',
      color: 'rgba(255,255,255,0.65)',
      position: 'relative',
      overflow: 'hidden',
      paddingTop: '64px',
      paddingBottom: '32px',
    }}>
      {/* Watermark */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '-30px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 'clamp(120px, 20vw, 200px)',
          fontWeight: 900,
          color: 'rgba(255,255,255,0.04)',
          letterSpacing: '-0.04em',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          lineHeight: 1,
        }}
      >
        OPUS
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        {/* Top: logo + columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr repeat(3, 1fr)',
          gap: '40px',
          marginBottom: '56px',
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{
                width: '30px', height: '30px', borderRadius: '7px',
                backgroundColor: 'var(--opus-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1.2" fill="white" />
                  <rect x="9" y="2.5" width="4.5" height="4.5" rx="1.2" fill="white" fillOpacity="0.55" />
                  <rect x="2.5" y="9" width="4.5" height="4.5" rx="1.2" fill="white" fillOpacity="0.55" />
                  <rect x="9" y="9" width="4.5" height="4.5" rx="1.2" fill="white" />
                </svg>
              </span>
              <span style={{ fontWeight: 700, fontSize: '17px', color: 'white', letterSpacing: '0.01em' }}>OPUS</span>
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.7, maxWidth: '240px' }}>
              La conformité des commissions d'apporteurs d'affaires, enfin automatisée.
            </p>
            <p style={{ fontSize: '12px', marginTop: '12px', color: 'rgba(255,255,255,0.35)' }}>
              Hébergé en France · AWS eu-west-3
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map(col => (
            <div key={col.title}>
              <h3 style={{
                fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)', marginBottom: '16px',
                fontFamily: 'var(--font-dm-mono, monospace)',
              }}>
                {col.title}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {col.links.map(link => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      style={{
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.6)',
                        textDecoration: 'none',
                        transition: 'color 150ms',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: '24px' }} />

        {/* Bottom row */}
        <div style={{
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'space-between',
          gap: '16px',
        }}>
          <p style={{ fontSize: '13px' }}>
            © {year} Opus BTP · Stack 48. Tous droits réservés.
          </p>
          <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {LEGAL.map(link => (
              <a
                key={link.label}
                href={link.href}
                style={{
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.45)',
                  textDecoration: 'none',
                  transition: 'color 150ms',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile responsive */}
      <style>{`
        @media (max-width: 768px) {
          footer [style*="gridTemplateColumns: '1.4fr"] {
            grid-template-columns: 1fr 1fr !important;
          }
          footer [style*="gridTemplateColumns: '1.4fr"] > div:first-child {
            grid-column: span 2 !important;
          }
        }
        @media (max-width: 480px) {
          footer [style*="gridTemplateColumns: '1.4fr"] {
            grid-template-columns: 1fr !important;
          }
          footer [style*="gridTemplateColumns: '1.4fr"] > div:first-child {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </footer>
  )
}
