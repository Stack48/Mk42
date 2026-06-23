'use client'
import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import {
  clipRevealVariants,
  fadeUpVariants,
  staggerContainerVariants,
  EASE_EXPO,
  EASE_POWER3,
  VIEWPORT,
} from '@/lib/motion'

const CHECK = (color: string) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="2.5 7 5.5 10.5 11.5 4"/>
  </svg>
)

const PLANS = [
  {
    name: 'Gratuit', price: '0', unit: '€', period: '', highlight: false,
    desc: "Tout ce qui est dans Gratuit plus :",
    features: ["1 apporteur d'affaires", '5 documents par mois', 'Contrats basiques', 'Support par email', 'Processus avancés'],
    btn: 'Essayer gratuitement',
  },
  {
    name: 'Pro', price: '3.99', unit: '€', period: '/mois', highlight: true,
    desc: "Tout ce qui est dans Gratuit plus :",
    features: ['Apporteurs illimités', 'Documents illimités', 'DAS2 automatique', 'Coffre-fort 6 ans', 'Signature eIDAS', 'Export FEC', 'Recommandations IA'],
    btn: 'Essayer professionnel',
  },
  {
    name: 'Ultra', price: '6.99', unit: '€', period: '/mois', highlight: false,
    desc: "Tout ce qui est dans Pro plus :",
    features: ['Tout Pro inclus', 'Multi-entreprises', 'API access', 'Processus avancés', 'Recommandations IA', 'Manager de compte'],
    btn: 'Essayer gratuitement',
  },
]

const REEL_H = 52
const DIGITS  = '0123456789'
const LAPS    = 4

function SlotReel({ digit, delay = 0, triggered, color }: { digit: string; delay?: number; triggered: boolean; color: string }) {
  const target = parseInt(digit)
  const finalY = -((LAPS * 10 + target) * REEL_H)

  return (
    <span className="inline-block overflow-hidden align-bottom" style={{ height: REEL_H }}>
      <motion.span
        className="flex flex-col will-change-transform"
        initial={{ y: 0 }}
        animate={triggered ? { y: finalY } : { y: 0 }}
        transition={{ duration: 1.55 + delay * 0.18, ease: [0.04, 0.62, 0.10, 1.0], delay }}
      >
        {Array.from({ length: LAPS + 1 }).flatMap((_, lap) =>
          DIGITS.split('').map(d => (
            <span
              key={`${lap}${d}`}
              className="block select-none"
              style={{ height: REEL_H, lineHeight: `${REEL_H}px`, fontWeight: 800, fontSize: 40, letterSpacing: '-0.03em', color }}
            >
              {d}
            </span>
          ))
        )}
      </motion.span>
    </span>
  )
}

function SlotPrice({ price, unit, color }: { price: string; unit: string; color: string }) {
  const ref  = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const chars = price.split('')
  let digitIdx = 0

  return (
    <div ref={ref} className="inline-flex items-end">
      {chars.map((char, i) => {
        if (/\d/.test(char)) {
          const idx = digitIdx++
          return <SlotReel key={i} digit={char} delay={idx * 0.13} triggered={inView} color={color} />
        }
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.15, duration: 0.25, ease: EASE_POWER3 }}
            style={{ fontSize: 40, fontWeight: 800, color, lineHeight: `${REEL_H}px`, letterSpacing: '-0.03em' }}
          >
            {char}
          </motion.span>
        )
      })}
      <motion.span
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: digitIdx * 0.13 + 0.08, duration: 0.25, ease: EASE_POWER3 }}
        style={{ fontSize: 40, fontWeight: 800, color, lineHeight: `${REEL_H}px`, letterSpacing: '-0.03em' }}
      >
        {unit}
      </motion.span>
    </div>
  )
}

const cardVariants = (highlight: boolean) => ({
  hidden:  { opacity: 0, y: 40, scale: highlight ? 0.92 : 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: highlight ? 0.85 : 0.65, ease: EASE_EXPO },
  },
})

