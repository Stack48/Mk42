/**
 * /inscription/compte  →  Création de compte Clerk
 * Accessible après la sélection du profil (/inscription).
 */
import type { Metadata } from 'next'
import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Opus — Créer un compte',
}

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M9 11l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="2.5" y="2.5" width="15" height="15" rx="3.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    title: 'Contrats légaux automatiques',
    desc: 'Générés et signés en quelques secondes, conformes au droit français.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M4 10h12M4 6h8M4 14h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    title: 'DAS2 et factures en 1 clic',
    desc: "Export fiscal prêt à l'emploi, zéro risque de redressement.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 3v14M3 10h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    title: 'Coffre-fort sécurisé RGPD',
    desc: 'Tous vos documents archivés 10 ans, accessibles à tout moment.',
  },
]

export default async function ComptePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── GAUCHE — Formulaire Clerk ── */}
      <div style={{
        flex: '0 0 auto',
        width: '100%',
        maxWidth: '520px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px 40px',
        backgroundColor: 'var(--opus-bg)',
      }}
        className="compte-left"
      >
        <div style={{ marginBottom: '40px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
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
            <span style={{ fontWeight: 700, fontSize: '17px', color: 'var(--opus-ink)', letterSpacing: '0.01em' }}>
              OPUS
            </span>
          </Link>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--opus-ink)', letterSpacing: '-0.3px', marginBottom: '8px' }}>
            Créer votre compte
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--opus-muted)', lineHeight: 1.5 }}>
            Déjà inscrit ?{' '}
            <Link href="/connexion" style={{ color: 'var(--opus-primary)', fontWeight: 500, textDecoration: 'none' }}>
              Se connecter
            </Link>
          </p>
        </div>

        <SignUp unsafeMetadata={{ typeApporteur: type ?? 'particulier' }} />
      </div>

      {/* ── DROITE — Panneau marketing ── */}
      <div
        className="hidden lg:flex"
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '64px 56px',
          background: 'linear-gradient(145deg, #3533B0 0%, #4648D4 45%, #6669E0 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <span aria-hidden="true" style={{
          position: 'absolute', bottom: '-40px', right: '-20px',
          fontSize: '220px', fontWeight: 900, color: 'rgba(255,255,255,0.05)',
          letterSpacing: '-8px', userSelect: 'none', lineHeight: 1, pointerEvents: 'none',
        }}>
          OPUS
        </span>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '440px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '5px 12px', borderRadius: '100px',
            backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
            fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.85)',
            letterSpacing: '0.04em', marginBottom: '32px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#7DD3FC', flexShrink: 0 }} />
            Essai gratuit · Sans carte bancaire
          </span>

          <h2 style={{
            fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, color: '#fff',
            lineHeight: 1.15, letterSpacing: '-0.5px', marginBottom: '16px',
          }}>
            Simplifiez vos commissions.{' '}
            <span style={{ color: 'rgba(255,255,255,0.65)' }}>Évitez les redressements.</span>
          </h2>

          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, marginBottom: '48px' }}>
            Opus automatise la conformité de vos apporteurs d&apos;affaires BTP — contrats, factures, DAS2 — en toute légalité.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '48px' }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, color: '#fff',
                }}>
                  {f.icon}
                </div>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>{f.title}</p>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '32px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            {[{ num: '500+', label: 'entreprises BTP' }, { num: '12 k', label: 'documents générés' }, { num: '98 %', label: 'de satisfaction' }].map(s => (
              <div key={s.label}>
                <p style={{ fontSize: '22px', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.num}</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginTop: '4px' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1023px) { .compte-left { max-width: 100% !important; } }
      `}</style>
    </div>
  )
}
