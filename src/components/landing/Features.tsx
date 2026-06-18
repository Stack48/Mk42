'use client'
import { useState } from 'react'

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
    <section id="fonctionnalites" className="bg-white py-[clamp(60px,7vw,90px)] px-6">
      <div className="max-w-[1100px] mx-auto">

        <div className="mb-12">
          <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[#4648D4] mb-2.5 font-['DM_Mono',monospace]">
            Fonctionnalités
          </p>
          <h2 className="text-[clamp(24px,3.5vw,38px)] font-extrabold text-[#111111] tracking-[-0.02em] leading-[1.2] max-w-[480px]">
            Toutes les fonctionnalités, sans les maux de tête
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-8 items-start max-md:grid-cols-1">

          <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
            {FEATURES.map((f, i) => (
              <div key={f.title}
                onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
                className={`bg-white rounded-[10px] px-[18px] py-5 border transition-[border-color,box-shadow] duration-200 cursor-default ${
                  hov === i
                    ? 'border-[#4648D4] shadow-[0_4px_20px_rgba(70,72,212,0.1)]'
                    : 'border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
                }`}
              >
                <div className="w-[38px] h-[38px] rounded-lg bg-[#EEEEFF] text-[#4648D4] flex items-center justify-center mb-3">
                  {f.icon}
                </div>
                <h3 className="text-sm font-bold text-[#111111] mb-1.5 leading-[1.3]">{f.title}</h3>
                <p className="text-[13px] text-[#6B7280] leading-[1.6]">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[14px] overflow-hidden bg-[#F3F4F6] min-h-[360px] flex items-center justify-center relative">
            <div className="text-center p-8">
              <div className="w-[100px] h-[100px] rounded-full bg-[linear-gradient(135deg,#4648D4,#6669e0)] mx-auto mb-5 flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                  <path d="M16 3h-8l-2 4h12z"/>
                  <circle cx="12" cy="13" r="2"/>
                </svg>
              </div>
              <p className="text-[15px] font-semibold text-[#4648D4] mb-2">Secteur BTP</p>
              <p className="text-[13px] text-[#6B7280] leading-[1.6] max-w-[240px] mx-auto">
                Parce que gérer son entreprise ne devrait pas ressembler à un contrôle fiscal.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-[13px] text-[#9CA3AF] text-center">
          Parce que gérer son entreprise ne devrait pas ressembler à un contrôle fiscal.
        </p>
      </div>
    </section>
  )
}
