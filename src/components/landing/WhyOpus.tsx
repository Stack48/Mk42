'use client'

function MiniDash({ title, stats }: { title: string, stats: { label: string, value: string }[] }) {
  return (
    <div className="bg-white rounded-[10px] border border-[#E5E7EB] p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
      <p className="text-[11px] font-semibold text-[#111111] mb-2.5">{title}</p>
      <div className="flex gap-2">
        {stats.map(s => (
          <div key={s.label} className="flex-1 bg-[#F9FAFB] rounded-[6px] px-2.5 py-2 border border-[#E5E7EB]">
            <p className="text-[15px] font-extrabold text-[#4648D4]">{s.value}</p>
            <p className="text-[9px] text-[#6B7280] mt-0.5 leading-[1.3]">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-2.5">
        {['Dashboard', 'Mes Opportunités', 'Factures'].map((item, i) => (
          <div key={item} className={`flex items-center gap-1.5 py-[5px] ${i < 2 ? 'border-b border-[#F3F4F6]' : ''}`}>
            <span className={`w-[5px] h-[5px] rounded-full shrink-0 ${i === 0 ? 'bg-[#4648D4]' : 'bg-[#D1D5DB]'}`} />
            <span className={`text-[10px] ${i === 0 ? 'text-[#111111]' : 'text-[#6B7280]'}`}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const DASHBOARDS = [
  { title: 'Suivi automatisé', stats: [{ label: 'Commissions', value: '2 506€' }, { label: 'Total annuel', value: '204 850' }, { label: 'Montant AN', value: '204 850' }] },
  { title: 'Suivi automatisé', stats: [{ label: 'Commissions', value: '2 506€' }, { label: 'Annual', value: '204 850' }] },
  { title: 'Dashboard', stats: [{ label: 'Opportunités', value: '12' }, { label: 'Contrats', value: '8' }, { label: 'DAS2', value: '100%' }] },
  { title: 'Suivi automatisé', stats: [{ label: 'Montant', value: '2 506€' }, { label: 'Annual', value: '204 850' }] },
  { title: 'Suivi avancé', stats: [{ label: 'Total', value: '100%' }, { label: 'Validés', value: '14/14' }] },
]

export default function WhyOpus() {
  return (
    <section id="temoignages" className="bg-white py-[clamp(60px,7vw,90px)] px-6">
      <div className="max-w-[1100px] mx-auto">

        <div className="text-center mb-12">
          <h2 className="text-[clamp(24px,3.5vw,38px)] font-extrabold text-[#111111] tracking-[-0.02em] mb-3">
            Pourquoi vous allez adorer utiliser OPUS
          </h2>
          <p className="text-[15px] text-[#6B7280] max-w-[520px] mx-auto leading-[1.6]">
            Parce que gérer son entreprise ne devrait pas ressembler à un contrôle fiscal. Parce que votre entreprise ne devrait pas se limiter à un contrôle fiscal.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4 max-md:grid-cols-1">
          {DASHBOARDS.slice(0, 3).map((d, i) => (
            <MiniDash key={i} title={d.title} stats={d.stats} />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          {DASHBOARDS.slice(3).map((d, i) => (
            <MiniDash key={i} title={d.title} stats={d.stats} />
          ))}
        </div>
      </div>
    </section>
  )
}
