'use client'
import Link from 'next/link'

const C = { primary: '#4648D4', primaryDk: '#3533B0', primaryXL: '#EEEEFF', ink: '#111111', muted: '#6B7280', border: '#E5E7EB', text: '#374151' }

const CHECK = (color: string) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="2.5 7 5.5 10.5 11.5 4"/>
  </svg>
)

const PLANS = [
  {
    name: 'Gratuit', price: '0', unit: '€', period: '', highlight: false,
    desc: 'Tout ce qui est dans Gratuit plus :',
    features: ['1 apporteur d\'affaires', '5 documents par mois', 'Contrats basiques', 'Support par email', 'Processus avancés'],
    btn: '→ Essayer gratuitement',
  },
  {
    name: 'Pro', price: '3.99', unit: '€', period: '/mois', highlight: true,
    desc: 'Tout ce qui est dans Gratuit plus :',
    features: ['Apporteurs illimités', 'Documents illimités', 'DAS2 automatique', 'Coffre-fort 6 ans', 'Signature eIDAS', 'Export FEC', 'Recommandations IA'],
    btn: '→ Essayer professionnel',
  },
  {
    name: 'Ultra', price: '6.99', unit: '€', period: '/mois', highlight: false,
    desc: 'Tout ce qui est dans Ultra plus :',
    features: ['Tout Pro inclus', 'Multi-entreprises', 'API access', 'Processus avancés', 'Recommandations IA', 'Manager de compte'],
    btn: '→ Essayer gratuitement',
  },
]

export default function Pricing() {
  return (
    <section id="prix" style={{ background: '#ffffff', padding: 'clamp(60px,7vw,90px) 24px' }}>
      <div style={{ maxWidth: 1060, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.primary, marginBottom: 10, fontFamily: "'DM Mono', monospace" }}>Tarifs</p>
          <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 800, color: C.ink, letterSpacing: '-0.02em', marginBottom: 8 }}>
            Choisissez votre forfait
          </h2>
          <p style={{ fontSize: 14, color: C.muted }}>Des prix justes qui évoluent avec votre entreprise</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, alignItems: 'start' }}>
          {PLANS.map(plan => (
            <div key={plan.name} style={{
              background: plan.highlight ? C.primary : '#fff',
              border: `1.5px solid ${plan.highlight ? C.primary : C.border}`,
              borderRadius: 14, padding: '28px 24px',
              transition: 'box-shadow 200ms',
            }}
              onMouseEnter={e => { if (!plan.highlight) e.currentTarget.style.boxShadow = '0 4px 20px rgba(70,72,212,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
            >
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8, fontFamily: "'DM Mono', monospace", color: plan.highlight ? 'rgba(255,255,255,0.7)' : C.muted }}>
                {plan.name}
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 6 }}>
                <span style={{ fontSize: 40, fontWeight: 800, color: plan.highlight ? '#fff' : C.ink, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {plan.price}{plan.unit}
                </span>
                {plan.period && <span style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.65)' : C.muted }}>{plan.period}</span>}
              </div>
              <p style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.7)' : C.muted, marginBottom: 20, lineHeight: 1.5 }}>{plan.desc}</p>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.85)' : C.text }}>
                    <span style={{ flexShrink: 0 }}>{CHECK(plan.highlight ? 'rgba(255,255,255,0.9)' : C.primary)}</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/inscription" style={{
                display: 'block', textAlign: 'center', padding: '10px 16px', borderRadius: 8,
                fontSize: 13, fontWeight: 600, textDecoration: 'none',
                transition: 'opacity 150ms',
                ...(plan.highlight
                  ? { background: '#fff', color: C.primary }
                  : { background: C.primaryXL, color: C.primary }),
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >{plan.btn}</Link>
            </div>
          ))}
        </div>
      </div>

      <style>{`@media(max-width:768px){#prix [style*="repeat(3,1fr)"]{grid-template-columns:1fr!important}}`}</style>
    </section>
  )
}
