'use client'
import IconStar from '@/components/icons/IconStar'

const TESTIMONIALS = [
  {
    name: 'Marc G.', role: 'Agent immobilier, Apporteur pro',
    quote: "Opus m'a permis d'automatiser toute ma gestion de commissions. Je passe maintenant 10x moins de temps sur la paperasse et mes clients apporteurs sont bien mieux servis.",
    initials: 'MG', bgCls: 'bg-[#EEEEFF]', colorCls: 'text-[#4648D4]',
  },
  {
    name: 'Sophie N.', role: 'Cadre, Apporteuse particulière',
    quote: "La plateforme est tellement intuitive. En quelques clics j'ai pu générer tous mes documents légaux et les partager avec mon entreprise partenaire.",
    initials: 'SN', bgCls: 'bg-[#D8F0E6]', colorCls: 'text-[#15724A]',
  },
  {
    name: 'Jean-Pierre T.', role: 'Directeur Commercial, Groupe BTP',
    quote: "Nous utilisons Opus pour gérer l'ensemble de notre réseau d'apporteurs. La fonctionnalité DAS2 automatique nous a économisé des heures de travail lors de la déclaration annuelle.",
    initials: 'JP', bgCls: 'bg-[#FEF3C7]', colorCls: 'text-[#92400E]',
  },
]

function Stars() {
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <IconStar key={i} />
      ))}
    </span>
  )
}

export default function Testimonials() {
  return (
    <section className="bg-white py-[clamp(60px,7vw,90px)] px-6">
      <div className="max-w-[1100px] mx-auto">

        <div className="grid grid-cols-[280px_1fr] gap-16 items-start max-md:grid-cols-1">

          <div className="sticky top-[100px] max-md:static">
            <h2 className="text-[clamp(28px,4vw,40px)] font-extrabold text-[#111111] tracking-[-0.03em] leading-[1.1] mb-5">
              Success<br />Stories.
            </h2>
            <div className="flex items-center gap-2 mb-2">
              <Stars />
              <span className="text-[22px] font-extrabold text-[#111111]">4.9/5</span>
            </div>
            <p className="text-[13px] text-[#6B7280] leading-[1.6]">
              Basé sur +200 avis de professionnels du bâtiment qui ont transformé leur gestion des commissions avec OPUS.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {TESTIMONIALS.map(t => (
              <div key={t.name}
                className="bg-white border border-[#E5E7EB] rounded-xl px-6 py-[22px] transition-[box-shadow,transform] duration-200 hover:shadow-[0_4px_20px_rgba(70,72,212,0.1)] hover:-translate-y-px"
              >
                <Stars />
                <p className="text-[15px] text-[#374151] leading-[1.7] my-3 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-lg ${t.bgCls} ${t.colorCls} flex items-center justify-center text-xs font-bold shrink-0`}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#111111]">{t.name}</div>
                    <div className="text-xs text-[#6B7280]">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
