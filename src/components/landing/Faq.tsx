'use client'
import { useState } from 'react'

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
    <section id="faq" className="bg-white py-[clamp(60px,7vw,90px)] px-6">
      <div className="max-w-[1100px] mx-auto">

        <div className="grid grid-cols-[260px_1fr] gap-16 items-start max-md:grid-cols-1">

          <div className="sticky top-[100px] max-md:static">
            <h2 className="text-[clamp(24px,3vw,34px)] font-extrabold text-[#111111] tracking-[-0.02em] leading-[1.2] mb-3.5">
              Questions<br />Fréquentes.
            </h2>
            <p className="text-[13px] text-[#6B7280] leading-[1.65]">
              Vous avez d&apos;autres questions ? Contactez notre équipe support.
            </p>
            <a href="mailto:support@opus-btp.fr" className="inline-block mt-3.5 text-[13px] font-semibold text-[#4648D4] no-underline">
              Nous contacter →
            </a>
          </div>

          <div className="flex flex-col gap-1.5">
            {ITEMS.map((item, i) => {
              const isOpen = open === i
              return (
                <div key={i} className={`border rounded-[10px] overflow-hidden transition-[border-color,background] duration-200 ${
                  isOpen ? 'border-[#4648D4] bg-[#EEEEFF]' : 'border-[#E5E7EB] bg-white'
                }`}>
                  <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}
                    className="w-full text-left px-5 py-4 bg-transparent border-none cursor-pointer flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-[#111111] leading-[1.4]">{item.q}</span>
                    <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-[background,transform] duration-200 ${
                      isOpen ? 'bg-[#4648D4] text-white rotate-45' : 'bg-[#F3F4F6] text-[#4648D4]'
                    }`}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/>
                      </svg>
                    </span>
                  </button>
                  <div className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${isOpen ? 'max-h-[300px]' : 'max-h-0'}`}>
                    <p className="px-5 pb-4 text-sm text-[#374151] leading-[1.7]">{item.a}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
