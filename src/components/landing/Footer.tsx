'use client'

import Link from 'next/link'
import s from './Footer.module.css'

/* ── Icône Opus — path exact du Footer.svg Figma ───────────────── */
function OpusIcon() {
  return (
    <svg width="24" height="22" viewBox="33 66 22 22" fill="none" aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}>
      <path
        d="M44 67L34 72L44 77L54 72L44 67Z M34 82L44 87L54 82H34Z M34 77L44 82L54 77H34Z"
        fill="#4648D4"
      />
    </svg>
  )
}

/* ── Tokens ─────────────────────────────────────────────────────── */
const ink   = '#131B23'
const text  = '#2A3A48'
const muted = '#5A6E7C'
const blue  = '#4648D4'

/* ── Footer ─────────────────────────────────────────────────────── */
export default function Footer() {
  return (
    <footer
      className={s.footer}
      style={{
        background: '#ffffff',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 540,
      }}
    >
      {/* ── Zone principale ── */}
      <div style={{
        position: 'relative', zIndex: 1,
        flex: 1,
        maxWidth: 1200, margin: '0 auto', width: '100%',
        padding: '56px 40px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'stretch',   /* colonne gauche prend toute la hauteur */
        boxSizing: 'border-box',
      }}>

        {/* ── Colonne gauche : tagline en haut, logo en bas ── */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',  /* tagline haut / logo bas */
          width: 255,
          paddingBottom: 32,
        }}>
          {/* Tagline (haut) */}
          <p style={{
            fontSize: 13, fontWeight: 400, lineHeight: 1.7,
            color: text, margin: 0, fontFamily: 'inherit',
          }}>
            Nous fournissons une plateforme rationalisée
            pour les entreprises du bâtiment de toute envergure.
          </p>

          {/* Logo [icon] OPUS (bas — sur la barre horizontale) */}
          <Link href="/" aria-label="Accueil Opus" style={{
            display: 'flex', flexDirection: 'row',
            alignItems: 'center', gap: 9,
            textDecoration: 'none',
          }}>
            <OpusIcon />
            <span style={{
              fontSize: 16, fontWeight: 800,
              color: ink, letterSpacing: '0.04em',
              lineHeight: 1, fontFamily: 'inherit',
            }}>
              OPUS
            </span>
          </Link>
        </div>

        {/* ── 3 colonnes navigation ── */}
        <div style={{
          display: 'flex', gap: 80,
          alignItems: 'flex-start',
          paddingBottom: 32,
        }}>

          {/* Colonne 1 */}
          <div>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.13em',
              textTransform: 'uppercase', color: ink,
              margin: '0 0 16px', fontFamily: 'inherit',
            }}>Menu</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li><Link href="/"                style={{ fontSize: 13, fontWeight: 400, color: blue,  textDecoration: 'none', display: 'block', fontFamily: 'inherit' }}>Accueil</Link></li>
              <li><Link href="/#about"          style={{ fontSize: 13, fontWeight: 400, color: text,  textDecoration: 'none', display: 'block', fontFamily: 'inherit' }}>À propos</Link></li>
              <li><Link href="/#fonctionnalites"style={{ fontSize: 13, fontWeight: 400, color: text,  textDecoration: 'none', display: 'block', fontFamily: 'inherit' }}>Fonctionnalités</Link></li>
              <li><Link href="/blog"            style={{ fontSize: 13, fontWeight: 400, color: text,  textDecoration: 'none', display: 'block', fontFamily: 'inherit' }}>Blog</Link></li>
              <li><Link href="/contact"         style={{ fontSize: 13, fontWeight: 400, color: text,  textDecoration: 'none', display: 'block', fontFamily: 'inherit' }}>Contact</Link></li>
            </ul>
          </div>

          {/* Colonne 2 */}
          <div>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.13em',
              textTransform: 'uppercase', color: ink,
              margin: '0 0 16px', fontFamily: 'inherit',
            }}>Menu</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li><Link href="/"       style={{ fontSize: 13, fontWeight: 400, color: text, textDecoration: 'none', display: 'block', fontFamily: 'inherit' }}>Accueil</Link></li>
              <li><Link href="/#about" style={{ fontSize: 13, fontWeight: 400, color: text, textDecoration: 'none', display: 'block', fontFamily: 'inherit' }}>À propos</Link></li>
            </ul>
          </div>

          {/* Colonne 3 */}
          <div>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.13em',
              textTransform: 'uppercase', color: ink,
              margin: '0 0 16px', fontFamily: 'inherit',
            }}>Menu</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li><Link href="/" style={{ fontSize: 13, fontWeight: 400, color: text, textDecoration: 'none', display: 'block', fontFamily: 'inherit' }}>Accueil</Link></li>
            </ul>

            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.13em',
              textTransform: 'uppercase', color: ink,
              margin: '24px 0 14px', fontFamily: 'inherit',
            }}>Autres</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Instagram','Facebook','LinkedIn','Twitter'].map(name => (
                <li key={name}>
                  <a
                    href={`https://${name.toLowerCase()}.com`}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      fontSize: 13, fontWeight: 400, color: text,
                      textDecoration: 'underline', textUnderlineOffset: 3,
                      textDecorationColor: 'rgba(42,58,72,0.4)',
                      display: 'block', fontFamily: 'inherit',
                    }}
                  >
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* ── Barre copyright ── */}
      <div style={{ position: 'relative', zIndex: 1, padding: '0 40px', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ height: 1, background: '#E4ECF1' }} />
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', padding: '18px 0 24px',
          }}>
            <p style={{ fontSize: 13, fontWeight: 400, color: muted, margin: 0, fontFamily: 'inherit' }}>
              © 2026 OPUS. Tous droits réservés.
            </p>
            <ul style={{ display: 'flex', gap: 28, listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                ['CGU',              '/cgu'],
                ['Mentions Légales', '/mentions-legales'],
                ['Confidentialité',  '/confidentialite'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} style={{ fontSize: 13, fontWeight: 400, color: muted, textDecoration: 'none', fontFamily: 'inherit' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

    </footer>
  )
}
