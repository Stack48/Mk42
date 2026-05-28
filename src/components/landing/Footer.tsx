'use client'

const C = { primary: '#4648D4' }

export default function Footer() {
  return (
    <footer style={{ background: '#111111', color: 'rgba(255,255,255,0.55)', position: 'relative', overflow: 'hidden', paddingTop: 56, paddingBottom: 28 }}>

      {/* OPUS watermark */}
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)',
        fontSize: 'clamp(100px,18vw,180px)', fontWeight: 900,
        color: 'rgba(255,255,255,0.04)', letterSpacing: '-0.04em',
        userSelect: 'none', whiteSpace: 'nowrap', pointerEvents: 'none', lineHeight: 1,
      }}>OPUS</div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 40, marginBottom: 48 }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{
                width: 28, height: 28, borderRadius: 6, background: C.primary,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1.2" fill="white"/>
                  <rect x="9" y="2.5" width="4.5" height="4.5" rx="1.2" fill="white" fillOpacity="0.55"/>
                  <rect x="2.5" y="9" width="4.5" height="4.5" rx="1.2" fill="white" fillOpacity="0.55"/>
                  <rect x="9" y="9" width="4.5" height="4.5" rx="1.2" fill="white"/>
                </svg>
              </span>
              <span style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>OPUS</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 220, marginBottom: 10 }}>
              La plateforme qui automatise la gestion des commissions d'apporteurs d'affaires pour les professionnels du bâtiment.
            </p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>SIRET : 123 456 789 00010</p>
          </div>

          {/* Menu */}
          <div>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 14, fontFamily: "'DM Mono', monospace" }}>Menu</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
              {['Dashboard', 'App store', 'Fonctionnalités', 'Tarifs', 'Contact'].map(item => (
                <li key={item}>
                  <a href="#" style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 150ms' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                  >{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 14, fontFamily: "'DM Mono', monospace" }}>Légal</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
              {['Mentions légales', 'Politique de confidentialité', 'Sécurité'].map(item => (
                <li key={item}>
                  <a href="#" style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 150ms' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                  >{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider + bottom */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 20 }} />
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
          © {new Date().getFullYear()} Réservé Opus BTP. Tous droits réservés.
        </p>
      </div>

      <style>{`
        @media(max-width:768px){footer [style*="1.5fr 1fr 1fr"]{grid-template-columns:1fr 1fr!important}}
        @media(max-width:480px){footer [style*="1.5fr 1fr 1fr"]{grid-template-columns:1fr!important}}
      `}</style>
    </footer>
  )
}
