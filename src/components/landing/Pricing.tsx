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

const C = {
  primary: '#4648D4', primaryDk: '#3533B0',
  primaryXL: '#EEEEFF', ink: '#111111',
  muted: '#6B7280', border: '#E5E7EB', text: '#374151',
}

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
    btn: '→ Essayer gratuitement',
  },
  {
    name: 'Pro', price: '3.99', unit: '€', period: '/mois', highlight: true,
    desc: "Tout ce qui est dans Gratuit plus :",
    features: ['Apporteurs illimités', 'Documents illimités', 'DAS2 automatique', 'Coffre-fort 6 ans', 'Signature eIDAS', 'Export FEC', 'Recommandations IA'],
    btn: '→ Essayer professionnel',
  },
  {
    name: 'Ultra', price: '6.99', unit: '€', period: '/mois', highlight: false,
    desc: "Tout ce qui est dans Ultra plus :",
    features: ['Tout Pro inclus', 'Multi-entreprises', 'API access', 'Processus avancés', 'Recommandations IA', 'Manager de compte'],
    btn: '→ Essayer gratuitement',
  },
]

// ══════════════════════════════════════════════════════════════════════════════
// Slot Machine — machine à sous pour les prix
// ══════════════════════════════════════════════════════════════════════════════

const REEL_H = 52     // hauteur px d'un slot (font 40px + respiration)
const DIGITS  = '0123456789'
const LAPS    = 4     // nombre de rotations complètes avant d'arriver sur le bon chiffre

// Un seul rouleau pour un chiffre
function SlotReel({
  digit, delay = 0, triggered, color,
}: {
  digit: string; delay?: number; triggered: boolean; color: string
}) {
  const target = parseInt(digit)
  // ex : target=9, LAPS=4 → finalY = -(49 * 52) = -2548px
  const finalY = -((LAPS * 10 + target) * REEL_H)

  return (
    <span style={{
      display: 'inline-block',
      height: REEL_H,
      overflow: 'hidden',
      verticalAlign: 'bottom',
    }}>
      <motion.span
        style={{ display: 'flex', flexDirection: 'column', willChange: 'transform' }}
        initial={{ y: 0 }}
        animate={triggered ? { y: finalY } : { y: 0 }}
        transition={{
          // départ ultra-rapide (casino) → freinage doux exponentiel
          duration: 1.55 + delay * 0.18,
          ease: [0.04, 0.62, 0.10, 1.0],
          delay,
        }}
      >
        {/* (LAPS + 1) répétitions de 0-9 pour couvrir toutes les rotations */}
        {Array.from({ length: LAPS + 1 }).flatMap((_, lap) =>
          DIGITS.split('').map(d => (
            <span
              key={`${lap}${d}`}
              style={{
                display: 'block',
                height: REEL_H,
                lineHeight: `${REEL_H}px`,
                fontWeight: 800,
                fontSize: 40,
                letterSpacing: '-0.03em',
                color,
                userSelect: 'none',
              }}
            >
              {d}
            </span>
          ))
        )}
      </motion.span>
    </span>
  )
}

// Prix complet : chaque chiffre = rouleau, '.' et '€' = fondu simple
function SlotPrice({ price, unit, color }: { price: string; unit: string; color: string }) {
  const ref  = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  const chars = price.split('')
  let digitIdx = 0

  return (
    <div ref={ref} style={{ display: 'inline-flex', alignItems: 'flex-end' }}>
      {chars.map((char, i) => {
        if (/\d/.test(char)) {
          const idx = digitIdx++
          return (
            <SlotReel
              key={i}
              digit={char}
              delay={idx * 0.13}
              triggered={inView}
              color={color}
            />
          )
        }
        // séparateur décimal
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.15, duration: 0.25, ease: EASE_POWER3 }}
            style={{
              fontSize: 40, fontWeight: 800, color,
              lineHeight: `${REEL_H}px`, letterSpacing: '-0.03em',
            }}
          >
            {char}
          </motion.span>
        )
      })}

      {/* Unité (€) */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: digitIdx * 0.13 + 0.08, duration: 0.25, ease: EASE_POWER3 }}
        style={{
          fontSize: 40, fontWeight: 800, color,
          lineHeight: `${REEL_H}px`, letterSpacing: '-0.03em',
        }}
      >
        {unit}
      </motion.span>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// Carte de tarif
// ══════════════════════════════════════════════════════════════════════════════

const cardVariants = (highlight: boolean) => ({
  hidden:  { opacity: 0, y: 40, scale: highlight ? 0.92 : 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: highlight ? 0.85 : 0.65, ease: EASE_EXPO },
  },
})

export default function Pricing() {
  return (
    <section id="prix" style={{ background: '#ffffff', padding: 'clamp(60px,7vw,90px) 24px' }}>
      <div style={{ maxWidth: 1060, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ overflow: 'hidden', marginBottom: 10 }}>
            <motion.p
              variants={clipRevealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
              style={{
                fontSize: 12, fontWeight: 600, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: C.primary,
                fontFamily: "'DM Mono', monospace", margin: 0,
              }}
            >
              Tarifs
            </motion.p>
          </div>
          <div style={{ overflow: 'hidden', marginBottom: 8 }}>
            <motion.h2
              variants={clipRevealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
              transition={{ delay: 0.08 }}
              style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 800, color: C.ink, letterSpacing: '-0.02em', margin: 0 }}
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
            style={{ fontSize: 14, color: C.muted, margin: 0 }}
          >
            Des prix justes qui évoluent avec votre entreprise
          </motion.p>
        </div>

        {/* Cartes */}
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, alignItems: 'start' }}
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
              style={{
                background: plan.highlight ? C.primary : '#fff',
                border: `1.5px solid ${plan.highlight ? C.primary : C.border}`,
                borderRadius: 14, padding: '28px 24px',
                willChange: 'transform',
              }}
            >
              <p style={{
                fontSize: 12, fontWeight: 600, letterSpacing: '0.05em',
                textTransform: 'uppercase', marginBottom: 12,
                fontFamily: "'DM Mono', monospace",
                color: plan.highlight ? 'rgba(255,255,255,0.7)' : C.muted,
              }}>
                {plan.name}
              </p>

              {/* ── Prix machine à sous ── */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 6 }}>
                <SlotPrice
                  price={plan.price}
                  unit={plan.unit}
                  color={plan.highlight ? '#ffffff' : C.ink}
                />
                {plan.period && (
                  <span style={{
                    fontSize: 13,
                    color: plan.highlight ? 'rgba(255,255,255,0.65)' : C.muted,
                    paddingBottom: 7,
                  }}>
                    {plan.period}
                  </span>
                )}
              </div>

              <p style={{
                fontSize: 13,
                color: plan.highlight ? 'rgba(255,255,255,0.7)' : C.muted,
                marginBottom: 20, lineHeight: 1.5,
              }}>
                {plan.desc}
              </p>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {plan.features.map((f, fi) => (
                  <motion.li
                    key={f}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={VIEWPORT}
                    transition={{ delay: fi * 0.06, duration: 0.4, ease: EASE_EXPO }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      fontSize: 13,
                      color: plan.highlight ? 'rgba(255,255,255,0.85)' : C.text,
                    }}
                  >
                    <span style={{ flexShrink: 0 }}>{CHECK(plan.highlight ? 'rgba(255,255,255,0.9)' : C.primary)}</span>
                    {f}
                  </motion.li>
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
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                {plan.btn}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style>{`@media(max-width:768px){#prix [style*="repeat(3,1fr)"]{grid-template-columns:1fr!important}}`}</style>
    </section>
  )
}
