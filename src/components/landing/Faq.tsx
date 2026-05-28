'use client'
import { useState } from 'react'

const ITEMS = [
  {
    q: 'Vos commissions sont-elles vraiment protégées par Opus ?',
    a: "Opus génère les documents légaux requis (contrats, factures, DAS2) et les conserve avec valeur probante pendant 6 ans. La conformité légale dépend de l'utilisation correcte des documents — Opus vous donne les outils, la responsabilité finale reste à l'utilisateur.",
  },
  {
    q: 'Comment ça marche pour les apporteurs particuliers ?',
    a: "Pour un apporteur particulier (sans SIRET), Opus génère un reçu de commission. C'est l'entreprise BTP qui émet la DAS2 correspondante avant le 1er février. Sarah n'a rien à déclarer elle-même — l'entreprise s'en charge via Opus.",
  },
  {
    q: 'Les documents générés ont-ils une valeur légale ?',
    a: "Oui. Les contrats sont signés avec signature électronique eIDAS (valeur légale dans toute l'UE). Les factures incluent toutes les mentions obligatoires du Code de Commerce. La DAS2 est au format CERFA n°2062. L'horodatage garantit l'intégrité des documents.",
  },
  {
    q: 'Puis-je tester Opus gratuitement ?',
    a: "Oui, le forfait Gratuit vous permet de créer 1 apporteur et 3 documents par mois sans carte bancaire. Vous pouvez passer au forfait Pro à tout moment, et résilier sans frais ni préavis.",
  },
  {
    q: 'Mes données sont-elles confidentielles ?',
    a: "Absolument. Vos données sont hébergées en France (AWS eu-west-3 — Paris), chiffrées au repos et en transit. Opus est conforme au RGPD. Nous ne partageons jamais vos données avec des tiers à des fins commerciales.",
  },
]

export default function Faq() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section
      id="faq"
      style={{
        backgroundColor: 'var(--opus-bg)',
        padding: 'clamp(64px, 8vw, 100px) 24px',
      }}
    >
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{
            fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--opus-primary)', fontFamily: 'var(--font-dm-mono, monospace)',
            marginBottom: '12px',
          }}>
            FAQ
          </p>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800,
            color: 'var(--opus-ink)', letterSpacing: '-0.02em',
          }}>
            Questions fréquentes
          </h2>
        </div>

        {/* Accordion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {ITEMS.map((item, i) => {
            const isOpen = open === i
            return (
              <div
                key={i}
                style={{
                  border: `1px solid ${isOpen ? 'var(--opus-primary-lt)' : 'var(--opus-border)'}`,
                  borderRadius: '10px',
                  overflow: 'hidden',
                  transition: 'border-color 200ms',
                  backgroundColor: isOpen ? 'var(--opus-primary-xl)' : 'white',
                }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '20px 24px',
                    background: 'none', border: 'none',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
                  }}
                >
                  <span style={{
                    fontSize: '17px', fontWeight: 600,
                    color: 'var(--opus-ink)', lineHeight: 1.4,
                  }}>
                    {item.q}
                  </span>
                  <span style={{
                    flexShrink: 0,
                    width: '28px', height: '28px',
                    borderRadius: '50%',
                    backgroundColor: isOpen ? 'var(--opus-primary)' : 'var(--opus-bg-tint)',
                    color: isOpen ? 'white' : 'var(--opus-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 200ms, color 200ms, transform 200ms',
                    transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <line x1="7" y1="2" x2="7" y2="12" />
                      <line x1="2" y1="7" x2="12" y2="7" />
                    </svg>
                  </span>
                </button>

                <div style={{
                  maxHeight: isOpen ? '400px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 300ms ease',
                }}>
                  <p style={{
                    padding: '0 24px 20px',
                    fontSize: '16px',
                    color: 'var(--opus-text)',
                    lineHeight: 1.7,
                  }}>
                    {item.a}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <p style={{
          textAlign: 'center', marginTop: '40px',
          fontSize: '16px', color: 'var(--opus-muted)',
        }}>
          Vous avez une autre question ?{' '}
          <a href="mailto:support@opus-btp.fr" style={{ color: 'var(--opus-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Contactez-nous
          </a>
        </p>
      </div>
    </section>
  )
}
