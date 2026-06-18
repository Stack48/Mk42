'use client'
import Link from 'next/link'

const CHECK = (highlight: boolean) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={highlight ? 'rgba(255,255,255,0.9)' : '#4648D4'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
    <section id="prix" className="bg-white py-[clamp(60px,7vw,90px)] px-6">
      <div className="max-w-[1060px] mx-auto">

        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[#4648D4] mb-2.5 font-['DM_Mono',monospace]">Tarifs</p>
          <h2 className="text-[clamp(24px,3.5vw,38px)] font-extrabold text-[#111111] tracking-[-0.02em] mb-2">
            Choisissez votre forfait
          </h2>
          <p className="text-sm text-[#6B7280]">Des prix justes qui évoluent avec votre entreprise</p>
        </div>

        <div className="grid grid-cols-3 gap-4 items-start max-md:grid-cols-1">
          {PLANS.map(plan => (
            <div key={plan.name}
              className={`rounded-[14px] px-6 py-7 border-[1.5px] transition-shadow duration-200 hover:shadow-[0_4px_20px_rgba(70,72,212,0.1)] ${
                plan.highlight
                  ? 'bg-[#4648D4] border-[#4648D4]'
                  : 'bg-white border-[#E5E7EB]'
              }`}
            >
              <p className={`text-xs font-semibold tracking-[0.05em] uppercase mb-2 font-['DM_Mono',monospace] ${
                plan.highlight ? 'text-white/70' : 'text-[#6B7280]'
              }`}>
                {plan.name}
              </p>
              <div className="flex items-baseline gap-0.5 mb-1.5">
                <span className={`text-[40px] font-extrabold tracking-[-0.03em] leading-none ${
                  plan.highlight ? 'text-white' : 'text-[#111111]'
                }`}>
                  {plan.price}{plan.unit}
                </span>
                {plan.period && <span className={`text-[13px] ${plan.highlight ? 'text-white/65' : 'text-[#6B7280]'}`}>{plan.period}</span>}
              </div>
              <p className={`text-[13px] mb-5 leading-[1.5] ${plan.highlight ? 'text-white/70' : 'text-[#6B7280]'}`}>{plan.desc}</p>

              <ul className="list-none p-0 m-0 mb-6 flex flex-col gap-2">
                {plan.features.map(f => (
                  <li key={f} className={`flex items-center gap-2 text-[13px] ${plan.highlight ? 'text-white/85' : 'text-[#374151]'}`}>
                    <span className="shrink-0">{CHECK(plan.highlight)}</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/inscription"
                className={`block text-center px-4 py-2.5 rounded-lg text-[13px] font-semibold no-underline transition-opacity duration-150 hover:opacity-85 ${
                  plan.highlight
                    ? 'bg-white text-[#4648D4]'
                    : 'bg-[#EEEEFF] text-[#4648D4]'
                }`}
              >{plan.btn}</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
