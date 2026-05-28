'use client'
import { useState } from 'react'

const ITEMS = [
  {
    q: "Mes commissions seront-elles reconnues par l'État ?",
    a: "Opus génère les documents légaux requis (contrats, factures, DAS2) reconnus par l'administration fiscale. La DAS2 est au format CERFA n°2062, les factures contiennent toutes les mentions obligatoires du Code de Commerce.",
  },
  {
    q: "Je ne suis pas à l'aise avec l'informatique, est-ce simple ?",
    a: "Oui. Opus a été conçu pour des professionnels du bâtiment, pas des développeurs. Chaque étape est guidée avec des explications claires. La plupart des utilisateurs génèrent leur premier document en moins de 10 minutes.",
  },
  {
    q: "Ai-je besoin d'un comptable pour utiliser Opus ?",
    a: "Non. Opus automatise les tâches comptables liées aux commissions d'apporteurs d'affaires. Le coffre-fort sécurisé et les exports FEC vous permettent de tout partager facilement avec votre expert-comptable si besoin.",
  },
  {
    q: "Que se passe-t-il après les 7 jours gratuits ?",
    a: "Vous restez sur le forfait Gratuit (1 apporteur, 3 documents/mois) sans engagement, ou vous passez au forfait Pro. Aucune carte bancaire requise pour démarrer. Résiliation à tout moment, sans frais ni préavis.",
  },
  {
    q: "Mes données sont-elles confidentielles ?",
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
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.6fr',
          gap: '80px',
          alignItems: 'start',
        }}
          className="faq-grid"
        >

          {/* Left — heading */}
          <div style={{ position: 'sticky', top: '80px' }}>
            <p style={{
              fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--opus-primary)', fontFamily: 'var(--font-dm-mono, monospace)',
              marginBottom: '16px',
            }}>
              FAQ
            </p>
            <h2 style={{
              fontSize: 'clamp(28px, 3.5vw, 42px)',
              fontWeight: 800,
              color: 'var(--opus-ink)',
              letterSpacing: '-0.025em',
              lineHeight: 1.15,
              marginBottom: '20px',
            }}>
              Questions<br />Fréquentes.
            </h2>
            <p style={{
              fontSize: '16px',
              color: 'var(--opus-muted)',
              lineHeight: 1.7,
              marginBottom: '28px',
            }}>
              Vous avez une question ? Nous avons toutes les réponses.
            </p>
            <a
              href="mailto:support@opus-btp.fr"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                color: 'var(--opus-primary)',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Contactez-nous
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 6.5h9M7 2.5l4 4-4 4" />
              </svg>
            </a>
          </div>

          {/* Right — accordion */}
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
                      padding: '18px 20px',
                      background: 'none', border: 'none',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
                    }}
                  >
                    <span style={{
                      fontSize: '16px', fontWeight: 600,
                      color: 'var(--opus-ink)', lineHeight: 1.4,
                    }}>
                      {item.q}
                    </span>
                    <span style={{
                      flexShrink: 0,
                      width: '26px', height: '26px',
                      borderRadius: '50%',
                      backgroundColor: isOpen ? 'var(--opus-primary)' : 'var(--opus-bg-tint)',
                      color: isOpen ? 'white' : 'var(--opus-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 200ms, color 200ms, transform 200ms',
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                    }}>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <line x1="6.5" y1="2" x2="6.5" y2="11" />
                        <line x1="2" y1="6.5" x2="11" y2="6.5" />
                      </svg>
                    </span>
                  </button>

                  <div style={{
                    maxHeight: isOpen ? '400px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 300ms ease',
                  }}>
                    <p style={{
                      padding: '0 20px 18px',
                      fontSize: '15px',
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
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .faq-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .faq-grid > div:first-child {
            position: static !important;
          }
        }
      `}</style>
    </section>
  )
}
