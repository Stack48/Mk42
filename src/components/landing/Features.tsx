'use client'
import { useRef, useCallback } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import {
  clipRevealVariants,
  fadeUpVariants,
  staggerContainerVariants,
  staggerItemVariants,
  EASE_POWER3,
  SPRING_TILT,
  VIEWPORT,
} from '@/lib/motion'

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6z"/>
        <polyline points="12 2 12 6 16 6"/>
        <line x1="8" y1="11" x2="12" y2="11"/>
        <line x1="8" y1="14" x2="10" y2="14"/>
      </svg>
    ),
    title: 'Contrats légaux en 2 clics',
    desc: 'Générez des contrats conformes au droit français avec signature électronique eIDAS.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="16" height="14" rx="2"/>
        <line x1="7" y1="10" x2="13" y2="10"/>
        <line x1="10" y1="7" x2="10" y2="13"/>
        <line x1="4" y1="6" x2="6" y2="6"/>
        <line x1="14" y1="6" x2="16" y2="6"/>
      </svg>
    ),
    title: 'DAS2 sans effort',
    desc: 'Déclaration annuelle générée automatiquement pour tous vos bénéficiaires.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="16" height="13" rx="2"/>
        <path d="M7 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/>
        <line x1="7" y1="9" x2="13" y2="9"/>
        <line x1="7" y1="12" x2="10" y2="12"/>
      </svg>
    ),
    title: 'Factures automatiques',
    desc: 'Facture légale ou reçu de commission générés automatiquement, exportables en PDF.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2L3 6v5c0 4 2.5 7.5 7 8.5 4.5-1 7-4.5 7-8.5V6z"/>
        <polyline points="7 10 9 12 13 8"/>
      </svg>
    ),
    title: 'Coffre-fort sécurisé',
    desc: 'Documents archivés 6 ans, accessibles immédiatement en cas de contrôle fiscal.',
  },
]

function FeatureCard({ feature }: { feature: typeof FEATURES[0] }) {
  const ref = useRef<HTMLDivElement>(null)
  const rotX = useMotionValue(0)
  const rotY = useMotionValue(0)
  const sRotX = useSpring(rotX, SPRING_TILT)
  const sRotY = useSpring(rotY, SPRING_TILT)

  const onMove = useCallback((e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    const nx = (e.clientX - r.left)  / r.width  - 0.5
    const ny = (e.clientY - r.top)   / r.height - 0.5
    rotY.set( nx * 14)
    rotX.set(-ny * 9)
  }, [rotX, rotY])

  const onLeave = useCallback(() => {
    rotX.set(0); rotY.set(0)
  }, [rotX, rotY])

  return (
    <div ref={ref} className="[perspective:700px]" onMouseMove={onMove} onMouseLeave={onLeave}>
      <motion.div
        variants={staggerItemVariants}
        style={{ rotateX: sRotX, rotateY: sRotY, transformStyle: 'preserve-3d' }}
        className="bg-white rounded-[10px] p-[18px] border border-gray-200 shadow-sm cursor-default will-change-transform"
        whileHover={{
          borderColor: '#4648D4',
          boxShadow: '0 20px 50px rgba(70,72,212,0.16)',
          transition: { duration: 0.25, ease: EASE_POWER3 },
        }}
      >
        <motion.div
          whileHover={{ scale: 1.15, rotate: -6 }}
          transition={{ duration: 0.28, ease: EASE_POWER3 }}
          className="w-[38px] h-[38px] rounded-lg bg-opus-primary-xl text-opus-primary flex items-center justify-center mb-3"
        >
          {feature.icon}
        </motion.div>
        <h3 className="text-sm font-bold text-opus-ink mb-1.5 leading-snug">{feature.title}</h3>
        <p className="text-[13px] text-gray-500 leading-relaxed">{feature.desc}</p>
      </motion.div>
    </div>
  )
}

export default function Features() {
  return (
    <section id="fonctionnalites" className="bg-white py-[clamp(60px,7vw,90px)] px-6">
      <div className="max-w-[1100px] mx-auto">

        <div className="mb-12">
          <div className="overflow-hidden mb-2.5">
            <motion.p
              variants={clipRevealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
              className="text-xs font-semibold tracking-[0.1em] uppercase text-opus-primary font-mono m-0"
            >
              Fonctionnalités
            </motion.p>
          </div>
          <div className="overflow-hidden">
            <motion.h2
              variants={clipRevealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
              transition={{ delay: 0.1 }}
              className="text-[clamp(24px,3.5vw,38px)] font-extrabold text-opus-ink tracking-[-0.02em] leading-tight max-w-[480px] m-0"
            >
              Toutes les fonctionnalités, sans les maux de tête
            </motion.h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 items-start max-[860px]:grid-cols-1">

          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            className="grid grid-cols-2 gap-3.5"
          >
            {FEATURES.map(f => (
              <FeatureCard key={f.title} feature={f} />
            ))}
          </motion.div>

          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            transition={{ delay: 0.3 }}
            className="rounded-[14px] overflow-hidden bg-gray-100 min-h-[360px] flex items-center justify-center max-[860px]:hidden"
          >
            <div className="text-center p-8">
              <div className="w-[100px] h-[100px] rounded-full bg-gradient-to-br from-opus-primary to-[#6669e0] mx-auto mb-5 flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                  <path d="M16 3h-8l-2 4h12z"/>
                  <circle cx="12" cy="13" r="2"/>
                </svg>
              </div>
              <p className="text-[15px] font-semibold text-opus-primary mb-2">Secteur BTP</p>
              <p className="text-[13px] text-gray-500 leading-relaxed max-w-[240px] mx-auto">
                Parce que gérer son entreprise ne devrait pas ressembler à un contrôle fiscal.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
