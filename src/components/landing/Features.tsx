'use client'
import { useState } from 'react'

const C = {
  primary: '#4648D4', primaryDk: '#3533B0',
  primaryXL: '#EEEEFF', ink: '#111111',
  muted: '#6B7280', border: '#E5E7EB',
}

const FEATURES = [
  {
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6z"/><polyline points="12 2 12 6 16 6"/><line x1="8" y1="11" x2="12" y2="11"/><line x1="8" y1="14" x2="10" y2="14"/></svg>,
    title: 'Contrats légaux en 2 clics',
    desc: 'Générez des contrats conformes au droit français avec signature électronique eIDAS.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="16" height="14" rx="2"/><line x1="7" y1="10" x2="13" y2="10"/><line x1="10" y1="7" x2="10" y2="13"/><line x1="4" y1="6" x2="6" y2="6"/><line x1="14" y1="6" x2="16" y2="6"/></svg>,
    title: 'DAS2 sans effort',
    desc: 'Déclaration annuelle générée automatiquement pour tous vos bénéficiaires.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="16" height="13" rx="2"/><path d="M7 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><line x1="7" y1="9" x2="13" y2="9"/><line x1="7" y1="12" x2="10" y2="12"/></svg>,
    title: 'Factures automatiques',
    desc: 'Facture légale ou reçu de commission générés automatiquement, exportables en PDF.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2L3 6v5c0 4 2.5 7.5 7 8.5 4.5-1 7-4.5 7-8.5V6z"/><polyline points="7 10 9 12 13 8"/></svg>,
    title: 'Coffre-fort sécurisé',
    desc: 'Documents archivés 6 ans, accessibles immédiatement en cas de contrôle fiscal.',
  },
]

export default function Features() {
  const [hov, setHov] = useState<number | null>(null)

  return (
    <section id="fonctionnalites" style={{ background: '#fff', padding: 'clamp(60px,7vw,90px) 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.primary, marginBottom: 10, fontFamily: "'DM Mono', monospace" }}>
            Fonctionnalités
          </p>
          <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 800, color: C.ink, letterSpacing: '-0.02em', lineHeight: 1.2, maxWidth: 480, marginBottom: 0 }}>
            Toutes les fonctionnalités, sans les maux de tête
          </h2>
        </div>

        {/* 2-col: cards + photo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>

          {/* 2×2 cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {FEATURES.map((f, i) => (
              <div key={f.title}
                onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
                style={{
                  background: '#fff', borderRadius: 10, padding: '20px 18px',
                  border: `1px solid ${hov === i ? C.primary : C.border}`,
                  boxShadow: hov === i ? '0 4px 20px rgba(70,72,212,0.1)' : '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'border-color 200ms, box-shadow 200ms',
                  cursor: 'default',
                }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 8, background: C.primaryXL, color: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 6, lineHeight: 1.3 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Photo placeholder */}
          <div style={{
            borderRadius: 14, overflow: 'hidden', background: '#F3F4F6',
            minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
          }}>
            <div style={{ textAlign: 'center', padding: 32 }}>
              <div style={{
                width: 100, height: 100, borderRadius: '50%',
                background: `linear-gradient(135deg, ${C.primary}, #6669e0)`,
                margin: '0 auto 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                  <path d="M16 3h-8l-2 4h12z"/>
                  <circle cx="12" cy="13" r="2"/>
                </svg>
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: C.primary, marginBottom: 8 }}>Secteur BTP</p>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, maxWidth: 240, margin: '0 auto' }}>
                Parce que gérer son entreprise ne devrait pas ressembler à un contrôle fiscal.
              </p>
            </div>
          </div>
        </div>

        <p style={{ marginTop: 32, fontSize: 13, color: '#9CA3AF', textAlign: 'center' }}>
          Parce que gérer son entreprise ne devrait pas ressembler à un contrôle fiscal.
        </p>
      </div>

      <style>{`
        @media(max-width:860px){
          #fonctionnalites > div > div:last-child > div:first-child{grid-template-columns:1fr!important}
          #fonctionnalites > div > div:last-child{grid-template-columns:1fr!important}
        }
      `}</style>
    </section>
  )
}
