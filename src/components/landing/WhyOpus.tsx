'use client'

const C = {
  primary: '#4648D4', primaryXL: '#EEEEFF',
  ink: '#111111', text: '#374151', muted: '#6B7280', border: '#E5E7EB',
}

/* Mini dashboard card */
function MiniDash({ title, stats }: { title: string, stats: { label: string, value: string }[] }) {
  return (
    <div style={{ background: '#fff', borderRadius: 10, border: `1px solid ${C.border}`, padding: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: C.ink, marginBottom: 10 }}>{title}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        {stats.map(s => (
          <div key={s.label} style={{ flex: 1, background: '#F9FAFB', borderRadius: 6, padding: '8px 10px', border: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: C.primary }}>{s.value}</p>
            <p style={{ fontSize: 9, color: C.muted, marginTop: 2, lineHeight: 1.3 }}>{s.label}</p>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10 }}>
        {['Dashboard', 'Mes Opportunités', 'Factures'].map((item, i) => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 0', borderBottom: i < 2 ? `1px solid #F3F4F6` : 'none' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: i === 0 ? C.primary : '#D1D5DB', flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: i === 0 ? C.ink : C.muted }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const DASHBOARDS = [
  { title: 'Suivi automatisé', stats: [{ label: 'Montant annuel', value: '2 506€' }, { label: 'Montant annuel', value: '204 850' }, { label: 'Montant AN', value: '204 850' }] },
  { title: 'Suivi automatisé', stats: [{ label: 'Commissions', value: '2 506€' }, { label: 'Annual', value: '204 850' }] },
  { title: 'Dashboard', stats: [{ label: 'Opportunités', value: '12' }, { label: 'Contrats', value: '8' }, { label: 'DAS2', value: '100%' }] },
  { title: 'Suivi automatisé', stats: [{ label: 'Montant', value: '2 506€' }, { label: 'Annual', value: '204 850' }] },
  { title: 'Suivi avancé', stats: [{ label: 'Total', value: '100%' }, { label: 'Validés', value: '14/14' }] },
]

export default function WhyOpus() {
  return (
    <section id="temoignages" style={{ background: '#ffffff', padding: 'clamp(60px,7vw,90px) 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 800, color: C.ink, letterSpacing: '-0.02em', marginBottom: 12 }}>
            Pourquoi vous allez adorer utiliser OPUS
          </h2>
          <p style={{ fontSize: 15, color: C.muted, maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
            Parce que gérer son entreprise ne devrait pas ressembler à un contrôle fiscal. Parce que votre entreprise ne devrait pas se limiter à un contrôle fiscal.
          </p>
        </div>

        {/* Row 1: 3 dashboards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 16 }}>
          {DASHBOARDS.slice(0, 3).map((d, i) => (
            <MiniDash key={i} title={d.title} stats={d.stats} />
          ))}
        </div>

        {/* Row 2: 2 dashboards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
          {DASHBOARDS.slice(3).map((d, i) => (
            <MiniDash key={i} title={d.title} stats={d.stats} />
          ))}
        </div>
      </div>

      <style>{`
        @media(max-width:768px){
          #temoignages [style*="repeat(3,1fr)"]{grid-template-columns:1fr!important}
          #temoignages [style*="repeat(2,1fr)"]{grid-template-columns:1fr!important}
        }
      `}</style>
    </section>
  )
}
