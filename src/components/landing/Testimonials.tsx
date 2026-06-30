'use client'
import { motion } from 'framer-motion'
import {
  clipRevealVariants,
  staggerContainerVariants,
  staggerItemVariants,
  EASE_POWER3,
  VIEWPORT,
} from '@/lib/motion'

const TESTIMONIALS = [
  {
    name: 'Marc G.', role: 'Agent immobilier, Apporteur pro',
    quote: "Opus m'a permis d'automatiser toute ma gestion de commissions. Je passe maintenant 10x moins de temps sur la paperasse et mes clients apporteurs sont bien mieux servis.",
    initials: 'MG', bg: '#EEEEFF', color: '#4648D4',
    avatar: 'https://ui-avatars.com/api/?name=Marc+G&background=4648D4&color=fff&bold=true&size=128',
  },
  {
    name: 'Sophie N.', role: 'Cadre, Apporteuse particulière',
    quote: "La plateforme est tellement intuitive. En quelques clics j'ai pu générer tous mes documents légaux et les partager avec mon entreprise partenaire.",
    initials: 'SN', bg: '#D8F0E6', color: '#15724A',
    avatar: 'https://ui-avatars.com/api/?name=Sophie+N&background=15724A&color=fff&bold=true&size=128',
  },
  {
    name: 'Jean-Pierre T.', role: 'Directeur Commercial, Groupe BTP',
    quote: "Nous utilisons Opus pour gérer l'ensemble de notre réseau d'apporteurs. La fonctionnalité DAS2 automatique nous a économisé des heures de travail lors de la déclaration annuelle.",
    initials: 'JP', bg: '#FEF3C7', color: '#92400E',
    avatar: 'https://ui-avatars.com/api/?name=Jean+Pierre&background=92400E&color=fff&bold=true&size=128',
  },
]

function Stars() {
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="14" height="14" viewBox="0 0 16 16" fill="#F59E0B">
          <path d="M8 1l1.85 3.75L14 5.5l-3 2.92.7 4.08L8 10.4l-3.7 2.1.7-4.08-3-2.92 4.15-.75z"/>
        </svg>
      ))}
    </span>
  )
}

export default function Testimonials() {
  return (
    <section id="temoignages-clients" className="bg-white py-[clamp(60px,7vw,90px)] px-4 sm:px-6 overflow-x-hidden">
      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 lg:gap-16 items-start">

          <div className="lg:sticky lg:top-[100px]">
            <div className="overflow-hidden mb-5">
              <motion.h2
                variants={clipRevealVariants}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT}
                className="text-[clamp(28px,4vw,40px)] font-extrabold text-opus-ink tracking-[-0.03em] leading-none m-0"
              >
                Success<br />Stories.
              </motion.h2>
            </div>
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Stars />
                <span className="text-[22px] font-extrabold text-opus-ink">4.9/5</span>
              </div>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Basé sur +200 avis de professionnels du bâtiment qui ont transformé leur gestion des commissions avec OPUS.
              </p>
            </motion.div>
          </div>

          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            className="flex flex-col gap-4"
          >
            {TESTIMONIALS.map(t => (
              <motion.div
                key={t.name}
                variants={staggerItemVariants}
                whileHover={{
                  y: -4,
                  boxShadow: '0 16px 40px rgba(70,72,212,0.12)',
                  transition: { duration: 0.28, ease: EASE_POWER3 },
                }}
                className="bg-white border border-gray-200 rounded-xl px-5 sm:px-6 py-[22px] will-change-transform flex flex-col min-h-[260px]"
              >
                <Stars />
                <p className="text-[14px] sm:text-[15px] text-gray-700 leading-[1.7] my-3 italic break-words flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-2.5 mt-2">
                  <div
                    className="relative w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center text-xs font-bold shrink-0 ring-1 ring-gray-200"
                    style={{ background: t.bg, color: t.color }}
                  >
                    <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center select-none">
                      {t.initials}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={t.avatar}
                      alt={t.name}
                      width={36}
                      height={36}
                      loading="lazy"
                      className="relative w-full h-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-opus-ink truncate">{t.name}</div>
                    <div className="text-xs text-gray-500 truncate">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
