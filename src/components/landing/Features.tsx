'use client'
import { useState } from 'react'
import IconFileContract from '@/components/icons/IconFileContract'
import IconDas2 from '@/components/icons/IconDas2'
import IconBriefClip from '@/components/icons/IconBriefClip'
import IconShieldCheck from '@/components/icons/IconShieldCheck'
import IconServerMachine from '@/components/icons/IconServerMachine'

const FEATURES = [
  {
    icon: <IconFileContract />,
    title: 'Contrats légaux en 2 clics',
    desc: 'Générez des contrats conformes au droit français avec signature électronique eIDAS.',
  },
  {
    icon: <IconDas2 />,
    title: 'DAS2 sans effort',
    desc: 'Déclaration annuelle générée automatiquement pour tous vos bénéficiaires.',
  },
  {
    icon: <IconBriefClip />,
    title: 'Factures automatiques',
    desc: 'Facture légale ou reçu de commission générés automatiquement, exportables en PDF.',
  },
  {
    icon: <IconShieldCheck />,
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
                <IconServerMachine />
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
