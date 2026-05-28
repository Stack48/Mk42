'use client'
import { useState } from 'react'

const C = { primary: '#4648D4', primaryXL: '#EEEEFF', ink: '#111111', text: '#374151', muted: '#6B7280', border: '#E5E7EB' }

const ITEMS = [
  { q: 'Mes commissions seront-elles reconnues par l\'État ?', a: "Oui. Opus génère tous les documents légaux requis : contrats conformes au Code civil, factures ou reçus d'honoraires, et déclaration DAS2 pour l'URSSAF. Vos commissions sont ainsi totalement traçables et fiscalement reconnues." },
  { q: 'Je ne suis pas à l\'aise avec l\'informatique, est-ce simple ?', a: "Absolument. Opus a été conçu pour être utilisé sans formation. En moins de 10 minutes, vous pouvez créer votre premier contrat d'apport et générer votre première facture. Un guide de démarrage vous accompagne pas à pas." },
  { q: 'Ai-je besoin d\'un comptable pour utiliser Opus ?', a: "Non. Opus automatise toutes les tâches comptables liées aux commissions : numérotation séquentielle des factures, génération de la DAS2 au format CERFA, export FEC pour votre expert-comptable si besoin." },
  { q: 'Que se passe-t-il après les 7 jours gratuits ?', a: "Vous basculez automatiquement sur le forfait Gratuit (1 apporteur, 3 documents/mois) sans aucune interruption. Vous pouvez passer au Pro à tout moment depuis votre tableau de bord, sans engagement ni préavis." },
  { q: 'Mes données sont-elles confidentielles ?', a: "Vos données sont hébergées exclusivement en France (AWS eu-west-3 — Paris), chiffrées au repos et en transit selon AES-256. Opus est conforme au RGPD. Nous ne partageons jamais vos données avec des tiers." },
]

export default function Faq() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" style={{ background: '#fff', padding: 'clamp(60px,7vw,90px) 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 64, alignItems: 'start' }}>

          {/* Left: title */}
          <div style={{ position: 'sticky', top: 100 }}>
            <h2 style={{ fontSize: 'clamp(24px,3vw,34px)', fontWeight: 800, color: C.ink, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 14 }}>
              Questions<br />Fréquentes.
            </h2>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>
              Vous avez d'autres questions ? Contactez notre équipe support.
            </p>
            <a href="mailto:support@opus-btp.fr" style={{ display: 'inline-block', marginTop: 14, fontSize: 13, fontWeight: 600, color: C.primary, textDecoration: 'none' }}>
              Nous contacter →
            </a>
          </div>

          {/* Right: accordion */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ITEMS.map((item, i) => {
              const isOpen = open === i
              return (
                <div key={i} style={{
                  border: `1px solid ${isOpen ? C.primary : C.border}`,
                  borderRadius: 10, overflow: 'hidden',
                  background: isOpen ? C.primaryXL : '#fff',
                  transition: 'border-color 200ms, background 200ms',
                }}>
                  <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} style={{
                    width: '100%', textAlign: 'left', padding: '16px 20px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.ink, lineHeight: 1.4 }}>{item.q}</span>
                    <span style={{
                      flexShrink: 0, width: 24, height: 24, borderRadius: '50%',
                      background: isOpen ? C.primary : '#F3F4F6',
                      color: isOpen ? '#fff' : C.primary,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 200ms, transform 200ms',
                      transform: isOpen ? 'rotate(45deg)' : 'none',
                    }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/>
                      </svg>
                    </span>
                  </button>
                  <div style={{ maxHeight: isOpen ? 300 : 0, overflow: 'hidden', transition: 'max-height 300ms ease' }}>
                    <p style={{ padding: '0 20px 16px', fontSize: 14, color: C.text, lineHeight: 1.7 }}>{item.a}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <style>{`@media(max-width:768px){#faq [style*="260px 1fr"]{grid-template-columns:1fr!important}}`}</style>
    </section>
  )
}