export default function Pricing() {
  return (
    <section id="prix" className="bg-white py-[clamp(60px,7vw,90px)] px-4 sm:px-6 overflow-x-hidden">
      <div className="max-w-[1060px] mx-auto">

        <div className="text-center mb-12">
          <div className="overflow-hidden mb-2.5">
            <motion.p
              variants={clipRevealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
              className="text-xs font-semibold tracking-[0.1em] uppercase text-opus-primary font-mono m-0"
            >
              Tarifs
            </motion.p>
          </div>
          <div className="overflow-hidden mb-2">
            <motion.h2
              variants={clipRevealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
              transition={{ delay: 0.08 }}
              className="text-[clamp(24px,3.5vw,38px)] font-extrabold text-opus-ink tracking-[-0.02em] m-0"
            >
              Choisissez votre forfait
            </motion.h2>
          </div>
          <motion.p
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            transition={{ delay: 0.18 }}
            className="text-sm text-gray-500 m-0"
          >
            Des prix justes qui évoluent avec votre entreprise
          </motion.p>
        </div>

        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch"
        >
          {PLANS.map(plan => (
            <motion.div
              key={plan.name}
              variants={cardVariants(plan.highlight)}
              whileHover={
                plan.highlight
                  ? { y: -6, boxShadow: '0 24px 60px rgba(70,72,212,0.3)', transition: { duration: 0.3, ease: EASE_POWER3 } }
                  : { y: -4, boxShadow: '0 16px 40px rgba(70,72,212,0.12)', transition: { duration: 0.3, ease: EASE_POWER3 } }
              }
              className={`rounded-[14px] px-5 sm:px-6 py-7 will-change-transform border-[1.5px] flex flex-col min-h-[520px] h-full ${plan.highlight ? 'bg-opus-primary border-opus-primary' : 'bg-white border-gray-200'}`}
            >
              <p className={`text-xs font-semibold tracking-[0.05em] uppercase mb-3 font-mono ${plan.highlight ? 'text-white/70' : 'text-gray-500'}`}>
                {plan.name}
              </p>

              <div className="flex items-end gap-1.5 mb-1.5">
                <SlotPrice price={plan.price} unit={plan.unit} color={plan.highlight ? '#ffffff' : '#111111'} />
                {plan.period && (
                  <span className={`text-[13px] pb-[7px] ${plan.highlight ? 'text-white/65' : 'text-gray-500'}`}>
                    {plan.period}
                  </span>
                )}
              </div>

              <p className={`text-[13px] mb-5 leading-snug ${plan.highlight ? 'text-white/70' : 'text-gray-500'}`}>
                {plan.desc}
              </p>

              <ul className="list-none p-0 m-0 mb-6 flex flex-col gap-2 flex-1">
                {plan.features.map((f, fi) => (
                  <motion.li
                    key={f}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={VIEWPORT}
                    transition={{ delay: fi * 0.06, duration: 0.4, ease: EASE_EXPO }}
                    className={`flex items-center gap-2 text-[13px] ${plan.highlight ? 'text-white/85' : 'text-gray-700'}`}
                  >
                    <span className="shrink-0">{CHECK(plan.highlight ? 'rgba(255,255,255,0.9)' : '#4648D4')}</span>
                    {f}
                  </motion.li>
                ))}
              </ul>

              <Link
                href="/inscription"
                className={`mt-auto flex items-center justify-center gap-2 px-4 py-[10px] rounded-lg text-[13px] font-semibold no-underline transition-opacity duration-150 hover:opacity-80 ${plan.highlight ? 'bg-white text-opus-primary' : 'bg-opus-primary-xl text-opus-primary'}`}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 relative -top-px">
                  <line x1="2" y1="7" x2="12" y2="7" />
                  <polyline points="8 3 12 7 8 11" />
                </svg>
                <span className="leading-none">{plan.btn}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
